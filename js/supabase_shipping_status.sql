-- ============================================================
-- 달력 배송 상황 테이블 (발송 + 수령 통합)
-- Supabase SQL Editor 에서 실행
-- ============================================================

create table if not exists shipping_status (
  id               bigserial primary key,
  company          text,                  -- 장금상선 / 흥아라인 (어느 회사 달력)
  country          text not null,
  region           text not null,
  status_type      text not null,         -- 'shipped' (발송) | 'received' (수령)
  qty              integer default 0,     -- 수량
  status_date      text,                  -- 일자 (YYYY-MM-DD)
  courier          text,                  -- 운송업체 (발송 시)
  tracking_no      text,                  -- 송장번호 (발송 시)
  note             text,
  submitter_name   text,
  submitter_email  text,
  submitter_office text,
  created_at       timestamptz not null default now()
);

create index if not exists idx_ship_region on shipping_status (country, region);
create index if not exists idx_ship_type   on shipping_status (status_type);

alter table shipping_status enable row level security;
create policy "anon insert shipping" on shipping_status for insert to anon          with check (true);
create policy "auth all shipping"    on shipping_status for all    to authenticated using (true) with check (true);
