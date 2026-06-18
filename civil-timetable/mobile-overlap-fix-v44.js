(function(){
  const style=document.createElement('style');
  style.id='mobileOverlapFixV44';
  style.textContent=`
    html,body{width:100%;max-width:100%;overflow-x:hidden!important}
    body{padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right)}
    .app{padding-top:max(10px,env(safe-area-inset-top))!important;padding-bottom:calc(132px + env(safe-area-inset-bottom))!important;overflow-x:hidden!important}
    .hero,.card,.subject,.setting,.schedule,.risk-card,.install-box,.note-card{position:relative;z-index:0;max-width:100%!important;min-width:0!important;overflow-wrap:anywhere}
    .nav{z-index:80!important;bottom:max(12px,env(safe-area-inset-bottom))!important}
    .notify-toast{z-index:90!important;bottom:calc(106px + env(safe-area-inset-bottom))!important}
    #appBootV25{z-index:9999!important}
    .head{display:grid!important;grid-template-columns:minmax(0,1fr) auto;align-items:start!important;gap:10px!important;min-width:0!important}
    .head>*{min-width:0!important;max-width:100%!important}
    .head .badge,.head .chip,.head .risk-status{justify-self:end;max-width:48vw;white-space:normal!important;text-align:center;line-height:1.25}
    .risk-card .head{grid-template-columns:minmax(0,1fr) minmax(96px,auto)!important}
    .risk-grid,.summary,.stats-grid,.actions,.grid{min-width:0!important;max-width:100%!important}
    .risk-box,.summary>div,.stats-box,.stat{min-width:0!important;overflow:hidden!important}
    .risk-box b,.summary b,.stats-box b,.stat b{overflow-wrap:anywhere!important;word-break:keep-all!important;line-height:1.25!important}
    .subject>.row,.setting>.row,.schedule>.row,.estimate{display:grid!important;grid-template-columns:minmax(0,1fr) auto;align-items:start!important;gap:8px!important;min-width:0!important}
    .subject>.row>*,.setting>.row>*,.schedule>.row>*,.estimate>*{min-width:0!important;max-width:100%!important}
    .check{min-width:0!important;max-width:100%!important}
    .check span,.check small{min-width:0!important;max-width:100%!important}
    h1,h2,h3,p,b,strong,span,small,label,button,.muted,.notice,.carry-title{max-width:100%;overflow-wrap:anywhere;word-break:keep-all;line-height:1.32}
    @media(max-width:430px){
      .app{padding-left:max(8px,env(safe-area-inset-left))!important;padding-right:max(8px,env(safe-area-inset-right))!important}
      .hero .row{grid-template-columns:minmax(0,1fr)!important;gap:10px!important}
      .hero .dday{justify-self:start!important;text-align:left!important;max-width:100%!important;width:auto!important}
      .head{grid-template-columns:minmax(0,1fr)!important}
      .head .badge,.head .chip,.head .risk-status{justify-self:start!important;max-width:100%!important;margin-top:2px}
      .risk-card .head{grid-template-columns:minmax(0,1fr)!important}
      .subject>.row,.setting>.row,.schedule>.row,.estimate{grid-template-columns:minmax(0,1fr)!important}
      .subject>.row>b,.setting>.row>button,.schedule>.row>span,.estimate>b{justify-self:start!important;max-width:100%!important;text-align:left!important}
      .stats{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:6px!important}
      .stat{padding:9px 6px!important;text-align:center!important}
      .stat small{font-size:10px!important;line-height:1.2!important}
      .stat b{font-size:13px!important}
      .summary,.risk-grid,.stats-grid,.actions,.grid{grid-template-columns:minmax(0,1fr)!important}
    }
    @media(max-width:360px){
      .nav button{font-size:10px!important;padding-left:2px!important;padding-right:2px!important}
      .card{padding:11px!important}
      .check{grid-template-columns:24px minmax(0,1fr)!important}
      .check>small{grid-column:2!important;text-align:left!important;max-width:100%!important}
    }
  `;
  document.head.appendChild(style);
  function settle(){
    const nav=document.querySelector('.nav');
    if(nav)document.documentElement.style.setProperty('--civil-nav-height',Math.ceil(nav.getBoundingClientRect().height)+'px');
    document.querySelectorAll('.card,.subject,.setting,.schedule,.risk-card,.install-box,.note-card').forEach(el=>{el.style.maxWidth='100%';el.style.minWidth='0'});
  }
  const prev=window.render;
  if(typeof prev==='function'&&!prev.__mobileOverlapFixV44){
    window.render=function(){const r=prev.apply(this,arguments);requestAnimationFrame(settle);return r};
    window.render.__mobileOverlapFixV44=true;
  }
  window.addEventListener('resize',()=>requestAnimationFrame(settle));
  window.addEventListener('orientationchange',()=>setTimeout(settle,250));
  settle();
})();