// videoConverter.js
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const fs = require("fs");
const path = require("path");
const os = require("os");

// ✅ تعيين مسار FFmpeg (يعمل على Windows و Linux)
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * تحويل الفيديو إلى MP3 (محسّن لـ Render)
 */
const convertVideoToMp3 = async (fileBuffer, originalname) => {
  console.log("[FFmpeg] 🎬 بدء التحويل:", originalname);
  console.log("[FFmpeg] 📏 الحجم:", (fileBuffer.length / 1024 / 1024).toFixed(2), "MB");

  // ⚠️ تحذير: Render المجاني لديه 512 MB RAM فقط
  if (fileBuffer.length > 100 * 1024 * 1024) {
    throw new Error("File too large for Render free tier (max 100MB)");
  }

  const tempDir = os.tmpdir();
  const inputPath = path.join(tempDir, `input-${Date.now()}-${originalname}`);
  const outputPath = path.join(tempDir, `output-${Date.now()}.mp3`);

  try {
    // 1️⃣ احفظ الفيديو مؤقتاً
    await fs.promises.writeFile(inputPath, fileBuffer);
    console.log("[FFmpeg] 📁 تم الحفظ المؤقت");

    // 2️⃣ حوّل إلى MP3
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat("mp3")
        .audioCodec("libmp3lame")
        .audioBitrate(128)
        .audioChannels(1)
        .audioFrequency(16000)
        .on("start", (cmd) => console.log("[FFmpeg] 🔄 بدء:", cmd.substring(0, 100) + "..."))
        .on("end", () => {
          console.log("[FFmpeg] ✅ اكتمل التحويل");
          resolve();
        })
        .on("error", (err, stdout, stderr) => {
          console.error("[FFmpeg] ❌ خطأ:", err.message);
          console.error("[FFmpeg] stderr:", stderr);
          reject(err);
        })
        .save(outputPath);
    });

    // 3️⃣ اقرأ الملف الناتج
    const mp3Buffer = await fs.promises.readFile(outputPath);
    console.log("[FFmpeg] 🎵 حجم الناتج:", (mp3Buffer.length / 1024 / 1024).toFixed(2), "MB");

    return {
      buffer: mp3Buffer,
      originalname: originalname.replace(/\.[^.]+$/, ".mp3"),
      mimetype: "audio/mpeg",
    };
  } finally {
    // 4️⃣ احذف الملفات فوراً (مهم جداً على Render!)
    try {
      if (fs.existsSync(inputPath)) await fs.promises.unlink(inputPath);
      if (fs.existsSync(outputPath)) await fs.promises.unlink(outputPath);
      console.log("[FFmpeg] 🗑️ تم الحذف");
    } catch (err) {
      console.warn("[FFmpeg] ⚠️ فشل الحذف:", err.message);
    }
  }
};

module.exports = { convertVideoToMp3 };