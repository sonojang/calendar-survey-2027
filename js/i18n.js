// ============================================================
// i18n - 한/영 다국어 토글
// 사용법:
//   <h1 data-i18n="header.title">기본 한국어 텍스트</h1>
//   <input data-i18n-placeholder="form.name_ph" placeholder="이름">
//   JS:  document.title = i18n.t('header.title');
//   언어 전환: i18n.setLang('en') / 'ko'
// ============================================================

(function (root) {

  const T = {
    ko: {
      /* ---------- 공통 ---------- */
      'nav.home':              '← 홈',
      'nav.admin':             '📊 전체 조회',
      'nav.logout':            '로그아웃',
      'nav.change_pw':         '🔑 비밀번호 변경',
      'common.required':       '*',
      'common.select':         '선택하세요',
      'common.select_short':   '선택',
      'common.submit':         '제출하기',
      'common.submit_all':     '전체 제출',
      'common.add_row':        '+ 행 추가',
      'common.refresh':        '⟳ 새로고침',
      'common.delete':         '삭제',
      'common.cancel':         '취소',
      'common.save':           '저장',
      'common.change':         '변경',
      'common.loading':        '불러오는 중...',
      'common.first_select_country': '먼저 국가를 선택하세요',
      'common.first_select_div':     '먼저 회사를 선택하세요',
      'common.first_select_team':    '먼저 본부를 선택하세요',
      'common.custom_input':         '+ 직접 입력',
      'common.all':            '전체',
      'common.note':           '비고',
      'common.note_special':   '비고(특이사항)',
      'common.no_data':        '데이터가 없습니다',
      'common.box_hint':       '수량 단위는 1BOX(25부) 기준 입니다.',
      'common.company':        '회사',
      'common.country':        '국가',
      'common.region':         '지역',
      'common.qty':            '수량',
      'common.address':        '주소',
      'common.email':          '이메일',
      'common.name':           '이름',
      'common.contact':        '연락처',
      'common.dept':           '소속 / 부서',
      'common.dept_ph':        '예: 총무팀',
      'common.lang_toggle':    '언어 / Language',
      'common.copyright':      '© 장금상선, 흥아라인 · 2027년 달력 제작 조사',
      'common.btn_history':    '📄 과거 신청 수량',
      'history.title_dom':     '과거 국내 신청 수량',
      'history.title_ovr':     '과거 해외 신청 수량',
      'history.year':          '연도',
      'history.empty':         '아직 과거 신청 데이터가 없습니다.',
      'common.query_error':    '조회 오류',
      'common.delete_short':   '×',

      /* ---------- 인덱스 ---------- */
      'idx.title':             '2027년 달력 제작 조사',
      'idx.subtitle':          '장금상선 · 흥아라인 · YJC',
      'idx.guide_h':           '안내',
      'idx.guide_p':           '2027년 사내 달력 제작을 위한 수량 및 배송 정보 조사입니다. 해당하시는 항목을 선택하여 입력해 주세요. 마감 후 총무팀에서 취합하여 제작에 반영합니다.',
      'idx.cal_kinds_h':       '달력 종류 안내',
      'idx.cal_kinds_a':       '· 장금상선A / 흥아라인A — <b>홍콩국기 제외</b> (중국 지역용)',
      'idx.cal_kinds_b':       '· 장금상선B / 흥아라인B — <b>홍콩국기 포함</b> (국내·기타 해외 지역용)',
      'idx.role_h':            '입력자 유형 선택',
      'idx.card_dom_h':        '국내 달력 신청',
      'idx.card_dom_p':        '장금상선 · 흥아라인 국내 본부/팀<br>(장금B + 흥아B 수량)',
      'idx.card_ovr_h':        '해외 달력 신청',
      'idx.card_ovr_p':        '국가/지역별 수량 + 배송정보<br>+ 세부포트 / 공휴일 / 네트워크',
      'idx.card_ship_h':       '달력 배송 상황',
      'idx.card_ship_p':       '발송 등록 및 수령 확인',
      'idx.card_admin_h':      '전체 조회',
      'idx.card_admin_p':      '응답 현황 조회<br>+ 엑셀 다운로드',

      /* ---------- 국내 ---------- */
      'dom.title':             '국내 달력 신청',
      'dom.subtitle':          '장금상선B + 흥아라인B (홍콩국기 포함)',
      'dom.guide_h':           '입력 안내',
      'dom.guide_p':           '소속회사 → 본부 → 팀을 차례로 선택하고 2027년에 필요한 <b>장금상선B</b> · <b>흥아라인B</b> 수량을 입력해 주세요.',
      'dom.warn':              '<b>국내 팀장</b>은 B버전 (홍콩국기 포함)만 신청합니다. A버전(홍콩국기 제외)은 중국 지역 전용입니다.',
      'dom.sec_org':           '소속',
      'dom.sec_submitter':     '입력자 정보',
      'dom.sec_qty':           '신청 수량 (2027년)',
      'dom.company':           '소속회사',
      'dom.division':          '본부/사무소',
      'dom.team':              '팀/구분',
      'dom.submitter_name':    '입력자 이름',
      'dom.submitter_email':   '입력자 이메일',
      'dom.qty_jangkum':       '장금상선B 수량',
      'dom.qty_heunga':        '흥아라인B 수량',
      'dom.hint_hk':           '홍콩국기 포함',
      'dom.note_ph':           '특이사항이 있으면 적어주세요',

      /* ---------- 해외 ---------- */
      'ovr.title':             '해외사무소 달력 신청',
      'ovr.subtitle':          '국가/지역별 수량·배송정보 · 세부포트 · 공휴일 · 네트워크 변경',
      'ovr.submitter_h':       '입력자 정보',
      'ovr.submitter_p':       '모든 탭에 공통으로 적용됩니다. 먼저 입력해 주세요.',
      'ovr.submitter_company': '소속회사',
      'ovr.branch_country':    '해외법인 국가',
      'ovr.branch_country_ph': '국가명을 직접 입력하세요',
      'ovr.branch_region':     '해외법인 지역/사무소',
      'ovr.branch_region_ph':  '지역/사무소명을 직접 입력하세요',
      'ovr.tab_qty':           '① 수량·배송정보',
      'ovr.tab_detail':        '② 세부포트',
      'ovr.tab_holiday':       '③ 다음년도 공휴일',
      'ovr.tab_network':       '④ 네트워크 변경',
      'ovr.qty_h':             '① 국가/지역별 수량 및 배송정보',
      'ovr.qty_info':          '<b>중국</b>은 A버전(홍콩국기 없음), 그 외 국가는 B버전(홍콩국기 있음)으로 자동 설정됩니다.<br>변경시 총무팀에 문의해 주세요.',
      'ovr.qty_company_hint':  '👆 <b>신청 달력 회사</b>를 먼저 선택해 주세요. 회사 선택 후 해당 회사의 수량 입력이 활성화됩니다.',
      'ovr.qty_company':       '신청 달력 회사',
      'ovr.qty_company_jk':    '장금상선 달력',
      'ovr.qty_company_ha':    '흥아라인 달력',
      'ovr.qty_country_ph':    '국가명을 직접 입력하세요 (예: 캄보디아)',
      'ovr.qty_region_ph':     '지역명을 직접 입력하세요 (예: 프놈펜)',
      'ovr.qty_caltype':       '달력 종류',
      'ovr.qty_caltype_b':     'B버전 (홍콩국기 있음) — 중국 외 지역',
      'ovr.qty_caltype_a':     'A버전 (홍콩국기 없음) — 중국 지역',
      'ovr.qty_caltype_hint':  '직접 입력 지역의 달력 종류를 선택해 주세요',
      'ovr.qty_qty_sec':       '수량 (부)',
      'ovr.qty_jangkum':       '장금 수량',
      'ovr.qty_yjc_jangkum':   'YJC 장금 수량',
      'ovr.qty_heunga':        '흥아 수량',
      'ovr.qty_yjc_heunga':    'YJC 흥아 수량',
      'ovr.qty_shipping_sec':  '배송 정보',
      'ovr.qty_shipping_method':'배송방법',
      'ovr.qty_port_code':     'Port Code',
      'ovr.qty_address':       '배송주소 (실제 배송받을 주소)',
      'ovr.qty_address_ph':    '번지 / 건물명 / 우편번호 포함',
      'ovr.qty_pic_name':      '담당자 이름',
      'ovr.qty_pic_contact':   '담당자 연락처',
      'ovr.qty_pic_contact_ph':'전화 / 이메일',
      'ovr.detail_h':          '② 세부 포트별 분산 배송',
      'ovr.detail_p':          '하나의 국가 안에서 여러 지점/지역으로 분산 배송받는 경우 (예: 일본의 도쿄/오사카/하카타…) 사용합니다. 엑셀 양식을 다운로드 받아 작성 후 업로드하거나, 아래에서 직접 행 추가 가능합니다.',
      'ovr.detail_country_ph': '예: JAPAN',
      'ovr.holiday_h':         '③ 2027년 공휴일',
      'ovr.holiday_p':         '담당 국가의 2027년 공휴일을 영어 명칭으로 작성합니다. 엑셀 양식을 다운로드 받아 작성 후 업로드하거나, 아래에서 직접 행 추가 가능합니다.',
      'ovr.holiday_country_ph':'예: CHINA, RUSSIA, JAPAN',
      'ovr.holiday_add':       '+ 공휴일 추가',
      'ovr.network_h':         '④ 달력 네트워크 페이지 변경사항',
      'ovr.network_p':         '달력 마지막 네트워크 페이지에서 <b>전년도(2026) 대비 변경된 항목만</b> 입력해 주세요. 주소·연락처·팩스·이메일·PIC 등이 동일하면 입력 불필요합니다.',
      'ovr.network_add':       '+ 변경 항목 추가',
      'ovr.network_image_h':   '📋 현재 네트워크 페이지 (A·B형 동일)',
      'ovr.network_image_desc':'현재 달력에 들어가있는 네트워크 정보입니다. 본인 담당 지역과 다른 부분만 아래에 추가해 주세요. (이미지 클릭시 확대)',
      'ovr.network_image_zoom':'🔍 크게 보기',
      'ovr.network_image_download':'📥 원본 다운로드',
      'ovr.network_pick_jangkum':'장금상선 네트워크',
      'ovr.network_pick_heunga': '흥아라인 네트워크',
      'ovr.tpl_download':      '📥 엑셀 양식 다운로드',
      'ovr.tpl_upload':        '📤 작성한 엑셀 업로드',
      'ovr.detail_region':     '세부 지역',
      'ovr.detail_region_ph':  '예: TOKYO',
      'ovr.detail_port_ph':    '예: JPTYO',
      'ovr.detail_qty':        '수량 (부)',
      'ovr.detail_company':    '회사명/사명',
      'ovr.detail_address':    '주소 (영문)',
      'ovr.holiday_date':      '날짜',
      'ovr.holiday_date_ph':   '예: 2027-01-01 또는 2027-01-01 ~ 03',
      'ovr.holiday_weekday':   '요일',
      'ovr.holiday_multi':     '여러 요일',
      'ovr.holiday_name':      '공휴일 이름 (영문)',
      'ovr.holiday_name_ph':   "예: New Year's Day",
      'ovr.network_company':   '네트워크 회사',
      'ovr.network_field':     '변경 항목',
      'ovr.network_branch':    '지점/사무소명',
      'ovr.network_branch_ph': '예: Shanghai Office',
      'ovr.network_country_ph':'예: CHINA, JAPAN',
      'ovr.network_old':       '기존 값 (2026)',
      'ovr.network_new':       '변경 값 (2027)',
      'ovr.network_full':      '전체 메모 (자유서술)',
      'ovr.network_full_ph':   '여러 항목을 한 번에 적고 싶으면 여기에 작성',
      'ovr.badge_a':           'A버전 (홍콩국기 없음)',
      'ovr.badge_b':           'B버전 (홍콩국기 있음)',
      'ovr.region_info_japan': ' · 일본은 ②번 탭에서 도시별 세부 수량을 입력하세요.',
      'ovr.region_info_tpl':   '이 지역은 {badge} 으로 발송됩니다.{detail}',

      /* ---------- 배송 상황 ---------- */
      'ship.title':            '달력 배송 상황',
      'ship.subtitle':         '발송 등록 · 신청자 조회',
      'ship.tab_status':       '📋 배송 현황 조회 (신청자)',
      'ship.tab_ship':         '📤 발송 등록 (발송담당)',
      'ship.status_desc':      '달력이 등록된 신청 지역별로 출발/도착 예정과 선박 정보를 확인할 수 있습니다.',
      'ship.filter_company':   '회사 필터',
      'ship.filter_country':   '국가 필터',
      'ship.ship_desc':        '총무팀에서 신청 지역별로 발송 정보를 등록합니다. 해외 신청건은 아래 리스트에서 "+ 발송 등록" 버튼으로 끌어오세요.',
      'ship.picker_h':         '📥 해외 신청건에서 가져오기',
      'ship.picker_search_ph': '국가/지역/담당자 검색',
      'ship.picker_no_data':   '해외 신청 데이터가 없습니다',
      'ship.picker_total_qty': '총수량',
      'ship.picker_pic':       '담당자',
      'ship.picker_ship_info': '배송정보',
      'ship.picker_register':  '발송 등록',
      'ship.picker_register_btn': '+ 발송 등록',
      'ship.picker_already':   '✓ 등록됨',
      'ship.submitter_h':      '등록자 정보',
      'ship.row_company':      '달력 회사',
      'ship.row_etd':          '예상 출발일자 (ETD)',
      'ship.row_eta':          '예상 도착일자 (ETA)',
      'ship.row_bl':           'BL 번호',
      'ship.row_bl_ph':        '예: KMTU1234567',
      'ship.row_vessel':       '선박명 (Vessel)',
      'ship.row_vessel_ph':    '예: SINOKOR JAKARTA / V.2701S',
      'ship.row_note_ph':      '환적/지연/항공 전환 등',
      'ship.row_country_ph':   '국가명 직접 입력',
      'ship.row_region_ph':    '지역명 직접 입력',
      'ship.add_row':          '+ 발송 건 추가',
      'ship.submit_all':       '전체 등록',
      'ship.col_etd':          'ETD (출발)',
      'ship.col_eta':          'ETA (도착)',
      'ship.col_note':         '특이사항',
      'ship.col_receive':      '수령확인',
      'ship.receive_btn':      '수령완료',
      'ship.receive_done':     '✓ 수령완료',
      'ship.no_match':         '조건에 해당하는 배송이 없습니다',
      'ship.prompt_name':      '수령자 이름을 입력해 주세요.',
      'ship.receive_err':      '수령완료 처리 실패: ',
      'ship.receive_rls':      '\n※ shipping_status에 anon UPDATE 정책이 필요합니다.',
      'ship.scope_overseas':   '🌏 해외 배송 조회',
      'ship.scope_domestic':   '🇰🇷 국내 배송 조회',
      'ship.scope_overseas_reg':'🌏 해외 발송 등록',
      'ship.scope_domestic_reg':'🇰🇷 국내 발송 등록',
      'ship.status_dom_desc':  '국내 본부/팀별로 도착예정일, 부수, 배송기사 연락처를 확인할 수 있습니다.',
      'ship.ship_dom_desc':    '국내 본부/팀별로 도착예정일, 부수, 배송기사 연락처를 등록합니다. 국내 신청건은 아래 리스트에서 "+ 발송 등록" 버튼으로 끌어오세요.',
      'ship.picker_dom_h':     '📥 국내 신청건에서 가져오기',
      'ship.picker_dom_search_ph':'회사/본부/팀/담당자 검색',
      'ship.picker_dom_no_data':'국내 신청 데이터가 없습니다',
      'ship.filter_division':  '본부 필터',
      'ship.col_division':     '본부',
      'ship.col_team':         '팀',
      'ship.row_eta_dom':      '도착예정일',
      'ship.row_qty':          '부수',
      'ship.row_driver_contact':'배송기사 연락처',
      'ship.row_driver_contact_ph':'예: 홍길동 / 010-1234-5678',

      /* ---------- 관리자 ---------- */
      'adm.title':             '전체 조회 — 2027 달력 조사',
      'adm.subtitle':          '응답 현황 조회 · 엑셀 다운로드',
      'adm.tab_report':        '📊 보고자료',
      'adm.report_print':      '🖨️ 인쇄 / PDF 저장',
      'adm.report_hint':       '현재 조사년도 신청 수량과 전년도 신청 수량을 비교합니다.',
      'adm.login_link':        '🔐 관리자 로그인',
      'adm.login_h':           '관리자 로그인',
      'adm.login_p':           '등록된 관리자 이메일로 로그인하면 응답 수정·삭제가 가능합니다.',
      'adm.login_btn':         '로그인',
      'adm.login_h':           '관리자 로그인',
      'adm.login_p':           '총무팀 담당자 이메일(<b>sonojang@sinokor.co.kr</b>)로 로그인합니다.<br>로그인 후 우측 상단에서 비밀번호를 변경할 수 있습니다.',
      'adm.login_btn':         '로그인',
      'adm.reset_btn':         '비밀번호 재설정 메일 받기',
      'adm.tab_dom':           '국내수량',
      'adm.tab_ovr':           '해외수량·배송',
      'adm.tab_detail':        '세부포트',
      'adm.tab_holiday':       '해외휴일',
      'adm.tab_network':       '네트워크 변경',
      'adm.tab_ship':          '배송 상황',
      'adm.export_xlsx':       '📊 전체 엑셀 다운로드 (원본 양식)',
      'adm.export_csv':        '📄 현재 탭 CSV 다운로드',
      'adm.report_jangkum':    '📕 장금 네트워크 변경사항 보고서',
      'adm.report_heunga':     '📗 흥아 네트워크 변경사항 보고서',
      'adm.pw_h':              '🔑 비밀번호 변경',
      'adm.pw_desc':           '새 비밀번호는 <b>8자 이상</b>이어야 합니다.',
      'adm.pw_new':            '새 비밀번호',
      'adm.pw_new2':           '새 비밀번호 확인',
      'adm.netimg_h':          '📷 네트워크 페이지 이미지 관리',
      'adm.netimg_p':          '해외 주재원 ④번 탭에서 보여줄 <b>현재 달력의 네트워크 페이지 이미지</b>를 업로드합니다. 매년 조사 전 새 이미지로 교체하세요. 업로드 즉시 사이트에 반영됩니다.',
      'adm.netimg_jangkum':    '장금상선 네트워크',
      'adm.netimg_heunga':     '흥아라인 네트워크',
      'adm.netimg_pick':       '📁 파일 선택',
      'adm.netimg_upload':     '⬆️ 업로드',
      'adm.netimg_empty':      '아직 업로드된 이미지가 없습니다',
    },

    en: {
      /* ---------- Common ---------- */
      'nav.home':              '← Home',
      'nav.admin':             '📊 View All',
      'nav.logout':            'Logout',
      'nav.change_pw':         '🔑 Change Password',
      'common.required':       '*',
      'common.select':         'Please select',
      'common.select_short':   'Select',
      'common.submit':         'Submit',
      'common.submit_all':     'Submit All',
      'common.add_row':        '+ Add Row',
      'common.refresh':        '⟳ Refresh',
      'common.delete':         'Delete',
      'common.cancel':         'Cancel',
      'common.save':           'Save',
      'common.change':         'Change',
      'common.loading':        'Loading...',
      'common.first_select_country': 'Select country first',
      'common.first_select_div':     'Select company first',
      'common.first_select_team':    'Select division first',
      'common.custom_input':         '+ Custom input',
      'common.all':            'All',
      'common.note':           'Note',
      'common.note_special':   'Note (remarks)',
      'common.no_data':        'No data',
      'common.box_hint':       'Quantity unit: 1 BOX = 25 copies.',
      'common.company':        'Company',
      'common.country':        'Country',
      'common.region':         'Region',
      'common.qty':            'Quantity',
      'common.address':        'Address',
      'common.email':          'Email',
      'common.name':           'Name',
      'common.contact':        'Contact',
      'common.dept':           'Department',
      'common.dept_ph':        'e.g. General Affairs',
      'common.lang_toggle':    'Language',
      'common.copyright':      '© Sinokor, Heung-A Line · 2027 Calendar Survey',
      'common.btn_history':    '📄 Previous Years',
      'history.title_dom':     'Previous Domestic Requests',
      'history.title_ovr':     'Previous Overseas Requests',
      'history.year':          'Year',
      'history.empty':         'No historical data yet.',
      'common.query_error':    'Query error',
      'common.delete_short':   '×',

      /* ---------- Index ---------- */
      'idx.title':             '2027 Calendar Production Survey',
      'idx.subtitle':          'Sinokor Merchant Marine · Heung-A Line · YJC',
      'idx.guide_h':           'Information',
      'idx.guide_p':           'Survey for quantities and delivery information for the 2027 in-house calendar. Please select the appropriate option and fill out the form. After the deadline, General Affairs will compile the responses for production.',
      'idx.cal_kinds_h':       'Calendar Types',
      'idx.cal_kinds_a':       '· Sinokor A / Heung-A A — <b>without HK flag</b> (for China)',
      'idx.cal_kinds_b':       '· Sinokor B / Heung-A B — <b>with HK flag</b> (Korea & other overseas)',
      'idx.role_h':            'Select your role',
      'idx.card_dom_h':        'Domestic Calendar Request',
      'idx.card_dom_p':        'Sinokor / Heung-A domestic divisions<br>(Sinokor B + Heung-A B qty)',
      'idx.card_ovr_h':        'Overseas Calendar Request',
      'idx.card_ovr_p':        'Quantities & delivery by country/region<br>+ Ports / Holidays / Network',
      'idx.card_ship_h':       'Calendar Shipping Status',
      'idx.card_ship_p':       'Register shipment & confirm receipt',
      'idx.card_admin_h':      'View All',
      'idx.card_admin_p':      'View responses<br>+ Excel download',

      /* ---------- Domestic ---------- */
      'dom.title':             'Domestic Calendar Request',
      'dom.subtitle':          'Sinokor B + Heung-A B (with HK flag)',
      'dom.guide_h':           'Instructions',
      'dom.guide_p':           'Select Company → Division → Team in order, then enter the <b>Sinokor B</b> · <b>Heung-A B</b> quantities you need for 2027.',
      'dom.warn':              '<b>Domestic team leaders</b> only request B version (with HK flag). A version (without HK flag) is exclusive for China.',
      'dom.sec_org':           'Organization',
      'dom.sec_submitter':     'Submitter Information',
      'dom.sec_qty':           'Requested Quantity (2027)',
      'dom.company':           'Company',
      'dom.division':          'Division / Office',
      'dom.team':              'Team',
      'dom.submitter_name':    'Submitter Name',
      'dom.submitter_email':   'Submitter Email',
      'dom.qty_jangkum':       'Sinokor B quantity',
      'dom.qty_heunga':        'Heung-A B quantity',
      'dom.hint_hk':           'with HK flag',
      'dom.note_ph':           'Please add any remarks',

      /* ---------- Overseas ---------- */
      'ovr.title':             'Overseas Branch Calendar Request',
      'ovr.subtitle':          'Quantities & delivery · Sub-ports · Holidays · Network changes',
      'ovr.submitter_h':       'Submitter Information',
      'ovr.submitter_p':       'Applied to all tabs. Please fill out first.',
      'ovr.submitter_company': 'Company',
      'ovr.branch_country':    'Branch Country',
      'ovr.branch_country_ph': 'Enter country name',
      'ovr.branch_region':     'Branch Region / Office',
      'ovr.branch_region_ph':  'Enter region / office name',
      'ovr.tab_qty':           '① Qty & Delivery',
      'ovr.tab_detail':        '② Sub-Ports',
      'ovr.tab_holiday':       '③ Holidays',
      'ovr.tab_network':       '④ Network Changes',
      'ovr.qty_h':             '① Quantities & Delivery by Country/Region',
      'ovr.qty_info':          '<b>China</b> uses A version (no HK flag); other countries use B version (with HK flag) by default.<br>Please contact General Affairs to change.',
      'ovr.qty_company_hint':  '👆 Select the <b>calendar company</b> first. Quantity inputs activate once a company is chosen.',
      'ovr.qty_company':       'Calendar Company',
      'ovr.qty_company_jk':    'Sinokor Calendar',
      'ovr.qty_company_ha':    'Heung-A Calendar',
      'ovr.qty_country_ph':    'Enter country name (e.g. Cambodia)',
      'ovr.qty_region_ph':     'Enter region name (e.g. Phnom Penh)',
      'ovr.qty_caltype':       'Calendar Type',
      'ovr.qty_caltype_b':     'Version B (with HK flag) — outside China',
      'ovr.qty_caltype_a':     'Version A (no HK flag) — China',
      'ovr.qty_caltype_hint':  'Select calendar type for the custom region',
      'ovr.qty_qty_sec':       'Quantity (copies)',
      'ovr.qty_jangkum':       'Sinokor qty',
      'ovr.qty_yjc_jangkum':   'YJC Sinokor qty',
      'ovr.qty_heunga':        'Heung-A qty',
      'ovr.qty_yjc_heunga':    'YJC Heung-A qty',
      'ovr.qty_shipping_sec':  'Delivery Information',
      'ovr.qty_shipping_method':'Shipping method',
      'ovr.qty_port_code':     'Port Code',
      'ovr.qty_address':       'Delivery address (actual receiving address)',
      'ovr.qty_address_ph':    'Include street / building / postal code',
      'ovr.qty_pic_name':      'Contact Person',
      'ovr.qty_pic_contact':   'Contact Info',
      'ovr.qty_pic_contact_ph':'Phone / Email',
      'ovr.detail_h':          '② Sub-Port Distribution',
      'ovr.detail_p':          'Use this when one country has multiple delivery locations (e.g. Japan: Tokyo/Osaka/Hakata…). Download the Excel template and upload, or add rows directly below.',
      'ovr.detail_country_ph': 'e.g. JAPAN',
      'ovr.holiday_h':         '③ 2027 Public Holidays',
      'ovr.holiday_p':         'Enter your country\'s 2027 public holidays in English. Download the Excel template and upload, or add rows directly below.',
      'ovr.holiday_country_ph':'e.g. CHINA, RUSSIA, JAPAN',
      'ovr.holiday_add':       '+ Add Holiday',
      'ovr.network_h':         '④ Calendar Network Page Changes',
      'ovr.network_p':         'On the last network page, enter <b>only items changed vs. last year (2026)</b>. Skip if address / contact / fax / email / PIC are unchanged.',
      'ovr.network_add':       '+ Add Change',
      'ovr.network_image_h':   '📋 Current Network Page (A & B identical)',
      'ovr.network_image_desc':'This is the network info currently printed on the calendar. Add only the items in your region that differ from this image. (Click to enlarge)',
      'ovr.network_image_zoom':'🔍 Enlarge',
      'ovr.network_image_download':'📥 Download original',
      'ovr.network_pick_jangkum':'Sinokor Network',
      'ovr.network_pick_heunga': 'Heung-A Network',
      'ovr.tpl_download':      '📥 Download Excel Template',
      'ovr.tpl_upload':        '📤 Upload Excel',
      'ovr.detail_region':     'Sub Region',
      'ovr.detail_region_ph':  'e.g. TOKYO',
      'ovr.detail_port_ph':    'e.g. JPTYO',
      'ovr.detail_qty':        'Quantity (copies)',
      'ovr.detail_company':    'Company / Branch Name',
      'ovr.detail_address':    'Address (English)',
      'ovr.holiday_date':      'Date',
      'ovr.holiday_date_ph':   'e.g. 2027-01-01 or 2027-01-01 ~ 03',
      'ovr.holiday_weekday':   'Weekday',
      'ovr.holiday_multi':     'Multiple weekdays',
      'ovr.holiday_name':      'Holiday Name (English)',
      'ovr.holiday_name_ph':   "e.g. New Year's Day",
      'ovr.network_company':   'Calendar Company',
      'ovr.network_field':     'Changed Field',
      'ovr.network_branch':    'Branch / Office Name',
      'ovr.network_branch_ph': 'e.g. Shanghai Office',
      'ovr.network_country_ph':'e.g. CHINA, JAPAN',
      'ovr.network_old':       'Previous value (2026)',
      'ovr.network_new':       'New value (2027)',
      'ovr.network_full':      'Free-text memo',
      'ovr.network_full_ph':   'Use this if you want to write multiple items at once',
      'ovr.badge_a':           'Version A (no HK flag)',
      'ovr.badge_b':           'Version B (with HK flag)',
      'ovr.region_info_japan': ' · For Japan, enter city-level quantities in tab ②.',
      'ovr.region_info_tpl':   'This region ships as {badge}.{detail}',

      /* ---------- Shipping ---------- */
      'ship.title':            'Calendar Shipping Status',
      'ship.subtitle':         'Register shipment · Track delivery',
      'ship.tab_status':       '📋 Shipping Status (Recipients)',
      'ship.tab_ship':         '📤 Register Shipment (Shipping Staff)',
      'ship.status_desc':      'View ETD/ETA and vessel info by registered region.',
      'ship.filter_company':   'Company filter',
      'ship.filter_country':   'Country filter',
      'ship.ship_desc':        'Register shipment info per region. For overseas requests, use the "+ Register" button in the list below.',
      'ship.picker_h':         '📥 Pull from Overseas Requests',
      'ship.picker_search_ph': 'Search country/region/contact',
      'ship.picker_no_data':   'No overseas request data',
      'ship.picker_total_qty': 'Total qty',
      'ship.picker_pic':       'Contact',
      'ship.picker_ship_info': 'Delivery info',
      'ship.picker_register':  'Register',
      'ship.picker_register_btn': '+ Register',
      'ship.picker_already':   '✓ Registered',
      'ship.submitter_h':      'Submitter Info',
      'ship.row_company':      'Calendar Company',
      'ship.row_etd':          'Estimated departure (ETD)',
      'ship.row_eta':          'Estimated arrival (ETA)',
      'ship.row_bl':           'B/L No.',
      'ship.row_bl_ph':        'e.g. KMTU1234567',
      'ship.row_vessel':       'Vessel',
      'ship.row_vessel_ph':    'e.g. SINOKOR JAKARTA / V.2701S',
      'ship.row_note_ph':      'Transshipment / delay / air switch etc.',
      'ship.row_country_ph':   'Enter country',
      'ship.row_region_ph':    'Enter region',
      'ship.add_row':          '+ Add shipment',
      'ship.submit_all':       'Register All',
      'ship.col_etd':          'ETD',
      'ship.col_eta':          'ETA',
      'ship.col_note':         'Notes',
      'ship.col_receive':      'Receipt',
      'ship.receive_btn':      'Mark Received',
      'ship.receive_done':     '✓ Received',
      'ship.no_match':         'No shipments match',
      'ship.prompt_name':      'Please enter the recipient name.',
      'ship.receive_err':      'Failed to mark received: ',
      'ship.receive_rls':      '\n※ shipping_status needs an anon UPDATE policy.',
      'ship.scope_overseas':   '🌏 Overseas Shipping',
      'ship.scope_domestic':   '🇰🇷 Domestic Shipping',
      'ship.scope_overseas_reg':'🌏 Overseas Register',
      'ship.scope_domestic_reg':'🇰🇷 Domestic Register',
      'ship.status_dom_desc':  'View ETA, copies, and driver contact info per domestic division/team.',
      'ship.ship_dom_desc':    'Register ETA, copies, and driver contact info per domestic division/team. Use the "+ Register" button below to pull from domestic requests.',
      'ship.picker_dom_h':     '📥 Pull from Domestic Requests',
      'ship.picker_dom_search_ph':'Search company/division/team/submitter',
      'ship.picker_dom_no_data':'No domestic request data',
      'ship.filter_division':  'Division filter',
      'ship.col_division':     'Division',
      'ship.col_team':         'Team',
      'ship.row_eta_dom':      'ETA',
      'ship.row_qty':          'Copies',
      'ship.row_driver_contact':'Driver Contact',
      'ship.row_driver_contact_ph':'e.g. Hong Gildong / 010-1234-5678',

      /* ---------- Admin ---------- */
      'adm.title':             'View All — 2027 Calendar Survey',
      'adm.subtitle':          'Response overview · Excel download',
      'adm.tab_report':        '📊 Report',
      'adm.report_print':      '🖨️ Print / Save PDF',
      'adm.report_hint':       'Compares current year quantities with the previous year.',
      'adm.login_link':        '🔐 Admin Login',
      'adm.login_h':           'Admin Login',
      'adm.login_p':           'Log in with the registered admin email to edit or delete responses.',
      'adm.login_btn':         'Log in',
      'adm.login_h':           'Admin Login',
      'adm.login_p':           'Login as the General Affairs admin (<b>sonojang@sinokor.co.kr</b>).<br>After login you can change the password from the top right.',
      'adm.login_btn':         'Login',
      'adm.reset_btn':         'Send password reset email',
      'adm.tab_dom':           'Domestic Qty',
      'adm.tab_ovr':           'Overseas Qty & Delivery',
      'adm.tab_detail':        'Sub-Ports',
      'adm.tab_holiday':       'Holidays',
      'adm.tab_network':       'Network Changes',
      'adm.tab_ship':          'Shipping Status',
      'adm.export_xlsx':       '📊 Export Full Excel (original form)',
      'adm.export_csv':        '📄 Export current tab as CSV',
      'adm.report_jangkum':    '📕 Sinokor Network Changes Report',
      'adm.report_heunga':     '📗 Heung-A Network Changes Report',
      'adm.pw_h':              '🔑 Change Password',
      'adm.pw_desc':           'New password must be at least <b>8 characters</b>.',
      'adm.pw_new':            'New password',
      'adm.pw_new2':           'Confirm new password',
      'adm.netimg_h':          '📷 Network Page Image Management',
      'adm.netimg_p':          'Upload the <b>current calendar network page image</b> shown in the overseas tab ④. Replace each year before the survey starts. Changes are reflected immediately.',
      'adm.netimg_jangkum':    'Sinokor Network',
      'adm.netimg_heunga':     'Heung-A Network',
      'adm.netimg_pick':       '📁 Choose file',
      'adm.netimg_upload':     '⬆️ Upload',
      'adm.netimg_empty':      'No image uploaded yet',
    }
  };

  const LS_KEY = 'cal2027_lang';
  let currentLang = (function () {
    try { return localStorage.getItem(LS_KEY) || 'ko'; }
    catch (_) { return 'ko'; }
  })();

  function t(key) {
    return (T[currentLang] && T[currentLang][key]) || (T.ko[key] || key);
  }

  function applyToDom(rootEl) {
    const scope = rootEl || document;
    scope.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      const val = t(k);
      if (val.includes('<')) el.innerHTML = val;
      else el.textContent = val;
    });
    scope.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
    scope.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
    });

    // <html lang> 갱신
    document.documentElement.setAttribute('lang', currentLang);

    // 토글 버튼 활성화 상태
    document.querySelectorAll('.lang-toggle-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === currentLang);
    });
  }

  function setLang(lang) {
    if (!T[lang]) return;
    currentLang = lang;
    try { localStorage.setItem(LS_KEY, lang); } catch (_) {}
    applyToDom();
    // 외부 코드에서 리렌더 필요한 경우를 위한 이벤트
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  function getLang() { return currentLang; }

  function injectToggle() {
    // <header class="site-header"> 의 <nav> 끝에 KOR/ENG 토글 삽입
    const navs = document.querySelectorAll('.site-header nav');
    navs.forEach(nav => {
      if (nav.querySelector('.lang-toggle')) return;
      const span = document.createElement('span');
      span.className = 'lang-toggle';
      span.innerHTML = `
        <button type="button" class="lang-toggle-btn" data-lang="ko">KOR</button>
        <span class="lang-sep">|</span>
        <button type="button" class="lang-toggle-btn" data-lang="en">ENG</button>
      `;
      nav.appendChild(span);
      span.querySelectorAll('.lang-toggle-btn').forEach(b => {
        b.addEventListener('click', () => setLang(b.dataset.lang));
      });
    });
  }

  function injectStyles() {
    if (document.getElementById('i18n-style')) return;
    const s = document.createElement('style');
    s.id = 'i18n-style';
    s.textContent = `
      .lang-toggle { margin-left: 14px; display: inline-flex; align-items: center; gap: 4px; }
      .lang-toggle-btn {
        background: transparent; border: 1px solid rgba(255,255,255,0.4);
        color: rgba(255,255,255,0.7); padding: 3px 10px; border-radius: 4px;
        font-size: 12px; cursor: pointer; font-weight: 600; letter-spacing: 0.5px;
      }
      .lang-toggle-btn:hover { color: #fff; border-color: #fff; }
      .lang-toggle-btn.active {
        background: #fff; color: var(--primary, #003366); border-color: #fff;
      }
      .lang-sep { color: rgba(255,255,255,0.3); }
    `;
    document.head.appendChild(s);
  }

  function init() {
    injectStyles();
    injectToggle();
    applyToDom();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  root.i18n = { t, setLang, getLang, applyToDom };

})(window);
