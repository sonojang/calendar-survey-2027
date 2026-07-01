-- ============================================================
-- 2027 달력 조사 사이트 - v2 마이그레이션
-- domestic_quantities 테이블에 company 컬럼 추가
-- (장금상선 / 흥아라인 구분)
-- Supabase SQL Editor 에서 실행
-- ============================================================

alter table domestic_quantities
  add column if not exists company text;

-- 기존 데이터(테스트 응답)는 NULL로 남음. 빈 응답 정리:
-- delete from domestic_quantities where company is null;
