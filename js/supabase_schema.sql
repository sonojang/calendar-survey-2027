-- ============================================================
-- 2027년 달력 제작 조사 사이트 - Supabase DB 스키마
-- Supabase Dashboard → SQL Editor 에 붙여넣고 실행하세요.
-- ============================================================

-- ============================================================
-- 1) 국내수량: 국내 장금/흥아 팀장이 입력 (장금B + 흥아B)
-- ============================================================
create table if not exists domestic_quantities (
  id              bigserial primary key,
  company         text,                           -- 소속회사 (장금상선 / 흥아라인)
  division        text not null,                  -- 본부 (영업본부/운영본부/경영관리본부/부산사무소/지방사무소)
  team            text not null,                  -- 팀/사무소 이름
  jangkum_b_qty   integer not null default 0,     -- 장금B (홍콩국기 포함) 수량
  heunga_b_qty    integer not null default 0,     -- 흥아B (홍콩국기 포함) 수량
  submitter_name  text,                           -- 입력자 이름
  submitter_email text,                           -- 입력자 이메일
  note            text,                           -- 비고
  created_at      timestamptz not null default now()
);

create index if not exists idx_domestic_team    on domestic_quantities (company, division, team);
create index if not exists idx_domestic_created on domestic_quantities (created_at desc);

-- ============================================================
-- 2) 해외수량 및 배송: 해외 주재원이 시트2 양식으로 입력
--    중국 → 장금A/흥아A (홍콩국기 없음)
--    나머지 → 장금B/흥아B (홍콩국기 있음)
-- ============================================================
create table if not exists overseas_quantities (
  id               bigserial primary key,
  company          text,                          -- 입력자 소속회사 (장금상선/흥아라인/YJC)
  country          text not null,                 -- 국가 (중국/일본/태국/말레이시아/싱가폴/인도네시아/베트남/홍콩/광저우/인도/필리핀/파키스탄/러시아/대만)
  region           text not null,                 -- 지역 (상해/대련/청도/...)
  calendar_type    text not null check (calendar_type in ('A','B')), -- A:홍콩국기 없음, B:있음
  jangkum_qty      integer not null default 0,    -- 장금 수량
  heunga_qty       integer not null default 0,    -- 흥아 수량
  yjc_jangkum_qty  integer not null default 0,    -- YJC 장금 수량
  yjc_heunga_qty   integer not null default 0,    -- YJC 흥아 수량
  shipping_method  text,                          -- 배송방법 (자사선 선탁/수출업체 위탁/DHL 등)
  note             text,                          -- 비고(특이사항)
  shipping_address text,                          -- 배송주소
  port_code        text,                          -- Port Code
  pic_name         text,                          -- 담당자 이름
  pic_contact      text,                          -- 담당자 연락처
  submitter_name   text,                          -- 입력자 이름
  submitter_email  text,                          -- 입력자 이메일
  created_at       timestamptz not null default now()
);

create index if not exists idx_overseas_region  on overseas_quantities (country, region);
create index if not exists idx_overseas_created on overseas_quantities (created_at desc);

-- ============================================================
-- 3) 세부포트: 한 국가에서 여러 지역으로 분산 배송시 (시트3)
-- ============================================================
create table if not exists detail_ports (
  id               bigserial primary key,
  company          text,                          -- 입력자 소속회사
  country          text not null,                 -- 국가 (예: JAPAN)
  region           text not null,                 -- 세부 배송지 지역 (예: TOKYO)
  port_code        text,                          -- Port Code (예: JPTYO)
  quantity         integer not null default 0,    -- 수량
  address          text,                          -- 주소 (영문)
  company_name     text,                          -- 배송지 회사명/사명
  submitter_name   text,
  submitter_email  text,
  created_at       timestamptz not null default now()
);

create index if not exists idx_detail_country on detail_ports (country, region);

-- ============================================================
-- 4) 해외휴일: 다음년도 공휴일 (시트4)
-- ============================================================
create table if not exists overseas_holidays (
  id              bigserial primary key,
  company         text,                           -- 입력자 소속회사
  country         text not null,                  -- 국가
  holiday_date    text not null,                  -- 날짜 (예: 2027-01-01 또는 2027-01-01 ~ 03)
  weekday         text,                           -- 요일
  holiday_name_en text not null,                  -- 공휴일 이름 (영어)
  submitter_name  text,
  submitter_email text,
  created_at      timestamptz not null default now()
);

create index if not exists idx_holiday_country on overseas_holidays (country);

-- ============================================================
-- 5) 네트워크 변경사항: 달력 마지막 페이지 네트워크 정보
-- ============================================================
create table if not exists network_changes (
  id              bigserial primary key,
  company         text,                           -- 입력자 소속회사
  country         text not null,                  -- 국가
  branch_name     text not null,                  -- 지점/사무소명
  field           text,                           -- 변경 항목 (주소/연락처/팩스/이메일/PIC)
  old_value       text,                           -- 기존 값
  new_value       text,                           -- 변경 값
  full_note       text,                           -- 전체 메모 (자유서술)
  submitter_name  text,
  submitter_email text,
  created_at      timestamptz not null default now()
);

create index if not exists idx_network_country on network_changes (country, branch_name);

-- ============================================================
-- RLS (Row Level Security) 설정
--  - 익명 사용자: INSERT만 허용 (응답 제출)
--  - 인증된 사용자(관리자): 모든 작업 허용
-- ============================================================
alter table domestic_quantities  enable row level security;
alter table overseas_quantities  enable row level security;
alter table detail_ports         enable row level security;
alter table overseas_holidays    enable row level security;
alter table network_changes      enable row level security;

-- 익명 INSERT 허용
create policy "anon insert domestic"  on domestic_quantities  for insert to anon with check (true);
create policy "anon insert overseas"  on overseas_quantities  for insert to anon with check (true);
create policy "anon insert detail"    on detail_ports         for insert to anon with check (true);
create policy "anon insert holiday"   on overseas_holidays    for insert to anon with check (true);
create policy "anon insert network"   on network_changes      for insert to anon with check (true);

-- 인증된 사용자(관리자) 전체 권한
create policy "auth all domestic"  on domestic_quantities  for all to authenticated using (true) with check (true);
create policy "auth all overseas"  on overseas_quantities  for all to authenticated using (true) with check (true);
create policy "auth all detail"    on detail_ports         for all to authenticated using (true) with check (true);
create policy "auth all holiday"   on overseas_holidays    for all to authenticated using (true) with check (true);
create policy "auth all network"   on network_changes      for all to authenticated using (true) with check (true);
