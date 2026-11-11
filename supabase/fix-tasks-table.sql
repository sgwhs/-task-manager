-- =============================================================
-- 一键修复 tasks 表（在 Supabase 控制台 → SQL Editor 里整段粘贴后点 Run）
-- 作用：
--   1. 补上缺少的 due_date（截止日期）字段
--   2. 打开 RLS 的四条读写策略（否则页面添加/修改/删除任务会被拦截）
-- 可以重复执行，不会报错
-- =============================================================

-- 1) 补齐截止日期字段
alter table tasks add column if not exists due_date date;

-- 2) 创建时间倒序索引（可选，数据量大时更快）
create index if not exists tasks_created_at_idx on tasks (created_at desc);

-- 3) 开启行级安全 + 允许匿名读写（教学演示用）
alter table tasks enable row level security;

drop policy if exists "Allow anon read"   on tasks;
drop policy if exists "Allow anon insert" on tasks;
drop policy if exists "Allow anon update" on tasks;
drop policy if exists "Allow anon delete" on tasks;

create policy "Allow anon read"   on tasks for select using (true);
create policy "Allow anon insert" on tasks for insert with check (true);
create policy "Allow anon update" on tasks for update using (true) with check (true);
create policy "Allow anon delete" on tasks for delete using (true);
