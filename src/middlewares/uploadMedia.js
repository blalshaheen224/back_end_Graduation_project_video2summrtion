const multer = require("multer");

// التخزين في الذاكرة
const storage = multer.memoryStorage();

// فلترة الملفات
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("video/") ||
    file.mimetype.startsWith("audio/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only video or audio files are allowed"), false);
  }
};

const uploadMedia = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 100, // 100MB
  },
});

module.exports = uploadMedia;
