// 전체 조회 페이지 - 인증 없이 응답 데이터 조회, 엑셀/CSV 다운로드
// (2026-07-01) 관리자 로그인 제거 — 사내 URL 공유 기반, 누구나 조회·다운로드 가능

(function () {
  const _t = (k) => (window.i18n ? window.i18n.t(k) : k);

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
    const [d1, d2, d3, d4, d5, d6] = await Promise.all([
      supabaseClient.from('domestic_quantities').select('*').order('created_at', { ascending: false }),
      supabaseClient.from('overseas_quantities').select('*').order('created_at', { ascending: false }),
      supabaseClient.from('detail_ports'       ).select('*').order('created_at', { ascending: false }),
      supabaseClient.from('overseas_holidays'  ).select('*').order('created_at', { ascending: false }),
      supabaseClient.from('network_changes'    ).select('*').order('created_at', { ascending: false }),
      supabaseClient.from('shipping_status'    ).select('*').order('created_at', { ascending: false })
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

    renderDomestic();
    renderOverseas();
    renderDetail();
    renderHoliday();
    renderNetwork();
    renderShipping();
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
    t.innerHTML = `
      <thead><tr>
        <th>회사</th><th>본부</th><th>팀</th>
        <th class="num">장금B</th><th class="num">흥아B</th>
        <th>입력자</th><th>이메일</th><th>비고</th><th>제출시각</th>
      </tr></thead>
      <tbody>
        ${allData.domestic.map(r => `
          <tr>
            <td>${esc(r.company||'')}</td>
            <td>${esc(r.division)}</td>
            <td>${esc(r.team)}</td>
            <td class="num">${(r.jangkum_b_qty||0).toLocaleString()}</td>
            <td class="num">${(r.heunga_b_qty||0).toLocaleString()}</td>
            <td>${esc(r.submitter_name||'')}</td>
            <td>${esc(r.submitter_email||'')}</td>
            <td class="wrap">${esc(r.note||'')}</td>
            <td>${fmtDate(r.created_at)}</td>
          </tr>`).join('') || emptyRow(9)}
      </tbody>`;
  }

  function renderOverseas() {
    const t = document.getElementById('table-overseas');
    t.innerHTML = `
      <thead><tr>
        <th>신청회사</th><th>국가</th><th>지역</th><th>타입</th>
        <th class="num">장금</th><th class="num">흥아</th>
        <th class="num">YJC장금</th><th class="num">YJC흥아</th>
        <th>배송방법</th><th>Port</th><th>담당자</th><th>연락처</th>
        <th>주소</th><th>비고</th><th>입력자</th><th>입력자 소속</th><th>제출시각</th>
      </tr></thead>
      <tbody>
        ${allData.overseas.map(r => `
          <tr>
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
            <td class="wrap-wide">${esc(r.shipping_address||'').replace(/\n/g,'<br>')}</td>
            <td class="wrap">${esc(r.note||'')}</td>
            <td>${esc(r.submitter_name||'')}</td>
            <td class="wrap">${esc(r.submitter_office||'')}</td>
            <td>${fmtDate(r.created_at)}</td>
          </tr>`).join('') || emptyRow(17)}
      </tbody>`;
  }

  function renderDetail() {
    const t = document.getElementById('table-detail');
    t.innerHTML = `
      <thead><tr>
        <th>국가</th><th>지역</th><th>Port</th>
        <th class="num">수량</th><th>배송처 사명</th><th>주소</th>
        <th>입력자</th><th>입력자 소속</th><th>제출시각</th>
      </tr></thead>
      <tbody>
        ${allData.detail.map(r => `
          <tr>
            <td>${esc(r.country)}</td>
            <td>${esc(r.region)}</td>
            <td>${esc(r.port_code||'')}</td>
            <td class="num">${(r.quantity||0).toLocaleString()}</td>
            <td class="wrap">${esc(r.company_name||'')}</td>
            <td class="wrap-wide">${esc(r.address||'').replace(/\n/g,'<br>')}</td>
            <td>${esc(r.submitter_name||'')}</td>
            <td class="wrap">${esc(r.submitter_office||'')}</td>
            <td>${fmtDate(r.created_at)}</td>
          </tr>`).join('') || emptyRow(9)}
      </tbody>`;
  }

  function renderHoliday() {
    const t = document.getElementById('table-holiday');
    t.innerHTML = `
      <thead><tr>
        <th>국가</th><th>날짜</th><th>요일</th><th>공휴일명 (EN)</th>
        <th>입력자</th><th>입력자 소속</th><th>제출시각</th>
      </tr></thead>
      <tbody>
        ${allData.holiday.map(r => `
          <tr>
            <td>${esc(r.country)}</td>
            <td>${esc(r.holiday_date)}</td>
            <td>${esc(r.weekday||'')}</td>
            <td>${esc(r.holiday_name_en)}</td>
            <td>${esc(r.submitter_name||'')}</td>
            <td>${esc(r.submitter_office||'')}</td>
            <td>${fmtDate(r.created_at)}</td>
          </tr>`).join('') || emptyRow(7)}
      </tbody>`;
  }

  function renderNetwork() {
    const t = document.getElementById('table-network');
    t.innerHTML = `
      <thead><tr>
        <th>국가</th><th>지점/사무소</th><th>변경항목</th>
        <th>기존값</th><th>변경값</th><th>메모</th>
        <th>입력자</th><th>입력자 소속</th><th>제출시각</th>
      </tr></thead>
      <tbody>
        ${allData.network.map(r => `
          <tr>
            <td>${esc(r.country)}</td>
            <td>${esc(r.branch_name)}</td>
            <td>${esc(r.field||'')}</td>
            <td class="wrap">${esc(r.old_value||'').replace(/\n/g,'<br>')}</td>
            <td class="wrap">${esc(r.new_value||'').replace(/\n/g,'<br>')}</td>
            <td class="wrap-wide">${esc(r.full_note||'').replace(/\n/g,'<br>')}</td>
            <td>${esc(r.submitter_name||'')}</td>
            <td class="wrap">${esc(r.submitter_office||'')}</td>
            <td>${fmtDate(r.created_at)}</td>
          </tr>`).join('') || emptyRow(9)}
      </tbody>`;
  }

  function renderShipping() {
    const t = document.getElementById('table-shipping');
    if (!t) return;
    t.innerHTML = `
      <thead><tr>
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
        }).join('') || emptyRow(12)}
      </tbody>`;
  }

  function emptyRow(cols) {
    return `<tr><td colspan="${cols}" style="text-align:center; color:#999; padding:30px">아직 응답이 없습니다</td></tr>`;
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
  생성: ${new Date().toLocaleString('ko-KR')} · ${rows.length}건 · 시노코 그룹 총무팀
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
