(function(){
  function test(){
    const out=[];
    out.push(['핵심 시간표',typeof render==='function'&&typeof schedule==='function']);
    try{localStorage.setItem('civilTest25','1');localStorage.removeItem('civilTest25');out.push(['데이터 저장',true])}catch(e){out.push(['데이터 저장',false])}
    out.push(['월별 달력',!!document.getElementById('calendarToolsV25')]);
    out.push(['자동 백업',!!window.civilBackupV25]);
    out.push(['완료 위험도',!!document.getElementById('examRiskCardV25')]);
    out.push(['홈 화면 안내',!!document.getElementById('homeInstallCardV24')]);
    return out;
  }
  function add(){
    const root=document.getElementById('subjectSettings');
    if(!root||document.getElementById('healthCardV25'))return;
    const box=document.createElement('div');box.className='setting';box.id='healthCardV25';
    box.innerHTML='<h3>앱 상태 점검</h3><div class="muted">아이폰 필수 기능 자동 확인</div>'+test().map(x=>'<div class="estimate"><span>'+x[0]+'</span><b style="color:'+(x[1]?'#198754':'#c83f49')+'">'+(x[1]?'정상':'확인 필요')+'</b></div>').join('')+'<button class="primary" id="runHealthV25" style="width:100%">다시 점검</button>';
    root.prepend(box);document.getElementById('runHealthV25').onclick=function(){render()};
  }
  const boot=document.getElementById('appBootV25');if(boot)boot.remove();
  if(typeof settings==='function'&&typeof render==='function'){const oldSettings=settings;settings=function(){oldSettings();add()};const oldRender=render;render=function(){oldRender();add()};render()}
})();