const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');
const config = require('../config/env');

function useBlobStorage() {
  return config.storage.provider === 'vercel-blob' && !!config.storage.blobToken;
}

function buildObjectKey(file) {
  const ext = path.extname(file.originalname).toLowerCase() || '';
  return `posts/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
}

async function saveUploadedFile(file) {
  if (!file?.buffer) {
    throw new Error('Invalid upload payload.');
  }

  const objectKey = buildObjectKey(file);

  if (useBlobStorage()) {
    const { url } = await put(objectKey, file.buffer, {
      access: 'public',
      token: config.storage.blobToken,
      contentType: file.mimetype,
    });
    return url;
  }

  const uploadDir = config.storage.localUploadDir;
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const localName = path.basename(objectKey);
  fs.writeFileSync(path.join(uploadDir, localName), file.buffer);
  return `/uploads/${localName}`;
}

module.exports = { saveUploadedFile, useBlobStorage };
