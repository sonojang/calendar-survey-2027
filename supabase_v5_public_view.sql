-- ============================================================
-- 2027년 달력 사이트 - v5 마이그레이션
-- "전체 조회" 페이지에서 인증 없이 응답을 조회할 수 있도록
-- anon(익명) 사용자에게 SELECT 권한 부여
--
-- 적용 방법: Supabase Dashboard → SQL Editor 에 통째로 붙여넣고 Run
-- ⚠️ 실행 후 URL을 아는 누구나 전체 응답(이름·이메일 포함)을 조회 가능해집니다.
--    사내 URL 공유 기반이라는 전제이며, 회사 정책에 맞는지 확인 후 실행하세요.
--
-- (재실행 안전: create policy if not exists 로 처리)
-- ============================================================

-- 이전 익명 정책이 있으면 제거 (중복 방지)
drop policy if exists "anon select domestic" on domestic_quantities;
drop policy if exists "anon select overseas" on overseas_quantities;
drop policy if exists "anon select detail"   on detail_ports;
drop policy if exists "anon select holiday"  on overseas_holidays;
drop policy if exists "anon select network"  on network_changes;
-- shipping_status 는 이미 anon select 정책 존재 (덮어씀 방지 위해 조건부)
drop policy if exists "anon select shipping" on shipping_status;

-- anon SELECT 허용 (모든 응답 조회)
create policy "anon select domestic" on domestic_quantities for select to anon using (true);
create policy "anon select overseas" on overseas_quantities for select to anon using (true);
create policy "anon select detail"   on detail_ports        for select to anon using (true);
create policy "anon select holiday"  on overseas_holidays   for select to anon using (true);
create policy "anon select network"  on network_changes    for select to anon using (true);
create policy "anon select shipping" on shipping_status    for select to anon using (true);
