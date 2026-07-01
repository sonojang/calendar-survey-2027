-- ============================================================
-- 2027년 달력 사이트 - v4 마이그레이션
-- "과거 신청 수량(연도별 누적)" 기능을 위한 스키마 변경
--
-- 적용 방법: Supabase Dashboard → SQL Editor 에 통째로 붙여넣고 Run
-- (1회만 실행. 두 번 실행해도 IF NOT EXISTS / OR REPLACE 로 안전)
-- ============================================================

-- 1) survey_year 컬럼 추가 ----------------------------------------
alter table domestic_quantities add column if not exists survey_year integer;
alter table overseas_quantities add column if not exists survey_year integer;

-- 기본값을 현재 조사년도(2027)로 — 이후 INSERT는 자동 채워짐
alter table domestic_quantities alter column survey_year set default 2027;
alter table overseas_quantities alter column survey_year set default 2027;

-- 기존 행(null)은 2027로 백필
update domestic_quantities set survey_year = 2027 where survey_year is null;
update overseas_quantities set survey_year = 2027 where survey_year is null;

create index if not exists idx_domestic_year on domestic_quantities (survey_year);
create index if not exists idx_overseas_year on overseas_quantities (survey_year);


-- 2) 집계 VIEW ----------------------------------------------------
-- 같은 (year, company, division/team or country/region) 조합 중 최신 응답만 채택 → 그 후 합산
-- → 모달은 이 view에서 조회 (개인정보 컬럼 제외)
create or replace view v_yearly_domestic as
with latest as (
  select distinct on (survey_year, company, division, team)
    survey_year, company, division, team,
    jangkum_b_qty, heunga_b_qty, created_at
  from domestic_quantities
  where survey_year is not null
  order by survey_year, company, division, team, created_at desc
)
select
  survey_year, division, team,
  sum(jangkum_b_qty)::int as jangkum_b_qty,
  sum(heunga_b_qty)::int  as heunga_b_qty
from latest
group by survey_year, division, team
order by survey_year, division, team;

create or replace view v_yearly_overseas as
with latest as (
  select distinct on (survey_year, company, country, region)
    survey_year, company, country, region, calendar_type,
    jangkum_qty, heunga_qty, yjc_jangkum_qty, yjc_heunga_qty,
    shipping_method, shipping_address, port_code, pic_name, pic_contact, note, created_at
  from overseas_quantities
  where survey_year is not null
  order by survey_year, company, country, region, created_at desc
)
select
  survey_year, country, region,
  max(calendar_type) as calendar_type,
  sum(jangkum_qty)::int      as jangkum_qty,
  sum(heunga_qty)::int       as heunga_qty,
  sum(yjc_jangkum_qty)::int  as yjc_jangkum_qty,
  sum(yjc_heunga_qty)::int   as yjc_heunga_qty,
  string_agg(distinct nullif(shipping_method,''),  ' / ') as shipping_method,
  string_agg(distinct nullif(shipping_address,''), E'\n---\n') as shipping_address,
  string_agg(distinct nullif(port_code,''),        ', ') as port_code,
  string_agg(distinct nullif(pic_name,''),         ' / ') as pic_name,
  string_agg(distinct nullif(pic_contact,''),      ' / ') as pic_contact,
  string_agg(distinct nullif(note,''),             ' / ') as note
from latest
group by survey_year, country, region
order by survey_year, country, region;


-- 3) anon SELECT 권한 — view에서만 (개인정보 제외) ---------------
grant select on v_yearly_domestic to anon;
grant select on v_yearly_overseas to anon;
grant select on v_yearly_domestic to authenticated;
grant select on v_yearly_overseas to authenticated;
