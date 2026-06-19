(function(){
  const STYLE_ID='calendarRestStyleV48';
  const SHEET_ID='calendarRestSheetV48';
  const list=$('scheduleList');
  let decorateQueued=false;

  if(!S.postponedDates||typeof S.postponedDates!=='object')S.postponedDates={};

  function manualValue(key){return S.postponedDates&&S.postponedDates[key]}
  function manualReason(key){
    const value=manualValue(key);
    return value&&typeof value==='object'&&value.reason?String(value.reason):'쉬는 날';
  }
  function escapeHtml(value){return String(value||'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;')}

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .calendar-day.calendar-rest-v48{background:#eef2f1!important;box-shadow:inset 0 0 0 1px #c8d2cf}
      .calendar-day.calendar-rest-v48.selected{box-shadow:inset 0 0 0 2px var(--primary)}
      .calendar-event.calendar-rest-v48{background:#dfe8e5!important;color:#42534e!important}
      .calendar-rest-overlay-v48{position:fixed;inset:0;z-index:999999;background:rgba(10,18,16,.48);display:flex;align-items:flex-end;justify-content:center;padding:14px;padding-bottom:calc(14px + env(safe-area-inset-bottom));backdrop-filter:blur(4px)}
      .calendar-rest-sheet-v48{width:min(100%,520px);max-height:min(84vh,620px);overflow:auto;background:var(--card,#fff);color:var(--text,#17201d);border-radius:24px;padding:20px;box-shadow:0 24px 70px rgba(0,0,0,.28)}
      .calendar-rest-sheet-v48 h3{margin:0;font-size:21px}.calendar-rest-sheet-v48 .sub{margin-top:6px;color:var(--muted);font-size:13px;line-height:1.55}.calendar-rest-sheet-v48 .field{margin-top:15px}
      .calendar-rest-sheet-v48 input{width:100%;min-height:48px;border:1px solid var(--line);border-radius:14px;padding:0 14px;background:var(--bg);color:var(--text);font:inherit;box-sizing:border-box}
      .calendar-rest-actions-v48{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:14px}.calendar-rest-actions-v48 button{min-height:48px;border-radius:14px;font-weight:850}.calendar-rest-actions-v48 .wide{grid-column:1/-1}.calendar-rest-actions-v48 .danger{background:#fff0f0;color:#b23a42;border:1px solid #f0c5c8}
      @media(max-width:420px){.calendar-rest-overlay-v48{padding:10px;padding-bottom:calc(10px + env(safe-area-inset-bottom))}.calendar-rest-sheet-v48{border-radius:22px;padding:17px}}
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

  function decorateToday(){
    if(!manualValue(selectedDate))return;
    const reason=manualReason(selectedDate),title=$('todayTitle'),badge=$('cycleBadge'),button=$('postponeBtn'),box=$('todayContent');
    if(title)title.textContent='쉬는 날';
    if(badge)badge.textContent=reason==='쉬는 날'?'개별 휴식':reason;
    if(button){button.textContent='쉬는 날 해제';button.disabled=false}
    if(box&&!box.querySelector('.calendar-rest-note-v48')){
      const note=document.createElement('div');
      note.className='notice calendar-rest-note-v48';
      note.innerHTML='<b>달력에서 지정한 쉬는 날</b><br>이날 일정은 건너뛰고 다음 공부일부터 그대로 이어집니다.';
      box.insertBefore(note,box.firstChild);
    }
  }

  function decorateCalendar(){
    decorateQueued=false;
    const help=document.querySelector('#calendarToolsV25 .calendar-help,#calendarToolsV19 .calendar-help');
    const helpText='날짜를 누르면 상세 시간표를 보거나 쉬는 날로 지정할 수 있습니다.';
    if(help&&help.textContent!==helpText)help.textContent=helpText;

    const legend=list&&list.querySelector('.calendar-legend');
    if(legend)legend.querySelectorAll('span').forEach(span=>{if(span.textContent.includes('주황'))span.textContent='회색 테두리: 개별 쉬는 날'});

    document.querySelectorAll('.calendar-day:not(.empty)').forEach(cell=>{
      if(cell.classList.contains('outside'))return;
      const key=dateKeyForCell(cell);
      if(!key)return;
      const manual=!!manualValue(key);
      cell.classList.toggle('calendar-rest-v48',manual);
      if(!manual)return;
      cell.classList.remove('postponed');
      let event=cell.querySelector('.calendar-event.postponed,.calendar-event.calendar-rest-v48');
      if(!event){event=document.createElement('span');cell.appendChild(event)}
      const className='calendar-event calendar-rest-v48';
      if(event.className!==className)event.className=className;
      const reason=manualReason(key),text=reason==='쉬는 날'?'쉬는 날':`휴식 · ${reason}`;
      if(event.textContent!==text)event.textContent=text;
    });

    if(list&&S.scheduleViewMode==='list')list.querySelectorAll('.schedule.postponed').forEach(row=>{
      row.classList.remove('postponed');row.classList.add('rest');
      row.querySelectorAll('span,.chip').forEach(el=>{if(el.textContent==='미룸')el.textContent='쉬는 날';if(el.textContent==='일정 전체 미룸')el.textContent='개별 쉬는 날'});
    });
  }

  function queueDecorate(){if(decorateQueued)return;decorateQueued=true;requestAnimationFrame(decorateCalendar)}
  function closeSheet(){const sheet=document.getElementById(SHEET_ID);if(sheet)sheet.remove()}
  function rerenderCalendar(){const button=$('showSchedule');if(button)button.click();else if(typeof schedule==='function')schedule()}

  function openDetail(key){
    closeSheet();selectedDate=key;render();decorateToday();
    document.querySelectorAll('.nav button,.view').forEach(x=>x.classList.remove('on'));
    const button=document.querySelector('.nav button[data-v="today"]');if(button)button.classList.add('on');
    const view=$('today');if(view)view.classList.add('on');scrollTo(0,0);
  }

  function toggleRest(key,reason){
    const d=date(key);
    if(isRestWeekday(d))return;
    if(manualValue(key)){
      delete S.postponedDates[key];save();closeSheet();render();rerenderCalendar();return;
    }
    if(d<date(S.startDate)){alert('공부 시작일 이후 날짜만 쉬는 날로 지정할 수 있어요.');return}
    if(typeof hasAnyChecksForDate==='function'&&hasAnyChecksForDate(d)){alert('이미 체크한 강의가 있는 날짜예요. 체크를 먼저 해제한 뒤 쉬는 날로 지정해 주세요.');return}
    S.postponedDates[key]={kind:'calendar-rest',reason:(reason||'').trim()||'쉬는 날',createdAt:new Date().toISOString()};
    save();closeSheet();render();decorateToday();rerenderCalendar();
  }

  function showSheet(key){
    closeSheet();
    const d=date(key),manual=!!manualValue(key),regular=isRestWeekday(d),reason=manual?manualReason(key):'',overlay=document.createElement('div');
    overlay.id=SHEET_ID;overlay.className='calendar-rest-overlay-v48';
    overlay.innerHTML=`<div class="calendar-rest-sheet-v48" role="dialog" aria-modal="true"><h3>${fmt(d)}</h3><div class="sub">${regular?'설정에서 지정한 정기 휴식일입니다.':manual?'현재 쉬는 날로 지정되어 있습니다.':'쉬는 날로 지정하면 이날 일정은 건너뛰고 다음 공부일부터 그대로 이어집니다.'}</div><div class="field"><input id="calendarRestReasonV48" maxlength="30" placeholder="메모 예: 가족여행, 약속" value="${escapeHtml(reason==='쉬는 날'?'':reason)}"></div><div class="calendar-rest-actions-v48"><button type="button" class="light" id="calendarRestDetailV48">상세 시간표</button><button type="button" class="${manual?'danger':'primary'}" id="calendarRestToggleV48" ${regular?'disabled':''}>${regular?'정기 휴식일':manual?'쉬는 날 해제':'쉬는 날 지정'}</button><button type="button" class="light wide" id="calendarRestCancelV48">닫기</button></div></div>`;
    overlay.addEventListener('click',event=>{if(event.target===overlay)closeSheet()});document.body.appendChild(overlay);
    $('calendarRestDetailV48').onclick=()=>openDetail(key);$('calendarRestToggleV48').onclick=()=>toggleRest(key,$('calendarRestReasonV48').value);$('calendarRestCancelV48').onclick=closeSheet;
  }

  function upgradeRangeOnce(){
    if(S.calendarRangeUpgradeV48)return;
    S.calendarRangeUpgradeV48=1;
    if(!Number(S.scheduleRangeDays)||Number(S.scheduleRangeDays)<180)S.scheduleRangeDays=365;
    save();
    const select=$('scheduleDays');
    if(select){
      select.value=String(S.scheduleRangeDays);
      if(select.value!==String(S.scheduleRangeDays)){
        const option=document.createElement('option');option.value=String(S.scheduleRangeDays);option.textContent=S.scheduleRangeDays+'일';select.appendChild(option);select.value=String(S.scheduleRangeDays);
      }
    }
    setTimeout(rerenderCalendar,0);
  }

  addStyle();
  document.addEventListener('click',event=>{
    const cell=event.target.closest&&event.target.closest('.calendar-day');
    if(!cell||cell.classList.contains('outside')||cell.classList.contains('empty'))return;
    const key=dateKeyForCell(cell);if(!key)return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();showSheet(key);
  },true);

  if(list&&'MutationObserver'in window)new MutationObserver(queueDecorate).observe(list,{childList:true,subtree:true});
  upgradeRangeOnce();queueDecorate();decorateToday();
})();