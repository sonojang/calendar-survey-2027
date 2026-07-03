// 국내 팀장 입력 페이지 - 회사 → 본부 → 팀 3단계 선택

(function () {
  const _t = (k) => (window.i18n ? window.i18n.t(k) : k);

  const companySel = document.getElementById('company');
  const divSel     = document.getElementById('division');
  const teamSel    = document.getElementById('team');
  const form       = document.getElementById('domestic-form');
  const msg        = document.getElementById('msg-area');
  const submitBtn  = document.getElementById('submit-btn');

  /* --- 임시저장 --- */
  const DRAFT_KEY = 'domestic';
  const draftBannerEl = document.getElementById('draft-banner');

  function getFormSnapshot() {
    return {
      company:         companySel.value,
      division:        divSel.value,
      team:            teamSel.value,
      jangkum_b_qty:   document.getElementById('jangkum_b_qty').value,
      heunga_b_qty:    document.getElementById('heunga_b_qty').value,
      submitter_name:  document.getElementById('submitter_name').value,
      submitter_email: document.getElementById('submitter_email').value,
      note:            document.getElementById('note').value
    };
  }
  function restoreDraft(d) {
    if (!d) return;
    // 회사 → 본부 → 팀 순서 (드롭다운이 종속됨)
    if (d.company) { companySel.value = d.company; repopulateDivision(); }
    if (d.division) { divSel.value = d.division; repopulateTeam(); }
    if (d.team) { teamSel.value = d.team; }
    document.getElementById('jangkum_b_qty').value = d.jangkum_b_qty || '0';
    document.getElementById('heunga_b_qty').value  = d.heunga_b_qty  || '0';
    document.getElementById('submitter_name').value  = d.submitter_name  || '';
    document.getElementById('submitter_email').value = d.submitter_email || '';
    document.getElementById('note').value = d.note || '';
    msg.innerHTML = `<div class="alert alert-info">임시저장한 내용을 불러왔습니다. 확인 후 제출하세요.</div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const draftBanner = window.Draft ? Draft.mountBanner(DRAFT_KEY, draftBannerEl, restoreDraft) : null;

  document.getElementById('draft-save-btn').addEventListener('click', () => {
    if (!window.Draft) return;
    Draft.save(DRAFT_KEY, getFormSnapshot());
    if (draftBanner) draftBanner.rerender();
    msg.innerHTML = `<div class="alert alert-success">✓ 임시저장 완료. 페이지 닫아도 유지됩니다 (같은 브라우저 기준).</div>`;
    setTimeout(() => { msg.innerHTML = ''; }, 3000);
  });

  function populateCompany() {
    const cur = companySel.value;
    companySel.innerHTML = `<option value="">${_t('common.select')}</option>` +
      COMPANIES.map(c => `<option value="${c}" ${c===cur?'selected':''}>${dispKo('company',c)}</option>`).join('');
  }
  populateCompany();

  function repopulateDivision() {
    const co = companySel.value;
    if (!co || !DOMESTIC_ORG[co]) {
      divSel.disabled = true;
      divSel.innerHTML = `<option value="">${_t('common.first_select_div')}</option>`;
      teamSel.disabled = true;
      teamSel.innerHTML = `<option value="">${_t('common.first_select_team')}</option>`;
      return;
    }
    const divisions = [...new Set(DOMESTIC_ORG[co].map(d => d.division))];
    const cur = divSel.value;
    divSel.disabled = false;
    divSel.innerHTML = `<option value="">${_t('common.select')}</option>` +
      divisions.map(d => `<option value="${d}" ${d===cur?'selected':''}>${dispKo('division',d)}</option>`).join('');
  }

  function repopulateTeam() {
    const co = companySel.value;
    const div = divSel.value;
    const teams = (DOMESTIC_ORG[co] || []).filter(d => d.division === div);
    if (!div || !teams.length) {
      teamSel.disabled = true;
      teamSel.innerHTML = `<option value="">${_t('common.first_select_team')}</option>`;
      return;
    }
    const cur = teamSel.value;
    teamSel.disabled = false;
    teamSel.innerHTML = `<option value="">${_t('common.select')}</option>` +
      teams.map(t => `<option value="${t.team}" ${t.team===cur?'selected':''}>${dispKo('team',t.team)}</option>`).join('');
  }

  companySel.addEventListener('change', () => {
    repopulateDivision();
    teamSel.disabled = true;
    teamSel.innerHTML = `<option value="">${_t('common.first_select_team')}</option>`;
  });

  divSel.addEventListener('change', repopulateTeam);

  document.addEventListener('langchange', () => {
    populateCompany();
    if (companySel.value) repopulateDivision();
    if (divSel.value) repopulateTeam();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.innerHTML = '';
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span>제출 중...';

    const payload = {
      survey_year:     SURVEY_YEAR,
      company:         companySel.value,
      division:        divSel.value,
      team:            teamSel.value,
      jangkum_b_qty:   parseInt(document.getElementById('jangkum_b_qty').value || '0', 10),
      heunga_b_qty:    parseInt(document.getElementById('heunga_b_qty').value || '0', 10),
      submitter_name:  document.getElementById('submitter_name').value.trim(),
      submitter_email: document.getElementById('submitter_email').value.trim() || null,
      note:            document.getElementById('note').value.trim() || null
    };

    const { error } = await supabaseClient
      .from('domestic_quantities')
      .insert([payload]);

    submitBtn.disabled = false;
    submitBtn.innerHTML = '제출하기';

    if (error) {
      console.error(error);
      msg.innerHTML = `<div class="alert alert-danger">
        제출 중 오류가 발생했습니다: ${error.message}
      </div>`;
      return;
    }

    msg.innerHTML = `<div class="alert alert-success">
      ✓ 제출이 완료되었습니다. 감사합니다.<br>
      <small>추가 또는 수정이 필요하면 다시 제출하시면 됩니다 (최신 응답 기준).</small>
    </div>`;
    if (window.Draft) { Draft.clear(DRAFT_KEY); if (draftBanner) draftBanner.rerender(); }
    form.reset();
    divSel.disabled = true;
    divSel.innerHTML = '<option value="">먼저 회사를 선택하세요</option>';
    teamSel.disabled = true;
    teamSel.innerHTML = '<option value="">먼저 본부를 선택하세요</option>';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
