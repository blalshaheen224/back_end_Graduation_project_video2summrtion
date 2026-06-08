const asyncHandler = require("express-async-handler");
const axios = require("axios");
const FormData = require("form-data");

const { summarizeText, extractKeywords } = require("./groq");

//const API_KEY = "1d3e595911e54a4297e55d78fdd4bda3";
//const API_KEY = "88c5a74560264374bfacea81e71c57bf";
const API_KEY =  process.env.assemblyai
console.log(process.env.assemblyai);
//88c5a74560264374bfacea81e71c57bf
//chat2
const jobs = {};
const headers = { authorization: API_KEY };

const uploadAudio = async (file) => {
  const formData = new FormData();
  formData.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  const response = await axios.post(
    "https://api.assemblyai.com/v2/upload",
    formData,
    { headers: { ...formData.getHeaders(), authorization: API_KEY } }
  );

  return response.data.upload_url;
};

const startTranscription = async (audioUrl) => {
  const response = await axios.post(
    "https://api.assemblyai.com/v2/transcript",
    {
      audio_url: audioUrl,
      speech_models: ["universal-3-pro", "universal-2"],
    },
    { headers }
  );
  return response.data.id;
};

const getTranscriptionStatus = async (transcriptId) => {
  const response = await axios.get(
    `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
    { headers }
  );
  return response.data;
};

const uploadMedia = asyncHandler(async (req, res) => {
  console.log(req.file);

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const audioUrl = await uploadAudio(req.file);
  const jobId = await startTranscription(audioUrl);

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
    status: "processing",
  });
});

const getJobStatus = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = jobs[jobId];
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  // لو التلخيص تمّ مسبقاً، أرجع النتيجة المحفوظة مباشرة
  if (job.summaryDone && job.result) {
    return res.status(200).json(job.result);
  }

  const data = await getTranscriptionStatus(jobId);

  if (data.status === "error") {
    return res.status(200).json({
      progress: 0,
      jobId,
      status: data.status,
      estimatedTime: "15s",
    });
  }

  if (data.status === "completed") {
    // ✅ transcription = النص الأصلي الكامل دائماً
    const transcription = data.text;

    // ✅ summary = ملخص حقيقي من Groq
    let summary = null;
    let keywords = "No keywords found";

    try {
      summary = await summarizeText(transcription);
      keywords = await extractKeywords(transcription);
    } catch (err) {
      console.error("Groq summarization failed:", err.message);
      summary = null; // لو فشل التلخيص نرجع null مش نكرر النص
      keywords = "No keywords found";
    }

    job.summaryDone = true;
    job.result = {
      transcription, // ← النص الأصلي كاملاً
      summary,       // ← الملخص فقط (أو null لو فشل)
      keywords,
      status: "completed",
    };

    return res.status(200).json(job.result);
  }

  // لا تزال قيد المعالجة
  const now = Date.now();
  const estimatedEndTime = job.startTime + 5 * 60 * 1000;
  let progress = Math.floor(((now - job.startTime) / (estimatedEndTime - job.startTime)) * 100);
  if (progress > 99) progress = 99;

  res.status(200).json({
    progress,
    jobId,
    status: data.status,
    estimatedTime: "15s",
  });
});

const getTranscriptionResult = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const data = await getTranscriptionStatus(jobId);

  if (data.status === "completed") {
    return res.status(200).json({ text: data.text });
  } else if (data.status === "error") {
    return res.status(500).json({ error: data.error });
  } else {
    return res.status(202).json({ status: data.status });
  }
});

module.exports = { uploadMedia, getJobStatus, getTranscriptionResult };