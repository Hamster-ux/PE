(function(){
  const DAY=86400000;
  let cacheKey='',cacheValue=null;

  function phaseRows(phase){
    const subjects=phase==='written'?S.subjects:S.practicalSubjects;
    const rows=[];
    subjects.forEach(subject=>{
      const tasks=phase==='written'?writtenTasks(subject):practicalTasks(subject);
      tasks.forEach(task=>rows.push({subject,task,key:taskKey(subject,task)}));
    });
    return rows;
  }

  function latestActualDate(rows){
    const dates=rows.map(row=>S.checks&&S.checks[row.key])
      .filter(value=>value&&typeof value==='object'&&!value.autoSkipped&&value.studyDate)
      .map(value=>value.studyDate)
      .sort();
    return dates.length?dates[dates.length-1]:null;
  }

  function displayDate(value,complete){
    if(!value)return'계산 불가';
    const text=String(value).replaceAll('-','.');
    return complete?`완료 · ${text}`:text;
  }

  function signature(){
    return JSON.stringify({
      startDate:S.startDate,
      examDate:S.examDate,
      practicalStartDate:S.practicalStartDate,
      restDays:S.restDays||[],
      postponedDates:S.postponedDates||{},
      checks:Object.entries(S.checks||{}).map(([key,value])=>[key,value&&value.studyDate,value&&value.autoSkipped]),
      subjects:S.subjects.map(s=>[s.id,s.theoryTotal,s.specialTotal,s.coreTotal,s.per,s.day,s.targetRounds]),
      practicalSubjects:S.practicalSubjects.map(s=>[s.id,s.theoryTotal,s.coreTotal,s.per,s.day])
    });
  }

  function calculate(){
    const key=signature();
    if(key===cacheKey&&cacheValue)return cacheValue;

    const written=phaseRows('written');
    const practical=phaseRows('practical');
    const writtenKeys=written.map(row=>row.key);
    const practicalKeys=practical.map(row=>row.key);
    const allKeys=[...writtenKeys,...practicalKeys];
    const done=new Set(Object.keys(S.checks||{}));
    const today=date(iso(new Date()));
    const configuredStart=date(S.startDate);
    const simulationStart=today<configuredStart?configuredStart:today;
    const target=date(S.examDate);
    const horizonBase=target>simulationStart?target:simulationStart;
    const horizon=add(horizonBase,1000);

    const writtenCompleteNow=writtenKeys.every(k=>done.has(k));
    const practicalCompleteNow=practicalKeys.every(k=>done.has(k));
    let writtenFinish=writtenCompleteNow?(latestActualDate(written)||iso(today)):null;
    let practicalFinish=practicalCompleteNow?(latestActualDate(practical)||iso(today)):null;

    const plans=projectedPlansUntil(horizon);
    for(let d=new Date(simulationStart);d<=horizon&&(!writtenFinish||!practicalFinish);d=add(d,1)){
      const plan=plans.get(iso(d));
      if(plan)plan.items.forEach(group=>group.tasks.forEach(task=>done.add(taskKey(group.s,task))));
      if(!writtenFinish&&writtenKeys.every(k=>done.has(k)))writtenFinish=iso(d);
      if(!practicalFinish&&practicalKeys.every(k=>done.has(k)))practicalFinish=iso(d);
    }

    let activeDays=0;
    if(target>=simulationStart){
      for(let d=new Date(simulationStart);d<=target;d=add(d,1))if(!isSkipped(d))activeDays++;
    }
    const remaining=allKeys.filter(k=>!Object.prototype.hasOwnProperty.call(S.checks||{},k)).length;
    const daily=(remaining/Math.max(1,activeDays)).toFixed(1);
    const buffer=practicalFinish?diff(target,date(practicalFinish)):null;

    let label='계산 확인',color='#60736d',message='현재 설정으로 완료 예상일을 계산하고 있어요.';
    if(buffer!==null&&buffer>=21){
      label='여유 있음';color='#176b5a';message=`시험일보다 약 ${buffer}일 먼저 전체 과정을 끝낼 것으로 예상돼요.`;
    }else if(buffer!==null&&buffer>=0){
      label='조금 빠르게';color='#b77908';message=`시험일까지 약 ${buffer}일 여유가 있을 것으로 예상돼요.`;
    }else if(buffer!==null){
      label='일정 부족';color='#c83f49';message=`현재 계획이면 시험일보다 약 ${Math.abs(buffer)}일 늦게 끝날 것으로 예상돼요.`;
    }

    cacheKey=key;
    cacheValue={
      target:S.examDate,
      writtenFinish,
      practicalFinish,
      writtenCompleteNow,
      practicalCompleteNow,
      remaining,
      daily,
      label,
      color,
      message
    };
    return cacheValue;
  }

  function renderRiskCard(){
    const view=$('today');
    if(!view)return;
    const old=$('examRiskCardV25');
    if(old)old.remove();

    const result=calculate();
    const card=document.createElement('div');
    card.className='card risk-card';
    card.id='examRiskCardV25';
    card.style.setProperty('--risk-color',result.color);
    card.innerHTML=`<div class="head"><div><h2>완료 위험도</h2><div class="muted">시험일 ${String(result.target).replaceAll('-','.')} 기준</div></div><span class="risk-status"><i class="risk-dot"></i>${result.label}</span></div><div class="risk-grid"><div class="risk-box"><small>필기 완료 예상</small><b>${displayDate(result.writtenFinish,result.writtenCompleteNow)}</b></div><div class="risk-box"><small>실기 완료 예상</small><b>${displayDate(result.practicalFinish,result.practicalCompleteNow)}</b></div><div class="risk-box"><small>남은 강의</small><b>${result.remaining}강</b></div><div class="risk-box"><small>시험일까지 하루 평균</small><b>${result.daily}강</b></div></div><div class="notice" style="border:2px solid ${result.color};color:var(--text);background:var(--surface-2,#f5f7f6)"><b>${result.label}</b><br>${result.message}</div>`;
    view.insertBefore(card,view.firstChild);
  }

  const previousRender=window.render;
  window.render=function(){
    const output=previousRender.apply(this,arguments);
    renderRiskCard();
    return output;
  };
  renderRiskCard();
})();