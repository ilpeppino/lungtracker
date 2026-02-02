Lung Tracker – Developer Onboarding (PoC)

This document explains how to set up a local development environment, configure the external platforms used by the Lung Tracker PoC, and run end-to-end tests independently.

Important
	•	API keys, secrets, and service-role credentials are not stored in the repository.
	•	Each developer must create and store their own secrets locally.
	•	The repository is the single source of truth for code and configuration structure.

⸻

1. Prerequisites

1.1 Required software

Install the following on your machine:
	•	Node.js ≥ 20.x
	•	npm ≥ 10.x
	•	Git
	•	curl (usually preinstalled on macOS/Linux)

Verify:

node -v
npm -v
git --version
curl --version


⸻

2. Repository structure (high level)

lung-tracker-mobile/
├── backend/              # Node.js + Express API (PDF, email, secure links)
│   ├── src/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── email/
│   │   ├── reporting/
│   │   ├── routes/
│   │   ├── util/
│   │   └── index.ts
│   ├── .env.example
│   └── package.json
│
├── app/                  # Expo / React Native mobile app
├── ONBOARDING.md         # This file
└── README.md


⸻

3. Backend setup (local)

3.1 Install dependencies

cd backend
npm install

3.2 Environment variables

Create a .env file based on .env.example:

cp .env.example .env

You must provide your own values for:

# General
NODE_ENV=development
PUBLIC_BASE_URL=http://localhost:8080

# Supabase
SUPABASE_URL=https://<project-id>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_REPORTS_BUCKET=reports

# Reporting links
REPORT_LINK_TTL_SECONDS=3600
SIGNED_URL_TTL_SECONDS=300
DEV_RETURN_REPORT_LINK=true

# Email (Resend)
RESEND_API_KEY=<resend-api-key>
REPORT_FROM_EMAIL=onboarding@resend.dev

⚠️ Never commit .env

⸻

3.3 Run backend locally

npm run dev

Expected output:

API listening on :8080


⸻

4. Supabase configuration

4.1 Create a Supabase project
	1.	Go to https://supabase.com
	2.	Create a new project
	3.	Save:
	•	Project URL
	•	Service Role Key (server-only)

⸻

4.2 Database schema

Run the SQL schema provided in the repository (or shared separately) to create:
	•	vitals_entries
	•	activities
	•	events
	•	report_exports

Row Level Security (RLS) must be enabled.

Backend uses the service role key, so RLS does not block server operations.

⸻

4.3 Storage

Create a private storage bucket:

Bucket name: reports
Public access: OFF

The backend generates short-lived signed URLs for access.

⸻

5. Email (Resend)

5.1 Create Resend account
	1.	Go to https://resend.com
	2.	Create an API key

For PoC:

REPORT_FROM_EMAIL=onboarding@resend.dev

For production:
	•	Verify your own domain in Resend
	•	Use reports@yourdomain.com

⸻

6. Mobile app (Expo)

6.1 Install Expo tooling

npm install -g expo-cli

6.2 Install app dependencies

cd app
npm install

6.3 Configure Supabase client

Set Supabase anon key and URL in Expo config (NOT the service role key).

Example (app.config.js):

extra: {
  supabaseUrl: "https://<project-id>.supabase.co",
  supabaseAnonKey: "<anon-key>"
}


⸻

7. Authentication
	•	Mobile app uses Supabase Auth
	•	Backend requires a Supabase access token (JWT)

Get a token in the app:

const { data } = await supabase.auth.getSession();
console.log(data.session?.access_token);


⸻

8. Backend test commands (curl)

8.1 Export user JWT

export USER_JWT='<SUPABASE_USER_ACCESS_TOKEN>'


⸻

8.2 Generate report + email link

curl -s \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "rangeStart":"2026-01-01T00:00:00.000Z",
    "rangeEnd":"2026-02-02T00:00:00.000Z",
    "recipientEmail":"your@email.com"
  }' \
  http://localhost:8080/reports/email-link

Expected:

{
  "ok": true,
  "devLink": "http://localhost:8080/reports/r/...",
  "expiresAt": "..."
}


⸻

8.3 Download report (signed URL flow)

curl -I "<devLink>"

Expected:
	•	HTTP 302
	•	Redirect to Supabase signed URL

Download:

curl -L -o report.pdf "<devLink>"
open report.pdf


⸻

8.4 List exports

curl -s \
  -H "Authorization: Bearer $USER_JWT" \
  http://localhost:8080/reports/exports?limit=5


⸻

8.5 Revoke a report

curl -s \
  -H "Authorization: Bearer $USER_JWT" \
  -X POST \
  http://localhost:8080/reports/revoke/<REPORT_ID>

After revoke:
	•	/reports/r/:token → 410 Gone

⸻

9. Security notes
	•	Service role key never used in mobile app
	•	All report downloads are:
	•	tokenized
	•	time-limited
	•	revocable
	•	rate-limited

⸻

10. Common issues

Backend fails on startup
	•	Check .env values
	•	Ensure REPORT_FROM_EMAIL is a plain email (not Name <email>)

Email not delivered
	•	Use onboarding@resend.dev for PoC
	•	Verify domain for production

⸻

11. Suggested workflow for contributors
	1.	Pull latest main
	2.	Configure .env
	3.	Run backend
	4.	Run curl tests
	5.	Run mobile app

⸻

12. Contact / coordination
	•	Repository issues → GitHub Issues
	•	Secrets / credentials → exchanged privately

⸻

End of document