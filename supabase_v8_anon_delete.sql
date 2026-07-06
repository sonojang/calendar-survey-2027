-- ============================================================
-- 2027년 달력 사이트 - v8 마이그레이션
-- 세부포트/공휴일/네트워크 변경 탭에서
-- "이전 제출 불러오기 → 편집(일부 삭제 포함) → 전체 제출" 흐름을 지원하려면
-- 담당자(anon)가 자신의 이전 행을 삭제할 수 있어야 합니다.
--
-- 적용: Supabase Dashboard → SQL Editor 에 통째로 붙여넣고 Run
-- ⚠️  URL 공유 기반 전제. 이미 anon UPDATE/INSERT 가 열려 있는 상태와
--     동일한 신뢰 수준이며, 관리자 감시(전체 조회)로 이상 삭제는 즉시 확인 가능.
-- ============================================================

-- 기존 정책이 있으면 제거 (재실행 안전)
drop policy if exists "anon delete detail"   on detail_ports;
drop policy if exists "anon delete holiday"  on overseas_holidays;
drop policy if exists "anon delete network"  on network_changes;

-- anon DELETE 허용
create policy "anon delete detail"  on detail_ports      for delete to anon using (true);
create policy "anon delete holiday" on overseas_holidays for delete to anon using (true);
create policy "anon delete network" on network_changes   for delete to anon using (true);
