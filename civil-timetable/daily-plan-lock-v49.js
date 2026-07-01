(function(){
  const CYCLE_DAYS=3;
  const DAILY_CAP=4;
  const baseScheduledForDate=window.scheduledForDate;

  if(!S.dailyPlanSnapshots||typeof S.dailyPlanSnapshots!=='object'||Array.isArray(S.dailyPlanSnapshots))S.dailyPlanSnapshots={};

  function todayKey(){return iso(new Date())}
  function subjectsFor(phase){return phase==='written'?S.subjects:S.practicalSubjects}
  function tasksFor(subject,phase){return phase==='written'?writtenTasks(subject):practicalTasks(subject)}
  function keyFor(subject,task){return taskKey(subject,task)}
  function completed(set,subject,task){return set.has(keyFor(subject,task))}
  function remaining(subject,phase,set){return tasksFor(subject,phase).filter(task=>!completed(set,subject,task))}
  function complete(subject,phase,set){return remaining(subject,phase,set).length===0}
  function phaseComplete(phase,set){return subjectsFor(phase).every(subject=>complete(subject,phase,set))}

  function choose(phase,cycle,set,used){
    return subjectsFor(phase).map((subject,index)=>({
      subject,
      index,
      left:remaining(subject,phase,set).length,
      preferred:subject.day===cycle?1:0
    })).filter(item=>item.left>0&&!used.has(item.subject.id))
      .sort((a,b)=>b.left-a.left||b.preferred-a.preferred||a.index-b.index)[0]?.subject||null;
  }

  function allocate(phase,cycle,set){
    if(cycle===null||cycle===undefined)return[];
    const preferred=subjectsFor(phase).filter(subject=>subject.day===cycle);
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
      tasks.forEach(task=>set.add(keyFor(subject,task)));
      used.add(subject.id);
    }
    return grouped;
  }

  function basisSignature(){
    return JSON.stringify({
      startDate:S.startDate,
      practicalStartDate:S.practicalStartDate,
      restDays:S.restDays||[],
      postponedDates:S.postponedDates||{},
      subjects:S.subjects.map(s=>[s.id,s.theoryTotal,s.specialTotal,s.coreTotal,s.targetRounds,s.day]),
      practicalSubjects:S.practicalSubjects.map(s=>[s.id,s.theoryTotal,s.coreTotal,s.day])
    });
  }

  function currentRows(phase){
    const rows=[];
    subjectsFor(phase).forEach(subject=>tasksFor(subject,phase).forEach(task=>rows.push({subject,task,key:keyFor(subject,task)})));
    return rows;
  }

  function checkedOnDate(phase,key){
    return currentRows(phase).filter(row=>{
      const value=S.checks&&S.checks[row.key];
      return value&&typeof value==='object'&&!value.autoSkipped&&value.studyDate===key;
    });
  }

  function snapshotPlan(snapshot){
    const wanted=new Set(snapshot.keys||[]),items=[];
    subjectsFor(snapshot.phase).forEach(subject=>{
      const tasks=tasksFor(subject,snapshot.phase).filter(task=>wanted.has(keyFor(subject,task)));
      if(tasks.length)items.push({s:subject,tasks});
    });
    return{phase:snapshot.phase,cycle:snapshot.cycle,items,review:false};
  }

  function buildTodayPlan(d){
    const key=iso(d),basis=basisSignature();
    let snapshot=S.dailyPlanSnapshots[key];
    if(!snapshot||snapshot.basis!==basis){
      const originalChecks=S.checks;
      const filtered={};
      Object.entries(originalChecks||{}).forEach(([taskKeyValue,value])=>{
        const checkedToday=value&&typeof value==='object'&&!value.autoSkipped&&value.studyDate===key;
        if(!checkedToday)filtered[taskKeyValue]=value;
      });
      let basePlan;
      try{
        S.checks=filtered;
        basePlan=baseScheduledForDate(d);
      }finally{
        S.checks=originalChecks;
      }
      const keys=[];
      (basePlan.items||[]).forEach(group=>group.tasks.forEach(task=>keys.push(keyFor(group.s,task))));
      checkedOnDate(basePlan.phase,key).forEach(row=>{if(!keys.includes(row.key))keys.push(row.key)});
      snapshot={basis,phase:basePlan.phase,cycle:basePlan.cycle,keys,createdAt:new Date().toISOString()};
      S.dailyPlanSnapshots={[key]:snapshot};
      save();
    }else{
      let changed=false;
      checkedOnDate(snapshot.phase,key).forEach(row=>{
        if(!snapshot.keys.includes(row.key)){snapshot.keys.push(row.key);changed=true}
      });
      if(changed)save();
    }
    return snapshotPlan(snapshot);
  }

  scheduledForDate=function(d){
    const key=iso(d),today=todayKey();
    if(key!==today||d<date(S.startDate)||isSkipped(d))return baseScheduledForDate(d);
    return buildTodayPlan(d);
  };

  projectedPlansUntil=function(endDate){
    const plans=new Map();
    const today=date(todayKey());
    const start=today<date(S.startDate)?date(S.startDate):today;
    if(endDate<start)return plans;

    const set=new Set(Object.keys(S.checks||{}));
    let practicalStart=S.practicalStartDate;
    if(!practicalStart&&phaseComplete('written',set))practicalStart=iso(nextStudyDate(add(start,-1)));

    for(let d=new Date(start);d<=endDate;d=add(d,1)){
      const key=iso(d);
      const phase=practicalStart&&d>=date(practicalStart)?'practical':'written';
      if(isSkipped(d)){
        plans.set(key,{phase,cycle:null,items:[],review:false});
        continue;
      }
      const index=phase==='written'?activeIndex(d,S.startDate):activeIndex(d,practicalStart);
      const cycle=index===null?null:index%CYCLE_DAYS;
      if(key===todayKey()){
        const frozen=buildTodayPlan(d);
        plans.set(key,frozen);
        frozen.items.forEach(group=>group.tasks.forEach(task=>set.add(keyFor(group.s,task))));
      }else{
        plans.set(key,{phase,cycle,items:allocate(phase,cycle,set),review:false});
      }
      if(phase==='written'&&!practicalStart&&phaseComplete('written',set))practicalStart=iso(nextStudyDate(d));
    }
    return plans;
  };

  displayPlanForDate=function(d){
    if(d<date(S.startDate))return{phase:'written',cycle:null,items:[],review:false};
    const today=date(todayKey());
    return d<=today?scheduledForDate(d):(projectedPlansUntil(d).get(iso(d))||scheduledForDate(d));
  };

  info=function(d){
    const plan=displayPlanForDate(d);
    const all=plan.items.flatMap(item=>item.tasks.map(task=>({s:item.s,t:task})));
    return{...plan,co:[],total:all.length,done:all.filter(item=>isTaskChecked(item.s,item.t)).length,review:false};
  };

  plannedFinishDate=function(subject,phase){
    const subjectKeys=tasksFor(subject,phase).map(task=>keyFor(subject,task));
    const set=new Set(Object.keys(S.checks||{}));
    if(subjectKeys.every(key=>set.has(key)))return'완료';

    const today=date(todayKey());
    const start=today<date(S.startDate)?date(S.startDate):today;
    let practicalStart=S.practicalStartDate;
    if(!practicalStart&&phaseComplete('written',set))practicalStart=iso(nextStudyDate(add(start,-1)));

    for(let i=0,d=new Date(start);i<4000;i++,d=add(d,1)){
      if(isSkipped(d))continue;
      const currentPhase=practicalStart&&d>=date(practicalStart)?'practical':'written';
      const index=currentPhase==='written'?activeIndex(d,S.startDate):activeIndex(d,practicalStart);
      const cycle=index===null?null:index%CYCLE_DAYS;
      if(iso(d)===todayKey()){
        const frozen=buildTodayPlan(d);
        if(frozen.phase===currentPhase)frozen.items.forEach(group=>group.tasks.forEach(task=>set.add(keyFor(group.s,task))));
        else allocate(currentPhase,cycle,set);
      }else{
        allocate(currentPhase,cycle,set);
      }
      if(currentPhase==='written'&&!practicalStart&&phaseComplete('written',set))practicalStart=iso(nextStudyDate(d));
      if(subjectKeys.every(key=>set.has(key)))return fmt(d);
    }
    return'계산 불가';
  };

  render();
})();