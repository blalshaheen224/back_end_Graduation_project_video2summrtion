const asyncHandler = require("express-async-handler");
const axios = require("axios");
const FormData = require("form-data");
const multer = require("multer");
const mime = require("mime-types");

const { summarizeText, extractKeywords } = require("./groq");

const API_KEY = process.env.assemblyai;
console.log("AssemblyAI Key loaded:", !!API_KEY);

const jobs = {};
const headers = { authorization: API_KEY };

// ✅ أنواع الملفات المدعومة
const SUPPORTED_MIME_TYPES = [
  // Audio
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/ogg",
  "audio/webm",
  "audio/flac",
  "audio/x-flac",
  "audio/aac",
  "audio/x-m4a",
  "audio/m4a",
  // Video
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
  "video/mpeg",
  "video/3gpp",
];

// ✅ multer مع fileFilter يصحح octet-stream
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // لو النوع octet-stream اكتشفه من الامتداد
  if (file.mimetype === "application/octet-stream") {
    const detectedType = mime.lookup(file.originalname);
    console.log(`octet-stream detected, resolved to: ${detectedType}`);

    if (detectedType && SUPPORTED_MIME_TYPES.includes(detectedType)) {
      file.mimetype = detectedType; // ✅ صحّح الـ mimetype
      return cb(null, true);
    }
  }

  if (SUPPORTED_MIME_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(
    new Error(
      `Unsupported file type: ${file.mimetype}. Please upload audio or video files only.`
    ),
    false
  );
};

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter,
});

// ✅ رفع الملف مع تصحيح الـ contentType
const uploadAudio = async (file) => {
  // اكتشف النوع الحقيقي لو كان غلط
  let contentType = file.mimetype;

  if (!contentType || contentType === "application/octet-stream") {
    contentType = mime.lookup(file.originalname) || "audio/mpeg";
    console.log(`Fixed contentType from extension: ${contentType}`);
  }

  console.log("Uploading file:", {
    name: file.originalname,
    originalMimetype: file.mimetype,
    resolvedContentType: contentType,
    size: file.size,
  });

  const formData = new FormData();
  formData.append("file", file.buffer, {
    filename: file.originalname,
    contentType: contentType, // ✅ النوع الصحيح
  });

  const response = await axios.post(
    "https://api.assemblyai.com/v2/upload",
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        authorization: API_KEY,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    }
  );

  return response.data.upload_url;
};

// ✅ بدء التفريغ بدون speech_model لتجنب خطأ 400
const startTranscription = async (audioUrl) => {
  try {
    const response = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      {
        audio_url: audioUrl,
        language_detection: true, // ✅ يكتشف اللغة تلقائياً
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

// ✅ جلب حالة التفريغ
const getTranscriptionStatus = async (transcriptId) => {
  const response = await axios.get(
    `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
    { headers }
  );
  return response.data;
};

// ✅ رفع الميديا
const uploadMedia = asyncHandler(async (req, res) => {
  console.log("Received file:", req.file);

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // تصحيح إضافي للـ mimetype لو وصل octet-stream
  if (
    !req.file.mimetype ||
    req.file.mimetype === "application/octet-stream"
  ) {
    const detectedType = mime.lookup(req.file.originalname);
    if (detectedType) {
      req.file.mimetype = detectedType;
    }
  }

  let audioUrl;
  try {
    audioUrl = await uploadAudio(req.file);
  } catch (err) {
    console.error("Upload to AssemblyAI failed:", err.message);
    return res.status(500).json({
      message: "Failed to upload file to transcription service",
      error: err.message,
    });
  }

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

  res.status(200).json({
    success: true,
    jobId,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    fileType: req.file.mimetype,
    status: "processing",
  });
});

// ✅ جلب حالة الوظيفة
const getJobStatus = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = jobs[jobId];
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  // لو التلخيص تمّ مسبقاً، أرجع النتيجة المحفوظة
  if (job.summaryDone && job.result) {
    return res.status(200).json(job.result);
  }

  let data;
  try {
    data = await getTranscriptionStatus(jobId);
  } catch (err) {
    console.error("Failed to get transcription status:", err.message);
    return res.status(500).json({
      message: "Failed to get transcription status",
      error: err.message,
    });
  }

  if (data.status === "error") {
    return res.status(200).json({
      progress: 0,
      jobId,
      status: data.status,
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
      summary = null;
      keywords = "No keywords found";
    }

    job.summaryDone = true;
    job.result = {
      transcription,
      summary,
      keywords,
      status: "completed",
    };

    return res.status(200).json(job.result);
  }

  // لا تزال قيد المعالجة
  const now = Date.now();
  const estimatedEndTime = job.startTime + 5 * 60 * 1000;
  let progress = Math.floor(
    ((now - job.startTime) / (estimatedEndTime - job.startTime)) * 100
  );
  if (progress > 99) progress = 99;
  if (progress < 0) progress = 0;

  res.status(200).json({
    progress,
    jobId,
    status: data.status,
    estimatedTime: "15s",
  });
});

// ✅ جلب نتيجة التفريغ مباشرة
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

  if (data.status === "completed") {
    return res.status(200).json({ text: data.text });
  } else if (data.status === "error") {
    return res.status(500).json({
      error: data.error || "Transcription failed",
    });
  } else {
    return res.status(202).json({ status: data.status });
  }
});

module.exports = {
  upload,
  uploadMedia,
  getJobStatus,
  getTranscriptionResult,
};