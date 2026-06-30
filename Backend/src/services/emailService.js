// Sends transactional emails (OTP codes, welcome emails) via Gmail SMTP - free.
// This is the one file you swap when migrating to AWS SES later: keep the
// same sendOtpEmail() function signature, change only what's inside it.

const nodemailer = require('nodemailer');
const config = require('../config/env');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!config.email.user || !config.email.appPassword) {
    throw new Error(
      'EMAIL_USER or EMAIL_APP_PASSWORD missing in .env. See .env.example for setup instructions.'
    );
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.user,
      pass: config.email.appPassword,
    },
  });

  return transporter;
}

async function sendOtpEmail(toEmail, otpCode) {
  const mailer = getTransporter();

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1F2937;">Your NeighbourHub verification code</h2>
      <p style="color: #4B5563; font-size: 15px;">Use this code to sign in. It expires in ${config.otp.expiryMinutes} minutes.</p>
      <div style="background: #F8FAFC; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: 600; letter-spacing: 8px; color: #2563EB;">${otpCode}</span>
      </div>
      <p style="color: #9CA3AF; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  await mailer.sendMail({
    from: `"${config.email.fromName}" <${config.email.user}>`,
    to: toEmail,
    subject: `${otpCode} is your NeighbourHub verification code`,
    html,
  });
}

async function sendWelcomeEmail(toEmail, name) {
  const mailer = getTransporter();

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1F2937;">Welcome to NeighbourHub${name ? `, ${name}` : ''}</h2>
      <p style="color: #4B5563; font-size: 15px;">
        You're now connected to your local community. Set your location to start seeing nearby updates, events, and announcements.
      </p>
    </div>
  `;

  await mailer.sendMail({
    from: `"${config.email.fromName}" <${config.email.user}>`,
    to: toEmail,
    subject: 'Welcome to NeighbourHub',
    html,
  });
}

module.exports = { sendOtpEmail, sendWelcomeEmail };