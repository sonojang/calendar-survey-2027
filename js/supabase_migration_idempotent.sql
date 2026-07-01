-- ============================================================
-- 멱등(idempotent) 마이그레이션
-- 어떤 상태에서 실행해도 안전합니다. 무한 반복 실행 가능.
-- ============================================================

-- 1) company 컬럼 추가 (없을 때만)
alter table domestic_quantities add column if not exists company text;

-- 2) 정책을 한 번 삭제 후 재생성 (이미 있어도 OK)
drop policy if exists "anon insert domestic" on domestic_quantities;
drop policy if exists "anon insert overseas" on overseas_quantities;
drop policy if exists "anon insert detail"   on detail_ports;
drop policy if exists "anon insert holiday"  on overseas_holidays;
drop policy if exists "anon insert network"  on network_changes;
drop policy if exists "auth all domestic"    on domestic_quantities;
drop policy if exists "auth all overseas"    on overseas_quantities;
drop policy if exists "auth all detail"      on detail_ports;
drop policy if exists "auth all holiday"     on overseas_holidays;
drop policy if exists "auth all network"     on network_changes;

create policy "anon insert domestic" on domestic_quantities for insert to anon with check (true);
create policy "anon insert overseas" on overseas_quantities for insert to anon with check (true);
create policy "anon insert detail"   on detail_ports        for insert to anon with check (true);
create policy "anon insert holiday"  on overseas_holidays   for insert to anon with check (true);
create policy "anon insert network"  on network_changes     for insert to anon with check (true);

create policy "auth all domestic" on domestic_quantities for all to authenticated using (true) with check (true);
create policy "auth all overseas" on overseas_quantities for all to authenticated using (true) with check (true);
create policy "auth all detail"   on detail_ports        for all to authenticated using (true) with check (true);
create policy "auth all holiday"  on overseas_holidays   for all to authenticated using (true) with check (true);
create policy "auth all network"  on network_changes     for all to authenticated using (true) with check (true);
