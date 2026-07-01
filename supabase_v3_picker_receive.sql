-- ============================================================
-- v3 마이그레이션: 해외 신청건 가져오기 + 수령완료 버튼
-- Supabase SQL Editor 에서 실행 (Ctrl+A로 비우고 붙여넣기)
-- ============================================================

-- 1) shipping_status 에 수령완료 컬럼 추가
ALTER TABLE shipping_status
  ADD COLUMN IF NOT EXISTS received_at      timestamptz,
  ADD COLUMN IF NOT EXISTS received_by_name text;

-- 2) 익명 사용자가 해외 신청건 조회 가능 (발송 등록 화면에서 끌어오기 위해)
DROP POLICY IF EXISTS "anon select overseas" ON overseas_quantities;
CREATE POLICY "anon select overseas" ON overseas_quantities
  FOR SELECT TO anon USING (true);

-- 3) 익명 사용자가 수령완료 처리 가능 (수령자가 받으면 직접 클릭)
DROP POLICY IF EXISTS "anon update shipping" ON shipping_status;
CREATE POLICY "anon update shipping" ON shipping_status
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
