// 해외 주재원 입력 페이지

(function () {
  const _t = (k) => (window.i18n ? window.i18n.t(k) : k);

  /* ----------------------------------------------------------
     공통 - 탭 전환
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
     ④ 네트워크 탭 - 회사별 이미지 전환 + 확대 모달
       이미지는 Supabase Storage(`network-images` 버킷)에서 최신본을 가져옴.
       업로드된 파일이 없으면 assets 폴백.
  ---------------------------------------------------------- */
  (function setupNetworkImageModal() {
    const img      = document.getElementById('network-current-image');
    const modalImg = document.getElementById('network-image-modal-img');
    const dlLink   = document.getElementById('network-image-download');
    const zoomBtn  = document.getElementById('network-image-zoom');
    const modal    = document.getElementById('network-image-modal');
    const closeX   = document.getElementById('network-image-close');
    const toggles  = document.querySelectorAll('.network-company-btn');
    if (!img || !modal) return;

    const ALT = {
      jangkum: 'SINOKOR (Jangkum) Networks',
      heunga:  'Heung-A Line Networks',
    };
    // 실제 URL은 loadFromStorage()에서 결정. 폴백은 NETWORK_IMAGE_FALLBACK.
    const SRC = { jangkum: NETWORK_IMAGE_FALLBACK.jangkum, heunga: NETWORK_IMAGE_FALLBACK.heunga };
    let currentCompany = 'jangkum';

    function setCompany(c) {
      currentCompany = c;
      const src = SRC[c] || SRC.jangkum;
      const alt = ALT[c] || ALT.jangkum;
      img.src = src;
      img.alt = alt;
      if (modalImg) { modalImg.src = src; modalImg.alt = alt + ' (zoom)'; }
      if (dlLink) dlLink.href = src;
      toggles.forEach(b => b.classList.toggle('active', b.dataset.networkCompany === c));
    }

    async function loadFromStorage() {
      try {
        const { data: files, error } = await supabaseClient.storage
          .from(NETWORK_IMAGE_BUCKET).list('', { limit: 100 });
        if (error || !files) return;
        ['jangkum', 'heunga'].forEach(c => {
          const prefix = NETWORK_IMAGE_KEY[c];
          const f = files.find(x => x.name.startsWith(prefix + '.'));
          if (!f) return;
          const ts = new Date(f.updated_at || f.created_at || Date.now()).getTime();
          const url = supabaseClient.storage
            .from(NETWORK_IMAGE_BUCKET).getPublicUrl(f.name).data.publicUrl;
          SRC[c] = `${url}?t=${ts}`;
        });
        // 현재 표시중인 회사 이미지 갱신
        setCompany(currentCompany);
      } catch (e) {
        console.warn('[netimg] storage fetch failed, using fallback:', e);
      }
    }

    toggles.forEach(b => {
      b.addEventListener('click', () => setCompany(b.dataset.networkCompany));
    });

    const open  = () => { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; };
    const close = () => { modal.style.display = 'none'; document.body.style.overflow = ''; };

    img.addEventListener('click', open);
    if (zoomBtn) zoomBtn.addEventListener('click', open);
    if (closeX)  closeX.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display !== 'none') close();
    });

    setCompany('jangkum');     // 폴백으로 즉시 표시
    loadFromStorage();         // Storage 응답 오면 갱신
  })();

  /* ----------------------------------------------------------
     입력자 정보 카드 초기화 (소속회사 / 해외법인 국가·지역)
  ---------------------------------------------------------- */
  const SUB_CUSTOM = '__custom__';
  const subCompanySel    = document.getElementById('submitter_company');
  const subCountrySel    = document.getElementById('submitter_branch_country');
  const subCountryCustom = document.getElementById('submitter_branch_country_custom');
  const subRegionSel     = document.getElementById('submitter_branch_region');
  const subRegionCustom  = document.getElementById('submitter_branch_region_custom');

  function populateSubmitterSelects() {
    subCompanySel.innerHTML = `<option value="">${_t('common.select')}</option>` +
      OVERSEAS_COMPANIES.map(c => `<option value="${c}">${dispKo('company',c)}</option>`).join('');

    const subCountries = [...new Set(OVERSEAS_REGIONS.map(r => r.country))];
    subCountrySel.innerHTML = `<option value="">${_t('common.select')}</option>` +
      subCountries.map(c => `<option value="${c}">${dispKo('country',c)}</option>`).join('') +
      `<option value="${SUB_CUSTOM}">${_t('common.custom_input')}</option>`;
  }
  populateSubmitterSelects();

  subCountrySel.addEventListener('change', () => {
    const c = subCountrySel.value;
    if (c === SUB_CUSTOM) {
      subCountryCustom.style.display = 'block';
      subCountryCustom.required = true;
      subRegionSel.disabled = true;
      subRegionSel.innerHTML = `<option value="${SUB_CUSTOM}" selected>${_t('common.custom_input')}</option>`;
      subRegionCustom.style.display = 'block';
      subRegionCustom.required = true;
      return;
    }
    subCountryCustom.style.display = 'none';
    subCountryCustom.required = false;
    subCountryCustom.value = '';
    subRegionCustom.style.display = 'none';
    subRegionCustom.required = false;
    subRegionCustom.value = '';

    if (!c) {
      subRegionSel.disabled = true;
      subRegionSel.innerHTML = `<option value="">${_t('common.first_select_country')}</option>`;
      return;
    }
    const regions = OVERSEAS_REGIONS.filter(r => r.country === c);
    subRegionSel.disabled = false;
    subRegionSel.innerHTML = `<option value="">${_t('common.select')}</option>` +
      regions.map(r => `<option value="${r.region}">${dispKo('region',r.region)}</option>`).join('') +
      `<option value="${SUB_CUSTOM}">${_t('common.custom_input')}</option>`;
  });

  subRegionSel.addEventListener('change', () => {
    if (subRegionSel.value === SUB_CUSTOM) {
      subRegionCustom.style.display = 'block';
      subRegionCustom.required = true;
    } else {
      subRegionCustom.style.display = 'none';
      subRegionCustom.required = false;
      subRegionCustom.value = '';
    }
  });

  /* 공통 - 입력자 정보 가져오기 */
  function getSubmitter() {
    const company = subCompanySel.value;
    const country = (subCountrySel.value === SUB_CUSTOM)
      ? subCountryCustom.value.trim()
      : subCountrySel.value;
    let region;
    if (subCountrySel.value === SUB_CUSTOM || subRegionSel.value === SUB_CUSTOM) {
      region = subRegionCustom.value.trim();
    } else {
      region = subRegionSel.value ? `${subRegionSel.value} 사무소` : '';
    }

    // 종합 텍스트 조립: "장금상선 / 중국 상해 사무소"
    const officeBits = [];
    if (company) officeBits.push(company);
    if (country || region) officeBits.push([country, region].filter(Boolean).join(' '));
    const submitter_office = officeBits.join(' / ') || null;

    return {
      submitter_office,
      submitter_name:  document.getElementById('submitter_name').value.trim(),
      submitter_email: document.getElementById('submitter_email').value.trim() || null,
      _company:        company,
      _branch_country: country,
      _branch_region:  region
    };
  }

  function requireSubmitter(msgArea) {
    const s = getSubmitter();
    if (!s._company) {
      msgArea.innerHTML = `<div class="alert alert-danger">먼저 상단의 <b>소속회사</b>를 선택해 주세요.</div>`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return null;
    }
    if (!s._branch_country || !s._branch_region) {
      msgArea.innerHTML = `<div class="alert alert-danger">먼저 상단의 <b>해외법인 국가/지역</b>을 입력해 주세요.</div>`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return null;
    }
    if (!s.submitter_name) {
      msgArea.innerHTML = `<div class="alert alert-danger">먼저 상단의 <b>입력자 이름</b>을 입력해 주세요.</div>`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return null;
    }
    // 내부 임시 키 제거 (DB로 안 보내기)
    delete s._company;
    delete s._branch_country;
    delete s._branch_region;
    return s;
  }

  /* ==========================================================
     ① 수량·배송정보
  ========================================================== */
  const qtyCompanySel = document.getElementById('qty-company');
  const qtyCountrySel = document.getElementById('qty-country');
  const qtyRegionSel  = document.getElementById('qty-region');
  const qtyCalInfo    = document.getElementById('qty-cal-info');
  const qtyShipping   = document.getElementById('qty-shipping-method');
  const rowJangkum    = document.getElementById('row-jangkum');
  const rowHeunga     = document.getElementById('row-heunga');

  const qtyCountryCustom = document.getElementById('qty-country-custom');
  const qtyRegionCustom  = document.getElementById('qty-region-custom');
  const rowCustomCalType = document.getElementById('row-custom-caltype');
  const CUSTOM_VAL = '__custom__';

  function populateQtySelects() {
    const countries = [...new Set(OVERSEAS_REGIONS.map(r => r.country))];
    qtyCountrySel.innerHTML = `<option value="">${_t('common.select')}</option>` +
      countries.map(c => `<option value="${c}">${dispKo('country',c)}</option>`).join('') +
      `<option value="${CUSTOM_VAL}">${_t('common.custom_input')}</option>`;

    qtyShipping.innerHTML = `<option value="">${_t('common.select')}</option>` +
      SHIPPING_METHODS.map(s => `<option value="${s}">${dispKo('shippingMethod',s)}</option>`).join('');
  }
  populateQtySelects();

  // 회사 선택에 따라 수량 입력란 활성/비활성 전환 (항상 보임)
  const qtyCompanyHint = document.getElementById('qty-company-hint');
  function setQtyEnabled() {
    const co = qtyCompanySel.value;
    const enableJ = (co === '장금상선');
    const enableH = (co === '흥아라인');
    rowJangkum.querySelectorAll('input').forEach(el => { el.disabled = !enableJ; });
    rowHeunga .querySelectorAll('input').forEach(el => { el.disabled = !enableH; });
    if (qtyCompanyHint) qtyCompanyHint.style.display = (enableJ || enableH) ? 'none' : '';
  }
  qtyCompanySel.addEventListener('change', setQtyEnabled);
  setQtyEnabled();   // 페이지 로드 시 초기 상태 적용

  qtyCountrySel.addEventListener('change', () => {
    const c = qtyCountrySel.value;

    // "직접 입력" 선택
    if (c === CUSTOM_VAL) {
      qtyCountryCustom.style.display = 'block';
      qtyCountryCustom.required = true;
      qtyRegionSel.disabled = true;
      qtyRegionSel.innerHTML = `<option value="${CUSTOM_VAL}" selected>${_t('common.custom_input')}</option>`;
      qtyRegionCustom.style.display = 'block';
      qtyRegionCustom.required = true;
      rowCustomCalType.style.display = '';
      qtyCalInfo.style.display = 'none';
      return;
    }

    // 기존 드롭다운 선택
    qtyCountryCustom.style.display = 'none';
    qtyCountryCustom.required = false;
    qtyCountryCustom.value = '';
    qtyRegionCustom.style.display = 'none';
    qtyRegionCustom.required = false;
    qtyRegionCustom.value = '';
    rowCustomCalType.style.display = 'none';

    const regions = OVERSEAS_REGIONS.filter(r => r.country === c);
    if (!c) {
      qtyRegionSel.disabled = true;
      qtyRegionSel.innerHTML = `<option value="">${_t('common.first_select_country')}</option>`;
      qtyCalInfo.style.display = 'none';
      return;
    }
    qtyRegionSel.disabled = false;
    qtyRegionSel.innerHTML = `<option value="">${_t('common.select')}</option>` +
      regions.map(r => `<option value="${r.region}">${dispKo('region',r.region)}</option>`).join('') +
      `<option value="${CUSTOM_VAL}">${_t('common.custom_input')}</option>`;
    qtyCalInfo.style.display = 'none';
  });

  /* ==========================================================
     ① 탭 수정 모드 (본인 응답 조회 후 불러오기)
  ========================================================== */
  let ovrEditingId = null;
  const ovrEditBannerEl = document.getElementById('qty-edit-mode-banner');

  function ovrEnterEditMode(row) {
    ovrEditingId = row.id;
    // 폼에 값 채우기
    if (row.company) { qtyCompanySel.value = row.company; qtyCompanySel.dispatchEvent(new Event('change')); }
    if (row.country) {
      qtyCountrySel.value = row.country;
      qtyCountrySel.dispatchEvent(new Event('change'));
      if (row.region) {
        qtyRegionSel.value = row.region;
        qtyRegionSel.dispatchEvent(new Event('change'));
      }
    }
    document.getElementById('qty-jangkum').value = row.jangkum_qty || 0;
    document.getElementById('qty-heunga').value  = row.heunga_qty  || 0;
    document.getElementById('qty-yjc-jangkum').value = row.yjc_jangkum_qty || 0;
    document.getElementById('qty-yjc-heunga').value  = row.yjc_heunga_qty  || 0;
    if (row.shipping_method) qtyShipping.value = row.shipping_method;
    document.getElementById('qty-address').value = row.shipping_address || '';
    document.getElementById('qty-port-code').value = row.port_code || '';
    document.getElementById('qty-pic-name').value = row.pic_name || '';
    document.getElementById('qty-pic-contact').value = row.pic_contact || '';
    document.getElementById('qty-note').value = row.note || '';

    ovrEditBannerEl.innerHTML = `
      <div class="edit-mode-banner">
        <span>✏️</span>
        <span class="msg"><b>${_t('edit.mode_title')}</b> — ${_t('edit.mode_desc')}</span>
        <button type="button" class="btn btn-secondary btn-sm" id="qty-exit-edit-mode">${_t('common.cancel')}</button>
      </div>`;
    const submitBtn = document.getElementById('qty-submit');
    document.getElementById('qty-exit-edit-mode').addEventListener('click', () => {
      ovrEditingId = null;
      ovrEditBannerEl.innerHTML = '';
      document.getElementById('qty-form').reset();
      if (submitBtn) submitBtn.textContent = _t('common.submit');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    if (submitBtn) submitBtn.textContent = _t('edit.save');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.getElementById('qty-my-entries-btn').addEventListener('click', () => {
    if (!window.MyEntries) return;
    MyEntries.open({
      table: 'overseas_quantities',
      filter: null,
      defaultEmail: document.getElementById('submitter_email').value.trim(),
      renderRow: (r) => `
        <b>${r.company || ''} · ${r.country || ''} ${r.region || ''}</b>
        <span class="cal-type-badge cal-type-${r.calendar_type}">${r.calendar_type}</span><br>
        장금 ${(r.jangkum_qty||0).toLocaleString()} · 흥아 ${(r.heunga_qty||0).toLocaleString()}
        <small>&nbsp; | ${r.survey_year || ''}년 · ${(r.created_at || '').substring(0, 10)}</small>
      `,
      onSelect: ovrEnterEditMode
    });
  });

  /* ==========================================================
     ① 탭 임시저장 (localStorage)
  ========================================================== */
  const OVR_DRAFT_KEY = 'overseas_qty';
  const ovrDraftBannerEl = document.getElementById('qty-draft-banner');

  function ovrGetSnapshot() {
    return {
      // 입력자 정보 (모든 탭 공용이지만 여기서도 저장)
      submitter_company:        subCompanySel.value,
      submitter_branch_country: subCountrySel.value,
      submitter_branch_country_custom: subCountryCustom.value,
      submitter_branch_region:  subRegionSel.value,
      submitter_branch_region_custom:  subRegionCustom.value,
      submitter_name:  document.getElementById('submitter_name').value,
      submitter_email: document.getElementById('submitter_email').value,
      // 수량·배송정보
      qty_company:  qtyCompanySel.value,
      qty_country:  qtyCountrySel.value,
      qty_country_custom: qtyCountryCustom.value,
      qty_region:   qtyRegionSel.value,
      qty_region_custom:  qtyRegionCustom.value,
      qty_custom_caltype: document.getElementById('qty-custom-caltype') ? document.getElementById('qty-custom-caltype').value : '',
      qty_jangkum:  document.getElementById('qty-jangkum').value,
      qty_heunga:   document.getElementById('qty-heunga').value,
      qty_yjc_jangkum: document.getElementById('qty-yjc-jangkum').value,
      qty_yjc_heunga:  document.getElementById('qty-yjc-heunga').value,
      qty_shipping_method: qtyShipping.value,
      qty_address:  document.getElementById('qty-address').value,
      qty_port_code:document.getElementById('qty-port-code').value,
      qty_pic_name: document.getElementById('qty-pic-name').value,
      qty_pic_contact: document.getElementById('qty-pic-contact').value,
      qty_note:     document.getElementById('qty-note').value
    };
  }
  function ovrRestore(d) {
    if (!d) return;
    // 입력자 정보
    if (d.submitter_company) subCompanySel.value = d.submitter_company;
    if (d.submitter_branch_country) {
      subCountrySel.value = d.submitter_branch_country;
      subCountrySel.dispatchEvent(new Event('change'));
      if (d.submitter_branch_country_custom) subCountryCustom.value = d.submitter_branch_country_custom;
      if (d.submitter_branch_region) {
        subRegionSel.value = d.submitter_branch_region;
        subRegionSel.dispatchEvent(new Event('change'));
        if (d.submitter_branch_region_custom) subRegionCustom.value = d.submitter_branch_region_custom;
      }
    }
    if (d.submitter_name)  document.getElementById('submitter_name').value  = d.submitter_name;
    if (d.submitter_email) document.getElementById('submitter_email').value = d.submitter_email;
    // 수량·배송
    if (d.qty_company) { qtyCompanySel.value = d.qty_company; qtyCompanySel.dispatchEvent(new Event('change')); }
    if (d.qty_country) {
      qtyCountrySel.value = d.qty_country;
      qtyCountrySel.dispatchEvent(new Event('change'));
      if (d.qty_country_custom) qtyCountryCustom.value = d.qty_country_custom;
      if (d.qty_region) {
        qtyRegionSel.value = d.qty_region;
        qtyRegionSel.dispatchEvent(new Event('change'));
        if (d.qty_region_custom) qtyRegionCustom.value = d.qty_region_custom;
      }
    }
    const caltypeEl = document.getElementById('qty-custom-caltype');
    if (caltypeEl && d.qty_custom_caltype) caltypeEl.value = d.qty_custom_caltype;
    if (d.qty_jangkum != null)     document.getElementById('qty-jangkum').value = d.qty_jangkum;
    if (d.qty_heunga != null)      document.getElementById('qty-heunga').value  = d.qty_heunga;
    if (d.qty_yjc_jangkum != null) document.getElementById('qty-yjc-jangkum').value = d.qty_yjc_jangkum;
    if (d.qty_yjc_heunga != null)  document.getElementById('qty-yjc-heunga').value  = d.qty_yjc_heunga;
    if (d.qty_shipping_method) qtyShipping.value = d.qty_shipping_method;
    if (d.qty_address)   document.getElementById('qty-address').value   = d.qty_address;
    if (d.qty_port_code) document.getElementById('qty-port-code').value = d.qty_port_code;
    if (d.qty_pic_name)  document.getElementById('qty-pic-name').value  = d.qty_pic_name;
    if (d.qty_pic_contact) document.getElementById('qty-pic-contact').value = d.qty_pic_contact;
    if (d.qty_note)      document.getElementById('qty-note').value      = d.qty_note;

    const msg = document.getElementById('qty-msg');
    msg.innerHTML = `<div class="alert alert-info">${_t('draft.restored_msg')}</div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const ovrDraftBanner = window.Draft ? Draft.mountBanner(OVR_DRAFT_KEY, ovrDraftBannerEl, ovrRestore) : null;

  document.getElementById('qty-draft-save').addEventListener('click', () => {
    if (!window.Draft) return;
    Draft.save(OVR_DRAFT_KEY, ovrGetSnapshot());
    if (ovrDraftBanner) ovrDraftBanner.rerender();
    const msg = document.getElementById('qty-msg');
    msg.innerHTML = `<div class="alert alert-success">${_t('draft.save_success')}</div>`;
    setTimeout(() => { msg.innerHTML = ''; }, 3000);
  });

  qtyRegionSel.addEventListener('change', () => {
    // 지역 직접 입력 선택
    if (qtyRegionSel.value === CUSTOM_VAL) {
      qtyRegionCustom.style.display = 'block';
      qtyRegionCustom.required = true;
      // 국가가 중국이면 A 고정, 아니면 사용자 선택 가능
      if (qtyCountrySel.value === '중국') {
        rowCustomCalType.style.display = 'none';
      } else {
        rowCustomCalType.style.display = '';
      }
      qtyCalInfo.style.display = 'none';
      return;
    }

    qtyRegionCustom.style.display = 'none';
    qtyRegionCustom.required = false;
    qtyRegionCustom.value = '';
    rowCustomCalType.style.display = 'none';

    const r = OVERSEAS_REGIONS.find(
      x => x.country === qtyCountrySel.value && x.region === qtyRegionSel.value
    );
    if (!r) { qtyCalInfo.style.display = 'none'; return; }
    document.getElementById('qty-port-code').value = r.port_code || '';
    const badge = r.calendar_type === 'A'
      ? `<span class="cal-type-badge cal-type-A">${_t('ovr.badge_a')}</span>`
      : `<span class="cal-type-badge cal-type-B">${_t('ovr.badge_b')}</span>`;
    const detail = r.has_detail_ports ? _t('ovr.region_info_japan') : '';
    qtyCalInfo.innerHTML = `<div class="alert alert-info">${
      _t('ovr.region_info_tpl').replace('{badge}', badge).replace('{detail}', detail)
    }</div>`;
    qtyCalInfo.style.display = 'block';
  });

  document.getElementById('qty-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('qty-msg');
    msg.innerHTML = '';
    const submitter = requireSubmitter(msg);
    if (!submitter) return;

    const company = qtyCompanySel.value;
    if (!company) {
      msg.innerHTML = `<div class="alert alert-danger">먼저 <b>신청 달력 회사</b>를 선택해 주세요.</div>`;
      return;
    }

    // 국가/지역 값 결정 (드롭다운 또는 직접 입력)
    let country, region, calendar_type, port_code_default;
    if (qtyCountrySel.value === CUSTOM_VAL) {
      country = qtyCountryCustom.value.trim();
      region  = qtyRegionCustom.value.trim();
      calendar_type = document.getElementById('qty-custom-caltype').value || 'B';
      port_code_default = '';
      if (!country || !region) {
        msg.innerHTML = `<div class="alert alert-danger">국가와 지역을 직접 입력해 주세요.</div>`;
        return;
      }
    } else if (qtyRegionSel.value === CUSTOM_VAL) {
      country = qtyCountrySel.value;
      region  = qtyRegionCustom.value.trim();
      // 중국 직접 입력 지역은 A, 그 외는 사용자 선택
      calendar_type = (country === '중국')
        ? 'A'
        : (document.getElementById('qty-custom-caltype').value || 'B');
      port_code_default = '';
      if (!region) {
        msg.innerHTML = `<div class="alert alert-danger">지역을 직접 입력해 주세요.</div>`;
        return;
      }
    } else {
      const r = OVERSEAS_REGIONS.find(
        x => x.country === qtyCountrySel.value && x.region === qtyRegionSel.value
      );
      if (!r) {
        msg.innerHTML = `<div class="alert alert-danger">국가/지역을 선택해 주세요.</div>`;
        return;
      }
      country = r.country;
      region  = r.region;
      calendar_type = r.calendar_type;
      port_code_default = r.port_code;
    }

    const btn = document.getElementById('qty-submit');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>제출 중...';

    // 선택한 회사 라인의 수량만 적용. 다른 회사 라인은 0.
    const isJangkum = (company === '장금상선');
    const payload = {
      survey_year: SURVEY_YEAR,
      company,
      country,
      region,
      calendar_type,
      jangkum_qty:      isJangkum ? parseInt(document.getElementById('qty-jangkum').value || '0', 10) : 0,
      heunga_qty:       !isJangkum ? parseInt(document.getElementById('qty-heunga').value || '0', 10) : 0,
      yjc_jangkum_qty:  isJangkum ? parseInt(document.getElementById('qty-yjc-jangkum').value || '0', 10) : 0,
      yjc_heunga_qty:   !isJangkum ? parseInt(document.getElementById('qty-yjc-heunga').value || '0', 10) : 0,
      shipping_method:  qtyShipping.value || null,
      note:             document.getElementById('qty-note').value.trim() || null,
      shipping_address: document.getElementById('qty-address').value.trim() || null,
      port_code:        document.getElementById('qty-port-code').value.trim() || null,
      pic_name:         document.getElementById('qty-pic-name').value.trim() || null,
      pic_contact:      document.getElementById('qty-pic-contact').value.trim() || null,
      ...submitter
    };

    let error;
    if (ovrEditingId) {
      const { error: err } = await supabaseClient
        .from('overseas_quantities')
        .update(payload)
        .eq('id', ovrEditingId);
      error = err;
    } else {
      const { error: err } = await supabaseClient
        .from('overseas_quantities')
        .insert([payload]);
      error = err;
    }

    btn.disabled = false;
    btn.innerHTML = ovrEditingId ? _t('edit.save') : _t('common.submit');

    if (error) {
      msg.innerHTML = `<div class="alert alert-danger">${ovrEditingId ? '수정' : '제출'} 오류: ${error.message}</div>`;
      return;
    }
    msg.innerHTML = `<div class="alert alert-success">
      ✓ ${company} - ${country} ${region} ${ovrEditingId ? '수정' : '제출'} 완료.<br>
      <small>다른 회사 달력도 신청하려면 회사를 바꿔서 다시 제출해 주세요.</small>
    </div>`;
    if (window.Draft) { Draft.clear(OVR_DRAFT_KEY); if (ovrDraftBanner) ovrDraftBanner.rerender(); }
    ovrEditingId = null;
    ovrEditBannerEl.innerHTML = '';
    btn.textContent = _t('common.submit');
    document.getElementById('qty-form').reset();
    qtyRegionSel.disabled = true;
    qtyRegionSel.innerHTML = '<option value="">먼저 국가를 선택하세요</option>';
    qtyCalInfo.style.display = 'none';
    setQtyEnabled();
    qtyCountryCustom.style.display = 'none';
    qtyCountryCustom.value = '';
    qtyRegionCustom.style.display = 'none';
    qtyRegionCustom.value = '';
    rowCustomCalType.style.display = 'none';
  });

  /* ==========================================================
     ② 세부포트 - 반복 행
  ========================================================== */
  const detailRows = document.getElementById('detail-rows');

  // 편집 모드: 원본 id 집합 유지 (Set). null이면 신규 모드.
  let detailEditIds = null;
  const detailEditBannerEl = document.getElementById('detail-edit-mode-banner');

  function detailRowHTML() {
    return `
      <div class="repeat-group">
        <button type="button" class="remove-btn" title="${_t('common.delete')}">×</button>
        <div class="form-row">
          <div class="form-group"><label>${_t('ovr.detail_region')}</label><input class="d-region" type="text" placeholder="${_t('ovr.detail_region_ph')}" required></div>
          <div class="form-group"><label>Port Code</label><input class="d-port" type="text" placeholder="${_t('ovr.detail_port_ph')}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>${_t('ovr.detail_qty')}</label><input class="d-qty" type="number" min="0" value="0" required></div>
          <div class="form-group"><label>${_t('ovr.detail_company')}</label><input class="d-company" type="text"></div>
        </div>
        <div class="form-row full">
          <div class="form-group"><label>${_t('ovr.detail_address')}</label><textarea class="d-address"></textarea></div>
        </div>
      </div>`;
  }

  function addDetailRow(preset) {
    detailRows.insertAdjacentHTML('beforeend', detailRowHTML());
    const row = detailRows.lastElementChild;
    row.querySelector('.remove-btn')
      .addEventListener('click', e => e.target.closest('.repeat-group').remove());
    if (preset) {
      if (preset.id != null) row.dataset.origId = preset.id;
      if (preset.region)       row.querySelector('.d-region').value  = preset.region;
      if (preset.port_code)    row.querySelector('.d-port').value    = preset.port_code;
      if (preset.quantity != null) row.querySelector('.d-qty').value = preset.quantity;
      if (preset.address)      row.querySelector('.d-address').value = preset.address;
      if (preset.company_name) row.querySelector('.d-company').value = preset.company_name;
    }
    return row;
  }
  document.getElementById('detail-add').addEventListener('click', () => addDetailRow());
  addDetailRow();  // 기본 1행

  // ----- 세부포트: 양식 다운로드 -----
  document.getElementById('detail-template').addEventListener('click', () => {
    const wb = XLSX.utils.book_new();
    const header = ['국가', '지역', 'PORT CODE', '수량', 'ADDRESS (영문)', '사명'];
    const aoa = [header];
    // 일본 세부 포트를 예시로 사전 채움
    JAPAN_PORTS.forEach(p => {
      aoa.push(['JAPAN', p.region, p.port_code, '', '', '']);
    });
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = [{wch:10},{wch:24},{wch:12},{wch:8},{wch:40},{wch:24}];
    XLSX.utils.book_append_sheet(wb, ws, '세부포트');
    XLSX.writeFile(wb, `${SURVEY_YEAR}년 달력 세부포트 양식.xlsx`);
  });

  // ----- 세부포트: 업로드 -----
  document.getElementById('detail-upload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const msg = document.getElementById('detail-msg');
    try {
      const buf = await file.arrayBuffer();
      const wb  = XLSX.read(buf, { type: 'array' });
      const ws  = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      if (rows.length < 2) {
        msg.innerHTML = `<div class="alert alert-warning">엑셀 파일에 데이터가 없습니다.</div>`;
        return;
      }

      // 첫 번째 컬럼이 모두 같은 국가면 자동 채움
      const dataRows = rows.slice(1).filter(r => r.some(c => String(c||'').trim() !== ''));
      const countries = [...new Set(dataRows.map(r => String(r[0]||'').trim()).filter(Boolean))];
      if (countries.length === 1) {
        document.getElementById('detail-country').value = countries[0];
      }

      // 엑셀 업로드는 신규 데이터 입력이므로 편집 모드 해제
      detailExitEditMode();
      // 기존 행 비우고 업로드 데이터로 채움
      detailRows.innerHTML = '';
      let added = 0;
      dataRows.forEach(r => {
        const region = String(r[1]||'').trim();
        if (!region) return;
        addDetailRow({
          region,
          port_code:    String(r[2]||'').trim(),
          quantity:     parseInt(r[3]||'0', 10) || 0,
          address:      String(r[4]||'').trim(),
          company_name: String(r[5]||'').trim()
        });
        added++;
      });
      if (!added) {
        addDetailRow();
        msg.innerHTML = `<div class="alert alert-warning">업로드한 파일에서 유효한 행을 찾지 못했습니다.</div>`;
      } else {
        msg.innerHTML = `<div class="alert alert-success">
          ✓ ${added}개 행을 불러왔습니다. 확인 후 <b>전체 제출</b> 버튼을 눌러주세요.
        </div>`;
      }
    } catch (err) {
      msg.innerHTML = `<div class="alert alert-danger">엑셀 파일 처리 오류: ${err.message}</div>`;
    } finally {
      e.target.value = '';  // 같은 파일 다시 업로드 가능하게
    }
  });

  document.getElementById('detail-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('detail-msg');
    msg.innerHTML = '';
    const submitter = requireSubmitter(msg);
    if (!submitter) return;

    const country = document.getElementById('detail-country').value.trim();
    const rowEls = [...detailRows.querySelectorAll('.repeat-group')];

    const buildPayload = r => ({
      country,
      region:       r.querySelector('.d-region').value.trim(),
      port_code:    r.querySelector('.d-port').value.trim() || null,
      quantity:     parseInt(r.querySelector('.d-qty').value || '0', 10),
      address:      r.querySelector('.d-address').value.trim() || null,
      company_name: r.querySelector('.d-company').value.trim() || null,
      ...submitter
    });

    const validRows = rowEls.filter(r => r.querySelector('.d-region').value.trim());
    if (!country || !validRows.length) {
      msg.innerHTML = `<div class="alert alert-danger">국가와 최소 1개의 세부 지역을 입력해 주세요.</div>`;
      return;
    }

    const btn = document.getElementById('detail-submit');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>제출 중...';

    let successMsg;
    if (detailEditIds) {
      // 편집 모드: UPDATE(id 유지) + INSERT(신규) + DELETE(제거된 id)
      const keepIds = new Set();
      const inserts = [];
      const updates = [];  // [{ id, payload }]
      validRows.forEach(r => {
        const p = buildPayload(r);
        if (r.dataset.origId) {
          const id = Number(r.dataset.origId);
          keepIds.add(id);
          updates.push({ id, payload: p });
        } else {
          inserts.push(p);
        }
      });
      const deleteIds = [...detailEditIds].filter(id => !keepIds.has(id));

      try {
        if (deleteIds.length) {
          const { error } = await supabaseClient.from('detail_ports').delete().in('id', deleteIds);
          if (error) throw error;
        }
        for (const u of updates) {
          const { error } = await supabaseClient.from('detail_ports').update(u.payload).eq('id', u.id);
          if (error) throw error;
        }
        if (inserts.length) {
          const { error } = await supabaseClient.from('detail_ports').insert(inserts);
          if (error) throw error;
        }
      } catch (err) {
        btn.disabled = false;
        btn.innerHTML = _t('common.submit_all');
        msg.innerHTML = `<div class="alert alert-danger">수정 저장 오류: ${err.message}</div>`;
        return;
      }
      successMsg = `✓ 수정 저장 완료 (신규 ${inserts.length} · 수정 ${updates.length} · 삭제 ${deleteIds.length}).`;
    } else {
      // 신규 모드: 전체 INSERT
      const payloads = validRows.map(buildPayload);
      const { error } = await supabaseClient.from('detail_ports').insert(payloads);
      if (error) {
        btn.disabled = false;
        btn.innerHTML = _t('common.submit_all');
        msg.innerHTML = `<div class="alert alert-danger">제출 오류: ${error.message}</div>`;
        return;
      }
      successMsg = `✓ ${payloads.length}개 세부포트 제출 완료.`;
    }

    btn.disabled = false;
    btn.innerHTML = _t('common.submit_all');
    msg.innerHTML = `<div class="alert alert-success">${successMsg}</div>`;

    detailExitEditMode();
    detailRows.innerHTML = '';
    document.getElementById('detail-country').value = '';
    addDetailRow();
    if (window.Draft) { Draft.clear(DETAIL_DRAFT_KEY); if (detailDraftBanner) detailDraftBanner.rerender(); }
  });

  /* -------------------- 세부포트: 편집 모드 & 임시저장 -------------------- */
  function detailExitEditMode() {
    if (!detailEditIds) return;
    detailEditIds = null;
    if (detailEditBannerEl) detailEditBannerEl.innerHTML = '';
    const btn = document.getElementById('detail-submit');
    if (btn) btn.textContent = _t('common.submit_all');
  }

  function detailEnterEditMode(rows) {
    if (!rows || !rows.length) return;
    detailEditIds = new Set(rows.map(r => Number(r.id)));
    document.getElementById('detail-country').value = rows[0].country || '';
    detailRows.innerHTML = '';
    rows.forEach(r => addDetailRow(r));

    detailEditBannerEl.innerHTML = `
      <div class="edit-mode-banner">
        <span>✏️</span>
        <span class="msg"><b>${_t('edit.mode_title')}</b> — ${_t('edit.mode_desc_batch')}</span>
        <button type="button" class="btn btn-secondary btn-sm" id="detail-exit-edit">${_t('common.cancel')}</button>
      </div>`;
    document.getElementById('detail-exit-edit').addEventListener('click', () => {
      detailExitEditMode();
      detailRows.innerHTML = '';
      document.getElementById('detail-country').value = '';
      addDetailRow();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    const btn = document.getElementById('detail-submit');
    if (btn) btn.textContent = _t('edit.save');
    document.getElementById('detail-msg').innerHTML =
      `<div class="alert alert-info">${_t('edit.loaded_msg').replace('{n}', rows.length)}</div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.getElementById('detail-my-entries-btn').addEventListener('click', () => {
    if (!window.MyEntries) return;
    MyEntries.openGrouped({
      table: 'detail_ports',
      groupBy: 'country',
      defaultEmail: document.getElementById('submitter_email').value.trim(),
      title: _t('my.title_detail'),
      renderGroupHead: (country, rows) => {
        const totalQty = rows.reduce((s, r) => s + (r.quantity || 0), 0);
        const latest = (rows[0].created_at || '').substring(0, 10);
        return `<b>${country}</b> · ${rows.length}${_t('my.rows_unit')} · ${_t('my.total_qty')} ${totalQty.toLocaleString()}
                <small>&nbsp; | ${latest}</small>`;
      },
      onSelectGroup: (rows) => detailEnterEditMode(rows)
    });
  });

  const DETAIL_DRAFT_KEY = 'overseas_detail';
  const detailDraftBannerEl = document.getElementById('detail-draft-banner');
  function detailGetSnapshot() {
    return {
      country: document.getElementById('detail-country').value,
      rows: [...detailRows.querySelectorAll('.repeat-group')].map(r => ({
        region:       r.querySelector('.d-region').value,
        port_code:    r.querySelector('.d-port').value,
        quantity:     r.querySelector('.d-qty').value,
        address:      r.querySelector('.d-address').value,
        company_name: r.querySelector('.d-company').value
      }))
    };
  }
  function detailRestoreDraft(d) {
    if (!d) return;
    detailExitEditMode();
    document.getElementById('detail-country').value = d.country || '';
    detailRows.innerHTML = '';
    if (Array.isArray(d.rows) && d.rows.length) {
      d.rows.forEach(rec => addDetailRow(rec));
    } else {
      addDetailRow();
    }
    document.getElementById('detail-msg').innerHTML =
      `<div class="alert alert-info">${_t('draft.restored_msg')}</div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const detailDraftBanner = window.Draft
    ? Draft.mountBanner(DETAIL_DRAFT_KEY, detailDraftBannerEl, detailRestoreDraft) : null;

  document.getElementById('detail-draft-save').addEventListener('click', () => {
    if (!window.Draft) return;
    Draft.save(DETAIL_DRAFT_KEY, detailGetSnapshot());
    if (detailDraftBanner) detailDraftBanner.rerender();
    const msg = document.getElementById('detail-msg');
    msg.innerHTML = `<div class="alert alert-success">${_t('draft.save_success')}</div>`;
    setTimeout(() => { msg.innerHTML = ''; }, 3000);
  });

  /* ==========================================================
     ③ 공휴일
  ========================================================== */
  const holidayRows = document.getElementById('holiday-rows');

  let holidayEditIds = null;
  const holidayEditBannerEl = document.getElementById('holiday-edit-mode-banner');

  function holidayRowHTML() {
    const wdays = WEEKDAYS.map(w => `<option>${w}</option>`).join('');
    return `
      <div class="repeat-group">
        <button type="button" class="remove-btn" title="${_t('common.delete')}">×</button>
        <div class="form-row">
          <div class="form-group"><label>${_t('ovr.holiday_date')}</label><input class="h-date" type="text" placeholder="${_t('ovr.holiday_date_ph')}" required></div>
          <div class="form-group"><label>${_t('ovr.holiday_weekday')}</label>
            <select class="h-weekday">
              <option value="">${_t('common.select_short')}</option>${wdays}
              <option>${_t('ovr.holiday_multi')}</option>
            </select>
          </div>
        </div>
        <div class="form-row full">
          <div class="form-group"><label>${_t('ovr.holiday_name')}</label><input class="h-name" type="text" placeholder="${_t('ovr.holiday_name_ph')}" required></div>
        </div>
      </div>`;
  }

  function addHolidayRow(preset) {
    holidayRows.insertAdjacentHTML('beforeend', holidayRowHTML());
    const row = holidayRows.lastElementChild;
    row.querySelector('.remove-btn')
      .addEventListener('click', e => e.target.closest('.repeat-group').remove());
    if (preset) {
      if (preset.id != null) row.dataset.origId = preset.id;
      if (preset.holiday_date) row.querySelector('.h-date').value = preset.holiday_date;
      if (preset.weekday) {
        const wdSel = row.querySelector('.h-weekday');
        const match = [...wdSel.options].find(o => o.value === preset.weekday);
        wdSel.value = match ? preset.weekday : '여러 요일';
      }
      if (preset.holiday_name_en) row.querySelector('.h-name').value = preset.holiday_name_en;
    }
    return row;
  }
  document.getElementById('holiday-add').addEventListener('click', () => addHolidayRow());
  addHolidayRow();

  // ----- 공휴일: 양식 다운로드 -----
  document.getElementById('holiday-template').addEventListener('click', () => {
    const wb = XLSX.utils.book_new();
    const header = ['국가', `DATE (${SURVEY_YEAR})`, 'Weekday', 'Holiday Name (영문)'];
    const aoa = [
      [`NATIONAL HOLIDAY ${SURVEY_YEAR}`],
      [],
      header,
      ['CHINA',  `${SURVEY_YEAR}-01-01`, 'Friday',  "New Year's Day"],
      ['CHINA',  `${SURVEY_YEAR}-02-06 ~ 12`, 'Saturday-Friday', 'Chinese Lunar New Year'],
      ['RUSSIA', `${SURVEY_YEAR}-01-01 ~ 08`, 'Friday-Friday', 'New Year Holiday'],
      ['JAPAN',  `${SURVEY_YEAR}-01-01`, 'Friday',  "New Year's Day"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = [{wch:14},{wch:22},{wch:18},{wch:36}];
    XLSX.utils.book_append_sheet(wb, ws, '해외휴일');
    XLSX.writeFile(wb, `${SURVEY_YEAR}년 달력 해외휴일 양식.xlsx`);
  });

  // ----- 공휴일: 업로드 -----
  document.getElementById('holiday-upload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const msg = document.getElementById('holiday-msg');
    try {
      const buf = await file.arrayBuffer();
      const wb  = XLSX.read(buf, { type: 'array' });
      const ws  = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

      // 헤더 행 찾기: "국가"가 있는 첫 행
      let headerIdx = -1;
      for (let i = 0; i < rows.length; i++) {
        const firstCol = String(rows[i][0]||'').trim();
        if (firstCol === '국가' || firstCol.toLowerCase() === 'country') {
          headerIdx = i;
          break;
        }
      }
      if (headerIdx < 0) {
        msg.innerHTML = `<div class="alert alert-warning">엑셀 양식에 "국가" 헤더를 찾지 못했습니다.</div>`;
        return;
      }

      const dataRows = rows.slice(headerIdx + 1).filter(r => r.some(c => String(c||'').trim() !== ''));
      const countries = [...new Set(dataRows.map(r => String(r[0]||'').trim()).filter(Boolean))];
      if (countries.length === 1) {
        document.getElementById('holiday-country').value = countries[0];
      } else if (countries.length > 1) {
        document.getElementById('holiday-country').value = countries.join(', ');
      }

      holidayExitEditMode();
      holidayRows.innerHTML = '';
      let added = 0;
      dataRows.forEach(r => {
        const date = String(r[1]||'').trim();
        const name = String(r[3]||'').trim();
        if (!date || !name) return;
        addHolidayRow({
          holiday_date:    date,
          weekday:         String(r[2]||'').trim(),
          holiday_name_en: name
        });
        added++;
      });
      if (!added) {
        addHolidayRow();
        msg.innerHTML = `<div class="alert alert-warning">업로드한 파일에서 유효한 공휴일을 찾지 못했습니다.</div>`;
      } else {
        msg.innerHTML = `<div class="alert alert-success">
          ✓ ${added}개 공휴일을 불러왔습니다. 확인 후 <b>전체 제출</b> 버튼을 눌러주세요.<br>
          <small>여러 국가가 한 파일에 있으면 국가 칸은 쉼표로 구분되어 채워집니다. 한 번에 한 국가만 권장합니다.</small>
        </div>`;
      }
    } catch (err) {
      msg.innerHTML = `<div class="alert alert-danger">엑셀 파일 처리 오류: ${err.message}</div>`;
    } finally {
      e.target.value = '';
    }
  });

  document.getElementById('holiday-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('holiday-msg');
    msg.innerHTML = '';
    const submitter = requireSubmitter(msg);
    if (!submitter) return;

    const country = document.getElementById('holiday-country').value.trim();
    const rowEls = [...holidayRows.querySelectorAll('.repeat-group')];
    const buildPayload = r => ({
      country,
      holiday_date:    r.querySelector('.h-date').value.trim(),
      weekday:         r.querySelector('.h-weekday').value || null,
      holiday_name_en: r.querySelector('.h-name').value.trim(),
      ...submitter
    });
    const validRows = rowEls.filter(r =>
      r.querySelector('.h-date').value.trim() && r.querySelector('.h-name').value.trim()
    );

    if (!country || !validRows.length) {
      msg.innerHTML = `<div class="alert alert-danger">국가와 최소 1개의 공휴일을 입력해 주세요.</div>`;
      return;
    }

    const btn = document.getElementById('holiday-submit');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>제출 중...';

    let successMsg;
    if (holidayEditIds) {
      const keepIds = new Set();
      const inserts = [];
      const updates = [];
      validRows.forEach(r => {
        const p = buildPayload(r);
        if (r.dataset.origId) {
          const id = Number(r.dataset.origId);
          keepIds.add(id);
          updates.push({ id, payload: p });
        } else {
          inserts.push(p);
        }
      });
      const deleteIds = [...holidayEditIds].filter(id => !keepIds.has(id));

      try {
        if (deleteIds.length) {
          const { error } = await supabaseClient.from('overseas_holidays').delete().in('id', deleteIds);
          if (error) throw error;
        }
        for (const u of updates) {
          const { error } = await supabaseClient.from('overseas_holidays').update(u.payload).eq('id', u.id);
          if (error) throw error;
        }
        if (inserts.length) {
          const { error } = await supabaseClient.from('overseas_holidays').insert(inserts);
          if (error) throw error;
        }
      } catch (err) {
        btn.disabled = false;
        btn.innerHTML = _t('common.submit_all');
        msg.innerHTML = `<div class="alert alert-danger">수정 저장 오류: ${err.message}</div>`;
        return;
      }
      successMsg = `✓ 수정 저장 완료 (신규 ${inserts.length} · 수정 ${updates.length} · 삭제 ${deleteIds.length}).`;
    } else {
      const payloads = validRows.map(buildPayload);
      const { error } = await supabaseClient.from('overseas_holidays').insert(payloads);
      if (error) {
        btn.disabled = false;
        btn.innerHTML = _t('common.submit_all');
        msg.innerHTML = `<div class="alert alert-danger">제출 오류: ${error.message}</div>`;
        return;
      }
      successMsg = `✓ ${payloads.length}개 공휴일 제출 완료.`;
    }

    btn.disabled = false;
    btn.innerHTML = _t('common.submit_all');
    msg.innerHTML = `<div class="alert alert-success">${successMsg}</div>`;

    holidayExitEditMode();
    holidayRows.innerHTML = '';
    document.getElementById('holiday-country').value = '';
    addHolidayRow();
    if (window.Draft) { Draft.clear(HOLIDAY_DRAFT_KEY); if (holidayDraftBanner) holidayDraftBanner.rerender(); }
  });

  /* -------------------- 공휴일: 편집 모드 & 임시저장 -------------------- */
  function holidayExitEditMode() {
    if (!holidayEditIds) return;
    holidayEditIds = null;
    if (holidayEditBannerEl) holidayEditBannerEl.innerHTML = '';
    const btn = document.getElementById('holiday-submit');
    if (btn) btn.textContent = _t('common.submit_all');
  }

  function holidayEnterEditMode(rows) {
    if (!rows || !rows.length) return;
    holidayEditIds = new Set(rows.map(r => Number(r.id)));
    document.getElementById('holiday-country').value = rows[0].country || '';
    holidayRows.innerHTML = '';
    rows.forEach(r => addHolidayRow(r));

    holidayEditBannerEl.innerHTML = `
      <div class="edit-mode-banner">
        <span>✏️</span>
        <span class="msg"><b>${_t('edit.mode_title')}</b> — ${_t('edit.mode_desc_batch')}</span>
        <button type="button" class="btn btn-secondary btn-sm" id="holiday-exit-edit">${_t('common.cancel')}</button>
      </div>`;
    document.getElementById('holiday-exit-edit').addEventListener('click', () => {
      holidayExitEditMode();
      holidayRows.innerHTML = '';
      document.getElementById('holiday-country').value = '';
      addHolidayRow();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    const btn = document.getElementById('holiday-submit');
    if (btn) btn.textContent = _t('edit.save');
    document.getElementById('holiday-msg').innerHTML =
      `<div class="alert alert-info">${_t('edit.loaded_msg').replace('{n}', rows.length)}</div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.getElementById('holiday-my-entries-btn').addEventListener('click', () => {
    if (!window.MyEntries) return;
    MyEntries.openGrouped({
      table: 'overseas_holidays',
      groupBy: 'country',
      defaultEmail: document.getElementById('submitter_email').value.trim(),
      title: _t('my.title_holiday'),
      renderGroupHead: (country, rows) => {
        const latest = (rows[0].created_at || '').substring(0, 10);
        return `<b>${country}</b> · ${rows.length}${_t('my.rows_unit')}
                <small>&nbsp; | ${latest}</small>`;
      },
      onSelectGroup: (rows) => holidayEnterEditMode(rows)
    });
  });

  const HOLIDAY_DRAFT_KEY = 'overseas_holiday';
  const holidayDraftBannerEl = document.getElementById('holiday-draft-banner');
  function holidayGetSnapshot() {
    return {
      country: document.getElementById('holiday-country').value,
      rows: [...holidayRows.querySelectorAll('.repeat-group')].map(r => ({
        holiday_date:    r.querySelector('.h-date').value,
        weekday:         r.querySelector('.h-weekday').value,
        holiday_name_en: r.querySelector('.h-name').value
      }))
    };
  }
  function holidayRestoreDraft(d) {
    if (!d) return;
    holidayExitEditMode();
    document.getElementById('holiday-country').value = d.country || '';
    holidayRows.innerHTML = '';
    if (Array.isArray(d.rows) && d.rows.length) {
      d.rows.forEach(rec => addHolidayRow(rec));
    } else {
      addHolidayRow();
    }
    document.getElementById('holiday-msg').innerHTML =
      `<div class="alert alert-info">${_t('draft.restored_msg')}</div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const holidayDraftBanner = window.Draft
    ? Draft.mountBanner(HOLIDAY_DRAFT_KEY, holidayDraftBannerEl, holidayRestoreDraft) : null;

  document.getElementById('holiday-draft-save').addEventListener('click', () => {
    if (!window.Draft) return;
    Draft.save(HOLIDAY_DRAFT_KEY, holidayGetSnapshot());
    if (holidayDraftBanner) holidayDraftBanner.rerender();
    const msg = document.getElementById('holiday-msg');
    msg.innerHTML = `<div class="alert alert-success">${_t('draft.save_success')}</div>`;
    setTimeout(() => { msg.innerHTML = ''; }, 3000);
  });

  /* ==========================================================
     ④ 네트워크 변경사항
  ========================================================== */
  const netRows = document.getElementById('network-rows');

  let networkEditIds = null;
  const networkEditBannerEl = document.getElementById('network-edit-mode-banner');

  function networkRowHTML() {
    const lang = (window.i18n && window.i18n.getLang()) || 'ko';
    const fields = NETWORK_FIELDS.map(f =>
      `<option value="${f.value}">${lang==='en' ? f.label_en : f.label}</option>`).join('');
    return `
      <div class="repeat-group">
        <button type="button" class="remove-btn" title="${_t('common.delete')}">×</button>
        <div class="form-row">
          <div class="form-group"><label>${_t('ovr.network_company')} <span class="req">*</span></label>
            <select class="n-company" required>
              <option value="">${_t('common.select_short')}</option>
              <option value="장금상선">${dispKo('company','장금상선')}</option>
              <option value="흥아라인">${dispKo('company','흥아라인')}</option>
            </select>
          </div>
          <div class="form-group"><label>${_t('ovr.network_field')}</label>
            <select class="n-field"><option value="">${_t('common.select_short')}</option>${fields}</select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>${_t('common.country')}</label><input class="n-country" type="text" placeholder="${_t('ovr.network_country_ph')}" required></div>
          <div class="form-group"><label>${_t('ovr.network_branch')}</label><input class="n-branch" type="text" placeholder="${_t('ovr.network_branch_ph')}" required></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>${_t('ovr.network_old')}</label><textarea class="n-old"></textarea></div>
          <div class="form-group"><label>${_t('ovr.network_new')}</label><textarea class="n-new"></textarea></div>
        </div>
        <div class="form-row full">
          <div class="form-group"><label>${_t('ovr.network_full')}</label><textarea class="n-note" placeholder="${_t('ovr.network_full_ph')}"></textarea></div>
        </div>
      </div>`;
  }
  function addNetworkRow(preset) {
    netRows.insertAdjacentHTML('beforeend', networkRowHTML());
    const row = netRows.lastElementChild;
    row.querySelector('.remove-btn')
      .addEventListener('click', e => e.target.closest('.repeat-group').remove());
    if (preset) {
      if (preset.id != null) row.dataset.origId = preset.id;
      if (preset.company)     row.querySelector('.n-company').value = preset.company;
      if (preset.field)       row.querySelector('.n-field').value   = preset.field;
      if (preset.country)     row.querySelector('.n-country').value = preset.country;
      if (preset.branch_name) row.querySelector('.n-branch').value  = preset.branch_name;
      if (preset.old_value)   row.querySelector('.n-old').value     = preset.old_value;
      if (preset.new_value)   row.querySelector('.n-new').value     = preset.new_value;
      if (preset.full_note)   row.querySelector('.n-note').value    = preset.full_note;
    }
    return row;
  }
  document.getElementById('network-add').addEventListener('click', () => addNetworkRow());
  addNetworkRow();

  document.getElementById('network-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('network-msg');
    msg.innerHTML = '';
    const submitter = requireSubmitter(msg);
    if (!submitter) return;

    const rowEls = [...netRows.querySelectorAll('.repeat-group')];
    const buildPayload = r => ({
      company:     r.querySelector('.n-company').value,
      country:     r.querySelector('.n-country').value.trim(),
      branch_name: r.querySelector('.n-branch').value.trim(),
      field:       r.querySelector('.n-field').value || null,
      old_value:   r.querySelector('.n-old').value.trim() || null,
      new_value:   r.querySelector('.n-new').value.trim() || null,
      full_note:   r.querySelector('.n-note').value.trim() || null,
      ...submitter
    });
    const validRows = rowEls.filter(r => {
      const p = buildPayload(r);
      return p.company && p.country && p.branch_name && (p.old_value || p.new_value || p.full_note);
    });

    if (!validRows.length) {
      msg.innerHTML = `<div class="alert alert-danger">
        각 변경 항목마다 <b>네트워크 회사(장금/흥아)</b>, 국가, 지점/사무소, 변경 내용을 모두 입력해 주세요.
      </div>`;
      return;
    }

    const btn = document.getElementById('network-submit');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>제출 중...';

    let successMsg;
    if (networkEditIds) {
      const keepIds = new Set();
      const inserts = [];
      const updates = [];
      validRows.forEach(r => {
        const p = buildPayload(r);
        if (r.dataset.origId) {
          const id = Number(r.dataset.origId);
          keepIds.add(id);
          updates.push({ id, payload: p });
        } else {
          inserts.push(p);
        }
      });
      const deleteIds = [...networkEditIds].filter(id => !keepIds.has(id));

      try {
        if (deleteIds.length) {
          const { error } = await supabaseClient.from('network_changes').delete().in('id', deleteIds);
          if (error) throw error;
        }
        for (const u of updates) {
          const { error } = await supabaseClient.from('network_changes').update(u.payload).eq('id', u.id);
          if (error) throw error;
        }
        if (inserts.length) {
          const { error } = await supabaseClient.from('network_changes').insert(inserts);
          if (error) throw error;
        }
      } catch (err) {
        btn.disabled = false;
        btn.innerHTML = _t('common.submit_all');
        msg.innerHTML = `<div class="alert alert-danger">수정 저장 오류: ${err.message}</div>`;
        return;
      }
      successMsg = `✓ 수정 저장 완료 (신규 ${inserts.length} · 수정 ${updates.length} · 삭제 ${deleteIds.length}).`;
    } else {
      const payloads = validRows.map(buildPayload);
      const { error } = await supabaseClient.from('network_changes').insert(payloads);
      if (error) {
        btn.disabled = false;
        btn.innerHTML = _t('common.submit_all');
        msg.innerHTML = `<div class="alert alert-danger">제출 오류: ${error.message}</div>`;
        return;
      }
      successMsg = `✓ ${payloads.length}개 변경사항 제출 완료.`;
    }

    btn.disabled = false;
    btn.innerHTML = _t('common.submit_all');
    msg.innerHTML = `<div class="alert alert-success">${successMsg}</div>`;

    networkExitEditMode();
    netRows.innerHTML = '';
    addNetworkRow();
    if (window.Draft) { Draft.clear(NETWORK_DRAFT_KEY); if (networkDraftBanner) networkDraftBanner.rerender(); }
  });

  /* -------------------- 네트워크: 편집 모드 & 임시저장 -------------------- */
  function networkExitEditMode() {
    if (!networkEditIds) return;
    networkEditIds = null;
    if (networkEditBannerEl) networkEditBannerEl.innerHTML = '';
    const btn = document.getElementById('network-submit');
    if (btn) btn.textContent = _t('common.submit_all');
  }

  function networkEnterEditMode(rows) {
    if (!rows || !rows.length) return;
    networkEditIds = new Set(rows.map(r => Number(r.id)));
    netRows.innerHTML = '';
    rows.forEach(r => addNetworkRow(r));

    networkEditBannerEl.innerHTML = `
      <div class="edit-mode-banner">
        <span>✏️</span>
        <span class="msg"><b>${_t('edit.mode_title')}</b> — ${_t('edit.mode_desc_batch')}</span>
        <button type="button" class="btn btn-secondary btn-sm" id="network-exit-edit">${_t('common.cancel')}</button>
      </div>`;
    document.getElementById('network-exit-edit').addEventListener('click', () => {
      networkExitEditMode();
      netRows.innerHTML = '';
      addNetworkRow();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    const btn = document.getElementById('network-submit');
    if (btn) btn.textContent = _t('edit.save');
    document.getElementById('network-msg').innerHTML =
      `<div class="alert alert-info">${_t('edit.loaded_msg').replace('{n}', rows.length)}</div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.getElementById('network-my-entries-btn').addEventListener('click', () => {
    if (!window.MyEntries) return;
    MyEntries.openGrouped({
      table: 'network_changes',
      groupBy: 'company',
      defaultEmail: document.getElementById('submitter_email').value.trim(),
      title: _t('my.title_network'),
      renderGroupHead: (company, rows) => {
        const latest = (rows[0].created_at || '').substring(0, 10);
        const countries = [...new Set(rows.map(r => r.country).filter(Boolean))].join(', ');
        return `<b>${dispKo('company', company)}</b> · ${rows.length}${_t('my.rows_unit')}
                <small>&nbsp; | ${countries || '-'} · ${latest}</small>`;
      },
      onSelectGroup: (rows) => networkEnterEditMode(rows)
    });
  });

  const NETWORK_DRAFT_KEY = 'overseas_network';
  const networkDraftBannerEl = document.getElementById('network-draft-banner');
  function networkGetSnapshot() {
    return {
      rows: [...netRows.querySelectorAll('.repeat-group')].map(r => ({
        company:     r.querySelector('.n-company').value,
        field:       r.querySelector('.n-field').value,
        country:     r.querySelector('.n-country').value,
        branch_name: r.querySelector('.n-branch').value,
        old_value:   r.querySelector('.n-old').value,
        new_value:   r.querySelector('.n-new').value,
        full_note:   r.querySelector('.n-note').value
      }))
    };
  }
  function networkRestoreDraft(d) {
    if (!d) return;
    networkExitEditMode();
    netRows.innerHTML = '';
    if (Array.isArray(d.rows) && d.rows.length) {
      d.rows.forEach(rec => addNetworkRow(rec));
    } else {
      addNetworkRow();
    }
    document.getElementById('network-msg').innerHTML =
      `<div class="alert alert-info">${_t('draft.restored_msg')}</div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const networkDraftBanner = window.Draft
    ? Draft.mountBanner(NETWORK_DRAFT_KEY, networkDraftBannerEl, networkRestoreDraft) : null;

  document.getElementById('network-draft-save').addEventListener('click', () => {
    if (!window.Draft) return;
    Draft.save(NETWORK_DRAFT_KEY, networkGetSnapshot());
    if (networkDraftBanner) networkDraftBanner.rerender();
    const msg = document.getElementById('network-msg');
    msg.innerHTML = `<div class="alert alert-success">${_t('draft.save_success')}</div>`;
    setTimeout(() => { msg.innerHTML = ''; }, 3000);
  });

  // ----- 행 재구성 헬퍼 (값 보존) -----
  function rebuildRows(container, rowHTMLFn, fieldSelectors) {
    const rows = [...container.querySelectorAll('.repeat-group')];
    if (!rows.length) return;
    const saved = rows.map(r => {
      const v = {};
      fieldSelectors.forEach(s => { const el = r.querySelector(s); if (el) v[s] = el.value; });
      return v;
    });
    container.innerHTML = '';
    saved.forEach(v => {
      container.insertAdjacentHTML('beforeend', rowHTMLFn());
      const row = container.lastElementChild;
      row.querySelector('.remove-btn').addEventListener('click', e =>
        e.target.closest('.repeat-group').remove());
      fieldSelectors.forEach(s => { const el = row.querySelector(s); if (el && v[s] !== undefined) el.value = v[s]; });
    });
  }

  // 언어 변경시 모든 동적 옵션/행 다시 그리기 (값 보존)
  document.addEventListener('langchange', () => {
    // 입력자 회사/국가/지역
    const subC = subCompanySel.value, subCo = subCountrySel.value, subR = subRegionSel.value;
    populateSubmitterSelects();
    if (subC) subCompanySel.value = subC;
    if (subCo && subCo !== SUB_CUSTOM) {
      subCountrySel.value = subCo;
      // 지역 옵션 재구성
      const regions = OVERSEAS_REGIONS.filter(r => r.country === subCo);
      subRegionSel.disabled = false;
      subRegionSel.innerHTML = `<option value="">${_t('common.select')}</option>` +
        regions.map(r => `<option value="${r.region}">${dispKo('region',r.region)}</option>`).join('') +
        `<option value="${SUB_CUSTOM}">${_t('common.custom_input')}</option>`;
      if (subR) subRegionSel.value = subR;
    }

    // 수량 탭 국가/배송방법
    const qtyC  = qtyCountrySel.value;
    const qtyR  = qtyRegionSel.value;
    const qtyS  = qtyShipping.value;
    populateQtySelects();
    if (qtyC) qtyCountrySel.value = qtyC;
    if (qtyS) qtyShipping.value = qtyS;
    if (qtyC && qtyC !== CUSTOM_VAL) {
      const regions = OVERSEAS_REGIONS.filter(r => r.country === qtyC);
      qtyRegionSel.disabled = false;
      qtyRegionSel.innerHTML = `<option value="">${_t('common.select')}</option>` +
        regions.map(r => `<option value="${r.region}">${dispKo('region',r.region)}</option>`).join('') +
        `<option value="${CUSTOM_VAL}">${_t('common.custom_input')}</option>`;
      if (qtyR) qtyRegionSel.value = qtyR;
    }

    // 세부포트 / 공휴일 / 네트워크 행 재구성
    rebuildRows(detailRows,  detailRowHTML,  ['.d-region','.d-port','.d-qty','.d-company','.d-address']);
    rebuildRows(holidayRows, holidayRowHTML, ['.h-date','.h-weekday','.h-name']);
    rebuildRows(netRows,     networkRowHTML, ['.n-company','.n-field','.n-country','.n-branch','.n-old','.n-new','.n-note']);
  });

})();
