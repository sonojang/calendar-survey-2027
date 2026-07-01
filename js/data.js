// 부서/국가/지역 마스터 데이터

// ============================================================
// 국내 조직 - 회사별 부서/팀 구조
// ============================================================
const DOMESTIC_ORG = {

  '장금상선': [
    // 영업본부
    { division: '영업본부',     team: '수출영업1팀'   },
    { division: '영업본부',     team: '수출영업2팀'   },
    { division: '영업본부',     team: '수입영업1팀'   },
    { division: '영업본부',     team: '수입영업2팀'   },
    { division: '영업본부',     team: '글로벌마케팅1팀' },
    { division: '영업본부',     team: '글로벌마케팅2팀' },
    { division: '영업본부',     team: '일본영업팀'    },
    { division: '영업본부',     team: '러시아영업팀'  },
    { division: '영업본부',     team: '특수영업팀'    },
    { division: '영업본부',     team: '고객지원팀'    },
    // 운영본부
    { division: '운영본부',     team: '운항1팀'       },
    { division: '운영본부',     team: '운항2팀'       },
    { division: '운영본부',     team: '장비팀'        },
    { division: '운영본부',     team: '영업기획1팀'   },
    { division: '운영본부',     team: '영업기획2팀'   },
    { division: '운영본부',     team: '심사팀'        },
    // 경영관리본부
    { division: '경영관리본부', team: '총무팀'        },
    { division: '경영관리본부', team: '회계팀'        },
    { division: '경영관리본부', team: '자금팀'        },
    { division: '경영관리본부', team: '기획팀'        },
    { division: '경영관리본부', team: '법무운영팀'    },
    { division: '경영관리본부', team: '전산팀'        },
    // 부산사무소
    { division: '부산사무소',   team: '관리팀'        },
    { division: '부산사무소',   team: '영업팀'        },
    { division: '부산사무소',   team: '고객지원팀'    },
    { division: '부산사무소',   team: '운항팀'        },
    // 지방사무소
    { division: '지방사무소',   team: '인천사무소'    },
    { division: '지방사무소',   team: '평택사무소'    },
    { division: '지방사무소',   team: '울산사무소'    },
    { division: '지방사무소',   team: '광양사무소'    }
  ],

  '흥아라인': [
    // 영업본부
    { division: '영업본부',     team: '수출영업팀'    },
    { division: '영업본부',     team: '수입영업팀'    },
    { division: '영업본부',     team: '중국영업팀'    },
    { division: '영업본부',     team: '일본영업팀'    },
    { division: '영업본부',     team: '글로벌마케팅팀' },
    { division: '영업본부',     team: '특수영업팀'    },
    { division: '영업본부',     team: '러시아영업팀'  },
    { division: '영업본부',     team: '고객지원팀'    },
    // 운영본부
    { division: '운영본부',     team: '운항팀'        },
    { division: '운영본부',     team: '컨테이너관리팀' },
    { division: '운영본부',     team: '심사팀'        },
    { division: '운영본부',     team: '전략팀'        },
    // 경영관리본부
    { division: '경영관리본부', team: '총무팀'        },
    { division: '경영관리본부', team: '회계팀'        },
    { division: '경영관리본부', team: '자금팀'        },
    { division: '경영관리본부', team: '기획팀'        },
    { division: '경영관리본부', team: '법무운영팀'    },
    { division: '경영관리본부', team: '전산팀'        }
  ]

};

const COMPANIES = Object.keys(DOMESTIC_ORG);

// 해외 주재원 소속 회사 (장금/흥아 + YJC)
const OVERSEAS_COMPANIES = ['장금상선', '흥아라인', 'YJC'];

// ============================================================
// 해외 국가/지역
// calendar_type: 'A' = 홍콩국기 제외 (중국만), 'B' = 홍콩국기 포함 (나머지)
// ============================================================
const OVERSEAS_REGIONS = [
  { country: '중국',       region: '상해',     port_code: 'CNSHA', calendar_type: 'A' },
  { country: '중국',       region: '대련',     port_code: 'CNDLC', calendar_type: 'A' },
  { country: '중국',       region: '청도',     port_code: 'CNTAO', calendar_type: 'A' },
  { country: '중국',       region: '천진',     port_code: 'CNTSN', calendar_type: 'A' },
  { country: '중국',       region: '닝보',     port_code: 'CNNGB', calendar_type: 'A' },
  { country: '중국',       region: '남경',     port_code: 'CNNKG', calendar_type: 'A' },
  { country: '중국',       region: '심천',     port_code: '518000', calendar_type: 'A' },
  { country: '중국',       region: '샤먼',     port_code: '361003', calendar_type: 'A' },
  { country: '중국',       region: '위해',     port_code: 'EMS',   calendar_type: 'A' },
  { country: '일본',       region: '전체',     port_code: '',      calendar_type: 'B', has_detail_ports: true },
  { country: '태국',       region: '방콕',     port_code: 'THBKK', calendar_type: 'B' },
  { country: '말레이시아', region: '포트클랑', port_code: 'MYPKG', calendar_type: 'B' },
  { country: '싱가폴',     region: '대리점',   port_code: 'SGSIN', calendar_type: 'B' },
  { country: '인도네시아', region: '자카르타', port_code: 'IDJKT', calendar_type: 'B' },
  { country: '베트남',     region: '호치민',   port_code: 'VNSGN', calendar_type: 'B' },
  { country: '베트남',     region: '하노이',   port_code: 'VNHPH', calendar_type: 'B' },
  { country: '홍콩',       region: '홍콩',     port_code: 'HKHKG', calendar_type: 'B' },
  { country: '광저우',     region: '광저우',   port_code: 'DHL',   calendar_type: 'B' },
  { country: '인도',       region: '인도',     port_code: 'INNSA', calendar_type: 'B' },
  { country: '필리핀',     region: '대리점',   port_code: 'PHMNL', calendar_type: 'B' },
  { country: '파키스탄',   region: '대리점',   port_code: 'PKKHI', calendar_type: 'B' },
  { country: '러시아',     region: '블라디',   port_code: 'RUVVO', calendar_type: 'B' },
  { country: '대만',       region: '대리점',   port_code: 'TWKEL & KHH', calendar_type: 'B' }
];

// 일본 세부 포트 코드 (참고용)
const JAPAN_PORTS = [
  { region: 'TOKYO OFFICE',    port_code: 'JPTYO'  },
  { region: 'OSAKA OFFICE',    port_code: 'JPOSA'  },
  { region: 'KYUSHU OFFICE',   port_code: 'JPHKT①' },
  { region: 'AKITA (NITTSU)',  port_code: 'JPAXT'  },
  { region: 'FUKUYAMA',        port_code: 'JPFKY'  },
  { region: 'HACHINOHE',       port_code: 'JPHHE'  },
  { region: 'HAMADA',          port_code: 'JPHMD'  },
  { region: 'HAKATA',          port_code: 'JPHKT②' },
  { region: 'HIBIKINADA',      port_code: 'JPHBK'  },
  { region: 'HIROSHIMA',       port_code: 'JPHIJ'  },
  { region: 'HITACHINAKA',     port_code: 'JPHIC'  },
  { region: 'HOSOSHIMA',       port_code: 'JPHSM'  },
  { region: 'IMABARI',         port_code: 'JPIMB'  },
  { region: 'IMARI',           port_code: 'JPIMI'  },
  { region: 'ISHIKARI',        port_code: 'JPISS'  },
  { region: 'IWAKUNI',         port_code: 'JPIWK'  },
  { region: 'IYOMISHIMA',      port_code: 'JPIYM'  },
  { region: 'KANAZAWA',        port_code: 'JPKNZ'  },
  { region: 'KOCHI',           port_code: 'JPKCZ'  },
  { region: 'MAIZURU',         port_code: 'JPMAI'  },
  { region: 'MATSUYAMA',       port_code: 'JPMYJ'  },
  { region: 'MIZUSHIMA',       port_code: 'JPMIZ'  },
  { region: 'MOJI',            port_code: 'JPMOJ'  },
  { region: 'NAGASAKI',        port_code: 'JPNGS'  },
  { region: 'NAGOYA',          port_code: 'JPNGO'  },
  { region: 'NAOETSU',         port_code: 'JPNAO'  },
  { region: 'NIIGATA',         port_code: 'JPKIJ'  }
];

const SHIPPING_METHODS = [
  '자사선 선탁',
  '수출업체 위탁',
  'DHL',
  'EMS',
  'FedEx',
  '항공특송',
  '기타'
];

const WEEKDAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const NETWORK_FIELDS = [
  { value: 'address',  label: '주소(Address)',    label_en: 'Address' },
  { value: 'tel',      label: '연락처(Tel)',      label_en: 'Tel' },
  { value: 'fax',      label: '팩스(Fax)',        label_en: 'Fax' },
  { value: 'email',    label: '이메일(Email)',    label_en: 'Email' },
  { value: 'pic',      label: 'PIC 담당자',       label_en: 'PIC' },
  { value: 'other',    label: '기타',             label_en: 'Other' }
];

// ============================================================
// 영어 표시 매핑 (값은 한국어 그대로 DB 저장, 표시만 영어로)
// ============================================================
const I18N_LOOKUP = {
  company: {
    '장금상선': 'Sinokor',
    '흥아라인': 'Heung-A Line',
    'YJC':      'YJC'
  },
  division: {
    '영업본부':     'Sales Division',
    '운영본부':     'Operations Division',
    '경영관리본부': 'Management Division',
    '부산사무소':   'Busan Office',
    '지방사무소':   'Regional Office'
  },
  team: {
    // 장금/흥아 공통
    '수출영업1팀':    'Export Sales Team 1',
    '수출영업2팀':    'Export Sales Team 2',
    '수입영업1팀':    'Import Sales Team 1',
    '수입영업2팀':    'Import Sales Team 2',
    '수출영업팀':     'Export Sales Team',
    '수입영업팀':     'Import Sales Team',
    '글로벌마케팅1팀':'Global Marketing Team 1',
    '글로벌마케팅2팀':'Global Marketing Team 2',
    '글로벌마케팅팀': 'Global Marketing Team',
    '일본영업팀':     'Japan Sales Team',
    '러시아영업팀':   'Russia Sales Team',
    '중국영업팀':     'China Sales Team',
    '특수영업팀':     'Special Sales Team',
    '고객지원팀':     'Customer Support Team',
    '운항1팀':        'Operations Team 1',
    '운항2팀':        'Operations Team 2',
    '운항팀':         'Operations Team',
    '장비팀':         'Equipment Team',
    '영업기획1팀':    'Sales Planning Team 1',
    '영업기획2팀':    'Sales Planning Team 2',
    '심사팀':         'Audit Team',
    '컨테이너관리팀': 'Container Management Team',
    '전략팀':         'Strategy Team',
    '총무팀':         'General Affairs Team',
    '회계팀':         'Accounting Team',
    '자금팀':         'Finance Team',
    '기획팀':         'Planning Team',
    '법무운영팀':     'Legal & Operations Team',
    '전산팀':         'IT Team',
    '관리팀':         'Management Team',
    '영업팀':         'Sales Team',
    '인천사무소':     'Incheon Office',
    '평택사무소':     'Pyeongtaek Office',
    '울산사무소':     'Ulsan Office',
    '광양사무소':     'Gwangyang Office'
  },
  country: {
    '중국':       'CHINA',
    '일본':       'JAPAN',
    '태국':       'THAILAND',
    '말레이시아': 'MALAYSIA',
    '싱가폴':     'SINGAPORE',
    '인도네시아': 'INDONESIA',
    '베트남':     'VIETNAM',
    '홍콩':       'HONG KONG',
    '광저우':     'GUANGZHOU',
    '인도':       'INDIA',
    '필리핀':     'PHILIPPINES',
    '파키스탄':   'PAKISTAN',
    '러시아':     'RUSSIA',
    '대만':       'TAIWAN'
  },
  region: {
    '상해':       'SHANGHAI',
    '대련':       'DALIAN',
    '청도':       'QINGDAO',
    '천진':       'TIANJIN',
    '닝보':       'NINGBO',
    '남경':       'NANJING',
    '심천':       'SHENZHEN',
    '샤먼':       'XIAMEN',
    '위해':       'WEIHAI',
    '전체':       'ALL',
    '방콕':       'BANGKOK',
    '포트클랑':   'PORT KLANG',
    '대리점':     'AGENT',
    '자카르타':   'JAKARTA',
    '호치민':     'HO CHI MINH',
    '하노이':     'HANOI',
    '홍콩':       'HONG KONG',
    '광저우':     'GUANGZHOU',
    '인도':       'INDIA',
    '블라디':     'VLADIVOSTOK'
  },
  shippingMethod: {
    '자사선 선탁': 'Own vessel',
    '수출업체 위탁': 'Forwarder',
    'DHL':         'DHL',
    'EMS':         'EMS',
    'FedEx':       'FedEx',
    '항공특송':    'Air courier',
    '기타':        'Other'
  }
};

// 표시용 헬퍼 - 현재 언어에 따라 한국어 값을 영어로 변환
function dispKo(category, val) {
  if (!window.i18n || window.i18n.getLang() !== 'en') return val;
  if (!val) return val;
  return (I18N_LOOKUP[category] && I18N_LOOKUP[category][val]) || val;
}
