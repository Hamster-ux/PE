(function(){
  const STYLE_ID='calendarRestStyleV46';
  const SHEET_ID='calendarRestSheetV46';

  if(!S.postponedDates||typeof S.postponedDates!=='object')S.postponedDates={};

  function manualValue(key){return S.postponedDates&&S.postponedDates[key]}
  function manualReason(key){
    const value=manualValue(key);
    if(value&&typeof value==='object'&&value.reason)return String(value.reason);
    return '쉬는 날';
  }

  function addStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .calendar-day.calendar-rest-v46{background:#eef2f1!important;box-shadow:inset 0 0 0 1px #c8d2cf}
      .calendar-day.calendar-rest-v46.selected{box-shadow:inset 0 0 0 2px var(--primary)}
      .calendar-event.calendar-rest-v46{background:#dfe8e5!important;color:#42534e!important}
      .calendar-rest-overlay-v46{position:fixed;inset:0;z-index:99998;background:rgba(10,18,16,.42);display:flex;align-items:flex-end;justify-content:center;padding:16px;padding-bottom:calc(16px + env(safe-area-inset-bottom));backdrop-filter:blur(3px)}
      .calendar-rest-sheet-v46{width:min(100%,520px);background:var(--card,#fff);color:var(--text,#17201d);border-radius:24px;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.25)}
      .calendar-rest-sheet-v46 h3{margin:0;font-size:21px}
      .calendar-rest-sheet-v46 .sub{margin-top:5px;color:var(--muted);font-size:13px;line-height:1.5}
      .calendar-rest-sheet-v46 .field{margin-top:15px}
      .calendar-rest-sheet-v46 input{width:100%;min-height:48px;border:1px solid var(--line);border-radius:14px;padding:0 14px;background:var(--bg);color:var(--text);font:inherit;box-sizing:border-box}
      .calendar-rest-actions-v46{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:14px}
      .calendar-rest-actions-v46 button{min-height:48px;border-radius:14px;font-weight:850}
      .calendar-rest-actions-v46 .wide{grid-column:1/-1}
      .calendar-rest-actions-v46 .danger{background:#fff0f0;color:#b23a42;border:1px solid #f0c5c8}
      @media(max-width:420px){.calendar-rest-overlay-v46{padding:10px;padding-bottom:calc(10px + env(safe-area-inset-bottom))}.calendar-rest-sheet-v46{border-radius:22px;padding:17px}}
    `;
    document.head.appendChild(style);
  }

  function dateKeyForCell(cell){
    const section=cell.closest('.month-calendar');
    const match=section&&section.id&&section.id.match(/^month-(\d{4})-(\d{2})$/);
    const number=cell.querySelector('.day-number');
    if(!match||!number)return null;
    return`${match[1]}-${match[2]}-${pad(Number(number.textContent))}`;
  }

  function decorateCalendar(){
    const help=document.querySelector('#calendarToolsV19 .calendar-help');
    if(help)help.textContent='날짜를 누르면 상세 시간표를 보거나 쉬는 날로 지정할 수 있습니다.';

    document.querySelectorAll('.calendar-day:not(.empty)').forEach(cell=>{
      if(cell.classList.contains('outside'))return;
      const key=dateKeyForCell(cell);
      if(!key)return;
      cell.dataset.date=key;
      const manual=!!manualValue(key);
      cell.classList.toggle('calendar-rest-v46',manual);
      if(manual){
        cell.classList.remove('postponed');
        let event=cell.querySelector('.calendar-event.postponed,.calendar-event.calendar-rest-v46');
        if(!event){
          event=document.createElement('span');
          cell.appendChild(event);
        }
        event.className='calendar-event calendar-rest-v46';
        const reason=manualReason(key);
        event.textContent=reason==='쉬는 날'?'쉬는 날':`휴식 · ${reason}`;
      }
    });

    const list=$('scheduleList');
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

  function toggleRest(key,reason){
    const d=date(key);
    if(isRestWeekday(d))return;
    if(manualValue(key)){
      delete S.postponedDates[key];
      save();
      closeSheet();
      render();
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
  }

  function showSheet(key){
    closeSheet();
    const d=date(key),manual=!!manualValue(key),regular=isRestWeekday(d),overlay=document.createElement('div');
    overlay.id=SHEET_ID;
    overlay.className='calendar-rest-overlay-v46';
    const reason=manual?manualReason(key):'';
    overlay.innerHTML=`<div class="calendar-rest-sheet-v46" role="dialog" aria-modal="true"><h3>${fmt(d)}</h3><div class="sub">${regular?'설정에서 지정한 정기 휴식일입니다.':manual?'현재 쉬는 날로 지정되어 있습니다.':'쉬는 날로 지정하면 이날 일정은 건너뛰고 다음 날부터 이어서 배정됩니다.'}</div><div class="field"><input id="calendarRestReasonV46" maxlength="30" placeholder="메모 예: 가족여행, 약속" value="${reason==='쉬는 날'?'':reason.replaceAll('&','&amp;').replaceAll('"','&quot;')}"></div><div class="calendar-rest-actions-v46"><button type="button" class="light" id="calendarRestDetailV46">상세 시간표</button><button type="button" class="${manual?'danger':'primary'}" id="calendarRestToggleV46" ${regular?'disabled':''}>${regular?'정기 휴식일':manual?'쉬는 날 해제':'쉬는 날 지정'}</button><button type="button" class="light wide" id="calendarRestCancelV46">닫기</button></div></div>`;
    overlay.addEventListener('click',event=>{if(event.target===overlay)closeSheet()});
    document.body.appendChild(overlay);
    document.getElementById('calendarRestDetailV46').onclick=()=>openDetail(key);
    document.getElementById('calendarRestToggleV46').onclick=()=>toggleRest(key,document.getElementById('calendarRestReasonV46').value);
    document.getElementById('calendarRestCancelV46').onclick=closeSheet;
  }

  addStyle();

  document.addEventListener('click',event=>{
    const cell=event.target.closest&&event.target.closest('.calendar-day[data-date]');
    if(!cell||cell.classList.contains('outside')||cell.classList.contains('empty'))return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    showSheet(cell.dataset.date);
  },true);

  const originalSchedule=window.schedule;
  window.schedule=function(){
    const result=originalSchedule.apply(this,arguments);
    decorateCalendar();
    return result;
  };

  const originalSelected=window.selected;
  window.selected=function(){
    const result=originalSelected.apply(this,arguments);
    const value=manualValue(selectedDate);
    if(value){
      const reason=manualReason(selectedDate);
      const title=$('todayTitle'),badge=$('cycleBadge'),button=$('postponeBtn'),box=$('todayContent');
      if(title)title.textContent='쉬는 날';
      if(badge)badge.textContent=reason==='쉬는 날'?'개별 휴식':reason;
      if(button){button.textContent='쉬는 날 해제';button.disabled=false}
      if(box&&!box.querySelector('.calendar-rest-note-v46')){
        const note=document.createElement('div');
        note.className='notice calendar-rest-note-v46';
        note.innerHTML='<b>달력에서 지정한 쉬는 날</b><br>이날 일정은 건너뛰고 다음 공부일부터 그대로 이어집니다.';
        box.insertBefore(note,box.firstChild);
      }
    }
    return result;
  };

  decorateCalendar();
})();