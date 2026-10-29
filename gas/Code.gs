/**
 * 생기부 문장 점검 - Google Apps Script 서버 코드
 *
 * OpenAI API 키는 코드에 쓰지 말고 프로젝트 설정의 Script properties에
 * OPENAI_API_KEY 이름으로 저장하세요. 선택적으로 OPENAI_MODEL을 설정할 수 있습니다.
 */

const SECTION_CONFIG = {
  common: { name: '공통 서술형', limit: 1500 },
  autonomy: { name: '자율활동', limit: 1500 },
  club: { name: '동아리활동', limit: 1500 },
  career: { name: '진로활동', limit: 1500 },
  volunteer: { name: '봉사활동', limit: 150 },
  reading: { name: '독서활동', limit: 1500 },
  subject: { name: '교과 세부능력 및 특기사항', limit: 1500 },
  behavior: { name: '행동특성 및 종합의견', limit: 900 }
};

const FORBIDDEN_RULES = [
  ['공인어학시험', /(TOEIC|TOEFL|TEPS|HSK|JLPT|JPT|DELF|DALF|TESTDAF|DSH|DELE|TORFL)/i, '공인어학시험 참여·성적·수상 실적은 기재할 수 없습니다.'],
  ['대회 관련 표현', /대회|경시|공모전|올림피아드/, '교내·외 대회 참여, 성적, 수상 및 준비 과정은 서술형 항목에 기재할 수 없습니다.'],
  ['성적·모의고사', /모의고사|전국연합학력평가|석차|백분위|등급|원점수/, '모의고사·전국연합학력평가 성적 관련 내용은 기재할 수 없습니다.'],
  ['온라인 공개강좌', /K-?MOOC|MOOC|KOCW/i, 'K-MOOC, MOOC, KOCW 관련 내용은 기재할 수 없습니다.'],
  ['방과후학교', /방과후/, '방과후학교 활동은 기재할 수 없습니다.'],
  ['장학 내용', /장학금|장학생/, '장학금·장학생 관련 내용은 기재할 수 없습니다.'],
  ['지식재산권', /특허|실용신안|상표권|디자인권/, '지식재산권 출원·등록 사실은 기재할 수 없습니다.']
];

const SPELLING_RULES = [
  ['할수있는', '할 수 있는', '의존 명사 ‘수’는 띄어 씁니다.'],
  ['될수있는', '될 수 있는', '의존 명사 ‘수’는 띄어 씁니다.'],
  ['할수', '할 수', '의존 명사 ‘수’는 띄어 씁니다.'],
  ['될수', '될 수', '의존 명사 ‘수’는 띄어 씁니다.'],
  ['뿐만아니라', '뿐만 아니라', '보조사 ‘뿐’과 ‘아니다’는 띄어 씁니다.'],
  ['하였습니다', '함', '생기부 서술형에 맞게 현재형·명사형으로 다듬습니다.'],
  ['하였음', '함', '생기부 서술형에 맞게 현재형·명사형으로 다듬습니다.'],
  ['되었습니다', '됨', '생기부 서술형에 맞게 현재형·명사형으로 다듬습니다.']
];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('생기부 문장 점검')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** 기본 규칙 점검. API 키 없이 항상 사용할 수 있습니다. */
function checkRecord(payload) {
  const text = String(payload && payload.text || '').trim();
  const section = SECTION_CONFIG[payload && payload.section] ? payload.section : 'subject';
  if (!text) throw new Error('점검할 문장을 입력해 주세요.');

  const config = SECTION_CONFIG[section];
  const issues = [];
  FORBIDDEN_RULES.forEach(function(rule) {
    if (rule[1].test(text)) issues.push({ type: 'warning', title: rule[0], message: rule[2] });
  });
  const byteCount = Utilities.newBlob(text).getBytes().length;
  if (byteCount > config.limit) {
    issues.push({ type: 'warning', title: '입력 분량 초과', message: '현재 ' + byteCount + ' Byte입니다. ' + config.limit + ' Byte 안으로 줄여야 합니다.' });
  }
  if (section === 'subject' && /[\r\n]/.test(text)) issues.push({ type: 'warning', title: '줄바꿈 확인', message: '교과 세부능력 및 특기사항은 줄바꿈 없이 입력합니다.' });
  if (section === 'reading' && !/^\(?\d학기\)?\s*[^\n]+\([^()]+\)(,\s*[^()]+\([^()]+\))*$/.test(text.replace(/[“”]/g, ''))) {
    issues.push({ type: 'warning', title: '독서 형식 확인', message: '독서활동은 감상·평가 대신 ‘도서명(저자명)’ 형식으로 입력합니다.' });
  }
  if (section === 'volunteer' && /(성실|우수|모범|본보기|감동|느낌|깨달)/.test(text)) {
    issues.push({ type: 'warning', title: '평가성 표현 확인', message: '봉사활동 실적에는 정성적 평가 대신 객관적인 활동 내용만 간략히 입력합니다.' });
  }
  if (section === 'subject' && /(소논문|연구보고서)/.test(text)) {
    issues.push({ type: 'warning', title: '연구보고서·소논문 확인', message: '세특에는 연구보고서·소논문 관련 사항이 원칙적으로 입력 불가합니다.' });
  }
  if (section === 'behavior' && /(영재교육|영재교육원|발명교육)/.test(text)) {
    issues.push({ type: 'warning', title: '영재교육 영역 확인', message: '영재교육 관련 내용은 행동특성 및 종합의견이 아니라 관련 교과 세특에 입력합니다.' });
  }
  if (/매우|아주|훌륭|뛰어남|성격이 좋|성실한 태도/.test(text)) {
    issues.push({ type: 'info', title: '관찰 근거 확인', message: '평가어만 쓰기보다 어떤 상황에서 어떤 행동을 했는지 구체적인 관찰 근거를 덧붙여 보세요.' });
  }

  return { byteCount: byteCount, byteLimit: config.limit, issues: issues, corrections: findCorrections_(text), aiAvailable: Boolean(PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY')) };
}

/** AI 심화 점검. OPENAI_API_KEY가 설정된 경우에만 호출됩니다. */
function checkWithAi(payload) {
  const text = String(payload && payload.text || '').trim();
  const section = SECTION_CONFIG[payload && payload.section] ? payload.section : 'subject';
  if (!text) throw new Error('점검할 문장을 입력해 주세요.');
  const key = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  if (!key) throw new Error('Script Properties에 OPENAI_API_KEY를 먼저 설정해 주세요.');

  const prompt = [
    '당신은 한국 고등학교 학교생활기록부 기재요령을 보조 점검하는 교사 지원 도구입니다.',
    '학생의 실제 수행 사실을 새로 만들거나 과장하지 마세요. 최종 판단은 교사가 한다고 안내하세요.',
    '영역: ' + SECTION_CONFIG[section].name,
    '점검 문장: ' + text,
    '다음 JSON만 반환하세요: {"summary":"한 문장 요약","corrections":[{"original":"문장에 실제로 있는 문제 구절","recommended":"권장 표현","reason":"이유"}],"recommendation":"사실관계가 비어 있으면 대괄호 자리표시자를 사용한 한 문장 템플릿","warnings":["기재요령상 교사 확인이 필요한 항목"]}.',
    'corrections에는 원문에 실제로 있는 표현만 넣고, 없으면 빈 배열로 하세요.'
  ].join('\n');

  const model = PropertiesService.getScriptProperties().getProperty('OPENAI_MODEL') || 'gpt-5-mini';
  const response = UrlFetchApp.fetch('https://api.openai.com/v1/responses', {
    method: 'post', contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + key },
    payload: JSON.stringify({ model: model, input: prompt, store: false }),
    muteHttpExceptions: true
  });
  const status = response.getResponseCode();
  const data = JSON.parse(response.getContentText());
  if (status < 200 || status >= 300) throw new Error((data.error && data.error.message) || 'AI 점검 요청에 실패했습니다.');
  const raw = extractOutputText_(data);
  try { return JSON.parse(raw.replace(/^```json\s*|\s*```$/g, '')); }
  catch (error) { return { summary: 'AI 응답을 읽는 중 형식 문제가 발생했습니다.', corrections: [], recommendation: raw, warnings: ['AI 결과는 보조 의견입니다. 실제 관찰 기록과 기재요령을 확인하세요.'] }; }
}

function findCorrections_(text) {
  const results = [];
  SPELLING_RULES.forEach(function(rule) {
    let start = 0, index;
    while ((index = text.indexOf(rule[0], start)) !== -1) {
      results.push({ original: rule[0], recommended: rule[1], reason: rule[2], index: index });
      start = index + rule[0].length;
    }
  });
  return results.sort(function(a, b) { return a.index - b.index; });
}

function extractOutputText_(data) {
  if (data.output_text) return data.output_text;
  return (data.output || []).map(function(item) {
    return (item.content || []).map(function(content) { return content.text || ''; }).join('');
  }).join('');
}
