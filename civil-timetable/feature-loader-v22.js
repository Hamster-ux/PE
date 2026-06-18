(function(){
  const frame=document.getElementById('appFrame');
  const loading=document.getElementById('loading');
  const scripts=[
    'written-defaults-v16.js?v=22',
    'practical-align-v14.js?v=22',
    'course-loop-v17.js?v=22',
    'data-tools-goal-v18.js?v=22',
    'study-summary-v18.js?v=22',
    'calendar-view-v19.js?v=22',
    'risk-notify-v20.js?v=22',
    'theme-v21.js?v=22',
    'risk-contrast-v22.js?v=22'
  ];

  function loadSequentially(doc,index){
    if(index>=scripts.length)return;
    const script=doc.createElement('script');
    script.src=scripts[index];
    script.onload=()=>loadSequentially(doc,index+1);
    script.onerror=()=>{console.warn(scripts[index]+' 불러오기 실패');loadSequentially(doc,index+1)};
    doc.body.appendChild(script);
  }

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