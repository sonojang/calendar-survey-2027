// Supabase 설정
const SUPABASE_URL  = 'https://wjfhybgwbtuqvylcaqfk.supabase.co';
const SUPABASE_KEY  = 'sb_publishable_3RFi7WrygfRvqf-1QwW83g_ohD6ZQWu';
const ADMIN_EMAIL   = 'sonojang@sinokor.co.kr';
const SURVEY_YEAR   = 2027;

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
