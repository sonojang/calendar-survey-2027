// 달력 배송 상황 - 발송 등록(총무팀) + 배송 현황 조회(신청자)
// DB 컬럼 사용:
//   status_type       : 'shipped'
//   status_date       : ETD (예상 출발일자)
//   eta               : ETA (예상 도착일자)
//   tracking_no       : BL 번호
//   courier           : 선박명
//   note              : 기타 특이사항
//   received_at       : 수령 완료 시각 (수령자가 버튼 클릭)
//   received_by_name  : 수령자 이름

(function () {
  const _t = (k) => (window.i18n ? window.i18n.t(k) : k);

  /* 탭 전환 */
  document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      document.getElementById('panel-' + t.dataset.tab).classList.add('active');
      const activeScope = document.querySelector(`.scope-btn.active[data-target="${t.dataset.tab}"]`);
      const scope = activeScope ? activeScope.dataset.scope : 'overseas';
      if (t.dataset.tab === 'status') (scope === 'domestic' ? loadDomStatus : loadStatus)();
      if (t.dataset.tab === 'ship')   (scope === 'domestic' ? loadDomesticPicks : loadOverseasPicks)();
    });
  });

  /* 국내/해외 모드 토글 (탭별 독립) */
  document.querySelectorAll('.scope-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;        // 'status' or 'ship'
      const scope  = btn.dataset.scope;         // 'overseas' or 'domestic'
      document.querySelectorAll(`.scope-btn[data-target="${target}"]`).forEach(b =>
        b.classList.toggle('active', b === btn));
      document.querySelectorAll(`[data-scope-panel^="${target}-"]`).forEach(p =>
        p.classList.toggle('active', p.dataset.scopePanel === `${target}-${scope}`));
      if (target === 'status') (scope === 'domestic' ? loadDomStatus : loadStatus)();
      if (target === 'ship')   (scope === 'domestic' ? loadDomesticPicks : loadOverseasPicks)();
    });
  });

  /* 공통 - 입력자 정보 */
  function getSubmitter() {
    return {
      submitter_name:   document.getElementById('submitter_name').value.trim(),
      submitter_email:  document.getElementById('submitter_email').value.trim() || null,
      submitter_office: document.getElementById('submitter_office').value.trim() || null
    };
  }
  function requireSubmitter(msgArea) {
    const s = getSubmitter();
    if (!s.submitter_name) {
      msgArea.innerHTML = `<div class="alert alert-danger">먼저 등록자 <b>이름</b>을 입력해 주세요.</div>`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return null;
    }
    return s;
  }

  /* 국가/지역 옵션 */
  const CUSTOM_VAL = '__custom__';
  function countryOptionsHTML(selected) {
    const countries = [...new Set(OVERSEAS_REGIONS.map(r => r.country))];
    const sel = selected || '';
    const inList = countries.includes(sel);
    return `<option value="">${_t('common.select_short')}</option>` +
      countries.map(c => `<option value="${c}" ${c===sel?'selected':''}>${dispKo('country',c)}</option>`).join('') +
      `<option value="${CUSTOM_VAL}" ${(!inList && sel)?'selected':''}>${_t('common.custom_input')}</option>`;
  }
  function regionOptionsHTML(country, selected) {
    if (!country) return `<option value="">${_t('common.first_select_country')}</option>`;
    const regions = OVERSEAS_REGIONS.filter(r => r.country === country);
    const sel = selected || '';
    const inList = regions.some(r => r.region === sel);
    return `<option value="">${_t('common.select_short')}</option>` +
      regions.map(r => `<option value="${r.region}" ${r.region===sel?'selected':''}>${dispKo('region',r.region)}</option>`).join('') +
      `<option value="${CUSTOM_VAL}" ${(!inList && sel)?'selected':''}>${_t('common.custom_input')}</option>`;
  }

  function bindCountryRegion(row) {
    const cSel = row.querySelector('.s-country');
    const rSel = row.querySelector('.s-region');
    const cCustom = row.querySelector('.s-country-custom');
    const rCustom = row.querySelector('.s-region-custom');
    cSel.innerHTML = countryOptionsHTML();
    cSel.addEventListener('change', () => {
      if (cSel.value === CUSTOM_VAL) {
        cCustom.style.display = 'block';
        rSel.disabled = true;
        rSel.innerHTML = `<option value="${CUSTOM_VAL}" selected>직접 입력</option>`;
        rCustom.style.display = 'block';
        return;
      }
      cCustom.style.display = 'none'; cCustom.value = '';
      rCustom.style.display = 'none'; rCustom.value = '';
      rSel.disabled = !cSel.value;
      rSel.innerHTML = regionOptionsHTML(cSel.value);
    });
    rSel.addEventListener('change', () => {
      if (rSel.value === CUSTOM_VAL) {
        rCustom.style.display = 'block';
      } else {
        rCustom.style.display = 'none'; rCustom.value = '';
      }
    });
  }

  function readCountryRegion(row) {
    const cSel = row.querySelector('.s-country').value;
    const country = (cSel === CUSTOM_VAL)
      ? row.querySelector('.s-country-custom').value.trim()
      : cSel;
    const rSel = row.querySelector('.s-region').value;
    const region = (cSel === CUSTOM_VAL || rSel === CUSTOM_VAL)
      ? row.querySelector('.s-region-custom').value.trim()
      : rSel;
    return { country, region };
  }

  /* ==========================================================
     📥 해외 신청건에서 가져오기
  ========================================================== */
  let overseasRequests = [];
  let shippedKeys = new Set(); // 이미 발송 등록된 (회사|국가|지역) 키

  async function loadOverseasPicks() {
    const tbl = document.getElementById('overseas-pick-table');
    tbl.innerHTML = `<tr><td colspan="6" style="padding:20px; text-align:center; color:#888">${_t('common.loading')}</td></tr>`;

    const [{ data: overseas, error: e1 }, { data: ships, error: e2 }] = await Promise.all([
      supabaseClient.from('overseas_quantities').select('*').order('created_at', { ascending: false }),
      supabaseClient.from('shipping_status').select('company,country,region').eq('status_type','shipped')
    ]);

    if (e1) {
      tbl.innerHTML = `<tr><td colspan="6" style="padding:20px; color:#c62828">${_t('common.query_error')}: ${e1.message}
        <br><small>※ overseas_quantities anon SELECT</small></td></tr>`;
      return;
    }

    overseasRequests = overseas || [];
    shippedKeys = new Set();
    (ships || []).forEach(s => {
      shippedKeys.add((s.company||'-') + '|' + s.country + '|' + s.region);
    });

    renderOverseasPicks();
  }

  function renderOverseasPicks() {
    const t = document.getElementById('overseas-pick-table');
    const q = (document.getElementById('overseas-search').value || '').toLowerCase().trim();

    // 같은 회사/국가/지역은 최신 1건만 (중복 제거)
    const seen = new Set();
    const dedup = [];
    overseasRequests.forEach(r => {
      const k = (r.company||'-') + '|' + r.country + '|' + r.region;
      if (seen.has(k)) return;
      seen.add(k);
      dedup.push(r);
    });

    const filtered = q
      ? dedup.filter(r =>
          (r.country||'').toLowerCase().includes(q) ||
          (r.region||'').toLowerCase().includes(q) ||
          (r.pic_name||'').toLowerCase().includes(q) ||
          (r.submitter_name||'').toLowerCase().includes(q))
      : dedup;

    if (!filtered.length) {
      t.innerHTML = `<tr><td colspan="6" style="padding:20px; text-align:center; color:#888">${_t('ship.picker_no_data')}</td></tr>`;
      return;
    }

    t.innerHTML = `
      <thead style="background:#fff3c4">
        <tr>
          <th style="padding:6px 8px">${_t('common.company')}</th>
          <th style="padding:6px 8px">${_t('common.country')} / ${_t('common.region')}</th>
          <th style="padding:6px 8px">${_t('ship.picker_total_qty')}</th>
          <th style="padding:6px 8px">${_t('ship.picker_pic')}</th>
          <th style="padding:6px 8px">${_t('ship.picker_ship_info')}</th>
          <th style="padding:6px 8px; width:110px">${_t('ship.picker_register')}</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(r => {
          const total = (r.jangkum_qty||0) + (r.heunga_qty||0) + (r.yjc_jangkum_qty||0) + (r.yjc_heunga_qty||0);
          const k = (r.company||'-') + '|' + r.country + '|' + r.region;
          const isShipped = shippedKeys.has(k);
          const pic = [r.pic_name, r.pic_contact].filter(Boolean).join(' / ');
          const addr = [r.shipping_method, r.shipping_address].filter(Boolean).join(' · ');
          const btn = isShipped
            ? `<span style="color:#2e7d32; font-size:12px">${_t('ship.picker_already')}</span>`
            : `<button type="button" class="btn btn-sm pick-btn" style="background:#2196f3; color:white; padding:4px 10px; font-size:12px"
                   data-rec='${encodeURIComponent(JSON.stringify({
                     company: r.company,
                     country: r.country,
                     region: r.region
                   }))}'>${_t('ship.picker_register_btn')}</button>`;
          return `
            <tr>
              <td style="padding:6px 8px">${esc(dispKo('company',r.company||''))}</td>
              <td style="padding:6px 8px"><b>${esc(dispKo('country',r.country))}</b> / ${esc(dispKo('region',r.region))}</td>
              <td style="padding:6px 8px; text-align:right">${total}</td>
              <td style="padding:6px 8px">${esc(pic||'-')}</td>
              <td style="padding:6px 8px; font-size:12px; color:#555">${esc(addr||'-')}</td>
              <td style="padding:6px 8px; text-align:center">${btn}</td>
            </tr>`;
        }).join('')}
      </tbody>`;

    // 버튼 핸들러 바인딩
    t.querySelectorAll('.pick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rec = JSON.parse(decodeURIComponent(btn.dataset.rec));
        addShipRowFromOverseas(rec);
      });
    });
  }

  function addShipRowFromOverseas(rec) {
    addShipRow();
    const row = shipRows.lastElementChild;
    // 회사
    row.querySelector('.s-company').value = rec.company || '';
    // 국가
    const cSel = row.querySelector('.s-country');
    const cCustom = row.querySelector('.s-country-custom');
    const rSel = row.querySelector('.s-region');
    const rCustom = row.querySelector('.s-region-custom');

    const countries = [...new Set(OVERSEAS_REGIONS.map(r => r.country))];
    if (countries.includes(rec.country)) {
      cSel.value = rec.country;
      rSel.disabled = false;
      rSel.innerHTML = regionOptionsHTML(rec.country, rec.region);
      const regions = OVERSEAS_REGIONS.filter(r => r.country === rec.country).map(r => r.region);
      if (!regions.includes(rec.region)) {
        rSel.value = CUSTOM_VAL;
        rCustom.style.display = 'block';
        rCustom.value = rec.region || '';
      }
    } else {
      cSel.value = CUSTOM_VAL;
      cCustom.style.display = 'block';
      cCustom.value = rec.country || '';
      rSel.disabled = true;
      rSel.innerHTML = `<option value="${CUSTOM_VAL}" selected>직접 입력</option>`;
      rCustom.style.display = 'block';
      rCustom.value = rec.region || '';
    }
    // 스크롤 이동
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    row.style.outline = '2px solid #2196f3';
    setTimeout(() => row.style.outline = '', 1500);
  }

  /* ==========================================================
     📤 발송 등록
  ========================================================== */
  const shipRows = document.getElementById('ship-rows');

  function shipRowHTML() {
    return `
      <div class="repeat-group">
        <button type="button" class="remove-btn" title="${_t('common.delete')}">×</button>
        <div class="form-row">
          <div class="form-group"><label>${_t('ship.row_company')} <span class="req">*</span></label>
            <select class="s-company" required>
              <option value="">${_t('common.select_short')}</option>
              <option value="장금상선">${dispKo('company','장금상선')}</option>
              <option value="흥아라인">${dispKo('company','흥아라인')}</option>
            </select>
          </div>
          <div class="form-group"></div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>${_t('common.country')} <span class="req">*</span></label>
            <select class="s-country" required></select>
            <input class="s-country-custom" type="text" style="display:none; margin-top:6px" placeholder="${_t('ship.row_country_ph')}">
          </div>
          <div class="form-group">
            <label>${_t('common.region')} <span class="req">*</span></label>
            <select class="s-region" required disabled>
              <option value="">${_t('common.first_select_country')}</option>
            </select>
            <input class="s-region-custom" type="text" style="display:none; margin-top:6px" placeholder="${_t('ship.row_region_ph')}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>${_t('ship.row_etd')}</label>
            <input class="s-etd" type="date">
          </div>
          <div class="form-group">
            <label>${_t('ship.row_eta')}</label>
            <input class="s-eta" type="date">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>${_t('ship.row_bl')}</label>
            <input class="s-bl" type="text" placeholder="${_t('ship.row_bl_ph')}">
          </div>
          <div class="form-group">
            <label>${_t('ship.row_vessel')}</label>
            <input class="s-vessel" type="text" placeholder="${_t('ship.row_vessel_ph')}">
          </div>
        </div>
        <div class="form-row full">
          <div class="form-group">
            <label>${_t('common.note_special')}</label>
            <textarea class="s-note" placeholder="${_t('ship.row_note_ph')}"></textarea>
          </div>
        </div>
      </div>`;
  }

  function addShipRow() {
    shipRows.insertAdjacentHTML('beforeend', shipRowHTML());
    const row = shipRows.lastElementChild;
    row.querySelector('.remove-btn').addEventListener('click', e =>
      e.target.closest('.repeat-group').remove()
    );
    bindCountryRegion(row);
  }
  document.getElementById('ship-add').addEventListener('click', addShipRow);
  addShipRow();

  document.getElementById('ship-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('ship-msg');
    msg.innerHTML = '';
    const submitter = requireSubmitter(msg);
    if (!submitter) return;

    const rows = [...shipRows.querySelectorAll('.repeat-group')];
    const payloads = rows.map(r => {
      const { country, region } = readCountryRegion(r);
      return {
        company:     r.querySelector('.s-company').value || null,
        country, region,
        status_type: 'shipped',
        status_date: r.querySelector('.s-etd').value || null,
        eta:         r.querySelector('.s-eta').value || null,
        tracking_no: r.querySelector('.s-bl').value.trim() || null,
        courier:     r.querySelector('.s-vessel').value.trim() || null,
        note:        r.querySelector('.s-note').value.trim() || null,
        qty:         null,
        ...submitter
      };
    }).filter(p => p.company && p.country && p.region);

    if (!payloads.length) {
      msg.innerHTML = `<div class="alert alert-danger">최소 1건의 발송 정보(회사/국가/지역 필수)를 입력해 주세요.</div>`;
      return;
    }

    const btn = document.getElementById('ship-submit');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>등록 중...';

    const { error } = await supabaseClient.from('shipping_status').insert(payloads);
    btn.disabled = false;
    btn.innerHTML = '전체 등록';

    if (error) {
      msg.innerHTML = `<div class="alert alert-danger">등록 오류: ${error.message}</div>`;
      return;
    }
    msg.innerHTML = `<div class="alert alert-success">✓ ${payloads.length}건의 발송 정보가 등록되었습니다.</div>`;
    shipRows.innerHTML = '';
    addShipRow();
    loadOverseasPicks(); // 등록된 행은 ✓등록됨으로 갱신
  });

  /* ==========================================================
     📋 배송 현황 조회 (누구나 가능)
  ========================================================== */
  let allShipments = [];

  function populateFilterCompany() {
    const sel = document.getElementById('filter-company');
    const cur = sel.value;
    sel.innerHTML =
      `<option value="">${_t('common.all')}</option>` +
      ['장금상선','흥아라인']
        .map(c => `<option value="${c}" ${c===cur?'selected':''}>${dispKo('company',c)}</option>`)
        .join('');
  }

  async function loadStatus() {
    const t = document.getElementById('status-table');
    t.innerHTML = `<tr><td colspan="9" style="padding:30px; text-align:center; color:#888">${_t('common.loading')}</td></tr>`;

    const { data, error } = await supabaseClient
      .from('shipping_status')
      .select('*')
      .eq('status_type', 'shipped')
      .order('status_date', { ascending: false });

    if (error) {
      t.innerHTML = `<tr><td colspan="9" style="padding:30px; color:#c62828">${_t('common.query_error')}: ${error.message}
        <br><small>※ Supabase RLS anon SELECT required.</small></td></tr>`;
      return;
    }
    allShipments = data || [];
    const latest = dedupLatest(allShipments);

    // 국가 필터 옵션 채우기
    populateFilterCompany();
    const fc = document.getElementById('filter-country');
    const currentCountry = fc.value;
    const countries = [...new Set(latest.map(r => r.country))].sort();
    fc.innerHTML = `<option value="">${_t('common.all')}</option>` +
      countries.map(c => `<option value="${c}" ${c===currentCountry?'selected':''}>${dispKo('country',c)}</option>`).join('');

    renderStatus(latest);
  }

  function dedupLatest(list) {
    const seen = new Set();
    const out = [];
    list.forEach(r => {
      const k = (r.company||'-') + '|' + r.country + '|' + r.region;
      if (seen.has(k)) return;
      seen.add(k);
      out.push(r);
    });
    return out;
  }

  function renderStatus(list) {
    const t = document.getElementById('status-table');
    const filterCo = document.getElementById('filter-company').value;
    const filterCountry = document.getElementById('filter-country').value;
    const filtered = list.filter(r =>
      (!filterCo      || (r.company  || '') === filterCo) &&
      (!filterCountry || r.country === filterCountry)
    );

    if (!filtered.length) {
      t.innerHTML = `<tr><td colspan="9" style="padding:30px; text-align:center; color:#888">${_t('ship.no_match')}</td></tr>`;
      return;
    }

    t.innerHTML = `
      <thead><tr>
        <th>${_t('common.company')}</th><th>${_t('common.country')}</th><th>${_t('common.region')}</th>
        <th>${_t('ship.col_etd')}</th><th>${_t('ship.col_eta')}</th>
        <th>${_t('ship.row_bl')}</th><th>${_t('ship.row_vessel')}</th><th>${_t('ship.col_note')}</th>
        <th style="width:140px">${_t('ship.col_receive')}</th>
      </tr></thead>
      <tbody>
        ${filtered.map(r => {
          const received = !!r.received_at;
          const receivedCell = received
            ? `<span style="color:#2e7d32; font-size:12px">
                 ${_t('ship.receive_done')}<br>
                 <small>${esc(r.received_by_name||'')} · ${fmtDate(r.received_at)}</small>
               </span>`
            : `<button type="button" class="btn-receive" data-id="${r.id}"
                   style="background:#4caf50; color:white; border:0; padding:6px 10px; border-radius:4px; cursor:pointer; font-size:12px">
                 ${_t('ship.receive_btn')}
               </button>`;
          return `
            <tr>
              <td>${esc(dispKo('company',r.company||''))}</td>
              <td>${esc(dispKo('country',r.country))}</td>
              <td>${esc(dispKo('region',r.region))}</td>
              <td>${esc(r.status_date||'-')}</td>
              <td>${esc(r.eta||'-')}</td>
              <td>${esc(r.tracking_no||'-')}</td>
              <td>${esc(r.courier||'-')}</td>
              <td>${esc(r.note||'').replace(/\n/g,'<br>')}</td>
              <td style="text-align:center">${receivedCell}</td>
            </tr>`;
        }).join('')}
      </tbody>`;

    // 수령완료 버튼 핸들러
    t.querySelectorAll('.btn-receive').forEach(btn => {
      btn.addEventListener('click', () => markReceived(btn.dataset.id, btn));
    });
  }

  async function markReceived(id, btn) {
    const name = (prompt(_t('ship.prompt_name')) || '').trim();
    if (!name) return;
    btn.disabled = true;
    btn.textContent = _t('common.loading');

    const { error } = await supabaseClient
      .from('shipping_status')
      .update({
        received_at: new Date().toISOString(),
        received_by_name: name
      })
      .eq('id', id);

    if (error) {
      alert(_t('ship.receive_err') + error.message + _t('ship.receive_rls'));
      btn.disabled = false;
      btn.textContent = _t('ship.receive_btn');
      return;
    }
    loadStatus();
  }

  document.getElementById('status-refresh').addEventListener('click', loadStatus);
  document.getElementById('filter-company').addEventListener('change',
    () => renderStatus(dedupLatest(allShipments)));
  document.getElementById('filter-country').addEventListener('change',
    () => renderStatus(dedupLatest(allShipments)));

  /* 해외 신청건 검색/새로고침 */
  document.getElementById('overseas-search').addEventListener('input', renderOverseasPicks);
  document.getElementById('overseas-refresh').addEventListener('click', loadOverseasPicks);

  // 초기 진입시 현황 자동 로드
  loadStatus();

  // 언어 변경시 동적 테이블 + 폼 옵션 다시 그리기
  document.addEventListener('langchange', () => {
    populateFilterCompany();
    renderStatus(dedupLatest(allShipments));
    if (overseasRequests.length) renderOverseasPicks();

    // 발송 등록 행 안의 회사/국가/지역 옵션 새로고침 (선택값 유지)
    document.querySelectorAll('#ship-rows .repeat-group').forEach(row => {
      const company = row.querySelector('.s-company').value;
      const cSel = row.querySelector('.s-country');
      const rSel = row.querySelector('.s-region');
      const curC = cSel.value;
      const curR = rSel.value;

      // 회사 옵션 재구성 (셀렉트 안 텍스트만 영어로)
      [...row.querySelector('.s-company').options].forEach(opt => {
        if (opt.value && opt.value !== '') opt.textContent = dispKo('company', opt.value);
      });

      // 국가 옵션 재구성
      cSel.innerHTML = countryOptionsHTML(curC);
      if (curC === CUSTOM_VAL) {
        rSel.disabled = true;
        rSel.innerHTML = `<option value="${CUSTOM_VAL}" selected>${_t('common.custom_input')}</option>`;
      } else if (curC) {
        rSel.disabled = false;
        rSel.innerHTML = regionOptionsHTML(curC, curR);
      }
    });
  });

  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function fmtDate(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }

  /* ============================================================
     🇰🇷 국내 배송 (등록 + 조회)
       - DB는 같은 shipping_status 테이블 사용
       - 국내 식별: division IS NOT NULL (또는 team IS NOT NULL)
       - 컬럼 매핑:
           company         : 장금상선 / 흥아라인
           division        : 본부
           team            : 팀
           status_type     : 'shipped'
           eta             : 도착예정일
           qty             : 부수
           driver_contact  : 배송기사 연락처
           note            : 비고
           country/region  : NULL (해외 전용)
  ============================================================ */

  /* -------------------- 국내 picker -------------------- */
  let domesticRequests = [];
  let domShippedKeys = new Set(); // (회사|본부|팀)

  async function loadDomesticPicks() {
    const tbl = document.getElementById('domestic-pick-table');
    if (!tbl) return;
    tbl.innerHTML = `<tr><td colspan="6" style="padding:20px; text-align:center; color:#888">${_t('common.loading')}</td></tr>`;

    const [{ data: domestic, error: e1 }, { data: ships, error: e2 }] = await Promise.all([
      supabaseClient.from('domestic_quantities').select('*').order('created_at', { ascending: false }),
      supabaseClient.from('shipping_status').select('company,division,team').eq('status_type','shipped').not('division','is',null)
    ]);

    if (e1) {
      tbl.innerHTML = `<tr><td colspan="6" style="padding:20px; color:#c62828">${_t('common.query_error')}: ${e1.message}
        <br><small>※ domestic_quantities anon SELECT 정책 필요</small></td></tr>`;
      return;
    }

    domesticRequests = domestic || [];
    domShippedKeys = new Set();
    (ships || []).forEach(s => {
      domShippedKeys.add((s.company||'-') + '|' + (s.division||'') + '|' + (s.team||''));
    });

    renderDomesticPicks();
  }

  function renderDomesticPicks() {
    const t = document.getElementById('domestic-pick-table');
    if (!t) return;
    const q = (document.getElementById('domestic-search').value || '').toLowerCase().trim();

    // 동일 회사/본부/팀은 최신 1건만
    const seen = new Set();
    const dedup = [];
    domesticRequests.forEach(r => {
      const k = (r.company||'-') + '|' + (r.division||'') + '|' + (r.team||'');
      if (seen.has(k)) return;
      seen.add(k);
      dedup.push(r);
    });

    const filtered = q
      ? dedup.filter(r =>
          (r.company||'').toLowerCase().includes(q) ||
          (r.division||'').toLowerCase().includes(q) ||
          (r.team||'').toLowerCase().includes(q) ||
          (r.submitter_name||'').toLowerCase().includes(q))
      : dedup;

    if (!filtered.length) {
      t.innerHTML = `<tr><td colspan="6" style="padding:20px; text-align:center; color:#888">${_t('ship.picker_dom_no_data')}</td></tr>`;
      return;
    }

    t.innerHTML = `
      <thead style="background:#fff3c4">
        <tr>
          <th style="padding:6px 8px">${_t('common.company')}</th>
          <th style="padding:6px 8px">${_t('ship.col_division')} / ${_t('ship.col_team')}</th>
          <th style="padding:6px 8px">${_t('ship.picker_total_qty')}</th>
          <th style="padding:6px 8px">${_t('common.name')}</th>
          <th style="padding:6px 8px">${_t('common.note')}</th>
          <th style="padding:6px 8px; width:110px">${_t('ship.picker_register')}</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(r => {
          const total = (r.jangkum_b_qty||0) + (r.heunga_b_qty||0);
          const k = (r.company||'-') + '|' + (r.division||'') + '|' + (r.team||'');
          const isShipped = domShippedKeys.has(k);
          const btn = isShipped
            ? `<span style="color:#2e7d32; font-size:12px">${_t('ship.picker_already')}</span>`
            : `<button type="button" class="btn btn-sm dom-pick-btn" style="background:#2196f3; color:white; padding:4px 10px; font-size:12px"
                   data-rec='${encodeURIComponent(JSON.stringify({
                     company: r.company, division: r.division, team: r.team,
                     qty: total
                   }))}'>${_t('ship.picker_register_btn')}</button>`;
          return `
            <tr>
              <td style="padding:6px 8px">${esc(dispKo('company',r.company||''))}</td>
              <td style="padding:6px 8px"><b>${esc(r.division||'-')}</b> / ${esc(r.team||'-')}</td>
              <td style="padding:6px 8px; text-align:right">${total}</td>
              <td style="padding:6px 8px">${esc(r.submitter_name||'-')}</td>
              <td style="padding:6px 8px; font-size:12px; color:#555">${esc(r.note||'-')}</td>
              <td style="padding:6px 8px; text-align:center">${btn}</td>
            </tr>`;
        }).join('')}
      </tbody>`;

    t.querySelectorAll('.dom-pick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rec = JSON.parse(decodeURIComponent(btn.dataset.rec));
        addDomShipRowFromPicker(rec);
      });
    });
  }

  /* -------------------- 국내 발송 등록 폼 -------------------- */
  const domShipRows = document.getElementById('dom-ship-rows');

  function domShipRowHTML() {
    return `
      <div class="repeat-group">
        <button type="button" class="remove-btn" title="${_t('common.delete')}">×</button>
        <div class="form-row">
          <div class="form-group"><label>${_t('ship.row_company')} <span class="req">*</span></label>
            <select class="d-company" required>
              <option value="">${_t('common.select_short')}</option>
              <option value="장금상선">${dispKo('company','장금상선')}</option>
              <option value="흥아라인">${dispKo('company','흥아라인')}</option>
            </select>
          </div>
          <div class="form-group"></div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>${_t('ship.col_division')} <span class="req">*</span></label>
            <select class="d-division" required disabled>
              <option value="">${_t('common.first_select_div')}</option>
            </select>
          </div>
          <div class="form-group">
            <label>${_t('ship.col_team')} <span class="req">*</span></label>
            <select class="d-team" required disabled>
              <option value="">${_t('common.first_select_team')}</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>${_t('ship.row_eta_dom')}</label>
            <input class="d-eta" type="date">
          </div>
          <div class="form-group">
            <label>${_t('ship.row_qty')}</label>
            <input class="d-qty" type="number" min="0" value="0">
          </div>
        </div>
        <div class="form-row full">
          <div class="form-group">
            <label>${_t('ship.row_driver_contact')}</label>
            <input class="d-driver" type="text" placeholder="${_t('ship.row_driver_contact_ph')}">
          </div>
        </div>
        <div class="form-row full">
          <div class="form-group">
            <label>${_t('common.note_special')}</label>
            <textarea class="d-note"></textarea>
          </div>
        </div>
      </div>`;
  }

  function bindDomRow(row) {
    const cSel = row.querySelector('.d-company');
    const dSel = row.querySelector('.d-division');
    const tSel = row.querySelector('.d-team');

    cSel.addEventListener('change', () => {
      const teams = DOMESTIC_ORG[cSel.value] || [];
      const divisions = [...new Set(teams.map(t => t.division))];
      dSel.disabled = divisions.length === 0;
      dSel.innerHTML = `<option value="">${_t('common.select_short')}</option>` +
        divisions.map(d => `<option value="${d}">${d}</option>`).join('');
      tSel.disabled = true;
      tSel.innerHTML = `<option value="">${_t('common.first_select_team')}</option>`;
    });

    dSel.addEventListener('change', () => {
      const teams = (DOMESTIC_ORG[cSel.value] || [])
        .filter(t => t.division === dSel.value).map(t => t.team);
      tSel.disabled = teams.length === 0;
      tSel.innerHTML = `<option value="">${_t('common.select_short')}</option>` +
        teams.map(tm => `<option value="${tm}">${tm}</option>`).join('');
    });
  }

  function addDomShipRow() {
    domShipRows.insertAdjacentHTML('beforeend', domShipRowHTML());
    const row = domShipRows.lastElementChild;
    row.querySelector('.remove-btn').addEventListener('click', e =>
      e.target.closest('.repeat-group').remove()
    );
    bindDomRow(row);
    return row;
  }

  function addDomShipRowFromPicker(rec) {
    const row = addDomShipRow();
    const cSel = row.querySelector('.d-company');
    const dSel = row.querySelector('.d-division');
    const tSel = row.querySelector('.d-team');

    cSel.value = rec.company || '';
    cSel.dispatchEvent(new Event('change'));
    if (rec.division) {
      dSel.value = rec.division;
      dSel.dispatchEvent(new Event('change'));
    }
    if (rec.team) {
      tSel.value = rec.team;
    }
    if (rec.qty != null) {
      row.querySelector('.d-qty').value = rec.qty;
    }

    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    row.style.outline = '2px solid #2196f3';
    setTimeout(() => row.style.outline = '', 1500);
  }

  if (domShipRows) {
    document.getElementById('dom-ship-add').addEventListener('click', addDomShipRow);
    addDomShipRow();

    document.getElementById('dom-ship-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('dom-ship-msg');
      msg.innerHTML = '';
      const submitter = requireSubmitter(msg);
      if (!submitter) return;

      const rows = [...domShipRows.querySelectorAll('.repeat-group')];
      const payloads = rows.map(r => ({
        company:        r.querySelector('.d-company').value || null,
        division:       r.querySelector('.d-division').value || null,
        team:           r.querySelector('.d-team').value || null,
        country:        null,
        region:         null,
        status_type:    'shipped',
        eta:            r.querySelector('.d-eta').value || null,
        qty:            parseInt(r.querySelector('.d-qty').value, 10) || 0,
        driver_contact: r.querySelector('.d-driver').value.trim() || null,
        note:           r.querySelector('.d-note').value.trim() || null,
        ...submitter
      })).filter(p => p.company && p.division && p.team);

      if (!payloads.length) {
        msg.innerHTML = `<div class="alert alert-danger">최소 1건의 발송 정보(회사/본부/팀 필수)를 입력해 주세요.</div>`;
        return;
      }

      const btn = document.getElementById('dom-ship-submit');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>등록 중...';

      const { error } = await supabaseClient.from('shipping_status').insert(payloads);
      btn.disabled = false;
      btn.innerHTML = _t('ship.submit_all');

      if (error) {
        msg.innerHTML = `<div class="alert alert-danger">등록 오류: ${error.message}
          <br><small>※ shipping_status 테이블에 division/team/driver_contact 컬럼이 있는지 확인하세요.</small></div>`;
        return;
      }
      msg.innerHTML = `<div class="alert alert-success">✓ ${payloads.length}건의 국내 발송 정보가 등록되었습니다.</div>`;
      domShipRows.innerHTML = '';
      addDomShipRow();
      loadDomesticPicks();
    });
  }

  /* -------------------- 국내 배송 현황 조회 -------------------- */
  let allDomShipments = [];

  async function loadDomStatus() {
    const t = document.getElementById('dom-status-table');
    if (!t) return;
    t.innerHTML = `<tr><td colspan="8" style="padding:30px; text-align:center; color:#888">${_t('common.loading')}</td></tr>`;

    const { data, error } = await supabaseClient
      .from('shipping_status')
      .select('*')
      .eq('status_type', 'shipped')
      .not('division', 'is', null)
      .order('eta', { ascending: true });

    if (error) {
      t.innerHTML = `<tr><td colspan="8" style="padding:30px; color:#c62828">${_t('common.query_error')}: ${error.message}</td></tr>`;
      return;
    }
    allDomShipments = data || [];

    // 본부 필터 옵션 채우기
    const fd = document.getElementById('dom-filter-division');
    const currentDiv = fd.value;
    const latest = dedupDomLatest(allDomShipments);
    const divisions = [...new Set(latest.map(r => r.division).filter(Boolean))].sort();
    fd.innerHTML = `<option value="">${_t('common.all')}</option>` +
      divisions.map(d => `<option value="${d}" ${d===currentDiv?'selected':''}>${esc(d)}</option>`).join('');

    renderDomStatus(latest);
  }

  function dedupDomLatest(list) {
    const seen = new Set();
    const out = [];
    list.forEach(r => {
      const k = (r.company||'-') + '|' + (r.division||'') + '|' + (r.team||'');
      if (seen.has(k)) return;
      seen.add(k);
      out.push(r);
    });
    return out;
  }

  function renderDomStatus(list) {
    const t = document.getElementById('dom-status-table');
    if (!t) return;
    const filterCo  = document.getElementById('dom-filter-company').value;
    const filterDiv = document.getElementById('dom-filter-division').value;
    const filtered = list.filter(r =>
      (!filterCo  || (r.company  || '') === filterCo) &&
      (!filterDiv || (r.division || '') === filterDiv)
    );

    if (!filtered.length) {
      t.innerHTML = `<tr><td colspan="8" style="padding:30px; text-align:center; color:#888">${_t('ship.no_match')}</td></tr>`;
      return;
    }

    t.innerHTML = `
      <thead><tr>
        <th>${_t('common.company')}</th>
        <th>${_t('ship.col_division')}</th>
        <th>${_t('ship.col_team')}</th>
        <th>${_t('ship.row_eta_dom')}</th>
        <th>${_t('ship.row_qty')}</th>
        <th>${_t('ship.row_driver_contact')}</th>
        <th>${_t('ship.col_note')}</th>
        <th style="width:140px">${_t('ship.col_receive')}</th>
      </tr></thead>
      <tbody>
        ${filtered.map(r => {
          const received = !!r.received_at;
          const receivedCell = received
            ? `<span style="color:#2e7d32; font-size:12px">
                 ${_t('ship.receive_done')}<br>
                 <small>${esc(r.received_by_name||'')} · ${fmtDate(r.received_at)}</small>
               </span>`
            : `<button type="button" class="btn-receive-dom" data-id="${r.id}"
                   style="background:#4caf50; color:white; border:0; padding:6px 10px; border-radius:4px; cursor:pointer; font-size:12px">
                 ${_t('ship.receive_btn')}
               </button>`;
          return `
            <tr>
              <td>${esc(dispKo('company',r.company||''))}</td>
              <td>${esc(r.division||'-')}</td>
              <td>${esc(r.team||'-')}</td>
              <td>${esc(r.eta||'-')}</td>
              <td style="text-align:right">${r.qty||0}</td>
              <td>${esc(r.driver_contact||'-')}</td>
              <td>${esc(r.note||'').replace(/\n/g,'<br>')}</td>
              <td style="text-align:center">${receivedCell}</td>
            </tr>`;
        }).join('')}
      </tbody>`;

    t.querySelectorAll('.btn-receive-dom').forEach(btn => {
      btn.addEventListener('click', () => markDomReceived(btn.dataset.id, btn));
    });
  }

  async function markDomReceived(id, btn) {
    const name = (prompt(_t('ship.prompt_name')) || '').trim();
    if (!name) return;
    btn.disabled = true;
    btn.textContent = _t('common.loading');

    const { error } = await supabaseClient
      .from('shipping_status')
      .update({
        received_at: new Date().toISOString(),
        received_by_name: name
      })
      .eq('id', id);

    if (error) {
      alert(_t('ship.receive_err') + error.message + _t('ship.receive_rls'));
      btn.disabled = false;
      btn.textContent = _t('ship.receive_btn');
      return;
    }
    loadDomStatus();
  }

  // 국내 조회 필터/새로고침
  const domStatusRefresh = document.getElementById('dom-status-refresh');
  const domFilterCo  = document.getElementById('dom-filter-company');
  const domFilterDiv = document.getElementById('dom-filter-division');
  if (domStatusRefresh) domStatusRefresh.addEventListener('click', loadDomStatus);
  if (domFilterCo)  domFilterCo.addEventListener('change', () => renderDomStatus(dedupDomLatest(allDomShipments)));
  if (domFilterDiv) domFilterDiv.addEventListener('change', () => renderDomStatus(dedupDomLatest(allDomShipments)));

  // 국내 picker 검색/새로고침
  const domSearch  = document.getElementById('domestic-search');
  const domRefresh = document.getElementById('domestic-refresh');
  if (domSearch)  domSearch.addEventListener('input', renderDomesticPicks);
  if (domRefresh) domRefresh.addEventListener('click', loadDomesticPicks);

  /* ==========================================================
     발송 등록 임시저장 (localStorage)
     - 등록자 정보 + 해외 반복 행 + 국내 반복 행 통합 저장
  ========================================================== */
  const SHIP_DRAFT_KEY = 'shipping';
  const shipDraftBannerEl = document.getElementById('ship-draft-banner');

  function shipCollectRows(container, fieldMap) {
    return [...container.querySelectorAll('.repeat-group')].map(row => {
      const out = {};
      for (const [key, selector] of Object.entries(fieldMap)) {
        const el = row.querySelector(selector);
        if (el) out[key] = el.value;
      }
      return out;
    });
  }
  const SHIP_OV_FIELDS = {
    company: '.s-company', country: '.s-country', country_custom: '.s-country-custom',
    region: '.s-region', region_custom: '.s-region-custom',
    etd: '.s-etd', eta: '.s-eta', bl: '.s-bl', vessel: '.s-vessel', note: '.s-note'
  };
  const SHIP_DOM_FIELDS = {
    company: '.d-company', division: '.d-division', team: '.d-team',
    eta: '.d-eta', qty: '.d-qty', driver: '.d-driver', note: '.d-note'
  };

  function shipGetSnapshot() {
    return {
      submitter_name:  document.getElementById('submitter_name').value,
      submitter_email: document.getElementById('submitter_email').value,
      submitter_office:document.getElementById('submitter_office').value,
      overseas: shipRows ? shipCollectRows(shipRows, SHIP_OV_FIELDS) : [],
      domestic: domShipRows ? shipCollectRows(domShipRows, SHIP_DOM_FIELDS) : []
    };
  }
  function shipRestore(d) {
    if (!d) return;
    if (d.submitter_name)  document.getElementById('submitter_name').value  = d.submitter_name;
    if (d.submitter_email) document.getElementById('submitter_email').value = d.submitter_email;
    if (d.submitter_office)document.getElementById('submitter_office').value= d.submitter_office;

    // 해외 행 복원
    if (Array.isArray(d.overseas) && d.overseas.length && shipRows) {
      shipRows.innerHTML = '';
      d.overseas.forEach(rec => {
        addShipRow();
        const row = shipRows.lastElementChild;
        for (const [key, selector] of Object.entries(SHIP_OV_FIELDS)) {
          if (rec[key] == null) continue;
          const el = row.querySelector(selector);
          if (!el) continue;
          el.value = rec[key];
          if (['.s-country', '.s-region'].includes(selector)) el.dispatchEvent(new Event('change'));
        }
      });
    }
    // 국내 행 복원
    if (Array.isArray(d.domestic) && d.domestic.length && domShipRows) {
      domShipRows.innerHTML = '';
      d.domestic.forEach(rec => {
        addDomShipRow();
        const row = domShipRows.lastElementChild;
        for (const [key, selector] of Object.entries(SHIP_DOM_FIELDS)) {
          if (rec[key] == null) continue;
          const el = row.querySelector(selector);
          if (!el) continue;
          el.value = rec[key];
          if (['.d-company', '.d-division'].includes(selector)) el.dispatchEvent(new Event('change'));
          // 종속 select는 change 이벤트 후에도 다시 채워야 함
          if (selector === '.d-division' && rec.team) {
            setTimeout(() => { row.querySelector('.d-team').value = rec.team; }, 0);
          }
        }
      });
    }
    alert('임시저장한 발송 등록 내용을 불러왔습니다. 확인 후 등록하세요.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const shipDraftBanner = window.Draft ? Draft.mountBanner(SHIP_DRAFT_KEY, shipDraftBannerEl, shipRestore) : null;

  const shipDraftBtn = document.getElementById('ship-draft-save');
  const domShipDraftBtn = document.getElementById('dom-ship-draft-save');
  function shipDoSave(msgAreaId) {
    if (!window.Draft) return;
    Draft.save(SHIP_DRAFT_KEY, shipGetSnapshot());
    if (shipDraftBanner) shipDraftBanner.rerender();
    const msg = document.getElementById(msgAreaId);
    if (msg) {
      msg.innerHTML = `<div class="alert alert-success">✓ 임시저장 완료. 페이지 닫아도 유지됩니다 (같은 브라우저 기준).</div>`;
      setTimeout(() => { msg.innerHTML = ''; }, 3000);
    }
  }
  if (shipDraftBtn)    shipDraftBtn.addEventListener('click',    () => shipDoSave('ship-msg'));
  if (domShipDraftBtn) domShipDraftBtn.addEventListener('click', () => shipDoSave('dom-ship-msg'));

  // 제출 성공 후 draft 삭제 (기존 submit 리스너 실행 후 감시)
  // 각 submit 리스너가 성공 시 msg에 "등록되었습니다" 를 넣으므로 그것을 관찰
  const observeSuccess = (msgId) => {
    const el = document.getElementById(msgId);
    if (!el) return;
    new MutationObserver(() => {
      if (el.querySelector('.alert-success') && el.textContent.includes('등록되었습니다')) {
        if (window.Draft) { Draft.clear(SHIP_DRAFT_KEY); if (shipDraftBanner) shipDraftBanner.rerender(); }
      }
    }).observe(el, { childList: true, subtree: true });
  };
  observeSuccess('ship-msg');
  observeSuccess('dom-ship-msg');

})();
