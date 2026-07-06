// 담당자 본인 응답 조회·수정 공통 유틸
// 사용:
//   MyEntries.open({ table, filter, defaultEmail, renderRow, onSelect });

(function () {
  const _t = (k) => (window.i18n ? window.i18n.t(k) : k);

  let modal, emailInput, msgEl, resultsEl, closeBtn, searchBtn, titleEl, descEl, cancelBtn;

  function ensureModal() {
    if (modal) return;
    modal = document.createElement('div');
    modal.id = 'my-entries-modal';
    modal.className = 'edit-modal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="edit-modal-box" style="max-width:640px">
        <div class="edit-modal-head">
          <h3 id="my-entries-title" data-i18n="my.title">📝 내 이전 신청 조회·수정</h3>
          <button class="edit-modal-close" type="button" aria-label="close">×</button>
        </div>
        <div class="edit-modal-body">
          <p class="desc" id="my-entries-desc" data-i18n="my.desc"></p>
          <div class="form-row full">
            <div class="form-group">
              <label data-i18n="common.email">이메일</label>
              <input id="my-entries-email" type="email" data-i18n-placeholder="my.email_ph">
            </div>
          </div>
          <div id="my-entries-msg"></div>
          <div id="my-entries-results" style="max-height:340px; overflow-y:auto; margin-top:8px"></div>
        </div>
        <div class="edit-modal-foot">
          <button class="btn btn-secondary" id="my-entries-cancel" data-i18n="common.close">닫기</button>
          <button class="btn btn-primary" id="my-entries-search" data-i18n="common.search">🔍 조회</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    // i18n 적용 (모달이 방금 DOM에 붙었으니 data-i18n을 반영)
    if (window.i18n && window.i18n.applyToDom) window.i18n.applyToDom(modal);

    emailInput = modal.querySelector('#my-entries-email');
    msgEl      = modal.querySelector('#my-entries-msg');
    resultsEl  = modal.querySelector('#my-entries-results');
    closeBtn   = modal.querySelector('.edit-modal-close');
    searchBtn  = modal.querySelector('#my-entries-search');
    titleEl    = modal.querySelector('#my-entries-title');
    descEl     = modal.querySelector('#my-entries-desc');
    cancelBtn  = modal.querySelector('#my-entries-cancel');

    closeBtn.addEventListener('click', close);
    cancelBtn.addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });

    // 언어 변경 시 모달 내부 다시 반영
    document.addEventListener('langchange', () => {
      if (window.i18n && window.i18n.applyToDom) window.i18n.applyToDom(modal);
    });
  }

  function close() {
    modal.style.display = 'none';
    msgEl.innerHTML = '';
    resultsEl.innerHTML = '';
  }

  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  let ctx = null;

  async function doSearch() {
    const email = (emailInput.value || '').trim().toLowerCase();
    if (!email) {
      msgEl.innerHTML = `<div class="alert alert-danger">${_t('my.email_required')}</div>`;
      return;
    }
    msgEl.innerHTML = `<div class="alert alert-info">${_t('my.searching')}</div>`;
    resultsEl.innerHTML = '';

    let q = supabaseClient.from(ctx.table).select('*')
      .ilike('submitter_email', email)
      .order('created_at', { ascending: false });

    if (ctx.filter) {
      Object.entries(ctx.filter).forEach(([k, v]) => { q = q.eq(k, v); });
    }

    const { data, error } = await q;
    if (error) {
      msgEl.innerHTML = `<div class="alert alert-danger">${_t('common.query_error')}: ${esc(error.message)}</div>`;
      return;
    }
    if (!data || !data.length) {
      msgEl.innerHTML = `<div class="alert alert-warning">${_t('my.no_results')}</div>`;
      return;
    }
    const msgText = _t('my.results_msg').replace('{n}', data.length);
    msgEl.innerHTML = `<div class="alert alert-success">${msgText}</div>`;
    resultsEl.innerHTML = data.map(r => `
      <div class="my-entry-item">
        <div class="my-entry-summary">${ctx.renderRow(r)}</div>
        <button type="button" class="btn btn-primary btn-sm my-entry-load" data-id="${r.id}">${_t('common.load')}</button>
      </div>`).join('');
    resultsEl.querySelectorAll('.my-entry-load').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = data.find(x => String(x.id) === btn.dataset.id);
        if (row) {
          try { ctx.onSelect(row); } catch (e) { console.error('[my-entries]', e); }
          close();
        }
      });
    });
  }

  function open(opts) {
    ensureModal();
    ctx = opts;
    emailInput.value = opts.defaultEmail || '';
    msgEl.innerHTML = '';
    resultsEl.innerHTML = '';
    modal.style.display = 'flex';
    setTimeout(() => emailInput.focus(), 50);
    searchBtn.onclick = doSearch;
    emailInput.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); doSearch(); } };
  }

  /* ------------------------------------------------------------
     openGrouped: 반복행(세부포트/공휴일/네트워크)용
     - 이메일로 모든 행 조회 → groupBy 필드값별로 그룹핑
     - 각 그룹에 [불러오기] 버튼 → onSelectGroup(rows) 콜백
     사용 예:
       MyEntries.openGrouped({
         table: 'detail_ports',
         groupBy: 'country',
         defaultEmail: '...',
         title: '내 이전 세부포트',
         renderGroupHead: (key, rows) => `<b>${key}</b> · ${rows.length}건`,
         onSelectGroup: (rows) => { ... }
       });
  ------------------------------------------------------------ */
  async function openGrouped(opts) {
    ensureModal();
    ctx = null; // 그룹 모드에서는 단건 컨텍스트 사용 안 함
    emailInput.value = opts.defaultEmail || '';
    if (opts.title && titleEl) titleEl.textContent = opts.title;
    if (opts.desc && descEl) descEl.innerHTML = opts.desc;
    msgEl.innerHTML = '';
    resultsEl.innerHTML = '';
    modal.style.display = 'flex';
    setTimeout(() => emailInput.focus(), 50);

    const doSearchGrouped = async () => {
      const email = (emailInput.value || '').trim().toLowerCase();
      if (!email) {
        msgEl.innerHTML = `<div class="alert alert-danger">${_t('my.email_required')}</div>`;
        return;
      }
      msgEl.innerHTML = `<div class="alert alert-info">${_t('my.searching')}</div>`;
      resultsEl.innerHTML = '';

      const { data, error } = await supabaseClient
        .from(opts.table).select('*')
        .ilike('submitter_email', email)
        .order('created_at', { ascending: false });

      if (error) {
        msgEl.innerHTML = `<div class="alert alert-danger">${_t('common.query_error')}: ${esc(error.message)}</div>`;
        return;
      }
      if (!data || !data.length) {
        msgEl.innerHTML = `<div class="alert alert-warning">${_t('my.no_results')}</div>`;
        return;
      }

      // groupBy 필드로 그룹핑
      const groups = new Map();
      data.forEach(r => {
        const key = r[opts.groupBy] || '(미분류)';
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(r);
      });

      const msgText = _t('my.results_msg').replace('{n}', data.length);
      msgEl.innerHTML = `<div class="alert alert-success">${msgText}</div>`;

      const items = [];
      groups.forEach((rows, key) => {
        const head = opts.renderGroupHead
          ? opts.renderGroupHead(key, rows)
          : `<b>${esc(key)}</b> · ${rows.length}건`;
        items.push(`
          <div class="my-entry-item">
            <div class="my-entry-summary">${head}</div>
            <button type="button" class="btn btn-primary btn-sm my-entry-load-group" data-key="${esc(String(key))}">${_t('common.load')}</button>
          </div>`);
      });
      resultsEl.innerHTML = items.join('');
      resultsEl.querySelectorAll('.my-entry-load-group').forEach(btn => {
        btn.addEventListener('click', () => {
          const rows = groups.get(btn.dataset.key) || [];
          try { opts.onSelectGroup(rows, btn.dataset.key); } catch (e) { console.error('[my-entries grouped]', e); }
          close();
        });
      });
    };

    searchBtn.onclick = doSearchGrouped;
    emailInput.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); doSearchGrouped(); } };
  }

  window.MyEntries = { open, openGrouped };
})();
