# SAPS Case Accountability Portal

This prototype now includes a realistic officer OTP flow that can send real SMS messages through Twilio.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set your Twilio credentials:
   ```bash
   cp .env.example .env
   ```

3. Create a Twilio account and verify a WhatsApp/SMS-capable sender number.

4. Set these values in `.env`:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+12025550123
   ```

5. Start the app:
   ```bash
   npm start
   ```

6. Open the browser at:
   ```text
   http://localhost:3000
   ```

## OTP behaviour

- If Twilio credentials are configured, the app sends an OTP by SMS to the officer's mobile number.
- If the credentials are missing, the app falls back to demo mode and logs the OTP in the terminal.
- This is still a prototype and uses browser `localStorage` for demonstration.

## Production note

A real SAPS deployment must replace localStorage with a secure backend session store and a real identity provider. Do not commit real Twilio secrets to GitHub.
