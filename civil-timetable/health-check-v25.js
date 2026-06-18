(function(){
  const boot=document.getElementById('appBootV25');if(boot)boot.remove();
  function load(src,next){const s=document.createElement('script');s.src=src;s.onload=next;s.onerror=()=>console.warn(src+' 불러오기 실패');document.body.appendChild(s)}
  load('iphone-test-core-v25.js?v=25',()=>load('iphone-test-ui-v25.js?v=25'));
})();