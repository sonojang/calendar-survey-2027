-- ============================================================
-- 2026년 달력 신청 수량 (히스토리 적재용)
-- 출처: 2026년 달력 조사xlsx.xlsx (국내수량 / 해외 수량 및 배송 시트)
--
-- 적용 방법: Supabase Dashboard → SQL Editor 에 붙여넣고 Run
-- (반드시 supabase_v4_historical.sql 을 먼저 실행한 다음에)
--
-- 재실행 시 중복 방지:
delete from domestic_quantities where survey_year = 2026;
delete from overseas_quantities where survey_year = 2026;
-- ============================================================

-- ----- 국내수량 ------------------------------------------------
-- 엑셀 원본: 회사 통합 표기 (장금/흥아 한 행), 그대로 보존
insert into domestic_quantities
  (survey_year, division, team, jangkum_b_qty, heunga_b_qty, submitter_name, note) values
  (2026, '영업본부',     '수출영업팀',   1600,  450, '시스템 적재', '2026 자료'),
  (2026, '영업본부',     '수입영업팀',    700,  300, '시스템 적재', '2026 자료'),
  (2026, '영업본부',     '일본영업팀',    700,  620, '시스템 적재', '2026 자료'),
  (2026, '영업본부',     '중국영업팀',      0,  350, '시스템 적재', '2026 자료'),
  (2026, '영업본부',     '글로벌마케팅팀', 25,   25, '시스템 적재', '2026 자료'),
  (2026, '영업본부',     '러시아영업팀',   70,   70, '시스템 적재', '2026 자료'),
  (2026, '영업본부',     '특수영업팀',     25,   25, '시스템 적재', '2026 자료'),
  (2026, '운영본부',     '장비팀',          0,    0, '시스템 적재', '2026 자료'),
  (2026, '운영본부',     '운항팀',         10,   10, '시스템 적재', '2026 자료'),
  (2026, '운영본부',     '영업기획팀',     50,    0, '시스템 적재', '2026 자료'),
  (2026, '경영관리본부', '전산팀',         25,    0, '시스템 적재', '2026 자료'),
  (2026, '경영관리본부', '총무팀',        200,   50, '시스템 적재', '2026 자료'),
  (2026, '부산사무소',   '영업팀',        950,  500, '시스템 적재', '2026 자료'),
  (2026, '부산사무소',   '운항팀',         83,   68, '시스템 적재', '2026 자료'),
  (2026, '부산사무소',   '관리팀',         42,    7, '시스템 적재', '2026 자료'),
  (2026, '지방사무소',   '인천사무소',    100,  100, '시스템 적재', '2026 자료'),
  (2026, '지방사무소',   '울산사무소',    125,   50, '시스템 적재', '2026 자료'),
  (2026, '지방사무소',   '광양사무소',    100,  100, '시스템 적재', '2026 자료'),
  (2026, '지방사무소',   '평택사무소',    150,  100, '시스템 적재', '2026 자료');

-- ----- 해외수량 ------------------------------------------------
-- 회사별로 행 분리 (장금/흥아 PIC가 달라서). view에서 country+region 단위로 합쳐 표시됨.
insert into overseas_quantities
  (survey_year, company, country, region, calendar_type,
   jangkum_qty, heunga_qty, yjc_jangkum_qty, yjc_heunga_qty,
   shipping_method, note, shipping_address, port_code, pic_name, pic_contact, submitter_name) values

  -- 중국 (A버전)
  (2026, '장금상선', '중국', '상해',  'A', 1125,    0,  200,  100,  '수출업체 위탁',  '홍콩, 대만 국기 표기 제외',
     'Sinokor Merchant Marine (China) Co., Ltd.  // Room 603, Yaojiang International Plaza, No.258 Wusong Road, Shanghai China',
     'CNSHA', 'MS. WU WEN XIAN',  '86-21-6324-2751', '시스템 적재'),
  (2026, '흥아라인', '중국', '상해',  'A',    0,  725,    0,    0,  '수출업체 위탁',  '홍콩, 대만 국기 표기 제외',
     'Heung A Line (China) Co.,Ltd.  // Room 601, Yaojiang International Plaza, No.258 Wusong Road, Shanghai, China',
     'CNSHA', 'MS. YUKI YAO',     '86-21-5385-0306', '시스템 적재'),

  (2026, NULL,       '중국', '대련',  'A',  350,  175,   50,   25,  '천진에서 통관 후 대련으로 배송',  NULL,
     'RM 601, Guoyu Bldg#85 Renmin Road dalian china/ zip 116001',
     'CNDLC', 'ZHANG XIA', '86-411-8255-3889', '시스템 적재'),

  (2026, NULL,       '중국', '청도',  'A',  600,  600,  100,   75,  '상해사무소 통한 배송요청',  '홍콩 대만 국기 표기 불가',
     'Room 1601 16th Floor #9 Building SIIC Center No.195 Hongkong East Road, Laoshan, Qingdao, China',
     NULL, NULL, NULL, '시스템 적재'),

  (2026, NULL,       '중국', '천진',  'A',  400,  300,    0,    0,  '자사 선탁',  '홍콩, 대만 국기 표기 제외',
     '(300040) 6/F,B1-Building,Tianjin Emperor Place,No.85 Nanjing Road,Heping District,Tianjin China.',
     NULL, NULL, NULL, '시스템 적재'),

  (2026, NULL,       '중국', '닝보',  'A',  450,  300,   25,   25,  NULL,  '홍콩, 대만 국기 표기 제외',
     'ROOM 1805, PORTMAN TOWER , NO 48 CAIHONG NORTH ROAD, NINGBO, 315040 ZHEJIANG PROVINCE, CHNA',
     'CNNGB', 'MS. LI HONG BO',  '574-8724-7442', '시스템 적재'),

  (2026, NULL,       '중국', '남경',  'A',    0,    0,   75,    0,  NULL, NULL, NULL, NULL, NULL, NULL, '시스템 적재'),

  (2026, NULL,       '중국', '심천',  'A',  100,  100,   75,   75,  '현재 선박으로 불가능, 택배 가능',  NULL,
     'Rm305, 3F, Zhuoyue Mansion, No. 98, 1st Fuhua Road, Futian Dist., Shenzhen, China',
     '518000', 'MS. Apple Zhang', '86-755-88299901, 135-1055-1899', '시스템 적재'),

  (2026, NULL,       '중국', '샤먼',  'A',   50,   50,    0,    0,  '현재 선박으로 불가능, 택배 가능',  NULL,
     'RM2301,The Bank Centre, No.189, Xiahe Road, Xiamen, P.R.China',
     '361003', 'MR.NORMAN LV', '86-592-238-5177, 136-0094-3409', '시스템 적재'),

  (2026, NULL,       '중국', '위해',  'A',  100,    0,   75,    0,  '수출업체 위탁',  '홍콩, 대만 국기 표기 제외',
     'RM 201, Haibin Middle Road, Sinotrans Building, Weihai, Shandong, 264200 P.R.China',
     'CN', NULL, NULL, '시스템 적재'),

  -- 그 외 해외 (B버전)
  (2026, NULL,       '일본', '전체',  'B',  997, 1052,    0,    0,  NULL,  '해외 세부포트별 시트에 기입',
     NULL, '세부포트기입', NULL, NULL, '시스템 적재'),

  (2026, NULL,       '태국', '방콕',  'B',  400,  400,    0,    0,  '자사 선탁',  NULL,
     'SINOKOR MERCHANT MARINE (THAILAND) CO., LTD. : U Chu Liang Bldg., 10th Floor, 968, Rama 4 Road, Silom, Bangrak, Bangkok, 10500, Thailand',
     'THBKK', 'Mr.Thana / Capt.Natee', '+662-035-6979 / +668-1923-7099', '시스템 적재'),

  (2026, NULL,       '말레이시아', '포트클랑', 'B',  400,  300,    0,    0,  'BY SHIP / AGENT DELIVERY',  '2025년 10월부터 통합사무소 입주 예정 (수량은 작년과 동일)',
     'Suite 8.02, Level 8, Menara Trend, Intan Millenium Square, No. 68, Jalan Batai Laut 4, Taman Intan, 41300 Klang, Selangor Darul Ehsan, Malaysia',
     'MYPKG', 'SKR: Ms. Shaira / Mr. Nigel / HAL: Mr. Kevin / Mr. Zainal', '+60 16 354 7912 / +60 11 118 18099 / +60 19 368 3966 / +60 19 221 1863', '시스템 적재'),

  (2026, NULL,       '베트남', '호치민', 'B',  350,  400,    0,    0,  '자사 선탁',  '흥아 다낭 대리점 50부 포함',
     'Saigon Riverside Bldg., 5th Fl., Suite #507-508, 2A-4A Ton Duc Thang St., Dist. 1 HCM, Vietnam',
     'VNSGN', 'Mr Nguyen Trung Nghia', 'Tel: 84.28.38214446/47 Mobile: 84.903.727.020', '시스템 적재'),

  (2026, NULL,       '베트남', '하노이', 'B',  250,  250,    0,    0,  '자사 선탁',  NULL,
     'SINOKOR (VIETNAM) CO.,LTD Rm.1505, 15th Fl., Thang Long Tower, 98A Nguy Nhu, Kon Tum Street, Thanh Xuan District, Ha Noi, Viet Nam',
     'VNHPH', 'Mr Duong Quoc Ngoc', 'Tel: 84.24.35690893/94 Mobile: 84.908.879.295', '시스템 적재'),

  (2026, '장금상선', '홍콩', '홍콩',  'B',   70,    0,    0,    0,  '자사 선탁',  NULL,
     'Unit 4201-07, Level 42, Metroplaza Tower 1 , 223 Hing Fong Road , Kwai Fong , N.T. Hong Kong.',
     'HKHKG', 'Mr. David', 'Tel: 852-2107 2025 / Email: david@sinokor.com.hk', '시스템 적재'),
  (2026, '흥아라인', '홍콩', '홍콩',  'B',    0,   70,    0,    0,  '자사 선탁',  NULL,
     'Unit 4220-25, Level 42, Metroplaza Tower 1, 223 Hing Fong road, Kwai Fong, N.T. Hong Kong.',
     'HKHKG', 'Mr. Ben Ko', 'Tel: 852-25343726 / Email: ops@konghing.com.hk', '시스템 적재'),

  (2026, '흥아라인', '광저우', '광저우', 'B',    0,  175,    0,    0,  '선탁 불가. DHL 배송 요청',  NULL,
     'Unit 3304, North Tower, World Trade Centre, 371 Huanshi Dong Road, Guangzhou, PRC.',
     'DHL', 'Mr. Kenny Li', 'Tel: 86-20-87606239 / Email: gzkenny@konghing.com.cn', '시스템 적재'),
  (2026, '장금상선', '광저우', '광저우', 'B',  175,    0,    0,    0,  '선탁 불가. DHL 배송 요청',  NULL,
     'Unit 5, 23th Floor, Teemtower, 208 Tianhe Road, Tianhe District, Guangzhou, China',
     'DHL', 'Ms Anna', 'Tel: 20-8334 0089 / Email: anna@sinokor.com.cn', '시스템 적재'),

  (2026, NULL,       '인도', '인도',  'B',  300,  300,    0,    0,  '선탁',  NULL,
     'Anchorage Bldg., 4th Floor, Near Amarnath Patil Ground, Off. Govandi Station Road, Govandi (East), Mumbai 400 088.',
     'INNSA', 'Mr. Chetan Rajput', '+91 22 6900831', '시스템 적재'),

  (2026, NULL,       '러시아', '블라디', 'B',  100,  100,    0,    0,  '자사 선탁',  NULL,
     '690106, Russia, Vladivostok, Krasnogo Znameni avenue 3, Ignat business centre, 9 floor, office 10',
     'RUVVO', 'Mr.Konstantin', '+7(423)2795786', '시스템 적재'),

  -- 대리점 지역 (수량 있음 / 없음 혼재)
  (2026, NULL,       '샨토우', '대리점',  'A',   25,   25,    0,    0,  '현재 선박으로 불가능, 택배 가능',  NULL,
     'Room 606, Building 10, Longguang Century Business Center, No.115 Haibin Road, Shantou, Guangdong, China',
     '515041', 'MS. Betty Huang', '86-754-88994611, 137-2650-9456', '시스템 적재'),

  (2026, NULL,       '치타공',   '대리점', 'B',    0,    0,    0,    0,  NULL, '2026년 신청 수량 없음', NULL, 'BDCGP', NULL, NULL, '시스템 적재'),
  (2026, NULL,       '미얀마',   '대리점', 'B',    0,    0,    0,    0,  NULL, '2026년 신청 수량 없음', NULL, 'MMRGN', NULL, NULL, '시스템 적재'),
  (2026, NULL,       '캄보디아', '대리점', 'B',    0,    0,    0,    0,  NULL, '2026년 신청 수량 없음', NULL, 'KHPNH', NULL, NULL, '시스템 적재');
