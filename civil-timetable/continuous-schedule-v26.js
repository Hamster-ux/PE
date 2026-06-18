(function(){
  const CYCLE_DAYS=3;
  const SLOT_SIZE=4;

  S.subjects.forEach(subject=>subject.per=SLOT_SIZE);
  S.practicalSubjects.forEach(subject=>subject.per=SLOT_SIZE);
  S.autoAlignWritten=false;
  S.autoAlignPractical=false;
  S.noReviewCycleV26=true;
  save();

  function subjectsFor(phase){return phase==='written'?S.subjects:S.practicalSubjects}
  function tasksFor(subject,phase){return phase==='written'?writtenTasks(subject):practicalTasks(subject)}
  function keyFor(subject,task){return taskKey(subject,task)}
  function completed(set,subject,task){return set?set.has(keyFor(subject,task)):isTaskChecked(subject,task)}
  function remaining(subject,phase,set){return tasksFor(subject,phase).filter(task=>!completed(set,subject,task))}
  function isComplete(subject,phase,set){return remaining(subject,phase,set).length===0}
  function allComplete(phase,set){return subjectsFor(phase).every(subject=>isComplete(subject,phase,set))}

  writtenCycle=function(d){const index=writtenIndex(d);return index===null?null:index%CYCLE_DAYS};
  practicalCycle=function(d){const index=practicalIndex(d);return index===null?null:index%CYCLE_DAYS};

  nextUncheckedTasks=function(subject,phase,set=null){
    return remaining(subject,phase,set).slice(0,SLOT_SIZE);
  };

  function chooseReplacement(phase,set,used,cycle){
    const candidates=subjectsFor(phase).map((subject,index)=>({
      subject,
      index,
      remaining:remaining(subject,phase,set).length,
      used:used.get(subject.id)||0,
      preferred:subject.day===cycle?1:0
    })).filter(item=>item.remaining>0);
    candidates.sort((a,b)=>{
      if((a.used===0)!==(b.used===0))return a.used===0?-1:1;
      if(b.remaining!==a.remaining)return b.remaining-a.remaining;
      if(b.preferred!==a.preferred)return b.preferred-a.preferred;
      return a.index-b.index;
    });
    return candidates[0]?candidates[0].subject:null;
  }

  function addTasks(grouped,subject,tasks){
    if(!tasks.length)return;
    let row=grouped.find(item=>item.s.id===subject.id);
    if(!row){row={s:subject,tasks:[]};grouped.push(row)}
    row.tasks.push(...tasks);
  }

  function allocateDay(phase,cycle,baseSet){
    const set=baseSet||new Set(Object.keys(S.checks||{}));
    const subjects=subjectsFor(phase);
    const preferred=subjects.filter(subject=>subject.day===cycle);
    const slotCount=Math.max(1,preferred.length);
    const grouped=[];
    const used=new Map();

    for(let slot=0;slot<slotCount;slot++){
      let quota=SLOT_SIZE;
      let candidate=preferred[slot]&&!isComplete(preferred[slot],phase,set)?preferred[slot]:null;
      while(quota>0){
        if(!candidate||isComplete(candidate,phase,set))candidate=chooseReplacement(phase,set,used,cycle);
        if(!candidate)break;
        const picked=remaining(candidate,phase,set).slice(0,quota);
        if(!picked.length){candidate=null;continue}
        addTasks(grouped,candidate,picked);
        picked.forEach(task=>set.add(keyFor(candidate,task)));
        used.set(candidate.id,(used.get(candidate.id)||0)+picked.length);
        quota-=picked.length;
        candidate=null;
      }
    }
    return grouped;
  }

  function historyItems(d,phase){
    const studyDate=iso(d),items=[];
    subjectsFor(phase).forEach(subject=>{
      const tasks=tasksFor(subject,phase).filter(task=>{
        const value=S.checks[keyFor(subject,task)];
        return value&&typeof value==='object'&&value.studyDate===studyDate;
      });
      if(tasks.length)items.push({s:subject,tasks});
    });
    return items;
  }

  scheduledForDate=function(d){
    const phase=phaseForDate(d),items=[];
    if(isSkipped(d))return{phase,cycle:null,items,review:false};
    const cycle=phase==='written'?writtenCycle(d):practicalCycle(d);
    const today=date(iso(new Date()));
    if(d<today){
      const history=historyItems(d,phase);
      if(history.length)return{phase,cycle,items:history,review:false};
    }
    return{phase,cycle,items:allocateDay(phase,cycle),review:false};
  };

  projectedPlansUntil=function(endDate){
    const plans=new Map();
    const today=date(iso(new Date()));
    const simulationStart=today<date(S.startDate)?date(S.startDate):today;
    const checkedSet=new Set(Object.keys(S.checks||{}));
    let practicalStart=S.practicalStartDate;
    if(!practicalStart&&allComplete('written',checkedSet))practicalStart=iso(nextStudyDate(add(simulationStart,-1)));

    for(let d=new Date(simulationStart);d<=endDate;d=add(d,1)){
      const key=iso(d);
      const phase=practicalStart&&d>=date(practicalStart)?'practical':'written';
      if(isSkipped(d)){plans.set(key,{phase,cycle:null,items:[],review:false});continue}
      const index=phase==='written'?activeIndex(d,S.startDate):activeIndex(d,practicalStart);
      const cycle=index===null?null:index%CYCLE_DAYS;
      const items=allocateDay(phase,cycle,checkedSet);
      plans.set(key,{phase,cycle,items,review:false});
      if(phase==='written'&&!practicalStart&&allComplete('written',checkedSet))practicalStart=iso(nextStudyDate(d));
    }
    return plans;
  };

  displayPlanForDate=function(d){
    const today=date(iso(new Date()));
    if(d<=today)return scheduledForDate(d);
    return projectedPlansUntil(d).get(iso(d))||scheduledForDate(d);
  };

  carry=function(){return[]};

  info=function(d){
    const plan=displayPlanForDate(d);
    const all=plan.items.flatMap(item=>item.tasks.map(task=>({s:item.s,t:task})));
    return{...plan,co:[],total:all.length,done:all.filter(item=>isTaskChecked(item.s,item.t)).length,review:false};
  };

  plannedFinishDate=function(subject,phase){
    if(isComplete(subject,phase,null))return'완료';
    const start=phase==='written'?(new Date()<date(S.startDate)?date(S.startDate):date(iso(new Date()))):(S.practicalStartDate?date(S.practicalStartDate):date(iso(new Date())));
    const checkedSet=new Set(Object.keys(S.checks||{}));
    let practicalStart=S.practicalStartDate;
    for(let i=0,d=new Date(start);i<4000;i++,d=add(d,1)){
      if(isSkipped(d))continue;
      let currentPhase=phase;
      if(phase==='practical'&&!practicalStart){
        if(!allComplete('written',checkedSet)){
          const writtenCycleIndex=activeIndex(d,S.startDate);
          allocateDay('written',writtenCycleIndex===null?0:writtenCycleIndex%CYCLE_DAYS,checkedSet);
          if(allComplete('written',checkedSet))practicalStart=iso(nextStudyDate(d));
          continue;
        }
        practicalStart=iso(d);
      }
      if(currentPhase==='practical'&&d<date(practicalStart))continue;
      const cycleIndex=currentPhase==='written'?activeIndex(d,S.startDate):activeIndex(d,practicalStart);
      allocateDay(currentPhase,cycleIndex===null?0:cycleIndex%CYCLE_DAYS,checkedSet);
      if(isComplete(subject,phase,checkedSet))return fmt(d);
    }
    return'계산 불가';
  };

  hasAnyChecksForDate=function(d){
    const key=iso(d);
    return Object.values(S.checks||{}).some(value=>value&&typeof value==='object'&&value.studyDate===key);
  };

  function decorate(){
    document.querySelectorAll('[data-f="per"]').forEach(select=>{
      select.value=String(SLOT_SIZE);
      select.disabled=true;
      const field=select.closest('.field');
      const label=field&&field.querySelector('label');
      if(label)label.textContent='해당 날짜 강의 수 · 4강 고정';
    });
    const oldWritten=$('autoAlignWrittenBox');if(oldWritten)oldWritten.remove();
    const oldPractical=$('practicalAlignInfo');if(oldPractical)oldPractical.remove();
    const oldPracticalNotice=$('practicalAlignNotice');if(oldPracticalNotice)oldPracticalNotice.remove();
    const progressRoot=$('progress');
    if(progressRoot&&!$('continuousScheduleNoticeV26')){
      const notice=document.createElement('div');
      notice.id='continuousScheduleNoticeV26';
      notice.className='notice';
      notice.innerHTML='<b>3일 연속 순환 · 과목별 4강</b><br>복습 전용 날짜 없이 1~3일차를 계속 반복합니다. 먼저 끝난 과목의 4강 자리는 아직 남은 과목으로 자동 채웁니다.';
      progressRoot.prepend(notice);
    }
    document.querySelectorAll('.notice').forEach(notice=>{
      if(notice.textContent.includes('토목적산 → 토목시공 → 토목공정 → 전체 복습 순환')){
        notice.innerHTML='<b>실기 단계 진행 중</b><br>토목적산 → 토목시공 → 토목공정을 3일 주기로 반복하며, 끝난 과목 자리는 남은 과목으로 채웁니다.';
      }
    });
    document.querySelectorAll('.calendar-legend span').forEach(span=>{
      if(span.textContent.includes('복습'))span.remove();
    });
  }

  const originalSettings=settings;
  settings=function(){originalSettings();decorate()};
  const originalProgress=progress;
  progress=function(){originalProgress();decorate()};
  const originalRender=render;
  render=function(){originalRender();decorate()};

  render();
})();