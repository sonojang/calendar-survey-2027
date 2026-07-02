// 전체 조회 페이지 - 조회는 무인증, 수정·삭제는 로그인 후만
// (2026-07-02) 관리자 로그인 재도입 — 삭제·수정 액션에만 인증 필요

(function () {
  const _t = (k) => (window.i18n ? window.i18n.t(k) : k);

  // 로그인 상태 (Supabase 세션 유무)
  let isAdmin = false;

  /* ----------------------------------------------------------
     테이블별 편집 가능한 필드 정의
     type: text / number / textarea / select
  ---------------------------------------------------------- */
  const EDIT_FIELDS = {
    domestic_quantities: [
      { key: 'survey_year',    label: '조사년도',   type: 'number' },
      { key: 'company',        label: '회사',       type: 'select', options: ['', '장금상선', '흥아라인'] },
      { key: 'division',       label: '본부',       type: 'text' },
      { key: 'team',           label: '팀',         type: 'text' },
      { key: 'jangkum_b_qty',  label: '장금B 수량', type: 'number' },
      { key: 'heunga_b_qty',   label: '흥아B 수량', type: 'number' },
      { key: 'submitter_name', label: '입력자',     type: 'text' },
      { key: 'submitter_email',label: '이메일',     type: 'text' },
      { key: 'note',           label: '비고',       type: 'textarea' }
    ],
    overseas_quantities: [
      { key: 'survey_year',      label: '조사년도',   type: 'number' },
      { key: 'company',          label: '신청회사',   type: 'select', options: ['', '장금상선', '흥아라인', 'YJC'] },
      { key: 'country',          label: '국가',       type: 'text' },
      { key: 'region',           label: '지역',       type: 'text' },
      { key: 'calendar_type',    label: '타입 (A/B)', type: 'select', options: ['A', 'B'] },
      { key: 'jangkum_qty',      label: '장금 수량',  type: 'number' },
      { key: 'heunga_qty',       label: '흥아 수량',  type: 'number' },
      { key: 'yjc_jangkum_qty',  label: 'YJC 장금',   type: 'number' },
      { key: 'yjc_heunga_qty',   label: 'YJC 흥아',   type: 'number' },
      { key: 'shipping_method',  label: '배송방법',   type: 'text' },
      { key: 'port_code',        label: 'Port Code',  type: 'text' },
      { key: 'pic_name',         label: '담당자',     type: 'text' },
      { key: 'pic_contact',      label: '연락처',     type: 'text' },
      { key: 'shipping_address', label: '주소',       type: 'textarea' },
      { key: 'note',             label: '비고',       type: 'textarea' },
      { key: 'submitter_name',   label: '입력자',     type: 'text' },
      { key: 'submitter_email',  label: '이메일',     type: 'text' }
    ],
    detail_ports: [
      { key: 'country',       label: '국가',   type: 'text' },
      { key: 'region',        label: '지역',   type: 'text' },
      { key: 'port_code',     label: 'Port Code', type: 'text' },
      { key: 'quantity',      label: '수량',   type: 'number' },
      { key: 'company_name',  label: '사명',   type: 'text' },
      { key: 'address',       label: '주소',   type: 'textarea' },
      { key: 'submitter_name', label: '입력자', type: 'text' },
      { key: 'submitter_email',label: '이메일', type: 'text' }
    ],
    overseas_holidays: [
      { key: 'country',         label: '국가',       type: 'text' },
      { key: 'holiday_date',    label: '날짜',       type: 'text' },
      { key: 'weekday',         label: '요일',       type: 'text' },
      { key: 'holiday_name_en', label: '공휴일명 (EN)', type: 'text' },
      { key: 'submitter_name',  label: '입력자',     type: 'text' },
      { key: 'submitter_email', label: '이메일',     type: 'text' }
    ],
    network_changes: [
      { key: 'company',     label: '네트워크 회사', type: 'select', options: ['', '장금상선', '흥아라인'] },
      { key: 'country',     label: '국가',   type: 'text' },
      { key: 'branch_name', label: '지점/사무소', type: 'text' },
      { key: 'field',       label: '변경항목', type: 'text' },
      { key: 'old_value',   label: '기존값',   type: 'textarea' },
      { key: 'new_value',   label: '변경값',   type: 'textarea' },
      { key: 'full_note',   label: '전체 메모', type: 'textarea' },
      { key: 'submitter_name', label: '입력자', type: 'text' },
      { key: 'submitter_email',label: '이메일', type: 'text' }
    ],
    shipping_status: [
      { key: 'company',     label: '회사',    type: 'text' },
      { key: 'country',     label: '국가',    type: 'text' },
      { key: 'region',      label: '지역',    type: 'text' },
      { key: 'division',    label: '본부(국내)', type: 'text' },
      { key: 'team',        label: '팀(국내)',   type: 'text' },
      { key: 'status_date', label: 'ETD',    type: 'text' },
      { key: 'eta',         label: 'ETA',    type: 'text' },
      { key: 'qty',         label: '부수',    type: 'number' },
      { key: 'tracking_no', label: 'BL 번호', type: 'text' },
      { key: 'courier',     label: '선박명/배송사', type: 'text' },
      { key: 'driver_contact', label: '기사 연락처', type: 'text' },
      { key: 'note',        label: '특이사항', type: 'textarea' }
    ]
  };

  /* ----------------------------------------------------------
     인증 - 로그인 / 로그아웃 / 세션 체크
  ---------------------------------------------------------- */
  const loginBtn    = document.getElementById('admin-login-btn');
  const logoutBtn   = document.getElementById('admin-logout-btn');
  const userLabel   = document.getElementById('admin-user');
  const loginModal  = document.getElementById('login-modal');
  const loginEmail  = document.getElementById('login-email');
  const loginPw     = document.getElementById('login-password');
  const loginMsg    = document.getElementById('login-msg');

  function openLoginModal() {
    loginMsg.innerHTML = '';
    loginPw.value = '';
    loginModal.style.display = 'flex';
    setTimeout(() => loginPw.focus(), 50);
  }
  function closeLoginModal() {
    loginModal.style.display = 'none';
  }
  function setAdminUI(email) {
    isAdmin = !!email;
    if (email) {
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'inline';
      userLabel.style.display = 'inline';
      userLabel.textContent = '👤 ' + email;
    } else {
      loginBtn.style.display = 'inline';
      logoutBtn.style.display = 'none';
      userLabel.style.display = 'none';
      userLabel.textContent = '';
    }
    // 로그인 상태 변경 시 테이블 다시 그려서 액션 버튼 표시/숨김
    if (typeof renderDomestic === 'function') {
      renderDomestic(); renderOverseas(); renderDetail();
      renderHoliday();  renderNetwork(); renderShipping();
    }
  }

  loginBtn.addEventListener('click', (e) => { e.preventDefault(); openLoginModal(); });
  document.getElementById('login-cancel').addEventListener('click', closeLoginModal);
  loginModal.querySelector('.edit-modal-close').addEventListener('click', closeLoginModal);
  loginModal.addEventListener('click', e => { if (e.target === loginModal) closeLoginModal(); });

  document.getElementById('login-submit').addEventListener('click', async () => {
    loginMsg.innerHTML = '';
    const email = loginEmail.value.trim();
    const password = loginPw.value;
    if (!email || !password) {
      loginMsg.innerHTML = `<div class="alert alert-danger">이메일과 비밀번호를 입력하세요.</div>`;
      return;
    }
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      loginMsg.innerHTML = `<div class="alert alert-danger">로그인 실패: ${error.message}</div>`;
      return;
    }
    closeLoginModal();
    setAdminUI(data.user.email);
  });

  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await supabaseClient.auth.signOut();
    setAdminUI(null);
  });

  // 페이지 로드 시 이미 로그인된 세션이 있으면 관리자 UI 활성화
  supabaseClient.auth.getSession().then(({ data }) => {
    if (data.session) setAdminUI(data.session.user.email);
  });

  /* ----------------------------------------------------------
     편집 · 삭제 - 액션 버튼 렌더 + 편집 모달
  ---------------------------------------------------------- */
  const editModal   = document.getElementById('edit-modal');
  const editTitle   = document.getElementById('edit-modal-title');
  const editFields  = document.getElementById('edit-modal-fields');
  const editSaveBtn = document.getElementById('edit-save');
  let editContext   = null; // { table, id }

  // 각 행에 붙는 액션 셀 HTML — 로그인 안 됐으면 빈 문자열 반환
  function actionCell(table, id) {
    if (!isAdmin) return '';
    return `<td class="row-actions">
      <button class="row-btn" data-action="edit" data-table="${table}" data-id="${id}">✏️ 수정</button>
      <button class="row-btn danger" data-action="delete" data-table="${table}" data-id="${id}">🗑️ 삭제</button>
    </td>`;
  }
  // 액션 컬럼 헤더 — 로그인 시에만 표시
  function actionHeader() {
    return isAdmin ? '<th class="col-actions">액션</th>' : '';
  }

  function openEditModal(table, row) {
    editContext = { table, id: row.id };
    editTitle.textContent = `수정 — ${table} #${row.id}`;
    const fields = EDIT_FIELDS[table] || [];
    editFields.innerHTML = fields.map(f => {
      const val = row[f.key];
      const safe = val === null || val === undefined ? '' : String(val);
      if (f.type === 'textarea') {
        return `<div class="form-group">
          <label>${f.label}</label>
          <textarea data-key="${f.key}" rows="3">${escAttr(safe)}</textarea>
        </div>`;
      }
      if (f.type === 'select') {
        const opts = (f.options || []).map(o =>
          `<option value="${escAttr(o)}" ${o === safe ? 'selected' : ''}>${o || '(비어있음)'}</option>`).join('');
        return `<div class="form-group">
          <label>${f.label}</label>
          <select data-key="${f.key}">${opts}</select>
        </div>`;
      }
      return `<div class="form-group">
        <label>${f.label}</label>
        <input type="${f.type}" data-key="${f.key}" value="${escAttr(safe)}">
      </div>`;
    }).join('');
    editModal.style.display = 'flex';
  }
  function closeEditModal() {
    editModal.style.display = 'none';
    editContext = null;
  }
  document.getElementById('edit-cancel').addEventListener('click', closeEditModal);
  editModal.querySelector('.edit-modal-close').addEventListener('click', closeEditModal);
  editModal.addEventListener('click', e => { if (e.target === editModal) closeEditModal(); });

  editSaveBtn.addEventListener('click', async () => {
    if (!editContext) return;
    const { table, id } = editContext;
    const payload = {};
    editFields.querySelectorAll('[data-key]').forEach(el => {
      const key = el.dataset.key;
      let v = el.value;
      if (el.type === 'number') v = v === '' ? null : Number(v);
      if (v === '') v = null;
      payload[key] = v;
    });
    editSaveBtn.disabled = true;
    editSaveBtn.innerHTML = '<span class="spinner"></span>저장 중...';
    const { error } = await supabaseClient.from(table).update(payload).eq('id', id);
    editSaveBtn.disabled = false;
    editSaveBtn.innerHTML = '저장';
    if (error) {
      alert('수정 실패: ' + error.message);
      return;
    }
    closeEditModal();
    await loadAll();
  });

  // 테이블 전역 클릭 위임 — 수정/삭제 버튼
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.row-btn');
    if (!btn) return;
    const { action, table, id } = btn.dataset;
    if (!table || !id) return;
    if (action === 'delete') {
      if (!confirm('이 항목을 정말 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.')) return;
      const { error } = await supabaseClient.from(table).delete().eq('id', Number(id));
      if (error) { alert('삭제 실패: ' + error.message); return; }
      await loadAll();
    } else if (action === 'edit') {
      // 해당 행의 원본 데이터 찾기
      const key = tableToKey(table);
      const row = (allData[key] || []).find(r => String(r.id) === String(id));
      if (!row) { alert('해당 행을 찾지 못했습니다. 새로고침 후 다시 시도하세요.'); return; }
      openEditModal(table, row);
    }
  });

  function tableToKey(table) {
    return {
      domestic_quantities: 'domestic',
      overseas_quantities: 'overseas',
      detail_ports:        'detail',
      overseas_holidays:   'holiday',
      network_changes:     'network',
      shipping_status:     'shipping'
    }[table];
  }

  function escAttr(s) {
    return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
  }

  /* ----------------------------------------------------------
     탭 전환
  ---------------------------------------------------------- */
  document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      document.getElementById('panel-' + t.dataset.tab).classList.add('active');
    });
  });

  /* ----------------------------------------------------------
     데이터 로드 및 표시
  ---------------------------------------------------------- */
  const allData = {
    domestic: [],
    overseas: [],
    detail:   [],
    holiday:  [],
    network:  [],
    shipping: []
  };

  // 같은 키의 여러 응답 중 첫 등장(=이미 created_at desc로 정렬돼 있어 최신)만 유지
  function dedupLatest(arr, keyFn) {
    const seen = new Set();
    return arr.filter(r => {
      const k = keyFn(r);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  async function loadAll() {
    const [d1, d2, d3, d4, d5, d6, v1, v2] = await Promise.all([
      supabaseClient.from('domestic_quantities').select('*').order('created_at', { ascending: false }),
      supabaseClient.from('overseas_quantities').select('*').order('created_at', { ascending: false }),
      supabaseClient.from('detail_ports'       ).select('*').order('created_at', { ascending: false }),
      supabaseClient.from('overseas_holidays'  ).select('*').order('created_at', { ascending: false }),
      supabaseClient.from('network_changes'    ).select('*').order('created_at', { ascending: false }),
      supabaseClient.from('shipping_status'    ).select('*').order('created_at', { ascending: false }),
      // 보고자료용 — 연도별 (division/team, country/region) 집계 view
      supabaseClient.from('v_yearly_domestic').select('*'),
      supabaseClient.from('v_yearly_overseas').select('*')
    ]);
    // 국내/해외 수량은 현재 조사년도(SURVEY_YEAR)만 표시. 이전 연도는 "과거 신청 수량" 모달용 히스토리로만 유지.
    // 같은 팀/지역이 여러 번 제출한 경우 최신 응답만 표시 (dedup은 화면 표시용 — DB 원본은 그대로).
    allData.domestic = dedupLatest(
      (d1.data || []).filter(r => r.survey_year === SURVEY_YEAR),
      r => `${r.company}|${r.division}|${r.team}`
    );
    allData.overseas = dedupLatest(
      (d2.data || []).filter(r => r.survey_year === SURVEY_YEAR),
      r => `${r.company}|${r.country}|${r.region}`
    );
    allData.detail   = d3.data || [];
    allData.holiday  = d4.data || [];
    allData.network  = d5.data || [];
    allData.shipping = d6.data || [];
    allData.yearlyDomestic = v1.data || [];
    allData.yearlyOverseas = v2.data || [];

    renderDomestic();
    renderOverseas();
    renderDetail();
    renderHoliday();
    renderNetwork();
    renderShipping();
    renderReport();
    renderSummary();
  }

  document.getElementById('refresh-btn').addEventListener('click', loadAll);

  function renderSummary() {
    const sumDomJ = allData.domestic.reduce((s, r) => s + (r.jangkum_b_qty || 0), 0);
    const sumDomH = allData.domestic.reduce((s, r) => s + (r.heunga_b_qty  || 0), 0);
    const sumOvJ  = allData.overseas.reduce((s, r) => s + (r.jangkum_qty   || 0), 0);
    const sumOvH  = allData.overseas.reduce((s, r) => s + (r.heunga_qty    || 0), 0);
    const sumDetail = allData.detail.reduce((s, r) => s + (r.quantity      || 0), 0);

    // 회사별 국내 응답 건수
    const domByCo = {};
    allData.domestic.forEach(r => {
      const k = r.company || '미지정';
      domByCo[k] = (domByCo[k] || 0) + 1;
    });
    const domBreakdown = Object.entries(domByCo).map(([k,v]) => `${k} ${v}`).join(' / ') || '0';

    document.getElementById('stats-summary').innerHTML = `
      <div class="alert alert-info">
        <b>응답 현황</b> &nbsp;|&nbsp;
        국내 ${allData.domestic.length}건 (${domBreakdown}) — 장금B ${sumDomJ.toLocaleString()} · 흥아B ${sumDomH.toLocaleString()}
        &nbsp;|&nbsp;
        해외 ${allData.overseas.length}건 (장금 ${sumOvJ.toLocaleString()} · 흥아 ${sumOvH.toLocaleString()})
        &nbsp;|&nbsp;
        세부포트 ${allData.detail.length}건 (${sumDetail.toLocaleString()}부)
        &nbsp;|&nbsp;
        공휴일 ${allData.holiday.length}건
        &nbsp;|&nbsp;
        네트워크 변경 ${allData.network.length}건
      </div>`;
  }

  /* ---------- 테이블 렌더링 ---------- */

  function renderDomestic() {
    const t = document.getElementById('table-domestic');
    const cols = 9 + (isAdmin ? 1 : 0);
    t.innerHTML = `
      <thead><tr>
        ${actionHeader()}
        <th>회사</th><th>본부</th><th>팀</th>
        <th class="num">장금B</th><th class="num">흥아B</th>
        <th>입력자</th><th>이메일</th><th>비고</th><th>제출시각</th>
      </tr></thead>
      <tbody>
        ${allData.domestic.map(r => `
          <tr>
            ${actionCell('domestic_quantities', r.id)}
            <td>${esc(r.company||'')}</td>
            <td>${esc(r.division)}</td>
            <td>${esc(r.team)}</td>
            <td class="num">${(r.jangkum_b_qty||0).toLocaleString()}</td>
            <td class="num">${(r.heunga_b_qty||0).toLocaleString()}</td>
            <td>${esc(r.submitter_name||'')}</td>
            <td>${esc(r.submitter_email||'')}</td>
            <td class="wrap">${esc(r.note||'')}</td>
            <td>${fmtDate(r.created_at)}</td>
          </tr>`).join('') || emptyRow(cols)}
      </tbody>`;
  }

  function renderOverseas() {
    const t = document.getElementById('table-overseas');
    const cols = 17 + (isAdmin ? 1 : 0);
    t.innerHTML = `
      <thead><tr>
        ${actionHeader()}
        <th>신청회사</th><th>국가</th><th>지역</th><th>타입</th>
        <th class="num">장금</th><th class="num">흥아</th>
        <th class="num">YJC장금</th><th class="num">YJC흥아</th>
        <th>배송방법</th><th>Port</th><th>담당자</th><th>연락처</th>
        <th>주소</th><th>비고</th><th>입력자</th><th>입력자 소속</th><th>제출시각</th>
      </tr></thead>
      <tbody>
        ${allData.overseas.map(r => `
          <tr>
            ${actionCell('overseas_quantities', r.id)}
            <td>${esc(r.company||'')}</td>
            <td>${esc(r.country)}</td>
            <td>${esc(r.region)}</td>
            <td><span class="cal-type-badge cal-type-${r.calendar_type}">${r.calendar_type}</span></td>
            <td class="num">${(r.jangkum_qty||0).toLocaleString()}</td>
            <td class="num">${(r.heunga_qty||0).toLocaleString()}</td>
            <td class="num">${(r.yjc_jangkum_qty||0).toLocaleString()}</td>
            <td class="num">${(r.yjc_heunga_qty||0).toLocaleString()}</td>
            <td class="wrap">${esc(r.shipping_method||'')}</td>
            <td>${esc(r.port_code||'')}</td>
            <td class="wrap">${esc(r.pic_name||'')}</td>
            <td class="wrap">${esc(r.pic_contact||'')}</td>
            <td class="wrap-address">${esc(r.shipping_address||'').replace(/\n/g,'<br>')}</td>
            <td class="wrap">${esc(r.note||'')}</td>
            <td>${esc(r.submitter_name||'')}</td>
            <td class="wrap">${esc(r.submitter_office||'')}</td>
            <td>${fmtDate(r.created_at)}</td>
          </tr>`).join('') || emptyRow(cols)}
      </tbody>`;
  }

  function renderDetail() {
    const t = document.getElementById('table-detail');
    const cols = 9 + (isAdmin ? 1 : 0);
    t.innerHTML = `
      <thead><tr>
        ${actionHeader()}
        <th>국가</th><th>지역</th><th>Port</th>
        <th class="num">수량</th><th>배송처 사명</th><th>주소</th>
        <th>입력자</th><th>입력자 소속</th><th>제출시각</th>
      </tr></thead>
      <tbody>
        ${allData.detail.map(r => `
          <tr>
            ${actionCell('detail_ports', r.id)}
            <td>${esc(r.country)}</td>
            <td>${esc(r.region)}</td>
            <td>${esc(r.port_code||'')}</td>
            <td class="num">${(r.quantity||0).toLocaleString()}</td>
            <td class="wrap">${esc(r.company_name||'')}</td>
            <td class="wrap-address">${esc(r.address||'').replace(/\n/g,'<br>')}</td>
            <td>${esc(r.submitter_name||'')}</td>
            <td class="wrap">${esc(r.submitter_office||'')}</td>
            <td>${fmtDate(r.created_at)}</td>
          </tr>`).join('') || emptyRow(cols)}
      </tbody>`;
  }

  function renderHoliday() {
    const t = document.getElementById('table-holiday');
    const cols = 7 + (isAdmin ? 1 : 0);
    t.innerHTML = `
      <thead><tr>
        ${actionHeader()}
        <th>국가</th><th>날짜</th><th>요일</th><th>공휴일명 (EN)</th>
        <th>입력자</th><th>입력자 소속</th><th>제출시각</th>
      </tr></thead>
      <tbody>
        ${allData.holiday.map(r => `
          <tr>
            ${actionCell('overseas_holidays', r.id)}
            <td>${esc(r.country)}</td>
            <td>${esc(r.holiday_date)}</td>
            <td>${esc(r.weekday||'')}</td>
            <td>${esc(r.holiday_name_en)}</td>
            <td>${esc(r.submitter_name||'')}</td>
            <td>${esc(r.submitter_office||'')}</td>
            <td>${fmtDate(r.created_at)}</td>
          </tr>`).join('') || emptyRow(cols)}
      </tbody>`;
  }

  function renderNetwork() {
    const t = document.getElementById('table-network');
    const cols = 9 + (isAdmin ? 1 : 0);
    t.innerHTML = `
      <thead><tr>
        ${actionHeader()}
        <th>국가</th><th>지점/사무소</th><th>변경항목</th>
        <th>기존값</th><th>변경값</th><th>메모</th>
        <th>입력자</th><th>입력자 소속</th><th>제출시각</th>
      </tr></thead>
      <tbody>
        ${allData.network.map(r => `
          <tr>
            ${actionCell('network_changes', r.id)}
            <td>${esc(r.country)}</td>
            <td>${esc(r.branch_name)}</td>
            <td>${esc(r.field||'')}</td>
            <td class="wrap">${esc(r.old_value||'').replace(/\n/g,'<br>')}</td>
            <td class="wrap">${esc(r.new_value||'').replace(/\n/g,'<br>')}</td>
            <td class="wrap-wide">${esc(r.full_note||'').replace(/\n/g,'<br>')}</td>
            <td>${esc(r.submitter_name||'')}</td>
            <td class="wrap">${esc(r.submitter_office||'')}</td>
            <td>${fmtDate(r.created_at)}</td>
          </tr>`).join('') || emptyRow(cols)}
      </tbody>`;
  }

  function renderShipping() {
    const t = document.getElementById('table-shipping');
    if (!t) return;
    const cols = 12 + (isAdmin ? 1 : 0);
    t.innerHTML = `
      <thead><tr>
        ${actionHeader()}
        <th>회사</th><th>국가</th><th>지역</th>
        <th>ETD</th><th>ETA</th>
        <th>BL 번호</th><th>선박명</th>
        <th>특이사항</th><th>수령상태</th><th>등록자</th><th>등록자 소속</th><th>등록시각</th>
      </tr></thead>
      <tbody>
        ${allData.shipping.map(r => {
          const recv = r.received_at
            ? `<span style="color:#2e7d32">✓ ${esc(r.received_by_name||'')}<br><small>${fmtDate(r.received_at)}</small></span>`
            : `<span style="color:#999">미수령</span>`;
          return `
          <tr>
            ${actionCell('shipping_status', r.id)}
            <td>${esc(r.company||'')}</td>
            <td>${esc(r.country)}</td>
            <td>${esc(r.region)}</td>
            <td>${esc(r.status_date||'')}</td>
            <td>${esc(r.eta||'')}</td>
            <td>${esc(r.tracking_no||'')}</td>
            <td>${esc(r.courier||'')}</td>
            <td class="wrap-wide">${esc(r.note||'').replace(/\n/g,'<br>')}</td>
            <td>${recv}</td>
            <td>${esc(r.submitter_name||'')}</td>
            <td class="wrap">${esc(r.submitter_office||'')}</td>
            <td>${fmtDate(r.created_at)}</td>
          </tr>`;
        }).join('') || emptyRow(cols)}
      </tbody>`;
  }

  function emptyRow(cols) {
    return `<tr><td colspan="${cols}" style="text-align:center; color:#999; padding:30px">아직 응답이 없습니다</td></tr>`;
  }

  /* ---------- 보고자료 (전년대비 비교표) ---------- */

  // 셀 수량 포맷: 0은 '-', 아니면 콤마 숫자
  function fmtQty(n) {
    const v = Number(n || 0);
    return v === 0 ? '-' : v.toLocaleString('ko-KR');
  }
  // 증감 셀: A - B (A=올해, B=작년). 감소는 파란▼, 증가는 빨간▲, 동일은 회색 '-'
  function fmtDiff(a, b) {
    const va = Number(a || 0), vb = Number(b || 0);
    const d = va - vb;
    if (d === 0) return `<span class="zero">-</span>`;
    if (d > 0)  return `<span class="up">${d.toLocaleString('ko-KR')} ▲</span>`;
    return `<span class="down">${Math.abs(d).toLocaleString('ko-KR')} ▼</span>`;
  }

  function renderReport() {
    const el = document.getElementById('report-content');
    if (!el) return;

    const yA = SURVEY_YEAR;
    const yB = SURVEY_YEAR - 1;

    // ----- 국내 -----
    // v_yearly_domestic: (survey_year, division, team, jangkum_b_qty, heunga_b_qty)
    // 올해 신청이 아직 없으면 히스토리 데이터로만 표시되므로 division/team 마스터를 기준으로 병합
    const domA = new Map(), domB = new Map();  // key = "division|team"
    (allData.yearlyDomestic || []).forEach(r => {
      const k = `${r.division}|${r.team}`;
      if (r.survey_year === yA) domA.set(k, r);
      else if (r.survey_year === yB) domB.set(k, r);
    });
    // 표시 순서: DOMESTIC_ORG의 순서 우선. 마스터에 없는 팀은 뒤에 추가.
    const seen = new Set();
    const domKeys = [];
    // DOMESTIC_ORG는 회사별 배열이지만 (division, team) 순서는 두 회사 통합
    const orderedTeams = [];
    Object.values(DOMESTIC_ORG).forEach(list => {
      list.forEach(({division, team}) => {
        const k = `${division}|${team}`;
        if (!seen.has(k)) { seen.add(k); orderedTeams.push({division, team}); }
      });
    });
    orderedTeams.forEach(({division, team}) => domKeys.push({division, team}));
    // 마스터에 없지만 데이터에 있는 팀
    [...domA.keys(), ...domB.keys()].forEach(k => {
      if (!seen.has(k)) {
        seen.add(k);
        const [division, team] = k.split('|');
        domKeys.push({division, team});
      }
    });

    // 국내 표 렌더 — 같은 division 그룹 첫 행에만 division 표시
    let lastDivision = null;
    let sumAJ = 0, sumAH = 0, sumBJ = 0, sumBH = 0;
    const domRows = domKeys.map(({division, team}) => {
      const k = `${division}|${team}`;
      const a = domA.get(k) || {};
      const b = domB.get(k) || {};
      const aJ = a.jangkum_b_qty || 0, aH = a.heunga_b_qty || 0;
      const bJ = b.jangkum_b_qty || 0, bH = b.heunga_b_qty || 0;
      // 두 해 모두 0인 팀은 표시에서 생략 (마스터에 있지만 데이터 없음)
      if (aJ === 0 && aH === 0 && bJ === 0 && bH === 0) return null;
      sumAJ += aJ; sumAH += aH; sumBJ += bJ; sumBH += bH;
      const divCell = (division !== lastDivision) ? `<td class="left group" rowspan="1">${esc(division)}</td>` : `<td class="left"></td>`;
      lastDivision = division;
      return `<tr>
        ${divCell}
        <td class="left">${esc(team)}</td>
        <td>${fmtQty(aJ)}</td><td>${fmtQty(aH)}</td>
        <td>${fmtQty(bJ)}</td><td>${fmtQty(bH)}</td>
        <td>${fmtDiff(aJ, bJ)}</td><td>${fmtDiff(aH, bH)}</td>
      </tr>`;
    }).filter(Boolean).join('');

    const domTable = `
      <div class="report-block">
        <h3>국내 ${yA}년 달력 신청수량 (전년 대비)</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th rowspan="2" class="left">구분</th>
              <th rowspan="2" class="left">팀</th>
              <th colspan="2">${yA}년 (A)</th>
              <th colspan="2">${yB}년 (B)</th>
              <th colspan="2">전년대비 (A-B)</th>
            </tr>
            <tr>
              <th>장금</th><th>흥아</th>
              <th>장금</th><th>흥아</th>
              <th>장금</th><th>흥아</th>
            </tr>
          </thead>
          <tbody>
            ${domRows || `<tr><td colspan="8" class="left" style="text-align:center; color:#999; padding:20px">데이터가 없습니다</td></tr>`}
            <tr class="total">
              <td class="left" colspan="2">국내 합계</td>
              <td>${sumAJ.toLocaleString()}</td><td>${sumAH.toLocaleString()}</td>
              <td>${sumBJ.toLocaleString()}</td><td>${sumBH.toLocaleString()}</td>
              <td>${fmtDiff(sumAJ, sumBJ)}</td><td>${fmtDiff(sumAH, sumBH)}</td>
            </tr>
          </tbody>
        </table>
      </div>`;

    // ----- 해외 -----
    const ovA = new Map(), ovB = new Map();
    (allData.yearlyOverseas || []).forEach(r => {
      const k = `${r.country}|${r.region}`;
      if (r.survey_year === yA) ovA.set(k, r);
      else if (r.survey_year === yB) ovB.set(k, r);
    });
    // 표시 순서: OVERSEAS_REGIONS 우선, 데이터만 있는 것 뒤에.
    const ovSeen = new Set();
    const ovKeys = [];
    OVERSEAS_REGIONS.forEach(r => {
      const k = `${r.country}|${r.region}`;
      if (!ovSeen.has(k)) { ovSeen.add(k); ovKeys.push({country: r.country, region: r.region}); }
    });
    [...ovA.keys(), ...ovB.keys()].forEach(k => {
      if (!ovSeen.has(k)) {
        ovSeen.add(k);
        const [country, region] = k.split('|');
        ovKeys.push({country, region});
      }
    });

    let lastCountry = null;
    let osAJ = 0, osAH = 0, osBJ = 0, osBH = 0;
    const ovRows = ovKeys.map(({country, region}) => {
      const k = `${country}|${region}`;
      const a = ovA.get(k) || {};
      const b = ovB.get(k) || {};
      // 장금·흥아 통합 수량 (기본 + YJC 합산)
      const aJ = (a.jangkum_qty||0) + (a.yjc_jangkum_qty||0);
      const aH = (a.heunga_qty ||0) + (a.yjc_heunga_qty ||0);
      const bJ = (b.jangkum_qty||0) + (b.yjc_jangkum_qty||0);
      const bH = (b.heunga_qty ||0) + (b.yjc_heunga_qty ||0);
      if (aJ === 0 && aH === 0 && bJ === 0 && bH === 0) return null;
      osAJ += aJ; osAH += aH; osBJ += bJ; osBH += bH;
      const countryCell = (country !== lastCountry) ? `<td class="left group">${esc(country)}</td>` : `<td class="left"></td>`;
      lastCountry = country;
      return `<tr>
        ${countryCell}
        <td class="left">${esc(region)}</td>
        <td>${fmtQty(aJ)}</td><td>${fmtQty(aH)}</td>
        <td>${fmtQty(bJ)}</td><td>${fmtQty(bH)}</td>
        <td>${fmtDiff(aJ, bJ)}</td><td>${fmtDiff(aH, bH)}</td>
      </tr>`;
    }).filter(Boolean).join('');

    const ovTable = `
      <div class="report-block">
        <h3>해외 ${yA}년 달력 신청수량 (전년 대비)</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th rowspan="2" class="left">국가</th>
              <th rowspan="2" class="left">지역</th>
              <th colspan="2">${yA}년 (A)</th>
              <th colspan="2">${yB}년 (B)</th>
              <th colspan="2">전년대비 (A-B)</th>
            </tr>
            <tr>
              <th>장금</th><th>흥아</th>
              <th>장금</th><th>흥아</th>
              <th>장금</th><th>흥아</th>
            </tr>
          </thead>
          <tbody>
            ${ovRows || `<tr><td colspan="8" class="left" style="text-align:center; color:#999; padding:20px">데이터가 없습니다</td></tr>`}
            <tr class="total">
              <td class="left" colspan="2">해외 합계</td>
              <td>${osAJ.toLocaleString()}</td><td>${osAH.toLocaleString()}</td>
              <td>${osBJ.toLocaleString()}</td><td>${osBH.toLocaleString()}</td>
              <td>${fmtDiff(osAJ, osBJ)}</td><td>${fmtDiff(osAH, osBH)}</td>
            </tr>
          </tbody>
        </table>
        <p style="font-size:12px; color:var(--text-muted); margin:6px 0 0">
          * 해외 수량은 <b>기본 + YJC</b> 합산 기준입니다.
        </p>
      </div>`;

    // ----- 전체 합계 & 요약 -----
    const totAJ = sumAJ + osAJ, totAH = sumAH + osAH;
    const totBJ = sumBJ + osBJ, totBH = sumBH + osBH;
    const totA = totAJ + totAH, totB = totBJ + totBH;
    const totalTable = `
      <div class="report-block">
        <h3>전체 합계 (국내 + 해외)</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th rowspan="2" class="left">구분</th>
              <th colspan="2">${yA}년 (A)</th>
              <th colspan="2">${yB}년 (B)</th>
              <th colspan="2">전년대비 (A-B)</th>
            </tr>
            <tr>
              <th>장금</th><th>흥아</th>
              <th>장금</th><th>흥아</th>
              <th>장금</th><th>흥아</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="left group">국내 합계</td>
              <td>${sumAJ.toLocaleString()}</td><td>${sumAH.toLocaleString()}</td>
              <td>${sumBJ.toLocaleString()}</td><td>${sumBH.toLocaleString()}</td>
              <td>${fmtDiff(sumAJ, sumBJ)}</td><td>${fmtDiff(sumAH, sumBH)}</td>
            </tr>
            <tr>
              <td class="left group">해외 합계</td>
              <td>${osAJ.toLocaleString()}</td><td>${osAH.toLocaleString()}</td>
              <td>${osBJ.toLocaleString()}</td><td>${osBH.toLocaleString()}</td>
              <td>${fmtDiff(osAJ, osBJ)}</td><td>${fmtDiff(osAH, osBH)}</td>
            </tr>
            <tr class="total">
              <td class="left">전체 합계</td>
              <td>${totAJ.toLocaleString()}</td><td>${totAH.toLocaleString()}</td>
              <td>${totBJ.toLocaleString()}</td><td>${totBH.toLocaleString()}</td>
              <td>${fmtDiff(totAJ, totBJ)}</td><td>${fmtDiff(totAH, totBH)}</td>
            </tr>
          </tbody>
        </table>
        <div class="report-summary">
          ※ <b>장금</b> ${totBJ.toLocaleString()}부 → ${totAJ.toLocaleString()}부,
          ${totAJ === totBJ ? '변동 없음' : `${Math.abs(totAJ - totBJ).toLocaleString()}부 ${totAJ > totBJ ? '증가 ▲' : '감소 ▼'}`}
          &nbsp;/&nbsp;
          <b>흥아</b> ${totBH.toLocaleString()}부 → ${totAH.toLocaleString()}부,
          ${totAH === totBH ? '변동 없음' : `${Math.abs(totAH - totBH).toLocaleString()}부 ${totAH > totBH ? '증가 ▲' : '감소 ▼'}`}
        </div>
      </div>`;

    el.innerHTML = `
      <h2 style="margin:0 0 16px; color:var(--primary)">${yA}년 달력 신청수량 보고자료</h2>
      ${domTable}
      ${ovTable}
      ${totalTable}
    `;
  }

  // 인쇄 버튼
  const printBtn = document.getElementById('report-print');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      // 다른 탭이 활성 상태면 보고 탭으로 강제 전환
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(x => x.classList.remove('active'));
      document.querySelector('.tab[data-tab="report"]').classList.add('active');
      document.getElementById('panel-report').classList.add('active');
      window.print();
    });
  }

  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const z = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}`;
  }

  /* ----------------------------------------------------------
     엑셀 다운로드 (원본 4시트 양식)
  ---------------------------------------------------------- */
  document.getElementById('export-xlsx').addEventListener('click', () => {
    const wb = XLSX.utils.book_new();

    // ===== 시트1: 국내수량 (회사별 분리) =====
    const dom = aggregateDomestic(allData.domestic);
    const sheet1 = [
      [`국내 ${SURVEY_YEAR}년 달력 신청수량`],
      [],
      ['회사', '본부', '팀', '장금B', '흥아B']
    ];
    let grandJ = 0, grandH = 0;
    COMPANIES.forEach(co => {
      let coJ = 0, coH = 0;
      DOMESTIC_ORG[co].forEach((org, i) => {
        const teams = DOMESTIC_ORG[co];
        const sameDiv = i > 0 && teams[i-1].division === org.division;
        const cur = dom[co + '|' + org.division + '|' + org.team] || { j:0, h:0 };
        sheet1.push([
          (i === 0 ? co : ''),
          sameDiv ? '' : org.division,
          org.team,
          cur.j,
          cur.h
        ]);
        coJ += cur.j; coH += cur.h;
      });
      sheet1.push(['', '', `${co} 소계`, coJ, coH]);
      sheet1.push([]);
      grandJ += coJ; grandH += coH;
    });
    sheet1.push(['국내 합계', '', '', grandJ, grandH]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheet1), '국내수량');

    // ===== 시트2: 해외 수량 및 배송 =====
    const sheet2 = [
      [`${SURVEY_YEAR}년 달력 해외 배송`],
      ['', '', '수량'],
      ['신청회사','구분','지역','장금','흥아','YJC 장금','YJC 흥아','배송방법','비고(특이사항)','배송주소','Port Code','담당자','담당자 연락처','달력타입','입력자','입력자 소속','제출시각']
    ];
    // 마스터 순서 기준으로 채우기 (응답 없는 행도 표시)
    const ovIndex = {};
    allData.overseas.forEach(r => { ovIndex[r.country+'|'+r.region] = r; });
    OVERSEAS_REGIONS.forEach((m, i) => {
      const sameC = i > 0 && OVERSEAS_REGIONS[i-1].country === m.country;
      const r = ovIndex[m.country+'|'+m.region];
      sheet2.push([
        r ? r.company || '' : '',
        sameC ? '' : m.country,
        m.region,
        r ? r.jangkum_qty || 0 : '',
        r ? r.heunga_qty  || 0 : '',
        r ? r.yjc_jangkum_qty || 0 : '',
        r ? r.yjc_heunga_qty  || 0 : '',
        r ? r.shipping_method || '' : '',
        r ? r.note || '' : '',
        r ? r.shipping_address || '' : '',
        r ? r.port_code || m.port_code : m.port_code,
        r ? r.pic_name || '' : '',
        r ? r.pic_contact || '' : '',
        m.calendar_type,
        r ? r.submitter_name || '' : '',
        r ? r.submitter_office || '' : '',
        r ? fmtDate(r.created_at) : ''
      ]);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheet2), '해외 수량 및 배송');

    // ===== 시트3: 세부포트 =====
    const sheet3 = [
      [`${SURVEY_YEAR}년 달력 해외 세부포트`],
      [],
      ['국가', '지역', 'PORT CODE', '수량', 'ADDRESS', '배송처 사명', '입력자', '입력자 소속', '제출시각']
    ];
    allData.detail.forEach(r => {
      sheet3.push([r.country, r.region, r.port_code || '', r.quantity || 0,
                   r.address || '', r.company_name || '',
                   r.submitter_name || '', r.submitter_office || '', fmtDate(r.created_at)]);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheet3), '세부포트');

    // ===== 시트4: 해외휴일 =====
    const sheet4 = [];
    // 국가별 그룹화
    const byCountry = {};
    allData.holiday.forEach(r => {
      (byCountry[r.country] = byCountry[r.country] || []).push(r);
    });
    Object.keys(byCountry).sort().forEach(country => {
      sheet4.push([`NATIONAL HOLIDAY ${SURVEY_YEAR} IN ${country}`]);
      sheet4.push([]);
      sheet4.push(['DATE', 'Weekday', 'Holiday Name', '입력자', '입력자 소속']);
      byCountry[country].forEach(r => {
        sheet4.push([r.holiday_date, r.weekday || '', r.holiday_name_en,
                     r.submitter_name || '', r.submitter_office || '']);
      });
      sheet4.push([]);
      sheet4.push([]);
    });
    if (!sheet4.length) sheet4.push(['아직 입력된 공휴일이 없습니다']);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheet4), '해외휴일');

    // ===== 시트5: 네트워크 변경사항 =====
    const sheet5 = [
      [`${SURVEY_YEAR}년 달력 네트워크 변경사항 (전년 대비)`],
      [],
      ['국가', '지점/사무소', '변경항목', '기존값(2026)', '변경값(2027)', '메모', '입력자', '입력자 소속', '제출시각']
    ];
    allData.network.forEach(r => {
      sheet5.push([r.country, r.branch_name, r.field || '', r.old_value || '',
                   r.new_value || '', r.full_note || '',
                   r.submitter_name || '', r.submitter_office || '', fmtDate(r.created_at)]);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheet5), '네트워크 변경');

    const fname = `${SURVEY_YEAR}년 달력 조사 응답_${ymd()}.xlsx`;
    XLSX.writeFile(wb, fname);
  });

  // 최신 응답 우선 (같은 회사+본부+팀 중복 응답은 가장 최근만)
  function aggregateDomestic(list) {
    const map = {};
    [...list].reverse().forEach(r => {  // reverse = 오래된 것부터, 최신이 덮어씀
      const key = (r.company||'') + '|' + r.division + '|' + r.team;
      map[key] = { j: r.jangkum_b_qty || 0, h: r.heunga_b_qty || 0 };
    });
    return map;
  }

  /* ----------------------------------------------------------
     CSV 다운로드 (현재 활성 탭)
  ---------------------------------------------------------- */
  document.getElementById('export-csv').addEventListener('click', () => {
    const active = document.querySelector('.tab.active').dataset.tab;
    const rows = allData[active];
    if (!rows.length) {
      alert('현재 탭에 응답이 없습니다.');
      return;
    }
    const keys = Object.keys(rows[0]);
    const csv = [
      keys.join(','),
      ...rows.map(r => keys.map(k => csvCell(r[k])).join(','))
    ].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${active}_${ymd()}.csv`;
    a.click();
  });

  /* ----------------------------------------------------------
     네트워크 변경사항 보고서 (회사별 PDF/인쇄)
     기존값(검정) + 변경값(진한 빨강) 표 형태로 출력
  ---------------------------------------------------------- */
  function networkReport(targetCompany) {
    const rows = allData.network.filter(r => (r.company || '') === targetCompany);
    if (!rows.length) {
      alert(`${targetCompany} 네트워크 변경사항이 없습니다.`);
      return;
    }

    const FIELD_LABEL = Object.fromEntries((window.NETWORK_FIELDS || []).map(f => [f.value, f.label]));
    function fmt(s) {
      if (s === null || s === undefined || s === '') return '<span style="color:#888">—</span>';
      return String(s).replace(/[&<>"']/g, c => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
      }[c])).replace(/\n/g, '<br>');
    }

    // 국가별로 그룹화
    const byCountry = {};
    rows.forEach(r => {
      (byCountry[r.country] = byCountry[r.country] || []).push(r);
    });

    const sections = Object.keys(byCountry).sort().map(country => {
      const items = byCountry[country].map(r => `
        <tr>
          <td>${fmt(r.branch_name)}</td>
          <td>${fmt(FIELD_LABEL[r.field] || r.field || '')}</td>
          <td class="old">${fmt(r.old_value)}</td>
          <td class="new">${fmt(r.new_value)}</td>
          <td>${fmt(r.full_note)}</td>
          <td class="meta">${fmt(r.submitter_name)} <br><small>${fmt(r.submitter_office||'')}</small></td>
        </tr>
      `).join('');
      return `
        <h2>${fmt(country)}</h2>
        <table>
          <thead><tr>
            <th>지점/사무소</th><th>변경 항목</th>
            <th>기존 값 (2026)</th><th>변경 값 (2027)</th>
            <th>메모</th><th>입력자</th>
          </tr></thead>
          <tbody>${items}</tbody>
        </table>
      `;
    }).join('');

    const html = `
<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<title>${targetCompany} 네트워크 변경사항 보고서 - ${SURVEY_YEAR}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Malgun Gothic', sans-serif; padding: 30px; color: #1a1d21; }
  h1 { color: #003876; border-bottom: 3px solid #003876; padding-bottom: 8px; }
  h1 .small { font-size: 14px; color: #6c757d; font-weight: normal; margin-left: 8px; }
  h2 { color: #003876; margin-top: 28px; padding: 6px 12px; background: #f0f3f7; border-left: 4px solid #003876; font-size: 16px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 12px; }
  th, td { border: 1px solid #cbd2dc; padding: 8px 10px; text-align: left; vertical-align: top; }
  th { background: #003876; color: #fff; font-weight: 600; }
  td.old { color: #1a1d21; }
  td.new { color: #c10000; font-weight: 700; }   /* 진한 빨강 */
  td.meta { font-size: 11px; color: #555; }
  .legend { font-size: 12px; margin: 12px 0 24px; }
  .legend .old-sample { color: #1a1d21; }
  .legend .new-sample { color: #c10000; font-weight: 700; }
  .print-btn { background:#003876; color:#fff; border:none; padding:10px 18px; font-size:14px; cursor:pointer; border-radius:4px; margin-bottom:10px; }
  @media print {
    .print-btn { display: none; }
    body { padding: 12mm; }
    h2 { page-break-after: avoid; }
    table { page-break-inside: auto; }
    tr { page-break-inside: avoid; }
  }
</style>
</head><body>

<button class="print-btn" onclick="window.print()">🖨 인쇄 / PDF로 저장</button>

<h1>${targetCompany} 네트워크 변경사항 보고서
  <span class="small">${SURVEY_YEAR}년 달력 제작용 · 전년 대비</span>
</h1>

<div class="legend">
  표시 기준: <span class="old-sample">검은색 = 2026년(기존) 값</span> &nbsp;|&nbsp;
  <span class="new-sample">진한 빨강 = 2027년(변경) 값</span><br>
  본 보고서를 디자인 담당(유진아트)에 전달하여 달력 PDF의 네트워크 페이지에 반영해 주세요.
</div>

${sections}

<div style="margin-top:40px; text-align:right; color:#888; font-size:11px">
  생성: ${new Date().toLocaleString('ko-KR')} · ${rows.length}건 · 장금상선, 흥아라인
</div>

</body></html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  document.getElementById('network-report-jangkum').addEventListener('click', () => networkReport('장금상선'));
  document.getElementById('network-report-heunga' ).addEventListener('click', () => networkReport('흥아라인'));

  function csvCell(v) {
    if (v === null || v === undefined) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  }

  function ymd() {
    const d = new Date();
    const z = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}${z(d.getMonth()+1)}${z(d.getDate())}`;
  }

  /* ----------------------------------------------------------
     네트워크 이미지 업로드 관리
  ---------------------------------------------------------- */
  const NET_COMPANIES = ['jangkum', 'heunga'];
  const netImagePending = { jangkum: null, heunga: null };

  function fmtDateTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const z = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}`;
  }

  async function listNetworkImageFiles() {
    const { data, error } = await supabaseClient.storage
      .from(NETWORK_IMAGE_BUCKET).list('', { limit: 100 });
    if (error) {
      console.warn('[netimg] list error:', error.message);
      return [];
    }
    return data || [];
  }

  function publicUrlFor(name) {
    return supabaseClient.storage.from(NETWORK_IMAGE_BUCKET).getPublicUrl(name).data.publicUrl;
  }

  function findFileFor(company, files) {
    const prefix = NETWORK_IMAGE_KEY[company];
    return files.find(f => f.name.startsWith(prefix + '.'));
  }

  async function loadNetworkImagePreviews() {
    const files = await listNetworkImageFiles();
    NET_COMPANIES.forEach(c => {
      const img    = document.getElementById('netimg-preview-' + c);
      const empty  = document.getElementById('netimg-empty-' + c);
      const meta   = document.getElementById('netimg-meta-' + c);
      const file = findFileFor(c, files);
      if (file) {
        const ts = new Date(file.updated_at || file.created_at || Date.now()).getTime();
        img.src = `${publicUrlFor(file.name)}?t=${ts}`;
        img.style.display = 'block';
        empty.style.display = 'none';
        meta.textContent = `최근 업로드: ${fmtDateTime(file.updated_at || file.created_at)}`;
      } else {
        img.removeAttribute('src');
        img.style.display = 'none';
        empty.style.display = 'block';
        meta.textContent = '';
      }
    });
  }

  function setupNetworkImageUpload(company) {
    const fileInput  = document.getElementById('netimg-file-' + company);
    const filename   = document.getElementById('netimg-filename-' + company);
    const uploadBtn  = document.getElementById('netimg-upload-' + company);
    const msg        = document.getElementById('netimg-msg-' + company);
    const preview    = document.getElementById('netimg-preview-' + company);
    const empty      = document.getElementById('netimg-empty-' + company);

    fileInput.addEventListener('change', () => {
      const f = fileInput.files && fileInput.files[0];
      if (!f) {
        netImagePending[company] = null;
        filename.textContent = '';
        uploadBtn.disabled = true;
        return;
      }
      netImagePending[company] = f;
      filename.textContent = f.name;
      uploadBtn.disabled = false;
      // 로컬 미리보기
      const reader = new FileReader();
      reader.onload = e => {
        preview.src = e.target.result;
        preview.style.display = 'block';
        empty.style.display = 'none';
      };
      reader.readAsDataURL(f);
      msg.innerHTML = '';
    });

    uploadBtn.addEventListener('click', async () => {
      const f = netImagePending[company];
      if (!f) return;
      const ext = (f.name.split('.').pop() || 'jpg').toLowerCase();
      const key = `${NETWORK_IMAGE_KEY[company]}.${ext}`;

      uploadBtn.disabled = true;
      uploadBtn.innerHTML = '<span class="spinner"></span>업로드 중...';
      msg.innerHTML = '';

      // 다른 확장자로 저장된 기존 파일이 있으면 삭제 (jpg/png 혼용 방지)
      const files = await listNetworkImageFiles();
      const old = findFileFor(company, files);
      if (old && old.name !== key) {
        await supabaseClient.storage.from(NETWORK_IMAGE_BUCKET).remove([old.name]);
      }

      const { error } = await supabaseClient.storage
        .from(NETWORK_IMAGE_BUCKET)
        .upload(key, f, { upsert: true, contentType: f.type, cacheControl: '60' });

      uploadBtn.innerHTML = '⬆️ 업로드';

      if (error) {
        msg.innerHTML = `<div class="alert alert-danger">업로드 실패: ${error.message}</div>`;
        uploadBtn.disabled = false;
        return;
      }

      msg.innerHTML = `<div class="alert alert-success">✓ 업로드 완료. 해외 주재원 페이지에 즉시 반영됩니다.</div>`;
      netImagePending[company] = null;
      fileInput.value = '';
      filename.textContent = '';
      await loadNetworkImagePreviews();
    });
  }

  NET_COMPANIES.forEach(setupNetworkImageUpload);

  // 초기 진입 — 인증 없이 바로 데이터 로드
  loadAll();
  loadNetworkImagePreviews();
})();
