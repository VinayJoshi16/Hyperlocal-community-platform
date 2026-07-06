const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');

// Ensure upload directory exists
const uploadDir = config.storage.localUploadDir;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // limit to 50MB for video/file capability
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp|gif|mp4|webm|mov|avi|pdf|doc|docx|xls|xlsx|txt|zip/;
    const mimetype = filetypes.test(file.mimetype) || 
                     file.mimetype.startsWith('video/') || 
                     file.mimetype.startsWith('image/') ||
                     file.mimetype === 'application/pdf' ||
                     file.mimetype.includes('msword') ||
                     file.mimetype.includes('officedocument') ||
                     file.mimetype.includes('text/') ||
                     file.mimetype.includes('zip');
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype || extname) {
      return cb(null, true);
    }
    cb(new Error('File type not supported. Allowed formats: images, videos (mp4/webm/mov), and documents (pdf/doc/xls/txt/zip).'));
  }
});

module.exports = upload;
