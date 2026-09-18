const express = require('express');
const router = express.Router();
const twilio = require('twilio');

const otpStore = new Map();
const OTP_TTL_MS = 5 * 60 * 1000;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizePhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) return `+27${digits.slice(1)}`;
  if (digits.startsWith('27')) return `+${digits}`;
  return `+${digits}`;
}

function twilioConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
}

async function sendOtpSms(phone, otp) {
  const cleanPhone = normalizePhone(phone);
  if (!twilioConfigured()) {
    console.log(`DEMO OTP for ${cleanPhone}: ${otp}`);
    return { demo: true };
  }

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    body: `Your SAPS verification code is ${otp}. This code expires in 5 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: cleanPhone
  });

  return { demo: false };
}

router.post('/request-otp', async (req, res) => {
  const { identity, phone, role } = req.body || {};

  if (!identity || !phone || !role) {
    return res.status(400).json({ error: 'Identity, phone number and role are required.' });
  }

  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    return res.status(400).json({ error: 'A valid phone number is required.' });
  }

  const otp = generateOtp();
  otpStore.set(`${identity}:${normalizedPhone}`, {
    otp,
    role,
    expiresAt: Date.now() + OTP_TTL_MS
  });

  try {
    await sendOtpSms(normalizedPhone, otp);
    return res.json({
      success: true,
      message: twilioConfigured() ? 'Verification SMS sent successfully.' : 'Demo OTP generated for local testing. Check the server terminal log.',
      phone: normalizedPhone
    });
  } catch (error) {
    console.error('Twilio OTP send failed:', error);
    return res.status(500).json({
      error: 'Could not send SMS. Check your Twilio configuration and your phone number format.'
    });
  }
});

router.post('/verify-otp', (req, res) => {
  const { identity, phone, otp, role } = req.body || {};

  if (!identity || !phone || !otp || !role) {
    return res.status(400).json({ error: 'Identity, phone, role and OTP are required.' });
  }

  const normalizedPhone = normalizePhone(phone);
  const key = `${identity}:${normalizedPhone}`;
  const record = otpStore.get(key);

  if (!record) {
    return res.status(400).json({ error: 'No OTP request has been issued for this identity and phone number.' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }

  if (record.role !== role || String(record.otp) !== String(otp)) {
    return res.status(400).json({ error: 'Invalid OTP or role mismatch.' });
  }

  otpStore.delete(key);
  return res.json({
    success: true,
    message: 'OTP verified successfully.',
    identity,
    phone: normalizedPhone,
    role
  });
});

module.exports = router;
