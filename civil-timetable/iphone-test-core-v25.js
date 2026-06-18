(function(){
  const RESULTS='civilIphoneTestsV25';
  const RELOAD='civilReloadProbeV25';
  const get=()=>{try{return JSON.parse(localStorage.getItem(RESULTS)||'{}')}catch{return{}}};
  const put=value=>localStorage.setItem(RESULTS,JSON.stringify(value));
  const set=(key,value)=>{const data=get();data[key]=value;put(data)};
  const ios=()=>/iphone|ipad|ipod/i.test(navigator.userAgent);
  const safari=()=>/^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);
  const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  function storage(){try{localStorage.setItem('civilStorageProbeV25','1');localStorage.removeItem('civilStorageProbeV25');return true}catch{return false}}
  function backup(){try{return!!window.civilBackupV25&&window.civilBackupV25.validate(S).ok}catch{return false}}
  function calendar(){return typeof schedule==='function'&&!!document.getElementById('calendarToolsV25')&&!!document.querySelector('#scheduleDays option[value="365"]')}
  function consumeReload(){try{const p=JSON.parse(localStorage.getItem(RELOAD)||'null');if(p&&Date.now()-p.time<120000){set('reloadPersistence',true);localStorage.removeItem(RELOAD)}}catch(e){}}
  async function workers(){try{if(!('serviceWorker'in navigator))return true;const regs=await navigator.serviceWorker.getRegistrations();if(regs.length)await Promise.all(regs.map(r=>r.unregister()));return true}catch{return false}}
  function notification(){if(!('Notification'in window))return'앱 안 알림';return Notification.permission==='granted'?'허용됨':Notification.permission==='denied'?'차단됨':'권한 필요'}
  function rows(workerClean){const r=get();return[
    {key:'safari',name:'Safari 새 탭',ok:ios()&&safari(),text:ios()&&safari()?'Safari 실행 중':'Safari에서 열기'},
    {key:'core',name:'핵심 시간표',ok:typeof render==='function'&&typeof schedule==='function',text:'화면·체크 기능'},
    {key:'storage',name:'데이터 저장',ok:storage(),text:'체크·설정 저장'},
    {key:'reloadPersistence',name:'재실행 저장 유지',ok:r.reloadPersistence===true,text:r.reloadPersistence?'새로고침 후 유지':'테스트 필요'},
    {key:'home',name:'홈 화면 실행',ok:standalone()||r.home===true,text:standalone()?'앱 실행 중':'수동 확인'},
    {key:'dark',name:'다크모드',ok:typeof matchMedia==='function',text:matchMedia('(prefers-color-scheme: dark)').matches?'현재 다크모드':'자동 전환 지원'},
    {key:'backup',name:'백업 검증',ok:backup(),text:'현재 데이터 검사'},
    {key:'calendar365',name:'달력 365일',ok:calendar()&&r.calendar365===true,text:r.calendar365?'12개월 이상 확인':'테스트 필요'},
    {key:'notification',name:'알림 기능',ok:'Notification'in window,text:notification()},
    {key:'worker',name:'구버전 캐시',ok:workerClean===true,text:workerClean?'정리 완료':'확인 중'},
    {key:'slowNetwork',name:'느린 인터넷',ok:r.slowNetwork===true,text:r.slowNetwork?'확인 완료':'수동 확인'}
  ]}
  consumeReload();
  window.civilIphoneTestV25={get,set,rows,workers,reloadKey:RELOAD};
})();