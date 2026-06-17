(function(){
  const allSubjects=()=>[...S.subjects,...S.practicalSubjects];
  const allIds=()=>allSubjects().map(s=>s.id);
  if(!S.goalDate)S.goalDate=S.examDate;
  if(!Array.isArray(S.nextCycleSubjects)||!S.nextCycleSubjects.length)S.nextCycleSubjects=allIds();
  save();

  function allTaskKeys(){
    const out=[];
    S.subjects.forEach(s=>writtenTasks(s).forEach(t=>out.push(taskKey(s,t))));
    S.practicalSubjects.forEach(s=>practicalTasks(s).forEach(t=>out.push(taskKey(s,t))));
    return out;
  }

  function goalAnalysis(targetText){
    const today=date(iso(new Date()));
    const start=today<date(S.startDate)?date(S.startDate):today;
    const target=date(targetText);
    const all=allTaskKeys();
    const checked=new Set(Object.keys(S.checks||{}));
    const remaining=all.filter(k=>!checked.has(k));
    if(target<start)return{ok:false,message:'목표 완료일이 오늘보다 이전이에요.'};

    let activeDays=0;
    for(let d=new Date(start);d<=target;d=add(d,1))if(!isSkipped(d))activeDays++;
    const plans=projectedPlansUntil(target);
    const covered=new Set(checked);
    let plannedLectures=0,lectureDays=0;
    for(let d=new Date(start);d<=target;d=add(d,1)){
      const plan=plans.get(iso(d));
      if(!plan)continue;
      let dayCount=0;
      plan.items.forEach(x=>x.tasks.forEach(t=>{const k=taskKey(x.s,t);if(!covered.has(k)){covered.add(k);plannedLectures++;dayCount++}}));
      if(dayCount)lectureDays++;
    }
    const missing=all.filter(k=>!covered.has(k)).length;
    const requiredAverage=remaining.length/Math.max(1,activeDays);
    const requiredLectureDayAverage=remaining.length/Math.max(1,lectureDays||Math.ceil(activeDays*0.75));

    let estimatedFinish=null;
    const far=add(target,500),future=projectedPlansUntil(far),sim=new Set(checked);
    for(let d=new Date(start);d<=far;d=add(d,1)){
      const plan=future.get(iso(d));
      if(plan)plan.items.forEach(x=>x.tasks.forEach(t=>sim.add(taskKey(x.s,t))));
      if(all.every(k=>sim.has(k))){estimatedFinish=iso(d);break}
    }

    return{
      ok:true,
      target:targetText,
      remaining:remaining.length,
      activeDays,
      lectureDays,
      plannedLectures,
      missing,
      requiredAverage:requiredAverage.toFixed(1),
      requiredLectureDayAverage:requiredLectureDayAverage.toFixed(1),
      estimatedFinish,
      possible:missing===0
    };
  }

  function analysisMarkup(a){
    if(!a)return'<div class="muted">목표 날짜를 선택한 뒤 계산해 주세요.</div>';
    if(!a.ok)return`<div class="carry-title danger">${a.message}</div>`;
    const status=a.possible?'현재 설정으로 목표일까지 완료 가능':'현재 설정으로는 목표일까지 부족';
    return`<div class="summary" style="margin-top:10px"><div><small>남은 강의</small><b>${a.remaining}강</b></div><div><small>공부 가능일</small><b>${a.activeDays}일</b></div><div><small>하루 필요 평균</small><b>${a.requiredAverage}강</b></div><div><small>강의일 필요 평균</small><b>${a.requiredLectureDayAverage}강</b></div></div><div class="notice"><b>${status}</b><br>${a.possible?`예상 완료일 ${a.estimatedFinish||a.target}`:`목표일까지 약 ${a.missing}강이 남을 것으로 예상돼요.${a.estimatedFinish?` 현재 속도 예상 완료일은 ${a.estimatedFinish}입니다.`:''}`}</div>`;
  }

  function exportBackup(){
    const payload={app:'civil-timetable',version:18,exportedAt:new Date().toISOString(),data:S};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=`토목기사_시간표_백업_${iso(new Date())}.json`;
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }

  function restoreBackup(file){
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const parsed=JSON.parse(reader.result),data=parsed.data||parsed;
        if(!data||!Array.isArray(data.subjects)||!Array.isArray(data.practicalSubjects))throw new Error('invalid');
        if(!confirm('현재 기록을 백업 파일의 내용으로 바꿀까요?'))return;
        localStorage.setItem(K,JSON.stringify(data));
        location.reload();
      }catch(e){alert('올바른 시간표 백업 파일이 아니에요.')}
    };
    reader.readAsText(file);
  }

  const originalRecords=records;
  records=function(){
    originalRecords();
    const view=$('records');
    const old=$('goalPlannerCard');if(old)old.remove();
    const card=document.createElement('div');card.className='card';card.id='goalPlannerCard';
    card.innerHTML=`<div class="head"><div><h2>목표 완료일 역산</h2><div class="muted">현재 진도와 휴식일을 기준으로 완료 가능성을 계산합니다.</div></div></div><div class="field"><label>목표 완료일</label><input id="goalDateV18" type="date" value="${S.goalDate||S.examDate}"></div><button id="goalCalcV18" class="primary" style="width:100%;margin-top:9px">완료 가능성 계산</button><div id="goalResultV18">${analysisMarkup(S.goalAnalysisV18||null)}</div>`;
    view.insertBefore(card,view.children[1]||null);
    $('goalCalcV18').onclick=()=>{
      const value=$('goalDateV18').value||S.examDate;
      S.goalDate=value;S.goalAnalysisV18=goalAnalysis(value);save();
      $('goalResultV18').innerHTML=analysisMarkup(S.goalAnalysisV18);
    };
  };

  const originalSettings=settings;
  settings=function(){
    originalSettings();
    const root=$('subjectSettings');
    const dataCard=document.createElement('div');dataCard.className='setting';dataCard.id='dataToolsCardV18';
    dataCard.innerHTML='<h3>데이터 백업·복원</h3><div class="muted">체크 기록, 설정, 메모, 회차 기록을 파일로 보관합니다.</div><div class="actions"><button type="button" class="primary" id="exportBackupV18">백업 파일 저장</button><button type="button" class="light" id="importBackupV18">백업 불러오기</button></div><input type="file" id="backupFileV18" accept="application/json,.json" class="hidden">';

    const selected=new Set(S.nextCycleSubjects||allIds());
    const cycleCard=document.createElement('div');cycleCard.className='setting';cycleCard.id='nextCycleCardV18';
    cycleCard.innerHTML=`<div class="row"><div><h3>다음 회차 과목 선택</h3><div class="muted">현재 회차 완료 후 다시 공부할 과목만 선택하세요.</div></div><button type="button" class="light" id="selectAllCycleV18">전체 선택</button></div><div class="checks" id="nextCycleListV18"></div>`;
    const list=cycleCard.querySelector('#nextCycleListV18');
    allSubjects().forEach(s=>{
      const on=selected.has(s.id),label=document.createElement('label');
      label.className='check '+(on?'on':'');label.style.setProperty('--subject-color',s.color);
      label.innerHTML=`<input type="checkbox" data-id="${s.id}" ${on?'checked':''}><span class="box">${on?'✓':''}</span><span>${s.name}</span><small class="muted">${S.subjects.some(x=>x.id===s.id)?'필기':'실기'}</small>`;
      label.querySelector('input').onchange=e=>{
        const id=e.target.dataset.id,current=new Set(S.nextCycleSubjects||allIds());
        e.target.checked?current.add(id):current.delete(id);
        if(!current.size){alert('다음 회차에는 최소 한 과목을 선택해야 해요.');e.target.checked=true;return}
        S.nextCycleSubjects=[...current];save();render();
      };
      list.appendChild(label);
    });
    root.prepend(cycleCard);root.prepend(dataCard);
    $('exportBackupV18').onclick=exportBackup;
    $('importBackupV18').onclick=()=>$('backupFileV18').click();
    $('backupFileV18').onchange=e=>{const f=e.target.files&&e.target.files[0];if(f)restoreBackup(f)};
    $('selectAllCycleV18').onclick=()=>{S.nextCycleSubjects=allIds();save();render()};
  };

  render();
})();