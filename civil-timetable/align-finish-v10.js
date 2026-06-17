(function(){
  if(!S.roundDefaultsV10){
    S.subjects.forEach(s=>s.targetRounds=3);
    S.roundDefaultsV10=true;
  }
  if(typeof S.autoAlignWritten!=='boolean')S.autoAlignWritten=true;
  save();

  const baseNext=nextUncheckedTasks;

  function remainingGroups(s,phase,set){
    const groups=[];
    taskStream(s,phase).forEach(t=>{
      const done=set?set.has(taskKey(s,t)):isTaskChecked(s,t);
      if(done)return;
      const sig=taskSegmentKey(t);
      let g=groups[groups.length-1];
      if(!g||g.sig!==sig){g={sig,tasks:[]};groups.push(g)}
      g.tasks.push(t);
    });
    return groups;
  }

  function sessionsNeeded(s,phase,set){
    return remainingGroups(s,phase,set).reduce((sum,g)=>sum+Math.ceil(g.tasks.length/s.per),0);
  }

  nextUncheckedTasks=function(s,phase,set=null){
    if(phase!=='written'||!S.autoAlignWritten)return baseNext(s,phase,set);
    const groups=remainingGroups(s,phase,set);
    if(!groups.length)return[];
    const common=Math.max(1,...S.subjects.map(subject=>sessionsNeeded(subject,'written',set)));
    const laterMinimum=groups.slice(1).reduce((sum,g)=>sum+Math.ceil(g.tasks.length/s.per),0);
    const slotsForCurrent=Math.max(1,common-laterMinimum);
    const count=Math.max(1,Math.min(s.per,Math.ceil(groups[0].tasks.length/slotsForCurrent)));
    return groups[0].tasks.slice(0,count);
  };

  const originalSettings=settings;
  settings=function(){
    originalSettings();
    const root=$('subjectSettings');
    if(!root||$('autoAlignWrittenBox'))return;
    const box=document.createElement('div');
    box.id='autoAlignWrittenBox';
    box.className='setting';
    box.innerHTML=`<div class="row"><div><h3>필기 완료 주 자동 맞춤</h3><div class="muted">가장 오래 걸리는 과목을 기준으로 빠른 과목의 하루 강의 수를 1강부터 설정한 최대치 사이에서 자동 조절합니다.</div></div><button type="button" id="autoAlignWrittenBtn" class="${S.autoAlignWritten?'primary':'light'}" style="min-width:76px">${S.autoAlignWritten?'사용 중':'사용 안 함'}</button></div>`;
    root.prepend(box);
    $('autoAlignWrittenBtn').onclick=()=>{
      S.autoAlignWritten=!S.autoAlignWritten;
      save();
      render();
    };
  };

  const originalProgress=progress;
  progress=function(){
    originalProgress();
    if(!S.autoAlignWritten)return;
    const p=$('progress');
    const note=document.createElement('div');
    note.className='notice';
    note.innerHTML='<b>필기 완료 주 자동 맞춤 사용 중</b><br>과목별 분량 차이를 자동으로 나눠 같은 학습 주차에 끝나도록 조절합니다.';
    p.prepend(note);
  };

  render();
})();