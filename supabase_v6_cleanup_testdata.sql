-- ============================================================
-- 2027년 달력 사이트 - v6 정리
-- 테스트 데이터(수출이 / 조아로리) 완전 삭제
--
-- 적용 방법: Supabase Dashboard → SQL Editor 에 통째로 붙여넣고 Run
-- (재실행 안전: 이미 지워졌으면 0건 삭제)
--
-- ⚠️ 되돌릴 수 없습니다. 실행 전에 남길 자료가 있으면 백업하세요.
-- ============================================================

-- 삭제 대상 이름
--   수출이, 조아로리 (테스트 계정으로 입력한 응답)

delete from domestic_quantities
  where submitter_name in ('수출이', '조아로리');

delete from overseas_quantities
  where submitter_name in ('수출이', '조아로리');

delete from detail_ports
  where submitter_name in ('수출이', '조아로리');

delete from overseas_holidays
  where submitter_name in ('수출이', '조아로리');

delete from network_changes
  where submitter_name in ('수출이', '조아로리');

-- shipping_status 는 submitter_name 컬럼이 없으니 스킵
