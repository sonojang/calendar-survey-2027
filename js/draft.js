// 폼 임시저장 공통 유틸 (localStorage 기반)
//
// 사용 예:
//   Draft.save('domestic', { company: '장금상선', ... });
//   const d = Draft.load('domestic');   // { data, savedAt } | null
//   Draft.clear('domestic');
//
// UI 헬퍼:
//   Draft.mountBanner('domestic', containerEl, (data) => { ...폼 채우기... });

(function () {
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

  // 폼 상단에 임시저장 안내 배너 렌더링
  // - 저장된 자료가 있으면 [불러오기] [삭제] 버튼 표시
  // - 없으면 배너 숨김
  function mountBanner(key, containerEl, onRestore) {
    if (!containerEl) return;

    function render() {
      const d = load(key);
      if (!d) { containerEl.innerHTML = ''; return; }
      containerEl.innerHTML = `
        <div class="draft-banner">
          <span class="draft-icon">📋</span>
          <span class="draft-msg">
            임시저장된 자료가 있습니다
            <small>(${fmtTime(d.savedAt)})</small>
          </span>
          <button type="button" class="btn btn-secondary btn-sm draft-restore">불러오기</button>
          <button type="button" class="btn btn-secondary btn-sm draft-discard">삭제</button>
        </div>`;
      containerEl.querySelector('.draft-restore').addEventListener('click', () => {
        try { onRestore && onRestore(d.data); } catch (e) { console.error('[draft] restore', e); }
      });
      containerEl.querySelector('.draft-discard').addEventListener('click', () => {
        if (confirm('임시저장 자료를 삭제하시겠습니까?')) {
          clear(key);
          render();
        }
      });
    }
    render();
    return { rerender: render };
  }

  window.Draft = { save, load, clear, fmtTime, mountBanner };
})();
