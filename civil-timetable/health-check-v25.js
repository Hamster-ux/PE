(function(){
  const boot=document.getElementById('appBootV25');
  function finish(){if(boot)boot.remove()}
  function load(src,next){
    const script=document.createElement('script');
    script.src=src;
    script.onload=()=>next&&next();
    script.onerror=()=>{console.warn(src+' 불러오기 실패');next&&next()};
    document.body.appendChild(script);
  }
  load('continuous-schedule-v26.js?v=27',()=>{
    load('subject-cap-v27.js?v=27',()=>{
      load('iphone-test-core-v25.js?v=27',()=>{
        load('iphone-test-ui-v25.js?v=27',finish);
      });
    });
  });
  setTimeout(finish,12000);
})();