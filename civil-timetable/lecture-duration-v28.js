(function(){
  const BUILTIN_DURATIONS={};

  if(!S.lectureDurations||typeof S.lectureDurations!=='object'||Array.isArray(S.lectureDurations))S.lectureDurations={};
  Object.entries(BUILTIN_DURATIONS).forEach(([key,value])=>{
    if(!Number.isFinite(Number(S.lectureDurations[key])))S.lectureDurations[key]=Number(value);
  });
  save();

  const originalWrittenTasks=writtenTasks;
  const originalPracticalTasks=practicalTasks;
  const originalTaskMinutes=taskMinutes;

  function attachDuration(subject,tasks){
    return tasks.map(task=>{
      const seconds=Number(S.lectureDurations[taskKey(subject,task)]);
      return Number.isFinite(seconds)&&seconds>0?{...task,actualSeconds:seconds}:task;
    });
  }

  writtenTasks=function(subject){return attachDuration(subject,originalWrittenTasks(subject))};
  practicalTasks=function(subject){return attachDuration(subject,originalPracticalTasks(subject))};
  taskMinutes=function(task){
    if(Number.isFinite(Number(task.actualSeconds))&&Number(task.actualSeconds)>0){
      return Math.max(1,Math.ceil(Number(task.actualSeconds)/90));
    }
    return originalTaskMinutes(task);
  };

  function allTaskEntries(){
    const rows=[];
    S.subjects.forEach(subject=>writtenTasks(subject).forEach(task=>rows.push({subject,task,key:taskKey(subject,task)})));
    S.practicalSubjects.forEach(subject=>practicalTasks(subject).forEach(task=>rows.push({subject,task,key:taskKey(subject,task)})));
    return rows;
  }

  function exactStudyMinutesForCheckKeys(keys){
    const taskMap=new Map(allTaskEntries().map(row=>[row.key,row.task]));
    return keys.reduce((sum,key)=>sum+(taskMap.has(key)?taskMinutes(taskMap.get(key)):27),0);
  }

  const oldWeeklyStats=weeklyStats;
  weeklyStats=function(){
    oldWeeklyStats();
    const bounds=weekBounds(),keys=[];
    Object.entries(S.checks||{}).forEach(([key,value])=>{
      if(!value||typeof value!=='object'||!value.studyDate)return;
      const d=date(value.studyDate);
      if(d>=date(iso(bounds.monday))&&d<=date(iso(bounds.sunday)))keys.push(key);
    });
    const minutes=exactStudyMinutesForCheckKeys(keys);
    $('weekTime').textContent=minutes>=60?`${Math.floor(minutes/60)}시간 ${minutes%60}분`:minutes+'분';
  };

  window.civilLectureDurationV28={
    setSeconds(entries){
      Object.entries(entries||{}).forEach(([key,value])=>{
        const seconds=Number(value);
        if(Number.isFinite(seconds)&&seconds>0)S.lectureDurations[key]=Math.round(seconds);
      });
      save();render();
    },
    setMinutes(entries){
      const converted={};
      Object.entries(entries||{}).forEach(([key,value])=>{
        const minutes=Number(value);
        if(Number.isFinite(minutes)&&minutes>0)converted[key]=Math.round(minutes*60);
      });
      this.setSeconds(converted);
    },
    count(){return Object.keys(S.lectureDurations||{}).length},
    export(){return JSON.parse(JSON.stringify(S.lectureDurations||{}))}
  };

  const oldSettings=settings;
  settings=function(){
    oldSettings();
    const root=$('subjectSettings');
    if(root&&!$('lectureDurationInfoV28')){
      const box=document.createElement('div');
      box.id='lectureDurationInfoV28';
      box.className='setting';
      const count=window.civilLectureDurationV28.count();
      box.innerHTML=`<div class="row"><div><h3>강의별 실제 시간</h3><div class="muted">보내준 강의 목록 사진의 시간을 강의별로 저장해 1.5배속 예상시간에 반영합니다.</div></div><span class="chip">${count}강 반영</span></div>`;
      root.prepend(box);
    }
  };

  render();
})();