const pool = require("../config/db");
const transport = require("../config/mailer.js");

const { generateOTP, getOTPExpiry } = require("../utils/otp");

const { hashPassword } = require("../utils/auth");

const { generateAuthToken } = require("../utils/auth");

const { validationResult } = require("express-validator");

const bcrypt = require("bcrypt");

// User Registration Endpoint

module.exports.register = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  try {
    const { name, email, password } = req.body;

    const existingUser = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await hashPassword(password);

    const userResult = await pool.query(
      `
            INSERT INTO users
            (
                name,
                email,
                password_hash
            )
            VALUES
            (
                $1,
                $2,
                $3
            )
            RETURNING *
            `,
      [name, email, hashedPassword],
    );

    const otp = generateOTP();

    const otpExpiry = getOTPExpiry();

    await pool.query(
      `
            INSERT INTO otp_verifications
            (
                email,
                otp,
                expires_at
            )
            VALUES
            (
                $1,
                $2,
                $3
            )
            `,
      [email, otp, otpExpiry],
    );

    await transport.sendMail({
      from: `"Hyperlocal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email Address",
      html: `
    <div style="
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      padding: 40px 20px;
    ">
      <div style="
        max-width: 600px;
        margin: auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      ">
        <div style="
          background: #2563eb;
          color: white;
          text-align: center;
          padding: 25px;
        ">
          <h1 style="margin:0;">Hyperlocal Platform</h1>
        </div>

        <div style="padding: 35px;">
          <h2 style="color:#333;">
            Email Verification
          </h2>

          <p style="
            color:#555;
            font-size:16px;
            line-height:1.6;
          ">
            Thank you for registering with Hyperlocal Platform.
            Please use the OTP below to verify your email address.
          </p>

          <div style="
            text-align:center;
            margin:30px 0;
          ">
            <span style="
              display:inline-block;
              background:#eef4ff;
              color:#2563eb;
              font-size:32px;
              font-weight:bold;
              letter-spacing:8px;
              padding:15px 30px;
              border-radius:10px;
              border:2px dashed #2563eb;
            ">
              ${otp}
            </span>
          </div>

          <p style="
            color:#666;
            font-size:15px;
          ">
            This OTP will expire in <strong>10 minutes</strong>.
          </p>

          <p style="
            color:#666;
            font-size:15px;
          ">
            If you did not create this account, please ignore this email.
          </p>
        </div>

        <div style="
          background:#f8fafc;
          text-align:center;
          padding:20px;
          color:#888;
          font-size:13px;
        ">
          © 2026 Hyperlocal Platform. All rights reserved.
        </div>

      </div>
    </div>
  `,
    });

    return res.status(201).json({
      message: "Registration successful. Check your email for OTP.",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// OTP Verification Endpoint

module.exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const result = await pool.query(
      `
            SELECT *
            FROM otp_verifications
            WHERE email = $1
            AND otp = $2
            AND is_used = FALSE
            ORDER BY created_at DESC
            LIMIT 1
            `,
      [email, otp],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const record = result.rows[0];

    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    await pool.query(
      `
            UPDATE otp_verifications
            SET is_used = TRUE
            WHERE id = $1
            `,
      [record.id],
    );

    await pool.query(
      `
            UPDATE users
            SET is_verified = TRUE
            WHERE email = $1
            `,
      [email],
    );

    const userResult = await pool.query(
      `
            SELECT *
            FROM users
            WHERE email = $1
            `,
      [email],
    );

    const user = userResult.rows[0];

    const token = generateAuthToken(user);

    return res.status(200).json({
      message: "Email verified successfully",
      token,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// User Login Endpoint

module.exports.login = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    try {
        const { email, password } = req.body;

        const userResult = await pool.query(
            `
            SELECT *
            FROM users
            WHERE email = $1
            `,
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({
                message: 'Invalid email or password'
            });
        }

        const user = userResult.rows[0];

        if (!user.is_verified) {
            return res.status(400).json({
                message: 'Please verify your email first'
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid email or password'
            });
        }

        const token = generateAuthToken(user);

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: 'Server Error'
        });
    }
};