(function(){
  if(typeof S.autoDistributeOverdue!=='boolean')S.autoDistributeOverdue=true;
  if(!Number.isFinite(Number(S.overdueDailyLimit)))S.overdueDailyLimit=2;
  if(!Number.isFinite(Number(S.summaryWeekOffset)))S.summaryWeekOffset=0;
  save();

  const baseCarry=carry;
  const baseInfo=info;

  function overduePool(){
    const groups=baseCarry(date(iso(new Date())))||[],seen=new Set(),out=[];
    groups.forEach(g=>g.tasks.forEach(t=>{
      const k=taskKey(g.s,t);
      if(!isTaskChecked(g.s,t)&&!seen.has(k)){seen.add(k);out.push({s:g.s,t,key:k,date:g.date})}
    }));
    return out;
  }

  function grouped(items){
    const map=new Map();
    items.forEach(x=>{
      if(!map.has(x.s.id))map.set(x.s.id,{s:x.s,date:x.date||new Date(),tasks:[]});
      map.get(x.s.id).tasks.push(x.t);
    });
    return[...map.values()];
  }

  function todayDistributed(){
    if(!S.autoDistributeOverdue)return baseCarry(date(iso(new Date())))||[];
    const limit=Math.max(1,Math.min(5,Number(S.overdueDailyLimit)||2));
    return grouped(overduePool().slice(0,limit));
  }

  info=function(d){
    const result=baseInfo(d);
    if(!S.autoDistributeOverdue||iso(d)!==iso(new Date()))return result;
    const oldCount=(result.co||[]).reduce((a,x)=>a+x.tasks.length,0),co=todayDistributed(),newCount=co.reduce((a,x)=>a+x.tasks.length,0);
    return{...result,co,total:Math.max(0,result.total-oldCount)+newCount};
  };

  function nextCatchupDates(pool){
    const limit=Math.max(1,Math.min(5,Number(S.overdueDailyLimit)||2)),days=[];
    let d=date(iso(new Date())),index=0,guard=0;
    while(index<pool.length&&guard<180){
      if(!isSkipped(d)){
        const phase=phaseForDate(d),cycle=phase==='written'?writtenCycle(d):practicalCycle(d);
        if(cycle!==3){
          const items=pool.slice(index,index+limit);days.push({date:new Date(d),items});index+=items.length;
        }
      }
      d=add(d,1);guard++;
    }
    return days;
  }

  function weekBoundsOffset(offset){
    const base=add(new Date(),offset*7),day=base.getDay(),monday=add(base,-((day+6)%7)),sunday=add(monday,6);
    return{monday:date(iso(monday)),sunday:date(iso(sunday))};
  }

  function weekData(offset){
    const{monday,sunday}=weekBoundsOffset(offset),counts={},dates=new Set(),entries=[];
    Object.entries(S.checks||{}).forEach(([k,v])=>{
      if(!v||!v.studyDate||v.autoSkipped)return;
      const d=date(v.studyDate);
      if(d<monday||d>sunday)return;
      const id=k.split(':')[1];counts[id]=(counts[id]||0)+1;dates.add(v.studyDate);entries.push({k,id});
    });
    const reviews=Object.keys(S.reviews||{}).filter(k=>{
      const parts=k.split(':'),d=parts[1]&&date(parts[1]);return d&&d>=monday&&d<=sunday;
    }).length;
    const topId=Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0],subject=([...S.subjects,...S.practicalSubjects]).find(s=>s.id===topId);
    return{monday,sunday,total:entries.length,reviews,studyDays:dates.size,counts,top:subject?`${subject.name} ${counts[topId]}강`:'-',minutes:Math.round(entries.length*27)};
  }

  function nextWeekPlanned(sunday){
    const from=add(sunday,1),to=add(sunday,7),plans=projectedPlansUntil(to);let count=0;
    for(let d=new Date(from);d<=to;d=add(d,1)){
      const p=plans.get(iso(d));if(p)p.items.forEach(x=>count+=x.tasks.length);
    }
    return count;
  }

  function weekCardHtml(data,previous){
    const delta=data.total-previous.total,deltaText=delta>0?`지난주보다 ${delta}강 증가`:delta<0?`지난주보다 ${Math.abs(delta)}강 감소`:'지난주와 동일';
    const hours=data.minutes>=60?`${Math.floor(data.minutes/60)}시간 ${data.minutes%60}분`:`${data.minutes}분`;
    const subjectChips=Object.entries(data.counts).sort((a,b)=>b[1]-a[1]).map(([id,n])=>{const s=[...S.subjects,...S.practicalSubjects].find(x=>x.id===id);return s?`<span class="chip" style="background:${s.color}18;color:${s.color}">${s.name} ${n}강</span>`:''}).join('');
    return`<div class="row"><button type="button" class="light" id="prevWeekV18">‹</button><div style="text-align:center"><b>${shortFmt(data.monday)} ~ ${shortFmt(data.sunday)}</b><div class="muted">${deltaText}</div></div><button type="button" class="light" id="nextWeekV18">›</button></div><div class="stats-grid"><div class="stats-box"><small>완료 강의</small><b>${data.total}강</b></div><div class="stats-box"><small>공부한 날</small><b>${data.studyDays}일</b></div><div class="stats-box"><small>예상 공부시간</small><b>${hours}</b></div><div class="stats-box"><small>가장 많이 공부</small><b style="font-size:14px">${data.top}</b></div></div>${data.reviews?`<div class="notice">복습 체크 ${data.reviews}개 완료</div>`:''}<div class="chips" style="margin-top:9px">${subjectChips||'<span class="muted">완료 기록이 아직 없어요.</span>'}</div><div class="notice"><b>다음 주 예상</b><br>현재 계획 기준 약 ${nextWeekPlanned(data.sunday)}강이 배정됩니다.</div>`;
  }

  const originalSelected=selected;
  selected=function(){
    originalSelected();
    if(!S.autoDistributeOverdue||selectedDate!==iso(new Date()))return;
    const pool=overduePool(),shown=todayDistributed().reduce((a,x)=>a+x.tasks.length,0),box=$('todayContent');
    if(pool.length>shown&&box){
      const n=document.createElement('div');n.className='notice';
      n.innerHTML=`<b>밀린 일정 자동 분산 중</b><br>밀린 ${pool.length}강 중 오늘은 ${shown}강만 먼저 배정하고 나머지는 다음 공부일로 나눕니다.`;
      box.insertBefore(n,box.firstChild);
    }
  };

  const originalRecords=records;
  records=function(){
    originalRecords();
    const view=$('records');
    ['weeklySummaryCardV18','catchupPlanCardV18'].forEach(id=>{const x=$(id);if(x)x.remove()});

    const offset=Number(S.summaryWeekOffset)||0,data=weekData(offset),previous=weekData(offset-1),weekly=document.createElement('div');
    weekly.className='card';weekly.id='weeklySummaryCardV18';
    weekly.innerHTML=`<div class="head"><div><h2>완료 주간 요약</h2><div class="muted">주별 완료량과 과목별 학습 기록</div></div></div>${weekCardHtml(data,previous)}`;
    view.insertBefore(weekly,view.children[1]||null);
    $('prevWeekV18').onclick=()=>{S.summaryWeekOffset=(Number(S.summaryWeekOffset)||0)-1;save();render()};
    $('nextWeekV18').onclick=()=>{S.summaryWeekOffset=Math.min(0,(Number(S.summaryWeekOffset)||0)+1);save();render()};

    const pool=overduePool(),catchup=document.createElement('div');catchup.className='card';catchup.id='catchupPlanCardV18';
    const days=nextCatchupDates(pool).slice(0,10);
    catchup.innerHTML='<div class="head"><div><h2>밀린 일정 자동 분산</h2><div class="muted">하루에 몰리지 않도록 다음 공부일에 나눠 배정합니다.</div></div></div><div id="catchupListV18"></div>';
    const list=catchup.querySelector('#catchupListV18');
    if(!pool.length)list.innerHTML='<div class="empty">현재 밀린 강의가 없어요.</div>';
    else days.forEach(day=>{
      const x=document.createElement('div');x.className='schedule';
      x.innerHTML=`<div class="row"><b>${fmt(day.date)}</b><span>이월 ${day.items.length}강</span></div><div class="chips">${day.items.map(i=>`<span class="chip" style="background:${i.s.color}18;color:${i.s.color}">${i.s.name} · ${taskLabel(i.t)}</span>`).join('')}</div>`;list.appendChild(x);
    });
    view.appendChild(catchup);
    const overdueEl=$('overdueCount');if(overdueEl)overdueEl.textContent=pool.length+'강';
  };

  const originalSettings=settings;
  settings=function(){
    originalSettings();
    const root=$('subjectSettings'),box=document.createElement('div');box.className='setting';box.id='overdueSettingsV18';
    box.innerHTML=`<div class="row"><div><h3>밀린 일정 자동 분산</h3><div class="muted">밀린 강의를 하루에 정한 개수만큼만 추가 배정합니다.</div></div><button type="button" id="toggleOverdueV18" class="${S.autoDistributeOverdue?'primary':'light'}">${S.autoDistributeOverdue?'사용 중':'사용 안 함'}</button></div><div class="field"><label>하루 최대 이월 강의 수</label><select id="overdueLimitV18"><option value="1" ${Number(S.overdueDailyLimit)===1?'selected':''}>1강</option><option value="2" ${Number(S.overdueDailyLimit)===2?'selected':''}>2강</option><option value="3" ${Number(S.overdueDailyLimit)===3?'selected':''}>3강</option><option value="4" ${Number(S.overdueDailyLimit)===4?'selected':''}>4강</option><option value="5" ${Number(S.overdueDailyLimit)===5?'selected':''}>5강</option></select></div>`;
    root.prepend(box);
    $('toggleOverdueV18').onclick=()=>{S.autoDistributeOverdue=!S.autoDistributeOverdue;save();render()};
    $('overdueLimitV18').onchange=e=>{S.overdueDailyLimit=Number(e.target.value)||2;save();render()};
  };

  render();
})();