const nodemailer = require("nodemailer");

/**
 * Universal Mail Dispatcher for Yamu Car Rentals
 * 
 * Supports:
 * 1. Brevo REST API (via BREVO_API_KEY) - Uses HTTPS (Port 443). Never blocked on Render/Vercel/Cloud.
 * 2. Resend REST API (via RESEND_API_KEY) - Uses HTTPS (Port 443).
 * 3. Gmail / SMTP Port 587 (STARTTLS) - High compatibility for localhost and open hosts.
 * 4. Gmail / SMTP Port 465 (SSL fallback).
 */

const sendViaBrevo = async ({ to, subject, html, senderEmail, senderName }) => {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) throw new Error("BREVO_API_KEY missing");

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: senderName || "Yamu Car Rentals",
        email: senderEmail || process.env.EMAIL_USER || "vihangarandima8@gmail.com",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Brevo API error (${response.status}): ${response.statusText}`);
  }
  return { success: true, provider: "brevo" };
};

const sendViaResend = async ({ to, subject, html, senderEmail, senderName }) => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error("RESEND_API_KEY missing");

  const fromAddress = process.env.RESEND_FROM || `${senderName || "Yamu Car Rentals"} <onboarding@resend.dev>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Resend API error (${response.status}): ${response.statusText}`);
  }
  return { success: true, provider: "resend" };
};

const createSmtpTransporter = (port = 587, secure = false) => {
  const emailUser = process.env.EMAIL_USER?.trim();
  const rawPass = process.env.EMAIL_PASS?.trim();
  const emailPass = rawPass ? rawPass.replace(/\s+/g, "") : "";

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port,
    secure,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
    family: 4, // Force IPv4 — avoids ENETUNREACH on IPv6-only DNS results
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const senderName = "Yamu Car Rentals";
  const senderEmail = process.env.EMAIL_USER?.trim() || "vihangarandima8@gmail.com";

  // 1. Try Brevo REST API if configured (HTTPS - guaranteed to work on Render & Cloud)
  if (process.env.BREVO_API_KEY) {
    return await sendViaBrevo({ to, subject, html, senderEmail, senderName });
  }

  // 2. Try Resend REST API if configured (HTTPS - guaranteed to work on Render & Cloud)
  if (process.env.RESEND_API_KEY) {
    return await sendViaResend({ to, subject, html, senderEmail, senderName });
  }

  // 3. Fallback to SMTP
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    const err = new Error(
      "Email service is not configured. Please add BREVO_API_KEY or EMAIL_USER and EMAIL_PASS."
    );
    err.code = "NO_SMTP";
    throw err;
  }

  const mailOptions = {
    from: `"${senderName}" <${senderEmail}>`,
    to,
    subject,
    html,
  };

  // Try port 587 first (STARTTLS), then port 465 (SSL)
  try {
    const transporter587 = createSmtpTransporter(587, false);
    return await transporter587.sendMail(mailOptions);
  } catch (err587) {
    console.warn("SMTP Port 587 failed, trying Port 465 SSL...", err587.message);
    const transporter465 = createSmtpTransporter(465, true);
    return await transporter465.sendMail(mailOptions);
  }
};

module.exports = {
  sendEmail,
};
