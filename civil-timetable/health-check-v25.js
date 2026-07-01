(function(){
  const boot=document.getElementById('appBootV25');
  const files=[
    'continuous-schedule-v26.js?v=49',
    'subject-cap-v27.js?v=49',
    'lecture-duration-v28.js?v=49',
    'lecture-duration-struct-v29.js?v=49',
    'lecture-duration-soil-v30.js?v=49',
    'lecture-duration-water-v31.js?v=49',
    'lecture-duration-core-v32.js?v=49',
    'lecture-duration-core-extra-v35.js?v=49',
    'lecture-duration-special-v43.js?v=49',
    'lecture-duration-practical-v37.js?v=49',
    'daily-plan-lock-v49.js?v=49',
    'ui-overflow-v28.js?v=49',
    'mobile-overlap-fix-v44.js?v=49',
    'risk-date-fix-v45.js?v=49',
    'calendar-rest-v48.js?v=49',
    'iphone-test-core-v25.js?v=49',
    'iphone-test-ui-v25.js?v=49'
  ];
  function finish(){if(boot)boot.remove()}
  function next(index){
    if(index>=files.length){finish();return}
    const script=document.createElement('script');
    script.src=files[index];
    script.onload=()=>next(index+1);
    script.onerror=()=>{console.warn(files[index]+' 불러오기 실패');next(index+1)};
    document.body.appendChild(script);
  }
  next(0);
  setTimeout(finish,12000);
})();