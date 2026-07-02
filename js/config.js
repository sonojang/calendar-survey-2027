// Supabase 설정
const SUPABASE_URL  = 'https://wjfhybgwbtuqvylcaqfk.supabase.co';
const SUPABASE_KEY  = 'sb_publishable_3RFi7WrygfRvqf-1QwW83g_ohD6ZQWu';
const ADMIN_EMAIL   = 'sonojang@sinokor.co.kr';
const SURVEY_YEAR   = 2027;

// 신청 단위 관련 상수
//  - 신청 폼: 사용자가 BOX 단위로 입력 (1 BOX = 25 부)
//  - 히스토리 자료(2026)는 부수 단위로 이미 적재됨
//  - 보고자료 표시할 때 BOX_UNIT_FROM_YEAR 이후 데이터는 * COPIES_PER_BOX 로 부수 환산
const COPIES_PER_BOX     = 25;
const BOX_UNIT_FROM_YEAR = 2027;  // 이 연도(포함)부터의 데이터는 박스 단위 저장

// 네트워크 이미지 (관리자가 매년 새 이미지 업로드)
const NETWORK_IMAGE_BUCKET = 'network-images';
const NETWORK_IMAGE_KEY = {
  jangkum: 'jangkum-current',
  heunga:  'heunga-current',
};
const NETWORK_IMAGE_FALLBACK = {
  jangkum: 'assets/network-jangkum-current.jpg',
  heunga:  'assets/network-heunga-current.jpg',
};

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
