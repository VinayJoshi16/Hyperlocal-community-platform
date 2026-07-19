// Single source of truth for environment variables.
// Other files import from here instead of reading process.env directly -
// this makes it obvious what config the app needs, and catches missing
// values at startup instead of failing randomly mid-request.

require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  db: {
    url: required('DATABASE_URL'),
  },

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '30d',
  },

  email: {
    provider: process.env.EMAIL_PROVIDER || 'gmail',
    user: process.env.EMAIL_USER,
    appPassword: process.env.EMAIL_APP_PASSWORD,
    fromName: process.env.EMAIL_FROM_NAME || 'NeighbourHub',
  },

  otp: {
    expiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES || 10),
    rateLimitPerHour: Number(process.env.OTP_RATE_LIMIT_PER_HOUR || 5),
  },

  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    localUploadDir: process.env.LOCAL_UPLOAD_DIR || 'uploads',
    blobToken: process.env.BLOB_READ_WRITE_TOKEN || '',
  },

  aws: {
    region: process.env.AWS_REGION || '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    s3Bucket: process.env.AWS_S3_BUCKET_NAME || '',
    sesFromEmail: process.env.AWS_SES_FROM_EMAIL || '',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || null,
  },
  vapid: {
    publicKey: required('VAPID_PUBLIC_KEY'),
    privateKey: required('VAPID_PRIVATE_KEY'),
    subject: required('VAPID_SUBJECT', 'mailto:vinay.joshi1608@gmail.com'),
  },
};

module.exports = config;