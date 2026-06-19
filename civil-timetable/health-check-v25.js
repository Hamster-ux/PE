(function(){
  const boot=document.getElementById('appBootV25');
  const files=[
    'continuous-schedule-v26.js?v=47',
    'subject-cap-v27.js?v=47',
    'lecture-duration-v28.js?v=47',
    'lecture-duration-struct-v29.js?v=47',
    'lecture-duration-soil-v30.js?v=47',
    'lecture-duration-water-v31.js?v=47',
    'lecture-duration-core-v32.js?v=47',
    'lecture-duration-core-extra-v35.js?v=47',
    'lecture-duration-special-v43.js?v=47',
    'lecture-duration-practical-v37.js?v=47',
    'ui-overflow-v28.js?v=47',
    'mobile-overlap-fix-v44.js?v=47',
    'risk-date-fix-v45.js?v=47',
    'calendar-rest-v47.js?v=47',
    'iphone-test-core-v25.js?v=47',
    'iphone-test-ui-v25.js?v=47'
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