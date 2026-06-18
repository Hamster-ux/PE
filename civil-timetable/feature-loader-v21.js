(function(){
  const frame=document.getElementById('appFrame');
  const loading=document.getElementById('loading');

  function add(doc,src,next){
    const script=doc.createElement('script');
    script.src=src;
    script.onload=()=>next&&next();
    script.onerror=()=>{console.warn(src+' 불러오기 실패');next&&next()};
    doc.body.appendChild(script);
  }

  frame.addEventListener('load',()=>{
    loading.classList.add('hide');
    try{
      const doc=frame.contentDocument;
      if(!doc)return;
      add(doc,'written-defaults-v16.js?v=21',()=>
      add(doc,'practical-align-v14.js?v=21',()=>
      add(doc,'course-loop-v17.js?v=21',()=>
      add(doc,'data-tools-goal-v18.js?v=21',()=>
      add(doc,'study-summary-v18.js?v=21',()=>
      add(doc,'calendar-view-v19.js?v=21',()=>
      add(doc,'risk-notify-v20.js?v=21',()=>
      add(doc,'theme-v21.js?v=21'))))))));
    }catch(e){
      console.warn('추가 설정 적용 실패. 기본 앱은 계속 사용할 수 있습니다.',e);
    }
  });

  setTimeout(()=>loading.classList.add('hide'),6000);
})();