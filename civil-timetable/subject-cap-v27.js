(function(){
  const CYCLE_DAYS=3;
  const DAILY_CAP=4;

  function list(phase){return phase==='written'?S.subjects:S.practicalSubjects}
  function stream(subject,phase){return phase==='written'?writtenTasks(subject):practicalTasks(subject)}
  function key(subject,task){return taskKey(subject,task)}
  function remaining(subject,phase,set){return stream(subject,phase).filter(task=>!(set?set.has(key(subject,task)):isTaskChecked(subject,task)))}
  function complete(subject,phase,set){return remaining(subject,phase,set).length===0}
  function phaseComplete(phase,set){return list(phase).every(subject=>complete(subject,phase,set))}

  function choose(phase,cycle,set,used){
    return list(phase).map((subject,index)=>({subject,index,left:remaining(subject,phase,set).length,preferred:subject.day===cycle?1:0}))
      .filter(item=>item.left>0&&!used.has(item.subject.id))
      .sort((a,b)=>b.left-a.left||b.preferred-a.preferred||a.index-b.index)[0]?.subject||null;
  }

  function allocate(phase,cycle,baseSet){
    const set=baseSet||new Set(Object.keys(S.checks||{}));
    const preferred=list(phase).filter(subject=>subject.day===cycle);
    const slots=Math.max(1,preferred.length);
    const used=new Set();
    const grouped=[];

    for(let slot=0;slot<slots;slot++){
      let subject=preferred[slot];
      if(!subject||used.has(subject.id)||complete(subject,phase,set))subject=choose(phase,cycle,set,used);
      if(!subject)continue;
      const tasks=remaining(subject,phase,set).slice(0,DAILY_CAP);
      if(!tasks.length)continue;
      grouped.push({s:subject,tasks});
      tasks.forEach(task=>set.add(key(subject,task)));
      used.add(subject.id);
    }
    return grouped;
  }

  function history(d,phase){
    const day=iso(d),items=[];
    list(phase).forEach(subject=>{
      const tasks=stream(subject,phase).filter(task=>S.checks[key(subject,task)]?.studyDate===day);
      if(tasks.length)items.push({s:subject,tasks});
    });
    return items;
  }

  scheduledForDate=function(d){
    const phase=phaseForDate(d);
    if(isSkipped(d))return{phase,cycle:null,items:[],review:false};
    const cycle=phase==='written'?writtenCycle(d):practicalCycle(d);
    const today=date(iso(new Date()));
    if(d<today){const actual=history(d,phase);if(actual.length)return{phase,cycle,items:actual,review:false}}
    return{phase,cycle,items:allocate(phase,cycle),review:false};
  };

  projectedPlansUntil=function(endDate){
    const plans=new Map(),today=date(iso(new Date())),start=today<date(S.startDate)?date(S.startDate):today,set=new Set(Object.keys(S.checks||{}));
    let practicalStart=S.practicalStartDate;
    if(!practicalStart&&phaseComplete('written',set))practicalStart=iso(nextStudyDate(add(start,-1)));
    for(let d=new Date(start);d<=endDate;d=add(d,1)){
      const day=iso(d),phase=practicalStart&&d>=date(practicalStart)?'practical':'written';
      if(isSkipped(d)){plans.set(day,{phase,cycle:null,items:[],review:false});continue}
      const index=phase==='written'?activeIndex(d,S.startDate):activeIndex(d,practicalStart);
      const cycle=index===null?null:index%CYCLE_DAYS;
      plans.set(day,{phase,cycle,items:allocate(phase,cycle,set),review:false});
      if(phase==='written'&&!practicalStart&&phaseComplete('written',set))practicalStart=iso(nextStudyDate(d));
    }
    return plans;
  };

  displayPlanForDate=function(d){const today=date(iso(new Date()));return d<=today?scheduledForDate(d):(projectedPlansUntil(d).get(iso(d))||scheduledForDate(d))};

  info=function(d){
    const plan=displayPlanForDate(d),all=plan.items.flatMap(item=>item.tasks.map(task=>({s:item.s,t:task})));
    return{...plan,co:[],total:all.length,done:all.filter(item=>isTaskChecked(item.s,item.t)).length,review:false};
  };

  plannedFinishDate=function(subject,phase){
    if(complete(subject,phase,null))return'완료';
    const set=new Set(Object.keys(S.checks||{}));
    let practicalStart=S.practicalStartDate;
    const start=phase==='written'?(new Date()<date(S.startDate)?date(S.startDate):date(iso(new Date()))):date(iso(new Date()));
    for(let i=0,d=new Date(start);i<4000;i++,d=add(d,1)){
      if(isSkipped(d))continue;
      if(phase==='practical'&&!practicalStart){
        if(!phaseComplete('written',set)){
          const wi=activeIndex(d,S.startDate);
          allocate('written',wi===null?0:wi%CYCLE_DAYS,set);
          if(phaseComplete('written',set))practicalStart=iso(nextStudyDate(d));
          continue;
        }
        practicalStart=iso(d);
      }
      if(phase==='practical'&&d<date(practicalStart))continue;
      const index=phase==='written'?activeIndex(d,S.startDate):activeIndex(d,practicalStart);
      allocate(phase,index===null?0:index%CYCLE_DAYS,set);
      if(complete(subject,phase,set))return fmt(d);
    }
    return'계산 불가';
  };

  const notice=document.getElementById('continuousScheduleNoticeV26');
  if(notice)notice.innerHTML='<b>3일 연속 순환 · 과목별 하루 4강</b><br>복습 전용 날짜 없이 계속 순환합니다. 먼저 끝난 과목의 자리는 아직 남은 다른 과목으로 채우며, 한 과목은 하루 최대 4강만 배정합니다.';
  render();
})();