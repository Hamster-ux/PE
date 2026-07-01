(function(){
  const BOUNDARY_HOUR=9;
  let timer=null;

  function studyDate(now=new Date()){
    const value=new Date(now);
    if(value.getHours()<BOUNDARY_HOUR)value.setDate(value.getDate()-1);
    value.setHours(0,0,0,0);
    return value;
  }

  function studyKey(now=new Date()){
    return iso(studyDate(now));
  }

  function nextBoundaryDelay(){
    const now=new Date(),target=new Date(now);
    target.setHours(BOUNDARY_HOUR,0,0,0);
    if(now>=target)target.setDate(target.getDate()+1);
    return Math.max(1000,target.getTime()-now.getTime()+250);
  }

  function decorateBoundary(){
    const dateText=$('todayDate');
    if(dateText&&!document.getElementById('studyBoundaryNoteV50')){
      const note=document.createElement('span');
      note.id='studyBoundaryNoteV50';
      note.textContent=' · 오전 9시 기준';
      note.style.fontWeight='800';
      dateText.appendChild(note);
    }

    document.querySelectorAll('.calendar-day.today').forEach(cell=>cell.classList.remove('today'));
    const key=studyKey();
    document.querySelectorAll('.calendar-day[data-date]').forEach(cell=>{
      if(cell.dataset.date===key)cell.classList.add('today');
    });
  }

  function applyBoundary(forceToday=false){
    const calendarKey=iso(new Date()),key=studyKey();
    if(forceToday||selectedDate===calendarKey)selectedDate=key;
    const jump=$('jumpToday');
    if(jump)jump.onclick=()=>{selectedDate=studyKey();render()};
    if(typeof render==='function')render();
    requestAnimationFrame(decorateBoundary);
  }

  function scheduleBoundary(){
    clearTimeout(timer);
    timer=setTimeout(()=>{
      selectedDate=studyKey();
      if(S.dailyPlanSnapshots&&typeof S.dailyPlanSnapshots==='object'){
        const keep=S.dailyPlanSnapshots[studyKey()];
        S.dailyPlanSnapshots=keep?{[studyKey()]:keep}:{};
        save();
      }
      applyBoundary(true);
      scheduleBoundary();
    },nextBoundaryDelay());
  }

  window.civilStudyBoundaryHour=BOUNDARY_HOUR;
  window.civilStudyDayDate=studyDate;
  window.civilStudyDayKey=studyKey;

  const calendarList=$('scheduleList');
  if(calendarList&&'MutationObserver'in window){
    new MutationObserver(()=>requestAnimationFrame(decorateBoundary)).observe(calendarList,{childList:true,subtree:true});
  }
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden){applyBoundary(false);scheduleBoundary()}
  });

  applyBoundary(false);
  scheduleBoundary();
})();