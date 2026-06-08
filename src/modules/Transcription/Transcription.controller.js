const asyncHandler = require("express-async-handler");
const axios = require("axios");
const FormData = require("form-data");
const multer = require("multer");
const mime = require("mime-types");
const fs = require("fs");
const path = require("path");
const os = require("os");

const { summarizeText, extractKeywords } = require("./groq");
const { convertVideoToMp3 } = require("./videoConverter"); // ✅ أعدناها

const API_KEY = process.env.assemblyai;
console.log("AssemblyAI Key loaded:", !!API_KEY);

const jobs = {};
const headers = { authorization: API_KEY };

const SUPPORTED_MIME_TYPES = [
  "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav",
  "audio/mp4", "audio/ogg", "audio/webm", "audio/flac",
  "audio/x-flac", "audio/aac", "audio/x-m4a", "audio/m4a",
  "video/mp4", "video/webm", "video/quicktime",
  "video/x-msvideo", "video/x-matroska", "video/mpeg", "video/3gpp",
];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/octet-stream") {
    const detectedType = mime.lookup(file.originalname);
    if (detectedType && SUPPORTED_MIME_TYPES.includes(detectedType)) {
      file.mimetype = detectedType;
      return cb(null, true);
    }
  }
  if (SUPPORTED_MIME_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
};

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter,
});

// ✅ رفع الملف لـ AssemblyAI باستخدام Stream
const uploadToAssemblyAI = async (buffer, filename, contentType) => {
  console.log("Uploading to AssemblyAI:", { filename, contentType, size: buffer.length });

  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, `${Date.now()}-${filename}`);
  await fs.promises.writeFile(tempFilePath, buffer);

  try {
    const formData = new FormData();
    const fileStream = fs.createReadStream(tempFilePath);
    formData.append("file", fileStream, {
      filename,
      contentType,
      knownLength: buffer.length,
    });

    const response = await axios.post(
      "https://api.assemblyai.com/v2/upload",
      formData,
      {
        headers: { ...formData.getHeaders(), authorization: API_KEY },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    console.log("[Upload] ✅ Upload successful");
    return response.data.upload_url;
  } finally {
    try {
      await fs.promises.unlink(tempFilePath);
    } catch (err) {
      console.warn("[Upload] ⚠️ Failed to delete temp file");
    }
  }
};

const startTranscription = async (audioUrl) => {
  try {
    const response = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      {
        audio_url: audioUrl,
        language_detection: true,
      },
      { headers }
    );
    console.log("Transcription started, ID:", response.data.id);
    return response.data.id;
  } catch (err) {
    const detail = err.response?.data;
    console.error("AssemblyAI error detail:", JSON.stringify(detail));
    throw new Error(`AssemblyAI: ${detail?.error || err.message}`);
  }
};

const getTranscriptionStatus = async (transcriptId) => {
  const response = await axios.get(
    `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
    { headers }
  );
  return response.data;
};

// ✅ دالة uploadMedia مع التحويل المحلي للفيديو
const uploadMedia = asyncHandler(async (req, res) => {
  console.log("=== FILE DEBUG ===");
  console.log("mimetype:", req.file?.mimetype);
  console.log("originalname:", req.file?.originalname);
  console.log("size:", req.file?.size);
  console.log("=================");

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  if (!req.file.mimetype || req.file.mimetype === "application/octet-stream") {
    const detectedType = mime.lookup(req.file.originalname);
    if (detectedType) req.file.mimetype = detectedType;
  }

  // ── كائن يحمل بيانات الملف النهائية ──
  let fileData = {
    buffer: req.file.buffer,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
  };

  // ✅ لو فيديو — حوّله لـ MP3 محلياً عبر FFmpeg
  if (req.file.mimetype.startsWith("video/")) {
    console.log("[Upload] 🎥 فيديو مكتشف، جاري التحويل محلياً عبر FFmpeg...");
    try {
      const converted = await convertVideoToMp3(
        req.file.buffer,
        req.file.originalname
      );
      fileData = converted;
      console.log("[Upload] ✅ تم التحويل بنجاح:", fileData.originalname);
    } catch (err) {
      console.error("[Upload] ❌ فشل التحويل:", err.message);
      return res.status(500).json({
        message: "Failed to convert video to audio",
        error: err.message,
      });
    }
  } else {
    console.log("[Upload] 🎵 ملف صوتي، سيتم رفعه مباشرة.");
  }

  // ✅ رفع الصوت لـ AssemblyAI
  let audioUrl;
  try {
    audioUrl = await uploadToAssemblyAI(
      fileData.buffer,
      fileData.originalname,
      fileData.mimetype
    );
  } catch (err) {
    console.error("Upload to AssemblyAI failed:", err.message);
    return res.status(500).json({
      message: "Failed to upload file",
      error: err.message,
    });
  }

  // ✅ بدء التفريغ
  let jobId;
  try {
    jobId = await startTranscription(audioUrl);
  } catch (err) {
    console.error("Failed to start transcription:", err.message);
    return res.status(500).json({
      message: "Failed to start transcription",
      error: err.message,
    });
  }

  jobs[jobId] = {
    startTime: Date.now(),
    summaryDone: false,
    result: null,
  };

  console.log(`[Upload] 🎉 تم بدء النسخ. Job ID: ${jobId}`);

  res.status(200).json({
    success: true,
    jobId,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    fileType: fileData.mimetype,
    status: "processing",
  });
});

const getJobStatus = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const job = jobs[jobId];
  if (!job) return res.status(404).json({ message: "Job not found" });

  if (job.summaryDone && job.result) {
    return res.status(200).json(job.result);
  }

  let data;
  try {
    data = await getTranscriptionStatus(jobId);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to get transcription status",
      error: err.message,
    });
  }

  if (data.status === "error") {
    return res.status(200).json({
      progress: 0, jobId, status: data.status,
      error: data.error || "Transcription failed",
      estimatedTime: null,
    });
  }

  if (data.status === "completed") {
    const transcription = data.text;
    let summary = null;
    let keywords = "No keywords found";

    try {
      summary = await summarizeText(transcription);
      keywords = await extractKeywords(transcription);
    } catch (err) {
      console.error("Groq summarization failed:", err.message);
    }

    job.summaryDone = true;
    job.result = { transcription, summary, keywords, status: "completed" };
    return res.status(200).json(job.result);
  }

  const now = Date.now();
  const estimatedEndTime = job.startTime + 5 * 60 * 1000;
  let progress = Math.floor(
    ((now - job.startTime) / (estimatedEndTime - job.startTime)) * 100
  );
  if (progress > 99) progress = 99;
  if (progress < 0) progress = 0;

  res.status(200).json({ progress, jobId, status: data.status, estimatedTime: "15s" });
});

const getTranscriptionResult = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  let data;
  try {
    data = await getTranscriptionStatus(jobId);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to retrieve transcription",
      error: err.message,
    });
  }

  if (data.status === "completed") return res.status(200).json({ text: data.text });
  else if (data.status === "error") return res.status(500).json({ error: data.error });
  else return res.status(202).json({ status: data.status });
});

module.exports = { upload, uploadMedia, getJobStatus, getTranscriptionResult };