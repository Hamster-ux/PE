(function(){
  const STYLE_ID='calendarRestStyleV47';
  const SHEET_ID='calendarRestSheetV47';
  const list=$('scheduleList');
  let decorateQueued=false;

  if(!S.postponedDates||typeof S.postponedDates!=='object')S.postponedDates={};

  function manualValue(key){return S.postponedDates&&S.postponedDates[key]}
  function manualReason(key){
    const value=manualValue(key);
    return value&&typeof value==='object'&&value.reason?String(value.reason):'쉬는 날';
  }

  function escapeHtml(value){
    return String(value||'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  }

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .calendar-day.calendar-rest-v47{background:#eef2f1!important;box-shadow:inset 0 0 0 1px #c8d2cf}
      .calendar-day.calendar-rest-v47.selected{box-shadow:inset 0 0 0 2px var(--primary)}
      .calendar-event.calendar-rest-v47{background:#dfe8e5!important;color:#42534e!important}
      .calendar-rest-overlay-v47{position:fixed;inset:0;z-index:999999;background:rgba(10,18,16,.48);display:flex;align-items:flex-end;justify-content:center;padding:14px;padding-bottom:calc(14px + env(safe-area-inset-bottom));backdrop-filter:blur(4px)}
      .calendar-rest-sheet-v47{width:min(100%,520px);max-height:min(84vh,620px);overflow:auto;background:var(--card,#fff);color:var(--text,#17201d);border-radius:24px;padding:20px;box-shadow:0 24px 70px rgba(0,0,0,.28)}
      .calendar-rest-sheet-v47 h3{margin:0;font-size:21px}
      .calendar-rest-sheet-v47 .sub{margin-top:6px;color:var(--muted);font-size:13px;line-height:1.55}
      .calendar-rest-sheet-v47 .field{margin-top:15px}
      .calendar-rest-sheet-v47 input{width:100%;min-height:48px;border:1px solid var(--line);border-radius:14px;padding:0 14px;background:var(--bg);color:var(--text);font:inherit;box-sizing:border-box}
      .calendar-rest-actions-v47{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:14px}
      .calendar-rest-actions-v47 button{min-height:48px;border-radius:14px;font-weight:850}
      .calendar-rest-actions-v47 .wide{grid-column:1/-1}
      .calendar-rest-actions-v47 .danger{background:#fff0f0;color:#b23a42;border:1px solid #f0c5c8}
      @media(max-width:420px){.calendar-rest-overlay-v47{padding:10px;padding-bottom:calc(10px + env(safe-area-inset-bottom))}.calendar-rest-sheet-v47{border-radius:22px;padding:17px}}
    `;
    document.head.appendChild(style);
  }

  function dateKeyForCell(cell){
    if(cell.dataset.date)return cell.dataset.date;
    const section=cell.closest('.month-calendar');
    const match=section&&section.id&&section.id.match(/^month-(\d{4})-(\d{2})$/);
    const number=cell.querySelector('.day-number');
    if(!match||!number)return null;
    const key=`${match[1]}-${match[2]}-${pad(Number(number.textContent))}`;
    cell.dataset.date=key;
    return key;
  }

  function decorateCalendar(){
    decorateQueued=false;
    const help=document.querySelector('#calendarToolsV25 .calendar-help,#calendarToolsV19 .calendar-help');
    if(help)help.textContent='날짜를 누르면 상세 시간표를 보거나 쉬는 날로 지정할 수 있습니다.';

    const legend=list&&list.querySelector('.calendar-legend');
    if(legend){
      legend.querySelectorAll('span').forEach(span=>{
        if(span.textContent.includes('주황'))span.textContent='회색 테두리: 개별 쉬는 날';
      });
    }

    document.querySelectorAll('.calendar-day:not(.empty)').forEach(cell=>{
      if(cell.classList.contains('outside'))return;
      const key=dateKeyForCell(cell);
      if(!key)return;
      const manual=!!manualValue(key);
      cell.classList.toggle('calendar-rest-v47',manual);
      if(manual){
        cell.classList.remove('postponed');
        let event=cell.querySelector('.calendar-event.postponed,.calendar-event.calendar-rest-v47');
        if(!event){event=document.createElement('span');cell.appendChild(event)}
        event.className='calendar-event calendar-rest-v47';
        const reason=manualReason(key);
        event.textContent=reason==='쉬는 날'?'쉬는 날':`휴식 · ${reason}`;
      }
    });

    if(list&&S.scheduleViewMode==='list'){
      list.querySelectorAll('.schedule.postponed').forEach(row=>{
        row.classList.remove('postponed');
        row.classList.add('rest');
        row.querySelectorAll('span,.chip').forEach(el=>{
          if(el.textContent==='미룸')el.textContent='쉬는 날';
          if(el.textContent==='일정 전체 미룸')el.textContent='개별 쉬는 날';
        });
      });
    }
  }

  function queueDecorate(){
    if(decorateQueued)return;
    decorateQueued=true;
    requestAnimationFrame(decorateCalendar);
  }

  function closeSheet(){
    const sheet=document.getElementById(SHEET_ID);
    if(sheet)sheet.remove();
  }

  function openDetail(key){
    closeSheet();
    selectedDate=key;
    render();
    document.querySelectorAll('.nav button,.view').forEach(x=>x.classList.remove('on'));
    const button=document.querySelector('.nav button[data-v="today"]');
    if(button)button.classList.add('on');
    const view=$('today');
    if(view)view.classList.add('on');
    scrollTo(0,0);
  }

  function rerenderCalendar(){
    const button=$('showSchedule');
    if(button)button.click();
    else if(typeof schedule==='function')schedule();
  }

  function toggleRest(key,reason){
    const d=date(key);
    if(isRestWeekday(d))return;
    if(manualValue(key)){
      delete S.postponedDates[key];
      save();
      closeSheet();
      render();
      rerenderCalendar();
      return;
    }
    if(d<date(S.startDate)){
      alert('공부 시작일 이후 날짜만 쉬는 날로 지정할 수 있어요.');
      return;
    }
    if(typeof hasAnyChecksForDate==='function'&&hasAnyChecksForDate(d)){
      alert('이미 체크한 강의가 있는 날짜예요. 체크를 먼저 해제한 뒤 쉬는 날로 지정해 주세요.');
      return;
    }
    S.postponedDates[key]={kind:'calendar-rest',reason:(reason||'').trim()||'쉬는 날',createdAt:new Date().toISOString()};
    save();
    closeSheet();
    render();
    rerenderCalendar();
  }

  function showSheet(key){
    closeSheet();
    const d=date(key),manual=!!manualValue(key),regular=isRestWeekday(d),reason=manual?manualReason(key):'',overlay=document.createElement('div');
    overlay.id=SHEET_ID;
    overlay.className='calendar-rest-overlay-v47';
    overlay.innerHTML=`<div class="calendar-rest-sheet-v47" role="dialog" aria-modal="true"><h3>${fmt(d)}</h3><div class="sub">${regular?'설정에서 지정한 정기 휴식일입니다.':manual?'현재 쉬는 날로 지정되어 있습니다.':'쉬는 날로 지정하면 이날 일정은 건너뛰고 다음 공부일부터 그대로 이어집니다.'}</div><div class="field"><input id="calendarRestReasonV47" maxlength="30" placeholder="메모 예: 가족여행, 약속" value="${escapeHtml(reason==='쉬는 날'?'':reason)}"></div><div class="calendar-rest-actions-v47"><button type="button" class="light" id="calendarRestDetailV47">상세 시간표</button><button type="button" class="${manual?'danger':'primary'}" id="calendarRestToggleV47" ${regular?'disabled':''}>${regular?'정기 휴식일':manual?'쉬는 날 해제':'쉬는 날 지정'}</button><button type="button" class="light wide" id="calendarRestCancelV47">닫기</button></div></div>`;
    overlay.addEventListener('click',event=>{if(event.target===overlay)closeSheet()});
    document.body.appendChild(overlay);
    $('calendarRestDetailV47').onclick=()=>openDetail(key);
    $('calendarRestToggleV47').onclick=()=>toggleRest(key,$('calendarRestReasonV47').value);
    $('calendarRestCancelV47').onclick=closeSheet;
  }

  function upgradeRangeOnce(){
    if(S.calendarRangeUpgradeV47)return;
    S.calendarRangeUpgradeV47=1;
    if(!Number(S.scheduleRangeDays)||Number(S.scheduleRangeDays)<180)S.scheduleRangeDays=365;
    save();
    const select=$('scheduleDays');
    if(select){
      select.value=String(S.scheduleRangeDays);
      if(select.value!==String(S.scheduleRangeDays)){
        const option=document.createElement('option');
        option.value=String(S.scheduleRangeDays);
        option.textContent=S.scheduleRangeDays+'일';
        select.appendChild(option);
        select.value=String(S.scheduleRangeDays);
      }
    }
    setTimeout(rerenderCalendar,0);
  }

  addStyle();

  document.addEventListener('click',event=>{
    const cell=event.target.closest&&event.target.closest('.calendar-day');
    if(!cell||cell.classList.contains('outside')||cell.classList.contains('empty'))return;
    const key=dateKeyForCell(cell);
    if(!key)return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    showSheet(key);
  },true);

  if(list&&'MutationObserver'in window){
    new MutationObserver(queueDecorate).observe(list,{childList:true,subtree:true});
  }

  upgradeRangeOnce();
  queueDecorate();
})();