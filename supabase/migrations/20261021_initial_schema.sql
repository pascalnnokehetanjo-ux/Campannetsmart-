-- ====================================================================
-- CAMPANNETSMART SUPABASE MIGRATION: INITIAL SCHEMA & TABLES
-- ====================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Schools (Tenants)
create table if not exists schools (
  id uuid primary key default uuid_generate_v4(),
  name_en text not null,
  name_fr text not null,
  subdivision text,
  created_at timestamptz default now()
);

-- 2. Users (Profiles linked to Supabase Auth)
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  created_at timestamptz default now()
);

-- 3. School Users (Tenant Membership & Role Assignment)
create type user_role as enum ('owner', 'administrator', 'teacher', 'viewer');

create table if not exists school_users (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references schools(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role user_role not null default 'teacher',
  created_at timestamptz default now(),
  unique(tenant_id, user_id)
);

-- 4. Academic Years
create table if not exists academic_years (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references schools(id) on delete cascade,
  title_en text not null,
  title_fr text not null,
  is_active boolean default false,
  created_at timestamptz default now()
);

-- 5. Terms
create table if not exists terms (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references schools(id) on delete cascade,
  academic_year_id uuid not null references academic_years(id) on delete cascade,
  title_en text not null,
  title_fr text not null,
  sequence_order int not null,
  created_at timestamptz default now()
);

-- 6. Months
create table if not exists months (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references schools(id) on delete cascade,
  term_id uuid not null references terms(id) on delete cascade,
  title_en text not null,
  title_fr text not null,
  sequence_order int not null,
  created_at timestamptz default now()
);

-- 7. Classes
create table if not exists classes (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references schools(id) on delete cascade,
  title_en text not null,
  title_fr text not null,
  academic_year_id uuid not null references academic_years(id) on delete cascade,
  teacher_id uuid references users(id),
  created_at timestamptz default now()
);

-- 8. Students
create table if not exists students (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references schools(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  student_number text not null,
  full_name text not null,
  gender text check (gender in ('M', 'F')),
  dob date,
  created_at timestamptz default now(),
  unique(tenant_id, student_number)
);

-- 9. Competences (2018 Official Curriculum)
create table if not exists competences (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references schools(id) on delete cascade,
  competence_number int not null,
  title_en text not null,
  title_fr text not null,
  created_at timestamptz default now()
);

-- 10. Subjects / Sub-competences
create table if not exists subjects (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references schools(id) on delete cascade,
  competence_id uuid not null references competences(id) on delete cascade,
  subject_code text not null,
  title_en text not null,
  title_fr text not null,
  created_at timestamptz default now()
);

-- 11. Evaluation Types (Oral, Written, Practical, Attitude)
create table if not exists evaluation_types (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references schools(id) on delete cascade,
  code text not null,
  title_en text not null,
  title_fr text not null,
  is_mandatory boolean default true,
  created_at timestamptz default now()
);

-- 12. Class Subject Configurations (Configurable max marks with versioning)
create table if not exists class_subject_configurations (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references schools(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  evaluation_type_id uuid not null references evaluation_types(id) on delete cascade,
  max_mark numeric(5,2) not null check (max_mark >= 0),
  version_number int not null default 1,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 13. Marksheets (Batches)
create table if not exists marksheets (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references schools(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  month_id uuid not null references months(id) on delete cascade,
  batch_name text not null,
  is_locked boolean default false,
  locked_at timestamptz,
  unlocked_by uuid references users(id),
  unlock_reason text,
  created_at timestamptz default now()
);

-- 14. Marksheet Parts (Uploaded images)
create table if not exists marksheet_parts (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references schools(id) on delete cascade,
  marksheet_id uuid not null references marksheets(id) on delete cascade,
  storage_path text not null,
  sequence_order int not null,
  rotation int default 0,
  created_at timestamptz default now()
);

-- 15. Merged Marksheets (Composite stitched image)
create table if not exists merged_marksheets (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references schools(id) on delete cascade,
  marksheet_id uuid not null references marksheets(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz default now()
);

-- 16. OCR Extractions
create table if not exists ocr_extractions (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references schools(id) on delete cascade,
  marksheet_id uuid not null references marksheets(id) on delete cascade,
  confidence numeric(4,3) check (confidence >= 0 and confidence <= 1),
  raw_response jsonb,
  created_at timestamptz default now()
);

-- 17. OCR Cells (Cell-by-cell review & audit)
create type cell_status as enum ('pending', 'accepted', 'corrected', 'rejected');

create table if not exists ocr_cells (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references schools(id) on delete cascade,
  extraction_id uuid not null references ocr_extractions(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  evaluation_type_id uuid not null references evaluation_types(id) on delete cascade,
  raw_ocr_text text,
  confidence numeric(4,3),
  proposed_mark numeric(5,2) check (proposed_mark >= 0),
  final_mark numeric(5,2) check (final_mark >= 0),
  status cell_status default 'pending',
  corrected_by uuid references users(id),
  previous_value numeric(5,2),
  created_at timestamptz default now()
);

-- 18. Official Marks (Deterministic official records)
create table if not exists official_marks (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references schools(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  evaluation_type_id uuid not null references evaluation_types(id) on delete cascade,
  month_id uuid not null references months(id) on delete cascade,
  configuration_version_id uuid not null references class_subject_configurations(id),
  mark_obtained numeric(5,2) not null check (mark_obtained >= 0),
  created_at timestamptz default now(),
  unique(student_id, subject_id, evaluation_type_id, month_id)
);

-- 19. Calculation Runs (Audit trail of monthly/termly/annual averages)
create table if not exists calculation_runs (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references schools(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  period_type text check (period_type in ('monthly', 'termly', 'annual')),
  period_id uuid not null,
  computed_average numeric(5,2) not null,
  appreciation text not null,
  grade text not null,
  created_at timestamptz default now()
);

-- 20. Report Cards
create table if not exists report_cards (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references schools(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  report_type text check (report_type in ('monthly', 'termly', 'annual')),
  period_id uuid not null,
  language report_language default 'en',
  storage_path text not null,
  configuration_version_id uuid not null references class_subject_configurations(id),
  created_at timestamptz default now()
);

-- 21. Audit Logs
create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references schools(id) on delete cascade,
  user_id uuid references users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

-- ====================================================================
-- INDEXES FOR TENANT ISOLATION AND PERFORMANCE
-- ====================================================================
create index if not exists idx_school_users_tenant on school_users(tenant_id);
create index if not exists idx_classes_tenant on classes(tenant_id);
create index if not exists idx_students_tenant on students(tenant_id);
create index if not exists idx_students_class on students(class_id);
create index if not exists idx_academic_years_tenant on academic_years(tenant_id);
create index if not exists idx_terms_tenant on terms(tenant_id);
create index if not exists idx_months_tenant on months(tenant_id);
create index if not exists idx_competences_tenant on competences(tenant_id);
create index if not exists idx_subjects_tenant on subjects(tenant_id);
create index if not exists idx_evaluation_types_tenant on evaluation_types(tenant_id);
create index if not exists idx_class_subject_config_tenant on class_subject_configurations(tenant_id);
create index if not exists idx_marksheets_tenant on marksheets(tenant_id);
create index if not exists idx_marksheet_parts_tenant on marksheet_parts(tenant_id);
create index if not exists idx_merged_marksheets_tenant on merged_marksheets(tenant_id);
create index if not exists idx_ocr_extractions_tenant on ocr_extractions(tenant_id);
create index if not exists idx_ocr_cells_tenant on ocr_cells(tenant_id);
create index if not exists idx_official_marks_tenant on official_marks(tenant_id);
create index if not exists idx_calculation_runs_tenant on calculation_runs(tenant_id);
create index if not exists idx_report_cards_tenant on report_cards(tenant_id);
create index if not exists idx_audit_logs_tenant on audit_logs(tenant_id);

create index if not exists idx_official_marks_student on official_marks(student_id);
create index if not exists idx_official_marks_month on official_marks(month_id);
create index if not exists idx_report_cards_student on report_cards(student_id);
