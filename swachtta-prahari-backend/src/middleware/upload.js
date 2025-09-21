// utils/uploadVideo.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const TMP_DIR = path.join(process.cwd(), "tmp");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, TMP_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const VIDEO_MIME = new Set([
  "video/mp4",
  "video/quicktime",
  "video/x-matroska",
  "video/webm",
  "video/x-msvideo",
]);

const fileFilter = (_req, file, cb) => {
  if (VIDEO_MIME.has(file.mimetype) || file.mimetype.startsWith("video/")) {
    return cb(null, true);
  }
  cb(new Error("Only video files are allowed"));
};

const uploadVideoSingle = multer({
  storage,
  fileFilter,
  // 10 GB example limit; adjust for your infra
  limits: { fileSize: 10 * 1024 * 1024 * 1024 },
}).single("video"); // <input name="video" ...>

module.exports = {
  uploadVideoSingle,
};
