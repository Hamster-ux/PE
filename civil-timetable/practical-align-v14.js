(function(){
  S.autoAlignPractical=true;
  save();

  function remainingGroups(s,set){
    const groups=[];
    taskStream(s,'practical').forEach(t=>{
      const done=set?set.has(taskKey(s,t)):isTaskChecked(s,t);
      if(done)return;
      const sig=taskSegmentKey(t);
      let g=groups[groups.length-1];
      if(!g||g.sig!==sig){g={sig,tasks:[]};groups.push(g)}
      g.tasks.push(t);
    });
    return groups;
  }

  function sessionCount(s,set){
    return remainingGroups(s,set).reduce((sum,g)=>sum+Math.ceil(g.tasks.length/s.per),0);
  }

  function totalSessionCount(s){
    const groups=[];
    taskStream(s,'practical').forEach(t=>{
      const sig=taskSegmentKey(t);
      let g=groups[groups.length-1];
      if(!g||g.sig!==sig){g={sig,count:0};groups.push(g)}
      g.count++;
    });
    return groups.reduce((sum,g)=>sum+Math.ceil(g.count/s.per),0);
  }

  function choosePracticalSubject(c,set){
    const candidates=S.practicalSubjects.map(s=>({
      s,
      remaining:sessionCount(s,set),
      total:Math.max(1,totalSessionCount(s))
    })).filter(x=>x.remaining>0);
    candidates.sort((a,b)=>{
      const ar=a.remaining/a.total,br=b.remaining/b.total;
      if(Math.abs(br-ar)>1e-9)return br-ar;
      const ao=a.s.day===c?1:0,bo=b.s.day===c?1:0;
      if(bo!==ao)return bo-ao;
      return b.remaining-a.remaining;
    });
    return candidates.length?candidates[0].s:null;
  }

  const oldScheduledForDate=scheduledForDate;
  scheduledForDate=function(d){
    if(phaseForDate(d)!=='practical')return oldScheduledForDate(d);
    const items=[];
    if(isSkipped(d))return{phase:'practical',cycle:null,items,review:false};
    const c=practicalCycle(d);
    if(c===3)return{phase:'practical',cycle:c,items,review:true};
    const s=choosePracticalSubject(c,null);
    if(s){const tasks=nextUncheckedTasks(s,'practical');if(tasks.length)items.push({s,tasks})}
    return{phase:'practical',cycle:c,items,review:false};
  };

  projectedPlansUntil=function(endDate){
    const plans=new Map(),today=date(iso(new Date())),simStart=today<date(S.startDate)?date(S.startDate):today,checkedSet=new Set(Object.keys(S.checks));
    let practicalStart=S.practicalStartDate;
    if(!practicalStart&&allPhaseCheckedInSet('written',checkedSet))practicalStart=iso(nextStudyDate(add(simStart,-1)));
    for(let d=new Date(simStart);d<=endDate;d=add(d,1)){
      const key=iso(d),phase=practicalStart&&d>=date(practicalStart)?'practical':'written',items=[];
      if(isSkipped(d)){plans.set(key,{phase,cycle:null,items,review:false});continue}
      const idx=phase==='written'?writtenIndex(d):activeIndex(d,practicalStart);
      const c=idx===null?null:idx%4;
      if(c===3){plans.set(key,{phase,cycle:c,items,review:true});continue}
      if(phase==='written'){
        S.subjects.filter(s=>s.day===c).forEach(s=>{
          const tasks=nextUncheckedTasks(s,'written',checkedSet);
          if(tasks.length){items.push({s,tasks});tasks.forEach(t=>checkedSet.add(taskKey(s,t)))}
        });
      }else{
        const s=choosePracticalSubject(c,checkedSet);
        if(s){
          const tasks=nextUncheckedTasks(s,'practical',checkedSet);
          if(tasks.length){items.push({s,tasks});tasks.forEach(t=>checkedSet.add(taskKey(s,t)))}
        }
      }
      plans.set(key,{phase,cycle:c,items,review:false});
      if(phase==='written'&&!practicalStart&&allPhaseCheckedInSet('written',checkedSet))practicalStart=iso(nextStudyDate(d));
    }
    return plans;
  };

  const oldCarry=carry;
  carry=function(d){return phaseForDate(d)==='practical'?[]:oldCarry(d)};

  const oldPlannedFinishDate=plannedFinishDate;
  plannedFinishDate=function(s,phase){
    if(phase!=='practical')return oldPlannedFinishDate(s,phase);
    if(taskStream(s,'practical').every(t=>isTaskChecked(s,t)))return'완료';
    if(!S.practicalStartDate)return null;
    const checkedSet=new Set(Object.keys(S.checks));
    let start=new Date()<date(S.practicalStartDate)?date(S.practicalStartDate):date(iso(new Date()));
    for(let i=0,d=new Date(start);i<4000;i++,d=add(d,1)){
      if(isSkipped(d))continue;
      const idx=activeIndex(d,S.practicalStartDate),c=idx===null?null:idx%4;
      if(c===3)continue;
      const chosen=choosePracticalSubject(c,checkedSet);
      if(chosen){
        const tasks=nextUncheckedTasks(chosen,'practical',checkedSet);
        tasks.forEach(t=>checkedSet.add(taskKey(chosen,t)));
      }
      if(taskStream(s,'practical').every(t=>checkedSet.has(taskKey(s,t))))return fmt(d);
    }
    return'계산 불가';
  };

  const oldSettings=settings;
  settings=function(){
    oldSettings();
    const root=$('subjectSettings');
    if(!root||$('practicalAlignInfo'))return;
    const box=document.createElement('div');
    box.id='practicalAlignInfo';
    box.className='setting';
    box.innerHTML='<h3>실기 완료 주 자동 맞춤</h3><div class="muted">실기 과목별 남은 분량을 비교해 완료 주를 맞춥니다. 먼저 끝난 과목의 날짜는 남아 있는 과목에 자동 배정되며, 한 과목만 남으면 실기 1~3일차에 연속으로 수강합니다.</div>';
    root.prepend(box);
  };

  const oldProgress=progress;
  progress=function(){
    oldProgress();
    const p=$('progress');
    if(!p||$('practicalAlignNotice'))return;
    const n=document.createElement('div');
    n.id='practicalAlignNotice';
    n.className='notice';
    n.innerHTML='<b>실기 완료 주 자동 맞춤 사용 중</b><br>토목시공처럼 분량이 많은 과목은 더 자주 배정되고, 다른 실기 과목이 끝난 뒤에는 최대 3일 연속으로 이어집니다.';
    p.appendChild(n);
  };

  render();
})();