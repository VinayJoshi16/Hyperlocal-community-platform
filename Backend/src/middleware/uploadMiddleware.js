const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp|gif|avif|mp4|webm|mov|avi|pdf|doc|docx|xls|xlsx|txt|zip/;
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
  },
});

module.exports = upload;
