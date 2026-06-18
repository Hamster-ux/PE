/* v25: 다음 과정 자동 연결, 미래 예측, 시작 렌더링 최적화 */
const __coreRenderV25=render;let __bootingV25=true,__queuedV25=false;
render=function(){if(!__bootingV25)return __coreRenderV25();if(!__queuedV25){__queuedV25=true;setTimeout(()=>{__bootingV25=false;__queuedV25=false;render()},0)}};
function taskStream(s,phase){return phase==='written'?writtenTasks(s):practicalTasks(s)}
function taskSegmentKey(t){return`${t.phase}:${t.type}:${t.round||1}`}
function nextUncheckedTasks(s,phase,checkedSet=null){
  const stream=taskStream(s,phase),unchecked=t=>checkedSet?!checkedSet.has(taskKey(s,t)):!isTaskChecked(s,t),first=stream.find(unchecked);
  if(!first)return[];
  const segment=taskSegmentKey(first);
  return stream.filter(t=>taskSegmentKey(t)===segment&&unchecked(t)).slice(0,s.per)
}
writtenRange=function(s,d){const i=writtenIndex(d);if(i===null||i%4!==s.day)return null;return nextUncheckedTasks(s,'written')};
practicalRange=function(s,d){const i=practicalIndex(d);if(i===null||i%4!==s.day)return null;return nextUncheckedTasks(s,'practical')};
function allPhaseCheckedInSet(phase,checkedSet){const subjects=phase==='written'?S.subjects:S.practicalSubjects;return subjects.every(s=>taskStream(s,phase).every(t=>checkedSet.has(taskKey(s,t))))}
function projectedPlansUntil(endDate){
  const plans=new Map(),today=date(iso(new Date())),simStart=today<date(S.startDate)?date(S.startDate):today,checkedSet=new Set(Object.keys(S.checks));
  let practicalStart=S.practicalStartDate;
  if(!practicalStart&&allPhaseCheckedInSet('written',checkedSet))practicalStart=iso(nextStudyDate(add(simStart,-1)));
  for(let d=new Date(simStart);d<=endDate;d=add(d,1)){
    const key=iso(d);
    if(isSkipped(d)){plans.set(key,{phase:practicalStart&&d>=date(practicalStart)?'practical':'written',cycle:null,items:[],review:false});continue}
    const phase=practicalStart&&d>=date(practicalStart)?'practical':'written',items=[];
    let c;
    if(phase==='written')c=writtenCycle(d);else{const idx=activeIndex(d,practicalStart);c=idx===null?null:idx%4}
    if(c===3){plans.set(key,{phase,cycle:c,items,review:true});continue}
    const subjects=phase==='written'?S.subjects:S.practicalSubjects;
    subjects.filter(s=>s.day===c).forEach(s=>{
      const tasks=nextUncheckedTasks(s,phase,checkedSet);
      if(tasks.length){items.push({s,tasks});tasks.forEach(t=>checkedSet.add(taskKey(s,t)))}
    });
    plans.set(key,{phase,cycle:c,items,review:false});
    if(phase==='written'&&!practicalStart&&allPhaseCheckedInSet('written',checkedSet))practicalStart=iso(nextStudyDate(d));
  }
  return plans
}
function displayPlanForDate(d){const today=date(iso(new Date()));if(d<=today)return scheduledForDate(d);return projectedPlansUntil(d).get(iso(d))||scheduledForDate(d)}
function dueInfoBefore(s,d,phase){
  const start=phase==='written'?S.startDate:S.practicalStartDate;
  if(!start)return{sessions:0,lastDate:null};
  let sessions=0,lastDate=null;
  for(let cur=date(start);cur<d;cur=add(cur,1)){
    if(isSkipped(cur))continue;
    const c=phase==='written'?writtenCycle(cur):practicalCycle(cur);
    if(c===s.day){sessions++;lastDate=new Date(cur)}
  }
  return{sessions,lastDate}
}
carry=function(d){
  const plan=scheduledForDate(d),phase=plan.phase,currentIds=new Set(plan.items.map(x=>x.s.id)),subjects=phase==='written'?S.subjects:S.practicalSubjects,out=[];
  subjects.forEach(s=>{
    if(currentIds.has(s.id))return;
    const due=dueInfoBefore(s,d,phase);if(!due.sessions)return;
    const stream=taskStream(s,phase),dueLimit=Math.min(stream.length,due.sessions*s.per),duePrefix=stream.slice(0,dueLimit),first=duePrefix.find(t=>!isTaskChecked(s,t));
    if(!first)return;
    const segment=taskSegmentKey(first),overdue=duePrefix.filter(t=>taskSegmentKey(t)===segment&&!isTaskChecked(s,t));
    if(overdue.length)out.push({s,date:due.lastDate||add(d,-1),tasks:overdue,phase})
  });
  return out
};
info=function(d){
  const today=date(iso(new Date())),future=d>today,plan=displayPlanForDate(d),co=future?[]:carry(d),coCount=co.reduce((a,x)=>a+x.tasks.length,0);
  if(plan.cycle===null)return{...plan,co,total:coCount,done:0};
  if(plan.review){const done=reviewSubjects(plan.phase).filter(s=>S.reviews[`${plan.phase}:${iso(d)}:${s.id}`]).length;return{...plan,co,total:reviewSubjects(plan.phase).length+coCount,done}}
  const all=plan.items.flatMap(x=>x.tasks.map(t=>({s:x.s,t})));
  return{...plan,co,total:all.length+coCount,done:all.filter(x=>isTaskChecked(x.s,x.t)).length}
};
schedule=function(){
  const l=$('scheduleList'),from=date($('scheduleFrom').value||S.startDate),days=+$('scheduleDays').value,end=add(from,days-1),today=date(iso(new Date())),projected=end>today?projectedPlansUntil(end):new Map();
  l.innerHTML='';
  for(let i=0;i<days;i++){
    const d=add(from,i),plan=d>today?(projected.get(iso(d))||scheduledForDate(d)):scheduledForDate(d),rest=isRestWeekday(d),manual=isManualPostponed(d),phaseName=plan.phase==='written'?'필기':'실기',x=document.createElement('div');
    x.className='schedule '+(rest?'rest':manual?'postponed':plan.review?'review':'');
    x.innerHTML=`<div class="row"><b>${fmt(d)}</b><span>${rest?'휴식':manual?'미룸':plan.review?phaseName+' 복습':phaseName+' '+(plan.cycle+1)+'일차'}</span></div><div class="chips"></div>`;
    const ch=x.querySelector('.chips');
    if(rest)ch.innerHTML='<span class="chip">정기 휴식일</span>';
    else if(manual)ch.innerHTML='<span class="chip">일정 전체 미룸</span>';
    else if(plan.review)ch.innerHTML=`<span class="chip">${phaseName} 전체 복습</span>`;
    else if(!plan.items.length)ch.innerHTML='<span class="chip">배정 완료</span>';
    else plan.items.forEach(({s,tasks})=>ch.innerHTML+=`<span class="chip" style="background:${s.color}18;color:${s.color}">${s.name} · ${taskRangeText(tasks)}</span>`);
    l.appendChild(x)
  }
};
plannedFinishDate=function(s,phase){
  const stream=taskStream(s,phase),remaining=stream.filter(t=>!isTaskChecked(s,t)).length;
  if(!remaining)return'완료';
  let sessions=Math.ceil(remaining/s.per),start=phase==='written'?(new Date()<date(S.startDate)?date(S.startDate):date(iso(new Date()))):(S.practicalStartDate?date(S.practicalStartDate):null);
  if(!start)return null;
  for(let i=0,d=new Date(start);i<4000;i++,d=add(d,1)){
    if(isSkipped(d))continue;
    const c=phase==='written'?writtenCycle(d):practicalCycle(d);
    if(c===s.day){sessions--;if(sessions<=0)return fmt(d)}
  }
  return'계산 불가'
};
hasAnyChecksForDate=function(d){const plan=displayPlanForDate(d);if(plan.review)return reviewSubjects(plan.phase).some(s=>S.reviews[`${plan.phase}:${iso(d)}:${s.id}`]);return plan.items.some(x=>x.tasks.some(t=>isTaskChecked(x.s,t)))};
$('showSchedule').onclick=schedule;
render();