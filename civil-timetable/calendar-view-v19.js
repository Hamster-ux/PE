(function(){
  if(!S.scheduleViewMode)S.scheduleViewMode='calendar';
  save();

  const baseSchedule=schedule;

  const style=document.createElement('style');
  style.textContent=`
    .calendar-tools{display:grid;grid-template-columns:1fr 1fr auto;gap:7px;margin-top:12px}
    .calendar-tools button{min-height:40px}
    .calendar-tools button.on{background:var(--primary);color:#fff}
    .calendar-tools .today-month{padding:0 12px;background:#eef7f4;color:var(--primary)}
    .calendar-help{margin-top:8px;color:var(--muted);font-size:12px}
    .month-calendar{margin-top:22px;scroll-margin-top:10px}
    .month-title{position:sticky;top:0;z-index:8;padding:12px 4px 9px;background:linear-gradient(var(--bg) 75%,transparent);font-size:25px;font-weight:900}
    .calendar-weekdays,.calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr))}
    .calendar-weekday{text-align:center;padding:7px 0;font-size:11px;font-weight:850;color:var(--muted);border-bottom:1px solid var(--line)}
    .calendar-weekday.sun{color:#d45d5d}.calendar-weekday.sat{color:#4477bd}
    .calendar-day{min-width:0;min-height:96px;padding:5px 3px 4px;border-bottom:1px solid var(--line);background:#fff;overflow:hidden;cursor:pointer}
    .calendar-day:nth-child(7n+1){background:#fffafa}.calendar-day:nth-child(7n){background:#f8fbff}
    .calendar-day.empty{background:transparent;cursor:default}
    .calendar-day.outside{opacity:.35}
    .calendar-day.selected{background:#eaf6f2;box-shadow:inset 0 0 0 2px #52a794}
    .calendar-day.rest{background:#f3f4f4}.calendar-day.postponed{background:#fff7ea}
    .day-number{width:27px;height:27px;display:grid;place-items:center;border-radius:50%;font-weight:900;font-size:14px;margin:0 0 2px 1px}
    .calendar-day.today .day-number{background:#ff4757;color:#fff}
    .calendar-day.sun .day-number{color:#d45d5d}.calendar-day.sat .day-number{color:#4477bd}
    .calendar-day.today.sun .day-number,.calendar-day.today.sat .day-number{color:#fff}
    .calendar-event{display:block;margin-top:3px;padding:3px 4px;border-radius:5px;font-size:9px;line-height:1.25;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .calendar-event.review{background:#fff0bd;color:#785c0b}.calendar-event.rest{background:#e7ebea;color:#66726f}.calendar-event.postponed{background:#ffe3bf;color:#9a5b11}
    .calendar-more{margin-top:3px;text-align:center;color:var(--muted);font-size:10px;font-weight:850}
    .calendar-legend{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
    .calendar-legend span{font-size:11px;padding:5px 8px;border-radius:999px;background:#f2f6f5;color:var(--muted)}
    @media(max-width:460px){
      .calendar-tools{grid-template-columns:1fr 1fr}.calendar-tools .today-month{grid-column:1/-1}
      .month-title{font-size:23px}.calendar-day{min-height:88px;padding:4px 2px}.calendar-event{font-size:8px;padding:3px}.day-number{width:25px;height:25px;font-size:13px}
    }
  `;
  document.head.appendChild(style);

  function shortName(name){
    const map={
      '수리수문학':'수리','토질 및 기초':'토질','상하수도공학':'상하수도','측량학':'측량','응용역학':'응용','철근콘크리트 및 강구조':'철콘',
      '토목적산(물량산출)':'적산','토목시공':'시공','토목공정(공정 및 품질관리)':'공정'
    };
    return map[name]||name.replace(/\(.+?\)/g,'').slice(0,5);
  }

  function rangeText(tasks){
    if(!tasks||!tasks.length)return'';
    const t=tasks[0],a=tasks[0].lecture,b=tasks[tasks.length-1].lecture,range=a===b?`${a}강`:`${a}~${b}강`;
    if(t.type==='special')return`특강 ${range}`;
    if(t.type==='core')return`핵심 ${range}`;
    if(t.phase==='written')return`${t.round||1}회 ${range}`;
    return`이론 ${range}`;
  }

  function planForDate(d,today,projected){
    return d>today?(projected.get(iso(d))||scheduledForDate(d)):scheduledForDate(d);
  }

  function dayEvents(d,plan){
    if(isRestWeekday(d))return[{kind:'rest',text:'휴식'}];
    if(isManualPostponed(d))return[{kind:'postponed',text:'일정 미룸'}];
    if(plan.review)return[{kind:'review',text:`${plan.phase==='written'?'필기':'실기'} 복습`}];
    const out=[];
    (plan.items||[]).forEach(({s,tasks})=>out.push({kind:'subject',text:`${shortName(s.name)} · ${rangeText(tasks)}`,color:s.color}));
    return out;
  }

  function openDate(key){
    selectedDate=key;
    render();
    document.querySelectorAll('.nav button,.view').forEach(x=>x.classList.remove('on'));
    const btn=document.querySelector('.nav button[data-v="today"]');
    if(btn)btn.classList.add('on');
    const view=$('today');if(view)view.classList.add('on');
    scrollTo(0,0);
  }

  function ensureTools(){
    const list=$('scheduleList');
    let tools=$('calendarToolsV19');
    if(!tools){
      tools=document.createElement('div');tools.id='calendarToolsV19';
      tools.innerHTML=`<div class="calendar-tools"><button type="button" id="calendarModeV19" class="${S.scheduleViewMode==='calendar'?'on':'light'}">달력형</button><button type="button" id="listModeV19" class="${S.scheduleViewMode==='list'?'on':'light'}">목록형</button><button type="button" id="todayMonthV19" class="today-month">오늘 달로 이동</button></div><div class="calendar-help">달력 날짜를 누르면 그날의 상세 시간표로 이동합니다.</div>`;
      list.parentNode.insertBefore(tools,list);
    }
    $('calendarModeV19').className=S.scheduleViewMode==='calendar'?'on':'light';
    $('listModeV19').className=S.scheduleViewMode==='list'?'on':'light';
    $('calendarModeV19').onclick=()=>{S.scheduleViewMode='calendar';save();schedule()};
    $('listModeV19').onclick=()=>{S.scheduleViewMode='list';save();schedule()};
    $('todayMonthV19').onclick=()=>{
      const id=`month-${iso(new Date()).slice(0,7)}`;
      const el=document.getElementById(id);
      if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
      else{$('scheduleFrom').value=iso(new Date());schedule()}
    };
  }

  function monthStart(d){return new Date(d.getFullYear(),d.getMonth(),1)}
  function nextMonth(d){return new Date(d.getFullYear(),d.getMonth()+1,1)}
  function monthEnd(d){return new Date(d.getFullYear(),d.getMonth()+1,0)}

  function renderCalendar(){
    const list=$('scheduleList'),from=date($('scheduleFrom').value||S.startDate),days=Math.max(1,+$('scheduleDays').value||32),end=add(from,days-1),today=date(iso(new Date())),projected=end>today?projectedPlansUntil(end):new Map();
    list.innerHTML='';

    const legend=document.createElement('div');legend.className='calendar-legend';legend.innerHTML='<span>과목별 색상 일정</span><span>노랑: 복습</span><span>회색: 휴식</span><span>주황: 미룸</span>';
    list.appendChild(legend);

    for(let month=monthStart(from);month<=monthStart(end);month=nextMonth(month)){
      const section=document.createElement('section');section.className='month-calendar';section.id=`month-${month.getFullYear()}-${pad(month.getMonth()+1)}`;
      const title=document.createElement('div');title.className='month-title';title.textContent=`${month.getFullYear()}년 ${month.getMonth()+1}월`;section.appendChild(title);
      const weekdays=document.createElement('div');weekdays.className='calendar-weekdays';
      ['일','월','화','수','목','금','토'].forEach((w,i)=>{const x=document.createElement('div');x.className='calendar-weekday '+(i===0?'sun':i===6?'sat':'');x.textContent=w;weekdays.appendChild(x)});section.appendChild(weekdays);
      const grid=document.createElement('div');grid.className='calendar-grid';
      const first=monthStart(month),last=monthEnd(month),leading=first.getDay();
      for(let i=0;i<leading;i++){const empty=document.createElement('div');empty.className='calendar-day empty';grid.appendChild(empty)}
      for(let d=new Date(first);d<=last;d=add(d,1)){
        const key=iso(d),outside=d<from||d>end,plan=outside?{items:[],review:false,phase:'written'}:planForDate(d,today,projected),events=outside?[]:dayEvents(d,plan),cell=document.createElement('div');
        cell.className='calendar-day '+(d.getDay()===0?'sun ':d.getDay()===6?'sat ':'')+(key===iso(today)?'today ':'')+(key===selectedDate?'selected ':'')+(outside?'outside ':'')+(isRestWeekday(d)?'rest ':'')+(isManualPostponed(d)?'postponed ':'');
        cell.innerHTML=`<div class="day-number">${d.getDate()}</div>`;
        events.slice(0,3).forEach(e=>{const chip=document.createElement('span');chip.className='calendar-event '+(e.kind||'');chip.textContent=e.text;if(e.color){chip.style.background=e.color+'20';chip.style.color=e.color}cell.appendChild(chip)});
        if(events.length>3){const more=document.createElement('div');more.className='calendar-more';more.textContent=`+${events.length-3}개`;cell.appendChild(more)}
        if(!outside)cell.onclick=()=>openDate(key);
        grid.appendChild(cell);
      }
      const trailing=(7-(leading+last.getDate())%7)%7;
      for(let i=0;i<trailing;i++){const empty=document.createElement('div');empty.className='calendar-day empty';grid.appendChild(empty)}
      section.appendChild(grid);list.appendChild(section);
    }
  }

  schedule=function(){
    ensureTools();
    if(S.scheduleViewMode==='list')baseSchedule();
    else renderCalendar();
  };
  $('showSchedule').onclick=schedule;
  schedule();
})();