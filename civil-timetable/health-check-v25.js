(function(){
  const boot=document.getElementById('appBootV25');
  const files=[
    'continuous-schedule-v26.js?v=45',
    'subject-cap-v27.js?v=45',
    'lecture-duration-v28.js?v=45',
    'lecture-duration-struct-v29.js?v=45',
    'lecture-duration-soil-v30.js?v=45',
    'lecture-duration-water-v31.js?v=45',
    'lecture-duration-core-v32.js?v=45',
    'lecture-duration-core-extra-v35.js?v=45',
    'lecture-duration-special-v43.js?v=45',
    'lecture-duration-practical-v37.js?v=45',
    'ui-overflow-v28.js?v=45',
    'mobile-overlap-fix-v44.js?v=45',
    'risk-date-fix-v45.js?v=45',
    'iphone-test-core-v25.js?v=45',
    'iphone-test-ui-v25.js?v=45'
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