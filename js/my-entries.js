// 담당자 본인 응답 조회·수정 공통 유틸
//
// 사용:
//   MyEntries.open({
//     table: 'domestic_quantities',            // 조회할 Supabase 테이블
//     filter: null,                             // 추가 필터 (예: { survey_year: SURVEY_YEAR })
//     renderRow: (r) => '<b>...</b>',          // 결과 리스트에 각 행 요약
//     onSelect: (row) => { ... 폼에 채우기 ... }
//   });
//
// 모달 HTML은 필요 시 자동 생성됨 (전역에 하나만 존재).

(function () {
  let modal, emailInput, msgEl, resultsEl, closeBtn, searchBtn;

  function ensureModal() {
    if (modal) return;
    modal = document.createElement('div');
    modal.id = 'my-entries-modal';
    modal.className = 'edit-modal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="edit-modal-box" style="max-width:640px">
        <div class="edit-modal-head">
          <h3>📝 내 이전 신청 조회·수정</h3>
          <button class="edit-modal-close" type="button" aria-label="닫기">×</button>
        </div>
        <div class="edit-modal-body">
          <p class="desc">본인이 이전에 입력한 이메일로 조회합니다. 결과에서 [불러오기]를 클릭하면 폼에 값이 채워지고, 그대로 수정 후 다시 제출하면 <b>기존 응답이 덮어쓰기</b>됩니다.</p>
          <div class="form-row full">
            <div class="form-group">
              <label>이메일</label>
              <input id="my-entries-email" type="email" placeholder="입력 시 사용한 이메일">
            </div>
          </div>
          <div id="my-entries-msg"></div>
          <div id="my-entries-results" style="max-height:340px; overflow-y:auto; margin-top:8px"></div>
        </div>
        <div class="edit-modal-foot">
          <button class="btn btn-secondary" id="my-entries-cancel">닫기</button>
          <button class="btn btn-primary" id="my-entries-search">🔍 조회</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    emailInput = modal.querySelector('#my-entries-email');
    msgEl     = modal.querySelector('#my-entries-msg');
    resultsEl = modal.querySelector('#my-entries-results');
    closeBtn  = modal.querySelector('.edit-modal-close');
    searchBtn = modal.querySelector('#my-entries-search');

    closeBtn.addEventListener('click', close);
    modal.querySelector('#my-entries-cancel').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
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

  // 하나의 조회 세션 상태
  let ctx = null;  // { table, filter, renderRow, onSelect }

  async function doSearch() {
    const email = (emailInput.value || '').trim().toLowerCase();
    if (!email) {
      msgEl.innerHTML = `<div class="alert alert-danger">이메일을 입력해 주세요.</div>`;
      return;
    }
    msgEl.innerHTML = `<div class="alert alert-info">조회 중...</div>`;
    resultsEl.innerHTML = '';

    let q = supabaseClient.from(ctx.table).select('*')
      .ilike('submitter_email', email)
      .order('created_at', { ascending: false });

    if (ctx.filter) {
      Object.entries(ctx.filter).forEach(([k, v]) => { q = q.eq(k, v); });
    }

    const { data, error } = await q;
    if (error) {
      msgEl.innerHTML = `<div class="alert alert-danger">조회 오류: ${esc(error.message)}</div>`;
      return;
    }
    if (!data || !data.length) {
      msgEl.innerHTML = `<div class="alert alert-warning">해당 이메일로 신청한 응답이 없습니다.</div>`;
      return;
    }
    // 같은 조합 중 최신만 유지 (선택적, 지금은 전부 표시)
    msgEl.innerHTML = `<div class="alert alert-success">${data.length}건의 응답이 검색되었습니다. 수정할 항목을 선택하세요.</div>`;
    resultsEl.innerHTML = data.map(r => `
      <div class="my-entry-item">
        <div class="my-entry-summary">${ctx.renderRow(r)}</div>
        <button type="button" class="btn btn-primary btn-sm my-entry-load" data-id="${r.id}">불러오기</button>
      </div>`).join('');
    // 이벤트 위임
    resultsEl.querySelectorAll('.my-entry-load').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = data.find(x => String(x.id) === btn.dataset.id);
        if (row) {
          try { ctx.onSelect(row); } catch (e) { console.error('[my-entries] onSelect', e); }
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
    // Enter 키로 조회
    emailInput.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); doSearch(); } };
  }

  window.MyEntries = { open };
})();
