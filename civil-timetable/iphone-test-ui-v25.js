(function(){
  let workerClean=null;
  const api=window.civilIphoneTestV25;
  if(!api)return;

  function manualHTML(){
    const r=api.get();
    return[
      ['home','홈 화면 아이콘으로 앱 실행 확인'],
      ['darkManual','아이폰 다크모드에서 글씨 확인'],
      ['backupManual','백업 생성 후 미리보기 확인'],
      ['notificationManual','알림 테스트 버튼 확인'],
      ['slowNetwork','느린 인터넷에서도 화면이 열린 것 확인']
    ].map(([key,label])=>`<label class="check ${r[key]?'on':''}" style="margin-top:7px"><input type="checkbox" data-manual="${key}" ${r[key]?'checked':''}><span class="box">${r[key]?'✓':''}</span><span>${label}</span></label>`).join('');
  }

  function addCard(){
    const root=document.getElementById('subjectSettings');
    if(!root||document.getElementById('iphoneTestCardV25'))return;
    const rows=api.rows(workerClean),passed=rows.filter(x=>x.ok).length,box=document.createElement('div');
    box.className='setting';box.id='iphoneTestCardV25';
    box.innerHTML=`<div class="row"><div><h3>아이폰 실사용 점검</h3><div class="muted">Safari·저장·달력·백업·알림을 실제 사용 기준으로 확인합니다.</div></div><span class="chip">${passed}/${rows.length} 정상</span></div><div style="margin-top:8px">${rows.map(x=>`<div class="estimate"><span>${x.name}<small class="muted" style="display:block">${x.text}</small></span><b style="color:${x.ok?'#198754':'#c83f49'}">${x.ok?'정상':'확인'}</b></div>`).join('')}</div><div class="actions"><button class="primary" id="reloadProbeV25">저장 유지 테스트</button><button class="light" id="calendarProbeV25">달력 365일 테스트</button></div><div class="actions"><button class="primary" id="notificationProbeV25">알림 테스트</button><button class="light" id="refreshIphoneTestV25">다시 점검</button></div><div class="carry-title"><b>직접 확인 항목</b><div class="muted">확인한 항목은 저장됩니다.</div>${manualHTML()}</div>`;
    root.prepend(box);

    document.getElementById('reloadProbeV25').onclick=()=>{localStorage.setItem(api.reloadKey,JSON.stringify({time:Date.now()}));location.reload()};
    document.getElementById('calendarProbeV25').onclick=()=>{
      S.scheduleViewMode='calendar';S.scheduleRangeDays=365;save();
      document.getElementById('scheduleDays').value='365';schedule();
      api.set('calendar365',document.querySelectorAll('.month-calendar').length>=12);
      document.querySelectorAll('.nav button,.view').forEach(x=>x.classList.remove('on'));
      const nav=document.querySelector('.nav button[data-v="schedule"]');if(nav)nav.classList.add('on');document.getElementById('schedule').classList.add('on');scrollTo(0,0);
    };
    document.getElementById('notificationProbeV25').onclick=()=>{const button=document.getElementById('testReminderV25');if(button)button.click();else alert('알림 설정에서 권한 요청 후 다시 테스트해 주세요.')};
    document.getElementById('refreshIphoneTestV25').onclick=async()=>{workerClean=await api.workers();render()};
    box.querySelectorAll('[data-manual]').forEach(input=>input.onchange=()=>{api.set(input.dataset.manual,input.checked);render()});
  }

  api.workers().then(value=>{workerClean=value;try{render()}catch(e){}});
  const oldSettings=settings;settings=function(){oldSettings();addCard()};
  const oldRender=render;render=function(){oldRender();addCard()};
  render();
})();