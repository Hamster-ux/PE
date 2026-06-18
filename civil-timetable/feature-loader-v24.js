(function(){
  const frame=document.getElementById('appFrame');
  const loading=document.getElementById('loading');
  const scripts=[
    'written-defaults-v16.js?v=24',
    'practical-align-v14.js?v=24',
    'course-loop-v17.js?v=24',
    'data-tools-goal-v18.js?v=24',
    'study-summary-v18.js?v=24',
    'calendar-view-v19.js?v=24',
    'risk-notify-v20.js?v=24',
    'theme-v21.js?v=24',
    'risk-contrast-v22.js?v=24',
    'auto-backup-v23.js?v=24',
    'home-install-v24.js?v=24'
  ];

  async function clearOldWorkers(){
    try{
      if('serviceWorker' in navigator){
        const regs=await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r=>r.unregister()));
      }
      if('caches' in window){
        const keys=await caches.keys();
        await Promise.all(keys.map(k=>caches.delete(k)));
      }
    }catch(e){console.warn('기존 캐시 정리 실패',e)}
  }

  function loadSequentially(doc,index){
    if(index>=scripts.length)return;
    const script=doc.createElement('script');
    script.src=scripts[index];
    script.onload=()=>loadSequentially(doc,index+1);
    script.onerror=()=>{console.warn(scripts[index]+' 불러오기 실패');loadSequentially(doc,index+1)};
    doc.body.appendChild(script);
  }

  clearOldWorkers();

  frame.addEventListener('load',()=>{
    loading.classList.add('hide');
    try{
      const doc=frame.contentDocument;
      if(doc)loadSequentially(doc,0);
    }catch(e){
      console.warn('추가 설정 적용 실패. 기본 앱은 계속 사용할 수 있습니다.',e);
    }
  });

  setTimeout(()=>loading.classList.add('hide'),6000);
})();