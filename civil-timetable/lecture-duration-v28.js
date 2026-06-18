(function(){
  const BUILTIN_DURATIONS={
    'w:mech:theory:r1:l1':2820,
    'w:mech:theory:r1:l2':2400,
    'w:mech:theory:r1:l3':2460,
    'w:mech:theory:r1:l4':2940,
    'w:mech:theory:r1:l5':2760,
    'w:mech:theory:r1:l6':2640,
    'w:mech:theory:r1:l7':2760,
    'w:mech:theory:r1:l8':2040,
    'w:mech:theory:r1:l9':2700,
    'w:mech:theory:r1:l10':3120,
    'w:mech:theory:r1:l11':2580,
    'w:mech:theory:r1:l12':3000,
    'w:mech:theory:r1:l13':2700,
    'w:mech:theory:r1:l14':2340,
    'w:mech:theory:r1:l15':2760,
    'w:mech:theory:r1:l16':2460,
    'w:mech:theory:r1:l17':2520,
    'w:mech:theory:r1:l18':3000,
    'w:mech:theory:r1:l19':2640,
    'w:mech:theory:r1:l20':2820,
    'w:mech:theory:r1:l21':2340,
    'w:mech:theory:r1:l22':3180,
    'w:mech:theory:r1:l23':2760,
    'w:mech:theory:r1:l24':3060,
    'w:mech:theory:r1:l25':3060,
    'w:mech:theory:r1:l26':3420,
    'w:mech:theory:r1:l27':2640,
    'w:mech:theory:r1:l28':2880,
    'w:mech:theory:r1:l29':3480,
    'w:mech:theory:r1:l30':2400,
    'w:mech:theory:r1:l31':2460,
    'w:mech:theory:r1:l32':2940,
    'w:mech:theory:r1:l33':2700,
    'w:mech:theory:r1:l34':2460,
    'w:mech:theory:r1:l35':2640,
    'w:mech:theory:r1:l36':2760,
    'w:mech:theory:r1:l37':3180,
    'w:mech:theory:r1:l38':3060,
    'w:mech:theory:r1:l39':2760,
    'w:mech:theory:r1:l40':3660,
    'w:mech:theory:r1:l41':2580,
    'w:mech:theory:r1:l42':2280,
    'w:mech:theory:r1:l43':2640,
    'w:mech:theory:r1:l44':2880,
    'w:mech:theory:r1:l45':2520,
    'w:mech:theory:r1:l46':2700,
    'w:mech:theory:r1:l47':2760,
    'w:mech:theory:r1:l48':2700,
    'w:mech:theory:r1:l49':2580,
    'w:mech:theory:r1:l50':2700,
    'w:mech:theory:r1:l51':2520,
    'w:mech:theory:r1:l52':3060,
    'w:mech:theory:r1:l53':2040,
    'w:survey:theory:r1:l1':1980,
    'w:survey:theory:r1:l2':2340,
    'w:survey:theory:r1:l3':2280,
    'w:survey:theory:r1:l4':2160,
    'w:survey:theory:r1:l5':2220,
    'w:survey:theory:r1:l6':2040,
    'w:survey:theory:r1:l7':2160,
    'w:survey:theory:r1:l8':2100,
    'w:survey:theory:r1:l9':2100,
    'w:survey:theory:r1:l10':2160,
    'w:survey:theory:r1:l11':2160,
    'w:survey:theory:r1:l12':2340,
    'w:survey:theory:r1:l13':1980,
    'w:survey:theory:r1:l14':2220,
    'w:survey:theory:r1:l15':2520,
    'w:survey:theory:r1:l16':2640,
    'w:survey:theory:r1:l17':2220,
    'w:survey:theory:r1:l18':2100,
    'w:survey:theory:r1:l19':2160,
    'w:survey:theory:r1:l20':2100,
    'w:survey:theory:r1:l21':2160,
    'w:survey:theory:r1:l22':1860,
    'w:survey:theory:r1:l23':1860,
    'w:survey:theory:r1:l24':2100,
    'w:survey:theory:r1:l25':2340,
    'w:survey:theory:r1:l26':2280,
    'w:survey:theory:r1:l27':1920,
    'w:survey:theory:r1:l28':2100,
    'w:survey:theory:r1:l29':2220,
    'w:survey:theory:r1:l30':2880,
    'w:survey:theory:r1:l31':1980,
    'w:survey:theory:r1:l32':2220,
    'w:survey:theory:r1:l33':2580,
    'w:survey:theory:r1:l34':2340,
    'w:survey:theory:r1:l35':2160,
    'w:survey:theory:r1:l36':2040,
    'w:survey:theory:r1:l37':2400,
    'w:survey:theory:r1:l38':2040,
    'w:survey:theory:r1:l39':2040,
    'w:survey:theory:r1:l40':1920,
    'w:survey:theory:r1:l41':2280,
    'w:survey:theory:r1:l42':2160
  };

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