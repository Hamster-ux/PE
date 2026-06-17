(function(){
  if(!Array.isArray(S.completedCourseCycles))S.completedCourseCycles=[];
  if(!Number.isFinite(Number(S.courseCycle)))S.courseCycle=1;
  const allIds=[...S.subjects,...S.practicalSubjects].map(s=>s.id);
  if(!Array.isArray(S.nextCycleSubjects)||!S.nextCycleSubjects.length)S.nextCycleSubjects=[...allIds];
  S.autoRestartCourse=true;
  save();

  let rolling=false;

  function latestStudyDate(){
    const dates=Object.values(S.checks||{}).map(v=>v&&v.studyDate).filter(Boolean).sort();
    if(dates.length)return dates[dates.length-1];
    if(typeof selectedDate==='string'&&selectedDate)return selectedDate;
    return iso(new Date());
  }

  function applyNextCycleSelection(nextStart){
    const selected=new Set((S.nextCycleSubjects||[]).filter(id=>allIds.includes(id)));
    if(!selected.size)allIds.forEach(id=>selected.add(id));
    const now=new Date().toISOString();
    S.subjects.forEach(s=>{
      if(selected.has(s.id))return;
      writtenTasks(s).forEach(t=>S.checks[taskKey(s,t)]={checkedAt:now,studyDate:nextStart,autoSkipped:true});
    });
    S.practicalSubjects.forEach(s=>{
      if(selected.has(s.id))return;
      practicalTasks(s).forEach(t=>S.checks[taskKey(s,t)]={checkedAt:now,studyDate:nextStart,autoSkipped:true});
    });
  }

  function rolloverIfComplete(){
    if(rolling||!S.autoRestartCourse||!S.practicalStartDate||!allPracticalChecked())return false;
    rolling=true;
    const completedDate=latestStudyDate();
    const cycle=Math.max(1,Number(S.courseCycle)||1);
    const selected=[...(S.nextCycleSubjects||allIds)];
    const already=S.completedCourseCycles.some(x=>Number(x.cycle)===cycle);
    if(!already){
      S.completedCourseCycles.push({
        cycle,
        completedDate,
        startDate:S.startDate,
        practicalStartDate:S.practicalStartDate,
        completedTasks:Object.keys(S.checks||{}).filter(k=>!S.checks[k]?.autoSkipped).length,
        nextCycleSubjects:selected
      });
    }
    const nextStart=iso(nextStudyDate(date(completedDate)));
    S.courseCycle=cycle+1;
    S.startDate=nextStart;
    S.practicalStartDate=null;
    S.checks={};
    S.reviews={};
    S.postponedDates=Object.fromEntries(Object.entries(S.postponedDates||{}).filter(([d])=>d>=nextStart));
    applyNextCycleSelection(nextStart);
    selectedDate=nextStart;
    save();
    rolling=false;
    return true;
  }

  function decorate(){
    const p=$('progress');
    if(p&&!$('courseLoopNotice')){
      const n=document.createElement('div');
      n.id='courseLoopNotice';
      n.className='notice';
      const done=S.completedCourseCycles.length;
      n.innerHTML=`<b>전체 과정 자동 반복 사용 중</b><br>${done?`${done}회 완주 · 현재 ${S.courseCycle}회차 진행 중`:`현재 ${S.courseCycle}회차 진행 중`} · 실기까지 완료하면 다음 공부일부터 선택한 과목으로 새 회차를 시작합니다.`;
      p.appendChild(n);
    }
    const root=$('subjectSettings');
    if(root&&!$('courseLoopInfo')){
      const box=document.createElement('div');
      box.id='courseLoopInfo';
      box.className='setting';
      const list=S.completedCourseCycles.slice(-3).reverse().map(x=>`${x.cycle}회차 완료: ${x.completedDate}`).join('<br>');
      box.innerHTML=`<h3>전체 과정 자동 재시작</h3><div class="muted">필기와 실기를 완료하면 다음 공부일부터 선택한 과목으로 새 회차를 시작합니다.${list?`<br><br>${list}`:''}</div>`;
      root.prepend(box);
    }
  }

  const originalRender=render;
  render=function(){
    rolloverIfComplete();
    originalRender();
    decorate();
  };

  render();
})();