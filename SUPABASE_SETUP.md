# CAMPANNETSMART - Supabase Production Setup & Tenant Isolation Guide

This guide details how to transition **CAMPANNETSMART** from a frontend demo into a secure, multi-school production application powered by **Supabase** (PostgreSQL, Authentication, Row Level Security, and File Storage).

---

## 1. Environment Variable Setup

Add the following environment variables to your `.env` file (and AI Studio Secrets panel):

```env
GEMINI_API_KEY="your-gemini-api-key"
VITE_SUPABASE_URL="https://your-supabase-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

---

## 2. Running Database Migrations

1. Go to your [Supabase Dashboard](https://app.supabase.com) for your project.
2. Navigate to the **SQL Editor**.
3. Run the initial schema migration located at `/supabase/migrations/20261021_initial_schema.sql`. This creates all 21 tenant-isolated tables, foreign keys, indexes, and versioned configuration tables.
4. Run the RLS policy migration located at `/supabase/migrations/20261021_rls_policies.sql`. This enables Row Level Security on all tables and creates helper functions (`get_user_tenant_ids`, `user_is_admin_or_owner`) to enforce strict school data isolation.

---

## 3. Storage Buckets Setup

In your Supabase Dashboard, create the following private storage buckets for secure asset management:
- `marksheet-parts`: For original uploaded photo parts.
- `merged-marksheets`: For stitched composite marksheet images.
- `ocr-crops`: For OCR bounding box crops or coordinates.
- `report-cards`: For generated PDF/HTML report card exports.

---

## 4. How to Test Tenant Isolation with Two Schools

To verify that **School A** cannot access **School B**'s data under any circumstances:

1. **Register School A**:
   - Sign up with an account (e.g. `director@schoola.com`).
   - Create School A ("Bilingual Academy Yaoundé").
   - Add students and classes for School A.

2. **Register School B**:
   - Sign up with a separate account (e.g. `admin@schoolb.com`).
   - Create School B ("École Bilingue Douala").
   - Add students and classes for School B.

3. **Verify RLS Isolation**:
   - Log in as `director@schoola.com`. Query students or marksheets via the Supabase client.
   - Confirm that **only** School A's records are returned. School B's records are completely hidden by PostgreSQL Row Level Security (`tenant_id` check against `auth.uid()`).
   - Attempt to fetch a student ID belonging to School B directly via the API; RLS will block the query and return zero rows.
