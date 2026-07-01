# 국내 배송 기능 — DB 컬럼 3개 추가 (Table Editor GUI, 2분)

> 같은 `shipping_status` 테이블에 국내 배송도 같이 저장하도록 컬럼 3개만 추가하면 끝.
> SQL 안 쓰고 Table Editor GUI로 진행.

---

## ✅ Step 1 — 컬럼 추가 (1분)

[Supabase Tables](https://supabase.com/dashboard/project/wjfhybgwbtuqvylcaqfk/database/tables) 열기 → 좌측에서 **`shipping_status`** 클릭

**+ New column** 버튼을 3번 눌러 아래 컬럼을 차례로 추가:

| Name | Type | Default | Nullable |
|------|------|---------|----------|
| `division` | `text` | (비움) | ✅ |
| `team` | `text` | (비움) | ✅ |
| `driver_contact` | `text` | (비움) | ✅ |

각 항목 **Save** 클릭.

> ⚠ 기존 해외 발송 데이터는 이 컬럼들이 NULL인 채로 유지됨 — 정상.
> 코드는 **`division IS NOT NULL`인 행만 국내 배송**으로 인식.

---

## ✅ Step 2 — domestic_quantities anon SELECT 정책 확인 (1분)

국내 발송 등록 시 신청건 picker가 `domestic_quantities`를 조회함.
정책이 없으면 picker가 비어 보임.

[Authentication → Policies](https://supabase.com/dashboard/project/wjfhybgwbtuqvylcaqfk/auth/policies) 열기 → `domestic_quantities` 찾기

정책 목록에 **`anon select domestic_quantities`** 또는 비슷한 이름의 **SELECT / anon** 정책이 있는지 확인.

없으면 **New Policy** → **For full customization**:
- Policy name: `anon select domestic`
- Allowed operation: ✅ **SELECT**
- Target roles: **anon**
- USING expression: `true`
- Save

(이미 `overseas_quantities`엔 동일 정책이 있어서 해외 picker가 동작했을 거임)

---

## 🧪 동작 확인

1. https://jolly-conkies-f8ee63.netlify.app/shipping-status.html 접속
2. 상단에 **🌏 해외 배송 / 🇰🇷 국내 배송** 토글이 보이는지
3. 🇰🇷 국내 배송 클릭 → "📥 국내 신청건에서 가져오기" 리스트에 회사/본부/팀 행들이 보임
4. **+ 발송 등록** 클릭 → 폼에 회사/본부/팀 자동 채워짐
5. 도착예정일/부수/배송기사 연락처 입력 → 전체 등록
6. **🇰🇷 국내 배송 조회** 클릭 → 방금 등록한 건이 보이고 수령완료 버튼 동작

---

## 🆘 문제 발생시

| 증상 | 원인 / 해결 |
|------|------|
| 등록 시 "column division does not exist" | Step 1의 컬럼 3개를 다시 확인 |
| 국내 picker가 비어있음 | Step 2의 anon SELECT 정책 확인 |
| 등록은 되는데 조회에 안 나옴 | shipping_status의 anon SELECT 정책 확인 (이전에 해외 조회용으로 추가됨) |
