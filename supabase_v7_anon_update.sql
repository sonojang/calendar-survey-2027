-- ============================================================
-- 2027년 달력 사이트 - v7 마이그레이션
-- 담당자가 본인이 입력한 응답을 수정할 수 있도록
-- anon(익명) 사용자에게 UPDATE 권한 부여
--
-- 적용 방법: Supabase Dashboard → SQL Editor 에 통째로 붙여넣고 Run
-- ⚠️ 담당자가 이메일로 자기 응답을 찾아 수정하는 방식.
--    URL 아는 누구든 anon으로 UPDATE 가능하므로 사내 URL 공유 기반 전제.
-- ============================================================

-- 기존 정책이 있으면 제거
drop policy if exists "anon update domestic"  on domestic_quantities;
drop policy if exists "anon update overseas"  on overseas_quantities;
drop policy if exists "anon update detail"    on detail_ports;
drop policy if exists "anon update holiday"   on overseas_holidays;
drop policy if exists "anon update network"   on network_changes;
drop policy if exists "anon update shipping"  on shipping_status;

-- anon UPDATE 허용
create policy "anon update domestic" on domestic_quantities for update to anon using (true) with check (true);
create policy "anon update overseas" on overseas_quantities for update to anon using (true) with check (true);
create policy "anon update detail"   on detail_ports        for update to anon using (true) with check (true);
create policy "anon update holiday"  on overseas_holidays   for update to anon using (true) with check (true);
create policy "anon update network"  on network_changes    for update to anon using (true) with check (true);
create policy "anon update shipping" on shipping_status    for update to anon using (true) with check (true);
