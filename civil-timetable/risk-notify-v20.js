(function(){
  if(typeof S.studyReminderEnabled!=='boolean')S.studyReminderEnabled=false;
  if(!S.studyReminderTime)S.studyReminderTime='20:00';
  if(!S.studyReminderLastDate)S.studyReminderLastDate='';
  save();

  let reminderTimer=null;

  const style=document.createElement('style');
  style.textContent=`
    .risk-card{border-left:7px solid var(--risk-color,#176b5a)}
    .risk-status{display:inline-flex;align-items:center;gap:6px;padding:7px 11px;border-radius:999px;font-size:12px;font-weight:900;background:var(--risk-soft,#e4f3ef);color:var(--risk-color,#176b5a)}
    .risk-dot{width:8px;height:8px;border-radius:50%;background:currentColor}
    .risk-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:12px}
    .risk-box{border:1px solid var(--line);background:#f8faf9;border-radius:13px;padding:11px}
    .risk-box small{display:block;color:var(--muted);margin-bottom:3px}.risk-box b{font-size:17px}
    .notify-toast{position:fixed;left:50%;bottom:94px;transform:translateX(-50%);width:min(520px,calc(100% - 28px));z-index:100;background:#17332d;color:#fff;padding:13px 15px;border-radius:15px;box-shadow:0 15px 35px #0004;font-size:14px;line-height:1.45}
    .notify-toast b{display:block;margin-bottom:3px}.notify-toast.hide{display:none}
    .notification-state{margin-top:8px;padding:9px 11px;border-radius:11px;background:#f4f7f6;color:var(--muted);font-size:12px}
    @media(max-width:460px){.risk-grid{grid-template-columns:1fr 1fr}.risk-box b{font-size:15px}}
  `;
  document.head.appendChild(style);

  function taskKeysFor(phase){
    const list=phase==='written'?S.subjects:S.practicalSubjects,out=[];
    list.forEach(s=>taskStream(s,phase).forEach(t=>out.push(taskKey(s,t))));
    return out;
  }

  function completionProjection(){
    const today=date(iso(new Date())),start=today<date(S.startDate)?date(S.startDate):today,target=date(S.goalDate||S.examDate),far=add(target>start?target:start,365),checked=new Set(Object.keys(S.checks||{})),writtenKeys=taskKeysFor('written'),practicalKeys=taskKeysFor('practical');
    let writtenFinish=writtenKeys.every(k=>checked.has(k))?(S.practicalStartDate?iso(add(date(S.practicalStartDate),-1)):iso(today)):null;
    let practicalFinish=practicalKeys.every(k=>checked.has(k))?iso(today):null;
    const plans=projectedPlansUntil(far);
    for(let d=new Date(start);d<=far&&(!writtenFinish||!practicalFinish);d=add(d,1)){
      const plan=plans.get(iso(d));
      if(plan)plan.items.forEach(x=>x.tasks.forEach(t=>checked.add(taskKey(x.s,t))));
      if(!writtenFinish&&writtenKeys.every(k=>checked.has(k)))writtenFinish=iso(d);
      if(!practicalFinish&&practicalKeys.every(k=>checked.has(k)))practicalFinish=iso(d);
    }
    const allKeys=[...writtenKeys,...practicalKeys],remaining=allKeys.filter(k=>!Object.prototype.hasOwnProperty.call(S.checks||{},k)).length;
    let activeDays=0;
    if(target>=start)for(let d=new Date(start);d<=target;d=add(d,1))if(!isSkipped(d))activeDays++;
    const requiredDaily=(remaining/Math.max(1,activeDays)).toFixed(1);
    const finish=practicalFinish&&date(practicalFinish),buffer=finish?diff(target,finish):null;
    let level='danger',label='일정 부족',color='#c83f49',soft='#ffe8ea',message='현재 계획으로는 기준일까지 전 과정을 끝내기 어려워요.';
    if(buffer!==null&&buffer>=21){level='safe';label='여유 있음';color='#176b5a';soft='#e4f3ef';message=`기준일보다 약 ${buffer}일 먼저 끝날 것으로 예상돼요.`}
    else if(buffer!==null&&buffer>=0){level='warning';label='조금 빠르게';color='#b77908';soft='#fff3cd';message=`기준일까지 약 ${buffer}일의 여유가 있어요. 밀리지 않게 유지하는 게 좋아요.`}
    else if(buffer!==null){message=`현재 속도면 기준일보다 약 ${Math.abs(buffer)}일 늦을 것으로 예상돼요.`}
    return{writtenFinish,practicalFinish,remaining,activeDays,requiredDaily,buffer,level,label,color,soft,message,target:iso(target)};
  }

  function addRiskCard(){
    const view=$('today');if(!view)return;
    const old=$('examRiskCardV20');if(old)old.remove();
    const r=completionProjection(),card=document.createElement('div');
    card.className='card risk-card';card.id='examRiskCardV20';
    card.style.setProperty('--risk-color',r.color);card.style.setProperty('--risk-soft',r.soft);
    card.innerHTML=`<div class="head"><div><h2>완료 위험도</h2><div class="muted">목표 기준일 ${r.target}</div></div><span class="risk-status"><i class="risk-dot"></i>${r.label}</span></div><div class="risk-grid"><div class="risk-box"><small>필기 완료 예상</small><b>${r.writtenFinish||'계산 중'}</b></div><div class="risk-box"><small>실기 완료 예상</small><b>${r.practicalFinish||'계산 중'}</b></div><div class="risk-box"><small>남은 강의</small><b>${r.remaining}강</b></div><div class="risk-box"><small>하루 필요 평균</small><b>${r.requiredDaily}강</b></div></div><div class="notice" style="border-color:${r.color}45;background:${r.soft};color:${r.color}"><b>${r.label}</b><br>${r.message}</div>`;
    view.insertBefore(card,view.firstChild);
  }

  function reminderSummary(){
    const d=date(iso(new Date())),x=info(d),count=(x.items||[]).reduce((a,g)=>a+g.tasks.length,0)+(x.co||[]).reduce((a,g)=>a+g.tasks.length,0),phase=x.phase==='practical'?'실기':'필기';
    if(isRestWeekday(d))return{title:'오늘은 정기 휴식일',body:'쉬면서 밀린 내용이나 메모만 가볍게 확인해 보세요.'};
    if(isManualPostponed(d))return{title:'오늘 일정은 미뤄졌어요',body:'시간표에서 다음 배정 일정을 확인해 주세요.'};
    if(x.review)return{title:`오늘은 ${phase} 복습일`,body:'요약 노트와 틀린 문제를 확인할 차례예요.'};
    return{title:`오늘 ${phase} 공부 ${count}강`,body:count?`시간표에 배정된 ${count}강을 확인해 주세요.`:'오늘 배정된 강의는 모두 완료됐어요.'};
  }

  function toast(title,body){
    let el=$('notifyToastV20');
    if(!el){el=document.createElement('div');el.id='notifyToastV20';el.className='notify-toast';document.body.appendChild(el)}
    el.innerHTML=`<b>${title}</b>${body}`;el.classList.remove('hide');clearTimeout(el._timer);el._timer=setTimeout(()=>el.classList.add('hide'),5500);
  }

  function sendReminder(test){
    const m=test?{title:'토목기사 시간표 알림 테스트',body:'알림 설정이 정상적으로 작동하고 있어요.'}:reminderSummary();
    let systemShown=false;
    try{
      if('Notification'in window&&Notification.permission==='granted'){
        const n=new Notification(m.title,{body:m.body,icon:'icon.svg',tag:test?'civil-test':'civil-daily'});
        n.onclick=()=>{window.focus();n.close()};systemShown=true;
      }
    }catch(e){systemShown=false}
    toast(m.title,m.body+(systemShown?'':' · 시스템 알림을 지원하지 않아 앱 안에서 표시했어요.'));
    return systemShown;
  }

  function scheduleReminder(){
    clearTimeout(reminderTimer);reminderTimer=null;
    if(!S.studyReminderEnabled)return;
    const now=new Date(),parts=String(S.studyReminderTime||'20:00').split(':').map(Number),target=new Date(now);target.setHours(parts[0]||0,parts[1]||0,0,0);const todayKey=iso(now);
    if(now>=target&&S.studyReminderLastDate!==todayKey){
      sendReminder(false);S.studyReminderLastDate=todayKey;save();
      target.setDate(target.getDate()+1);
    }else if(now>=target)target.setDate(target.getDate()+1);
    const delay=Math.max(1000,target-now);
    reminderTimer=setTimeout(()=>{if(S.studyReminderEnabled){sendReminder(false);S.studyReminderLastDate=iso(new Date());save();scheduleReminder()}},Math.min(delay,2147483000));
  }

  function permissionText(){
    if(!('Notification'in window))return'이 브라우저는 시스템 알림을 지원하지 않아 앱 안 알림으로 표시됩니다.';
    if(Notification.permission==='granted')return'시스템 알림 권한이 허용되어 있어요.';
    if(Notification.permission==='denied')return'알림 권한이 차단되어 있어요. 아이폰 설정에서 허용해야 합니다.';
    return'알림 권한을 요청하지 않았어요.';
  }

  function addNotificationSettings(){
    const root=$('subjectSettings');if(!root)return;
    const box=document.createElement('div');box.className='setting';box.id='notificationSettingsV20';
    box.innerHTML=`<div class="row"><div><h3>오늘 공부 알림</h3><div class="muted">정한 시간에 오늘 강의 수와 밀린 일정을 알려줍니다.</div></div><button type="button" id="toggleReminderV20" class="${S.studyReminderEnabled?'primary':'light'}">${S.studyReminderEnabled?'사용 중':'사용 안 함'}</button></div><div class="field"><label>알림 시간</label><input id="reminderTimeV20" type="time" value="${S.studyReminderTime||'20:00'}"></div><div class="actions"><button type="button" class="primary" id="permissionV20">알림 권한 요청</button><button type="button" class="light" id="testReminderV20">알림 테스트</button></div><div class="notification-state" id="permissionStateV20">${permissionText()}</div><div class="notice"><b>아이폰 알림 안내</b><br>현재 정적 웹앱에서는 앱이 열려 있거나 다시 열렸을 때 알림이 가장 안정적으로 표시됩니다. 앱이 완전히 종료된 상태의 확실한 푸시 알림은 별도 푸시 서버가 필요합니다.</div>`;
    root.prepend(box);
    $('toggleReminderV20').onclick=()=>{S.studyReminderEnabled=!S.studyReminderEnabled;save();render()};
    $('reminderTimeV20').onchange=e=>{S.studyReminderTime=e.target.value||'20:00';S.studyReminderLastDate='';save();scheduleReminder()};
    $('permissionV20').onclick=async()=>{
      if(!('Notification'in window)){alert('이 브라우저에서는 시스템 알림을 지원하지 않아요. 앱 안 알림은 사용할 수 있어요.');return}
      try{const p=await Notification.requestPermission();if(p==='granted')S.studyReminderEnabled=true;save();render()}catch(e){alert('알림 권한을 요청하지 못했어요.')}
    };
    $('testReminderV20').onclick=()=>sendReminder(true);
  }

  const previousRender=render;
  render=function(){
    previousRender();
    addRiskCard();
    addNotificationSettings();
    scheduleReminder();
  };

  document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleReminder()});
  window.addEventListener('focus',scheduleReminder);
  render();
})();