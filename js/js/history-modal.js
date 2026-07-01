// 과거 신청 수량 모달 (domestic / overseas 공용)
// HTML이 다음 구조를 갖추고 있어야 함:
//   <button class="btn-history" data-history-scope="domestic|overseas">📄 과거 신청 수량</button>
//   <div id="history-modal" class="history-modal" hidden> ... </div>
//
// 데이터는 Supabase view 에서 조회: v_yearly_domestic / v_yearly_overseas
// 현재 SURVEY_YEAR 이상 연도는 신청이 진행 중이므로 제외(과거만 노출).

(function () {
  const modal = document.getElementById('history-modal');
  if (!modal) return;

  const _t = (k, fb) => (window.i18n ? window.i18n.t(k) : fb);

  const titleEl   = modal.querySelector('.history-modal-head h3');
  const yearSel   = modal.querySelector('#history-year');
  const bodyEl    = modal.querySelector('.history-modal-body');
  const closeBtn  = modal.querySelector('.history-modal-close');

  // 캐시: scope → { years: [], byYear: { 2026: rows, ... } }
  const cache = { domestic: null, overseas: null };
  let currentScope = null;

  function fmt(n) {
    const v = Number(n || 0);
    return v.toLocaleString('ko-KR');
  }
  function cls(n) { return Number(n||0) === 0 ? 'num zero' : 'num'; }

  async function loadScope(scope) {
    if (cache[scope]) return cache[scope];
    const table = scope === 'domestic' ? 'v_yearly_domestic' : 'v_yearly_overseas';
    const { data, error } = await supabaseClient
      .from(table)
      .select('*')
      .lt('survey_year', SURVEY_YEAR)
      .order('survey_year', { ascending: false });
    if (error) {
      console.error('[history]', error);
      throw error;
    }
    const byYear = {};
    (data || []).forEach(r => {
      const y = r.survey_year;
      (byYear[y] = byYear[y] || []).push(r);
    });
    const years = Object.keys(byYear).map(Number).sort((a,b) => b - a);
    cache[scope] = { years, byYear };
    return cache[scope];
  }

  function renderDomestic(rows) {
    if (!rows || !rows.length) return `<div class="history-empty">데이터가 없습니다.</div>`;
    let sumJ = 0, sumH = 0;
    const body = rows.map(r => {
      sumJ += Number(r.jangkum_b_qty || 0);
      sumH += Number(r.heunga_b_qty  || 0);
      return `<tr>
        <td class="left">${r.division || ''}</td>
        <td class="left">${r.team || ''}</td>
        <td class="${cls(r.jangkum_b_qty)}">${fmt(r.jangkum_b_qty)}</td>
        <td class="${cls(r.heunga_b_qty)}">${fmt(r.heunga_b_qty)}</td>
      </tr>`;
    }).join('');
    return `
      <table class="history-table">
        <thead>
          <tr>
            <th class="left">본부/사무소</th>
            <th class="left">팀</th>
            <th>장금B</th>
            <th>흥아B</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
        <tfoot>
          <tr class="total">
            <td class="left" colspan="2">합계</td>
            <td class="num">${fmt(sumJ)}</td>
            <td class="num">${fmt(sumH)}</td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  function renderOverseas(rows) {
    if (!rows || !rows.length) return `<div class="history-empty">데이터가 없습니다.</div>`;
    let sumJ=0, sumH=0, sumYJ=0, sumYH=0;
    const body = rows.map(r => {
      sumJ  += Number(r.jangkum_qty || 0);
      sumH  += Number(r.heunga_qty  || 0);
      sumYJ += Number(r.yjc_jangkum_qty || 0);
      sumYH += Number(r.yjc_heunga_qty  || 0);
      const calBadge = r.calendar_type === 'A'
        ? `<span class="cal-type-badge cal-type-A">A</span>`
        : `<span class="cal-type-badge cal-type-B">B</span>`;
      return `<tr>
        <td class="left">${r.country || ''}</td>
        <td class="left">${r.region || ''}</td>
        <td class="left">${calBadge}</td>
        <td class="${cls(r.jangkum_qty)}">${fmt(r.jangkum_qty)}</td>
        <td class="${cls(r.heunga_qty)}">${fmt(r.heunga_qty)}</td>
        <td class="${cls(r.yjc_jangkum_qty)}">${fmt(r.yjc_jangkum_qty)}</td>
        <td class="${cls(r.yjc_heunga_qty)}">${fmt(r.yjc_heunga_qty)}</td>
      </tr>`;
    }).join('');
    return `
      <table class="history-table">
        <thead>
          <tr>
            <th class="left">국가</th>
            <th class="left">지역</th>
            <th class="left">버전</th>
            <th>장금</th>
            <th>흥아</th>
            <th>YJC 장금</th>
            <th>YJC 흥아</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
        <tfoot>
          <tr class="total">
            <td class="left" colspan="3">합계</td>
            <td class="num">${fmt(sumJ)}</td>
            <td class="num">${fmt(sumH)}</td>
            <td class="num">${fmt(sumYJ)}</td>
            <td class="num">${fmt(sumYH)}</td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  function renderForYear(year) {
    const c = cache[currentScope];
    const rows = (c && c.byYear[year]) || [];
    bodyEl.innerHTML = (currentScope === 'domestic')
      ? renderDomestic(rows)
      : renderOverseas(rows);
  }

  async function openModal(scope) {
    currentScope = scope;
    titleEl.textContent = (scope === 'domestic')
      ? _t('history.title_dom', '과거 국내 신청 수량')
      : _t('history.title_ovr', '과거 해외 신청 수량');
    bodyEl.innerHTML = `<div class="history-empty">${_t('common.loading', '불러오는 중...')}</div>`;
    yearSel.innerHTML = '';
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    try {
      const { years } = await loadScope(scope);
      if (!years.length) {
        bodyEl.innerHTML = `<div class="history-empty">${_t('history.empty', '아직 과거 신청 데이터가 없습니다.')}</div>`;
        return;
      }
      const lang = (window.i18n && window.i18n.getLang()) || 'ko';
      const suffix = lang === 'en' ? '' : '년';
      yearSel.innerHTML = years.map(y => `<option value="${y}">${y}${suffix}</option>`).join('');
      renderForYear(years[0]);
    } catch (e) {
      bodyEl.innerHTML = `<div class="history-empty" style="color:var(--danger)">${_t('common.query_error','조회 오류')}: ${e.message}</div>`;
    }
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  yearSel.addEventListener('change', () => renderForYear(yearSel.value));
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  document.querySelectorAll('.btn-history').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.historyScope));
  });
})();
