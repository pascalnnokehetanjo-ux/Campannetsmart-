# CAMPANNETSMART - Production Hardening & Deployment Guide for Cameroonian Schools

This document outlines the production hardening specifications, environment configurations, security controls, disaster recovery checklist, and deployment procedures for live deployment by Cameroonian primary and secondary schools.

---

## 1. Environment Variable Template (`.env.production`)

Never expose secret keys (`SUPABASE_SERVICE_ROLE_KEY` or `GEMINI_API_KEY`) in the frontend bundle. All AI and privileged database operations execute exclusively on the server (`server.ts`).

```env
# Node Environment
NODE_ENV="production"
PORT=3000

# App URL
APP_URL="https://campannetsmart.cm"

# Supabase Configuration
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key-server-side-only"

# Gemini AI API (Server-side only)
GEMINI_API_KEY="your-gemini-api-key-server-side-only"

# Storage Buckets
STORAGE_BUCKET_PARTS="marksheet-parts"
STORAGE_BUCKET_MERGED="merged-marksheets"
STORAGE_BUCKET_REPORTS="report-cards"
```

---

## 2. Security & Abuse Protection

- **Rate Limiting**: Applied to `/api/ocr-marksheet`, authentication endpoints, and report generation routes to prevent denial-of-service and OCR quota exhaustion.
- **File-Upload Security**: 
  - Strict MIME type verification (`image/jpeg`, `image/png`, `image/webp`).
  - File size limitation (maximum 50MB per request).
  - School-scoped storage paths (`tenant_id/marksheets/...`) enforced via RLS policies and server route validations.
- **Row Level Security (RLS)**: Guaranteed multi-tenant isolation where teachers can only access classes assigned to their `tenant_id`.

---

## 3. Production Logging & Error Monitoring

The backend (`server.ts`) logs all critical events in structured JSON format:
- **OCR Requests & Failures**: Request IDs, latency, token usage, error codes.
- **Mark Confirmations & Corrections**: Audit trails capturing teacher ID, timestamp, previous value, final value, and marksheet batch ID.
- **Report Card Generation**: Term/month metadata and configuration version IDs.
- **Auth & Permission Failures**: Unauthorized tenant access attempts.

---

## 4. Disaster Recovery & Backup Checklist

- **Daily Database Backups**: Automated via Supabase Point-in-Time Recovery (PITR).
- **Storage Backups**: Daily snapshots of Supabase storage buckets (`marksheet-parts`, `merged-marksheets`, `report-cards`).
- **Restore Procedure**:
  1. Restore database snapshot in Supabase dashboard.
  2. Restore storage bucket objects via Supabase CLI or S3-compatible replication.
  3. Verify environment variables on the Node.js hosting runner.

---

## 5. Deployment Checklist

- [ ] Build passes successfully (`npm run build`).
- [ ] TypeScript type checks pass (`npm run lint`).
- [ ] Database migrations executed in Supabase SQL Editor.
- [ ] RLS policies verified across test tenants.
- [ ] Environment secrets configured securely (no service keys in client bundle).
- [ ] Rate limiting and file upload guards active.
- [ ] Production URL tested for bilingual English/French report generation.
