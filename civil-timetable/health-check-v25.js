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
  load('continuous-schedule-v26.js?v=30',()=>{
    load('subject-cap-v27.js?v=30',()=>{
      load('lecture-duration-v28.js?v=30',()=>{
        load('lecture-duration-struct-v29.js?v=30',()=>{
          load('lecture-duration-soil-v30.js?v=30',()=>{
            load('ui-overflow-v28.js?v=30',()=>{
              load('iphone-test-core-v25.js?v=30',()=>{
                load('iphone-test-ui-v25.js?v=30',finish);
              });
            });
          });
        });
      });
    });
  });
  setTimeout(finish,12000);
})();