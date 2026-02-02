# Reporting & Encryption Architecture (PoC)
_Last updated: 2026-02-02_

## 1. Context and goals
The application includes a reporting feature: "Email data - Generate  [oai_citation:20‡LUNG TRACKER (TYSON) - 20260111 v1.pdf](sediment://file_00000000246471f4b55a9333348bb4f5)ts, graphs and raw data" to send to a provider quickly.  [oai_citation:21‡LUNG TRACKER (TYSON) - 20260111 v1.pdf](sediment://file_00000000246471f4b55a9333348bb4f5)  
The existing Lovable setup is flagged as having flawed authentication/authorization/encryption patterns (e.g., hardcoded keys).  [oai_citation:22‡LUNG TRACKER (TYSON) - 20260111 v1.pdf](sediment://file_00000000246471f4b55a9333348bb4f5)  
The product plan also highlights data security concerns as a major adoption/trust risk.  [oai_citation:23‡Marketing Plan - Recovery App - v3.pdf](sediment://file_00000000b57c720aa10d0ec886e204bb)

**Goals (PoC):**
1. Generate a PDF report server-side (tables + charts + raw data).
2. Store report privately and share using a time-limited, revocable mechanism.
3. Encrypt in transit and at rest.
4. Audit exporting and downloading events.

## 2. Components
### 2.1 Mobile client
- React Native app
- Auth0 login to obtain access token for API calls

### 2.2 Backend API (Node.js)
Responsibilities:
- Validate Auth0  [oai_citation:24‡LUNG TRACKER (TYSON) - 20260111 v1.pdf](sediment://file_00000000246471f4b55a9333348bb4f5)rification using issuer, audience, JWKS).
- Query user data from database.
- Generate report PDF.
- Upload PDF to Supabase Storage  [oai_citation:25‡LUNG TRACKER (TYSON) - 20260111 v1.pdf](sediment://file_00000000246471f4b55a9333348bb4f5)reate a time-limited share token.
- Send email with secure link.
- Serve the download endpo [oai_citation:26‡Marketing Plan - Recovery App - v3.pdf](sediment://file_00000000b57c720aa10d0ec886e204bb)igned URLs.

Auth0 guidance: validate access tokens using standard JWT validation and JWKS.  [oai_citation:27‡Auth0](https://auth0.com/docs/secure/tokens/access-tokens/validate-access-tokens?utm_source=chatgpt.com)

### 2.3 Database (Supabase Postgres)
- Stores vitals, activities, events, settings.
- Stores report export records for audit (`report_exports`).
- RLS enabled for per-user data access.  [oai_citation:28‡Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security?utm_source=chatgpt.com)

### 2.4 Storage (Supabase Storage)
- Private bucket: `reports`.
- Stores PDFs at `reports/<user_id>/<report_id>.pdf`.
- Uses signed URLs (short-lived) when serving downloads. Signed URLs are designed to share a file for a fixed amount of time.  [oai_citation:29‡Supabase](https://supabase.com/docs/reference/javascript/storage-from-createsignedurl?utm_source=chatgpt.com)
- Private buckets are subject to access control policies.  [oai_citation:30‡Supabase](https://supabase.com/docs/guides/storage/buckets/fundamentals?utm_source=chatgpt.com)

### 2.5 Email provider
- Resend (PoC) to send the secure link via API.  [oai_citation:31‡resend.com](https://resend.com/docs/api-reference/emails/send-email?utm_source=chatgpt.com)

## 3. Reporting flow (secure link / Option B)
### 3.1 Create report and email link
1. User submits report request in the app: date range + recipient email.
2. App calls `POST /reports/email-link` with Auth0 bearer token.
3. Backend validates token; maps `auth0_sub` to internal `user_id`.
4. Backend queries data (vitals, activities, events) for the date range.
5. Backend generates an HTML report and prints to PDF.
6. Backend uploads PDF to Supabase Storage private bucket.
7. Backend creates an export row with:
   - token hash
   - expires_at
   - storage_path
   - sent_to_email
8. Backend emails `https://api.../r/<token>` to recipient.

### 3.2 Download report (recipient)
1. Recipient clicks link `GET /r/<token>`.
2. Backend validates token hash and expiry (and not revoked).
3. Backend generates a short-lived Supabase signed URL (`createSignedUrl(path, expiresIn)`).  [oai_citation:32‡Supabase](https://supabase.com/docs/reference/javascript/storage-from-createsignedurl?utm_source=chatgpt.com)
4. Backend redirects recipient to signed URL or streams the PDF.
5. Backend logs `downloaded_at` for audit.

## 4. Encryption and confidentiality
### 4.1 In transit encryption
All communication uses TLS:
- App → API: HTTPS
- API → Postgres: TLS-enabled connection
- API → Supabase Storage: HTTPS
- API → Email provider: HTTPS

### 4.2 At rest encryption
- Database is stored encrypted by the managed platform (provider-managed encryption at rest).
- Supabase Storage objects are stored encrypted by the managed platform.
- PDFs are kept in a *private bucket*, and access is only via controlled signed links.  [oai_citation:33‡Supabase](https://supabase.com/docs/guides/storage/buckets/fundamentals?utm_source=chatgpt.com)

### 4.3 Link security controls
PoC controls:
- Link expiry (e.g., 60 minutes)
- Signed URL TTL (e.g., 5 minutes)
- Token stored as SHA-256 hash in DB (no plaintext token in DB)
- Optional revocation (`revoked_at`) and one-time-use logic

### 4.4 Audit logging
The product plan emphasizes logged interactions and trustworthy reporting.  [oai_citation:34‡Marketing Plan - Recovery App - v3.pdf](sediment://file_00000000a174720aa557fc1b66f6740e)  
The reporting system logs:
- report created (sent_at)
- recipient email
- expiry
- downloads (downloaded_at)
- revoked/expired states

## 5. Risks and PoC boundaries
- Email delivery beyond the sender side may not guarantee TLS at the recipient server; therefore, the PDF itself is not attached and the link is short-lived.
- This PoC does not claim HIPAA compliance; it implements baseline security patterns and logs suitable for iteration.

## 6. Future-ready path (serverless later)
This design maps cleanly to serverless:
- `POST /reports/email-link` → Lambda / Cloud Run function
- `GET /r/:token` → Lambda / edge function
- Replace secret storage with managed secret store/KMS