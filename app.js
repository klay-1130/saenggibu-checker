const $ = (selector) => document.querySelector(selector);
const entry = $('#entry');

const profiles = {
  common: { title:'공통 서술형 점검', limit:1500, text:'학교 교육활동 안에서 직접 관찰한 객관적 사실을 바탕으로, 개별 특성과 변화가 드러나게 구체적으로 씁니다.', good:'“학급 토의에서 근거 자료를 비교하여 의견을 제시하고, 다른 의견을 반영해 해결안을 보완함.”', bad:'피하기: “매우 훌륭하고 뛰어남.”처럼 근거 없는 평가만 나열하는 표현은 지양합니다.', manual:['직접 관찰·평가한 사실과 누가기록에 근거했는가?','학교 교육계획 및 교육과정 안에서 이루어진 활동인가?','동기·과정·결과·변화 중 확인 가능한 내용이 드러나는가?'] },
  autonomy: { title:'자율활동', limit:1500, text:'자율·자치활동에서 실제로 수행한 역할, 참여 과정, 변화가 구체적으로 보이도록 기록합니다.', good:'“학급회의에서 급식 잔반 문제를 제안하고 실천 방법을 정리해 구성원에게 안내함.”', bad:'피하기: 탐구 제목·연구주제·참여인원·소요시간만 나열한 기재는 적절하지 않습니다.', manual:['임원 재임기간은 실제 활동 기간과 일치하는가?','자율탐구활동의 제목·참여인원·소요시간만 기재하지 않았는가?'] },
  club: { title:'동아리활동', limit:1500, text:'정규 동아리 활동에서 관찰한 참여 과정과 특성을 구체적으로 기록합니다.', good:'“실험 설계 과정에서 변인을 구분하고 결과 차이의 원인을 모둠원과 토의하여 정리함.”', bad:'피하기: 교외 수상이나 대회 준비 과정을 기록하지 않습니다.', manual:['정규교육과정 안의 실제 활동 및 관찰 내용인가?','자율동아리 소개라면 학년당 1개, 30자 제한을 확인했는가?'] },
  career: { title:'진로활동', limit:1500, text:'진로 탐색 과정에서 학생이 보인 관심, 탐색 행동, 변화가 드러나도록 기록합니다.', good:'“직업인 인터뷰 자료를 바탕으로 관심 분야에 필요한 역량을 정리하고 진로 계획을 보완함.”', bad:'피하기: 특정 대학명이나 외부 기관명을 노출하는 내용은 점검이 필요합니다.', manual:['학생의 진로희망·상담·검사 결과를 사실에 근거해 활용했는가?','진로활동과 무관한 수상·외부 실적이 포함되지 않았는가?'] },
  volunteer: { title:'봉사활동', limit:150, text:'봉사는 일자·장소·내용·시간 중심의 객관적 실적을 기록하며 정성적 평가는 넣지 않습니다.', good:'“도서 도우미 활동”', bad:'피하기: “성실하게 봉사하여 다른 학생의 본보기가 됨.”처럼 평가성 서술은 봉사 실적에 맞지 않습니다.', manual:['활동 내용이 객관적·간략한 제목 형태인가?','물품·현금 기부 또는 징계·미인정결석 중 봉사가 포함되지 않았는가?','1일 인정 시간 및 누계 시간이 정확한가?'] },
  reading: { title:'독서활동', limit:1500, text:'특기할 만한 독서활동은 ISBN 등재 도서를 ‘도서명(저자명)’ 형식으로만 입력합니다.', good:'“공중그네(오쿠다 히데오)”', bad:'피하기: 책을 읽고 느낀 점을 서술하는 감상문 형식은 입력하지 않습니다.', manual:['ISBN 등재 도서이며 정기간행물(ISSN)이 아닌가?','도서명(저자명) 형식만 사용했는가?','반복 독서라면 서로 다른 증빙자료가 있는가?'] },
  subject: { title:'교과 세부능력 및 특기사항', limit:1500, text:'수업 및 수업과 연계된 수행평가에서 관찰한 내용으로, 성취기준에 따른 특성·참여도·변화와 성장을 구체적으로 기록합니다.', good:'“이차함수의 최댓값과 최솟값 단원에서 실생활 소재를 함수식으로 변환하는 탐구활동을 수행하고, 풀이 과정을 논리적으로 정리한 보고서를 작성함.”', bad:'피하기: “수업에 열심히 참여하고 성실한 태도를 보임.”처럼 관찰 근거 없는 추상적 평가는 지양합니다.', manual:['해당 과목 수업 또는 수업 연계 수행평가에서 관찰한 사실인가?','성취기준·학습 활동·참여 과정 중 적어도 하나가 구체적으로 드러나는가?','줄바꿈 없이 과목별 제한 글자 수 안에 들어가는가?'] },
  behavior: { title:'행동특성 및 종합의견', limit:900, text:'학년 동안 지속적으로 관찰한 행동특성을 근거로, 변화·성장 가능성까지 포함한 종합의견을 기록합니다.', good:'“학급 내 갈등 상황에서 중재자 역할을 수행함. 학기 후반으로 갈수록 새로운 활동에도 적극성을 보이며 발전하는 모습을 보임.”', bad:'피하기: “성격이 좋고 매사에 성실함.”처럼 구체적 관찰 근거가 없는 표현은 지양합니다.', manual:['학기당 1회 이상 누가기록과 연결되는가?','부정적 특성이 있다면 변화 과정 또는 성장 방향을 함께 기록했는가?','영재교육·방과후학교 등 다른 영역 기재 불가 사항이 들어가지 않았는가?'] }
};
const forbidden = [
  ['공인어학시험', /(TOEIC|TOEFL|TEPS|HSK|JLPT|JPT|DELF|DALF|TESTDAF|DSH|DELE|TORFL)/i, '공인어학시험 참여·성적·수상 실적은 기재할 수 없습니다.'],
  ['대회 관련 표현', /대회|경시|공모전|올림피아드/, '교내·외 대회 참여, 성적, 수상 및 준비 과정은 서술형 항목에 기재할 수 없습니다.'],
  ['성적·모의고사', /모의고사|전국연합학력평가|석차|백분위|등급|원점수/, '모의고사·전국연합학력평가 성적 등 성적 관련 내용은 기재할 수 없습니다.'],
  ['온라인 공개강좌', /K-?MOOC|MOOC|KOCW/i, 'K-MOOC, MOOC, KOCW 관련 내용은 기재할 수 없습니다.'],
  ['방과후학교', /방과후/, '방과후학교 활동은 기재할 수 없습니다.'],
  ['교외 실적', /교외s*(수상|상|활동)|해외s*(연수|봉사|활동)/, '교외 수상 또는 해외 활동 실적은 기재할 수 없습니다.'],
  ['장학 내용', /장학금|장학생/, '장학금·장학생 관련 내용은 기재할 수 없습니다.'],
  ['지식재산권', /특허|실용신안|상표권|디자인권/, '지식재산권 출원·등록 사실은 기재할 수 없습니다.'],
  ['도서 출간', /도서s*출간|책을s*출간|출판/, '도서 출간 사실은 기재할 수 없습니다.']
];

function bytes(text) { return new TextEncoder().encode(text).length; }
function updateCounter() { const p=profiles[$('#section').value], count=entry.value.length, byte=bytes(entry.value); $('#counter').textContent=`${count}자 · ${byte} Byte${p.limit ? ` / ${p.limit} Byte` : ''}`; $('#counter').className=byte>p.limit?'over':''; }
function updateGuide() { const p=profiles[$('#section').value]; $('#guide-title').textContent=p.title; $('#guide-text').textContent=p.text; $('#good-example').textContent=`“${p.good.replaceAll('“','').replaceAll('”','')}”`; $('#bad-example').textContent=p.bad; updateCounter(); }
function item(kind,title,text) { return `<div class="issue ${kind}"><i>${kind==='warn'?'!':'i'}</i><div><b>${title}</b><p>${text}</p></div></div>`; }
function review() {
  const text=entry.value.trim(), section=$('#section').value, p=profiles[section], issues=[];
  if(!text){ alert('점검할 문장을 입력해 주세요.'); return; }
  forbidden.forEach(([title,regex,message])=>{if(regex.test(text)) issues.push(item('warn',title,message));});
  if(bytes(text)>p.limit) issues.push(item('warn','입력 분량 초과',`현재 ${bytes(text)} Byte입니다. 이 영역의 기준 ${p.limit} Byte 안으로 줄여야 합니다.`));
  if(/[\n\r]/.test(text) && section==='subject') issues.push(item('warn','줄바꿈 확인','교과 세부능력 및 특기사항은 줄바꿈 없이 입력하는 기준입니다.'));
  if(section==='reading' && !/^\(?\d학기\)?\s*[^\n]+\([^()]+\)(,\s*[^()]+\([^()]+\))*$/.test(text.replace(/[“”]/g,''))) issues.push(item('warn','독서 형식 확인','독서활동은 감상·평가 대신 ‘도서명(저자명)’ 형식으로 입력했는지 확인하세요.'));
  if(section==='volunteer' && /(성실|우수|모범|본보기가|감동|느낌|깨달)/.test(text)) issues.push(item('warn','평가성 표현 확인','봉사활동 실적에는 정성적 평가 대신 객관적인 활동 내용만 간략히 입력합니다.'));
  if(section==='subject' && /(소논문|연구보고서)/.test(text)) issues.push(item('warn','연구보고서·소논문 확인','세특에는 연구보고서·소논문 관련 사항이 원칙적으로 입력 불가합니다. 예외 과목도 제목·참여인원·소요시간은 기재할 수 없습니다.'));
  if(section==='behavior' && /(영재교육|영재교육원|발명교육)/.test(text)) issues.push(item('warn','영재교육 영역 확인','영재교육 관련 내용은 행동특성 및 종합의견이 아니라 관련 교과 세특에 입력합니다.'));
  if(/하였음|되었습니다|하였습니다/.test(text)) issues.push(item('info','서술 어미 확인','서술형 기록은 보통 현재형·명사형 ‘~함’ 표현을 사용합니다. 문맥에 맞게 다듬어 보세요.'));
  if(/매우|아주|훌륭|뛰어남|성격이 좋|성실한 태도/.test(text)) issues.push(item('info','관찰 근거 확인','평가어만 쓰기보다 어떤 상황에서 어떤 행동을 했는지 구체적인 관찰 근거를 덧붙여 보세요.'));
  if(!/[.。]$/.test(text)) issues.push(item('info','마침표 확인','창체 특기사항·세특·행동특성 및 종합의견은 문장 끝 마침표를 확인하세요.'));
  $('#idle').hidden=true; $('#report').hidden=false; $('#issues').innerHTML=issues.length?issues.join(''):item('info','자동 점검에서 뚜렷한 제한 표현을 찾지 못함','자동 검사는 보조 수단입니다. 아래 항목과 실제 누가기록을 함께 확인해 최종 판단하세요.');
  $('#status-count').textContent=issues.length; $('#status-text').textContent=issues.filter(x=>x.includes('warn')).length?'수정 또는 근거 확인이 필요한 항목이 있습니다.':'자동 탐지된 금지 표현은 없거나 적습니다.';
  $('#manual-list').innerHTML=p.manual.map(v=>`<li>${v}</li>`).join('');
}
entry.addEventListener('input',updateCounter); $('#section').addEventListener('change',updateGuide); $('#review').addEventListener('click',review); $('#reset').addEventListener('click',()=>{entry.value='';$('#idle').hidden=false;$('#report').hidden=true;updateCounter();entry.focus();});
updateGuide();
