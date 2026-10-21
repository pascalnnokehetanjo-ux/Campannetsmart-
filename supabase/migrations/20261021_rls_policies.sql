-- ====================================================================
-- CAMPANNETSMART SUPABASE MIGRATION: ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Helper function to get current user's tenant IDs
create or replace function get_user_tenant_ids()
returns setof uuid
language sql security definer
as $$
  select tenant_id from school_users where user_id = auth.uid();
$$;

-- Helper function to check if current user has admin or owner role in tenant
create or replace function user_is_admin_or_owner(p_tenant_id uuid)
returns boolean
language sql security definer
as $$
  select exists (
    select 1 from school_users 
    where user_id = auth.uid() 
      and tenant_id = p_tenant_id 
      and role in ('owner', 'administrator')
  );
$$;

-- Enable RLS on all tenant tables
alter table schools enable row level security;
alter table users enable row level security;
alter table school_users enable row level security;
alter table academic_years enable row level security;
alter table terms enable row level security;
alter table months enable row level security;
alter table classes enable row level security;
alter table students enable row level security;
alter table competences enable row level security;
alter table subjects enable row level security;
alter table evaluation_types enable row level security;
alter table class_subject_configurations enable row level security;
alter table marksheets enable row level security;
alter table marksheet_parts enable row level security;
alter table merged_marksheets enable row level security;
alter table ocr_extractions enable row level security;
alter table ocr_cells enable row level security;
alter table official_marks enable row level security;
alter table calculation_runs enable row level security;
alter table report_cards enable row level security;
alter table audit_logs enable row level security;

-- ====================================================================
-- RLS POLICIES FOR TENANT ISOLATION
-- ====================================================================

-- Schools
create policy "Users can view their schools" on schools
  for select using (id in (select get_user_tenant_ids()));

create policy "Owners can update their school" on schools
  for update using (user_is_admin_or_owner(id));

-- Users Profile
create policy "Users can view own profile" on users
  for select using (id = auth.uid() or id in (
    select user_id from school_users where tenant_id in (select get_user_tenant_ids())
  ));

create policy "Users can update own profile" on users
  for update using (id = auth.uid());

-- School Users (Membership)
create policy "View school members" on school_users
  for select using (tenant_id in (select get_user_tenant_ids()));

create policy "Admins manage school members" on school_users
  for all using (user_is_admin_or_owner(tenant_id));

-- Generic Tenant Data Tables (Academic Years, Terms, Months, Classes, Students, Competences, Subjects, Evaluation Types, Marksheets, Official Marks, Report Cards, Audit Logs)
create macro tenant_isolation_policy(tbl regclass) as
  create policy "Tenant isolation select" on tbl for select using (tenant_id in (select get_user_tenant_ids()));
  create policy "Tenant isolation insert" on tbl for insert with check (tenant_id in (select get_user_tenant_ids()));
  create policy "Tenant isolation update" on tbl for update using (tenant_id in (select get_user_tenant_ids()));
  create policy "Tenant isolation delete" on tbl for delete using (tenant_id in (select get_user_tenant_ids()));
end macro;

-- Apply tenant isolation policies across all tenant-specific tables
create policy "Academic years tenant isolation" on academic_years for all using (tenant_id in (select get_user_tenant_ids()));
create policy "Terms tenant isolation" on terms for all using (tenant_id in (select get_user_tenant_ids()));
create policy "Months tenant isolation" on months for all using (tenant_id in (select get_user_tenant_ids()));
create policy "Classes tenant isolation" on classes for all using (tenant_id in (select get_user_tenant_ids()));
create policy "Students tenant isolation" on students for all using (tenant_id in (select get_user_tenant_ids()));
create policy "Competences tenant isolation" on competences for all using (tenant_id in (select get_user_tenant_ids()));
create policy "Subjects tenant isolation" on subjects for all using (tenant_id in (select get_user_tenant_ids()));
create policy "Evaluation types tenant isolation" on evaluation_types for all using (tenant_id in (select get_user_tenant_ids()));
create policy "Class subject configs tenant isolation" on class_subject_configurations for all using (tenant_id in (select get_user_tenant_ids()));
create policy "Marksheets tenant isolation" on marksheets for all using (tenant_id in (select get_user_tenant_ids()));
create policy "Marksheet parts tenant isolation" on marksheet_parts for all using (tenant_id in (select get_user_tenant_ids()));
create policy "Merged marksheets tenant isolation" on merged_marksheets for all using (tenant_id in (select get_user_tenant_ids()));
create policy "OCR extractions tenant isolation" on ocr_extractions for all using (tenant_id in (select get_user_tenant_ids()));
create policy "OCR cells tenant isolation" on ocr_cells for all using (tenant_id in (select get_user_tenant_ids()));
create policy "Official marks tenant isolation" on official_marks for all using (tenant_id in (select get_user_tenant_ids()));
create policy "Calculation runs tenant isolation" on calculation_runs for all using (tenant_id in (select get_user_tenant_ids()));
create policy "Report cards tenant isolation" on report_cards for all using (tenant_id in (select get_user_tenant_ids()));
create policy "Audit logs tenant isolation" on audit_logs for all using (tenant_id in (select get_user_tenant_ids()));
