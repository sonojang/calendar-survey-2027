// 폼 임시저장 공통 유틸 (localStorage 기반)

(function () {
  const _t = (k) => (window.i18n ? window.i18n.t(k) : k);
  const PREFIX = 'cal2027_draft:';

  function save(key, data) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify({
        data,
        savedAt: new Date().toISOString()
      }));
      return true;
    } catch (e) {
      console.warn('[draft] save fail', e);
      return false;
    }
  }
  function load(key) {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v ? JSON.parse(v) : null;
    } catch { return null; }
  }
  function clear(key) {
    localStorage.removeItem(PREFIX + key);
  }
  function fmtTime(iso) {
    const d = new Date(iso);
    const z = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}`;
  }

  function mountBanner(key, containerEl, onRestore) {
    if (!containerEl) return;

    function render() {
      const d = load(key);
      if (!d) { containerEl.innerHTML = ''; return; }
      containerEl.innerHTML = `
        <div class="draft-banner">
          <span class="draft-icon">📋</span>
          <span class="draft-msg">
            ${_t('draft.saved_msg')}
            <small>(${fmtTime(d.savedAt)})</small>
          </span>
          <button type="button" class="btn btn-secondary btn-sm draft-restore">${_t('common.load')}</button>
          <button type="button" class="btn btn-secondary btn-sm draft-discard">${_t('common.discard')}</button>
        </div>`;
      containerEl.querySelector('.draft-restore').addEventListener('click', () => {
        try { onRestore && onRestore(d.data); } catch (e) { console.error('[draft] restore', e); }
      });
      containerEl.querySelector('.draft-discard').addEventListener('click', () => {
        if (confirm(_t('draft.discard_confirm'))) {
          clear(key);
          render();
        }
      });
    }
    render();
    // 언어 변경 시 배너 다시 그려서 텍스트 갱신
    document.addEventListener('langchange', render);
    return { rerender: render };
  }

  window.Draft = { save, load, clear, fmtTime, mountBanner };
})();
