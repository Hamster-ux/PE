(function(){
  const style=document.createElement('style');
  style.id='uiOverflowStyleV28';
  style.textContent=`
    html,body{width:100%;max-width:100%;overflow-x:hidden!important}
    body{padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right)}
    .app,.view,.card,.subject,.setting,.schedule,.note-card,.install-box,.risk-card,#subjectSettings,#scheduleList,#todayContent,#progress,#notes,#estimates{box-sizing:border-box;min-width:0!important;max-width:100%!important}
    .app{width:100%!important;overflow-x:clip;padding-left:max(7px,env(safe-area-inset-left));padding-right:max(7px,env(safe-area-inset-right))}
    .row,.head,.prow,.estimate{min-width:0!important;max-width:100%;flex-wrap:wrap}
    .row>*,.head>*,.prow>*,.estimate>*{min-width:0!important;max-width:100%}
    h1,h2,h3,p,b,strong,span,small,label,.muted,.notice,.carry-title,.chip,.badge,.risk-status,.notification-state,.pwa-state-v23,.install-state{overflow-wrap:anywhere;word-break:keep-all}
    button,input,select,textarea{box-sizing:border-box;min-width:0!important;max-width:100%!important}
    button{white-space:normal!important;overflow-wrap:anywhere;line-height:1.25;padding-left:10px;padding-right:10px}
    input,select,textarea{width:100%}
    .grid,.actions,.summary,.stats,.stats-grid,.risk-grid,.calendar-tools,.date-tools,.rest-days{min-width:0!important;max-width:100%;grid-template-columns:repeat(2,minmax(0,1fr))}
    .stats{grid-template-columns:repeat(3,minmax(0,1fr))}
    .date-tools{grid-template-columns:42px minmax(0,1fr) 42px}
    .calendar-tools{grid-template-columns:repeat(2,minmax(0,1fr))!important}
    .calendar-tools .today-month{grid-column:1/-1!important;width:100%}
    .risk-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
    .risk-box{min-width:0!important;overflow:hidden}
    .risk-box b{display:block;max-width:100%;font-size:clamp(14px,4vw,18px)!important;overflow-wrap:anywhere}
    .chip,.badge,.risk-status{max-width:100%;white-space:normal!important;text-align:center}
    .subject>.row,.setting>.row,.schedule>.row{display:grid!important;grid-template-columns:minmax(0,1fr) auto;align-items:start}
    .subject>.row>div,.setting>.row>div,.schedule>.row>div{min-width:0}
    .subject>.row>b,.setting>.row>button,.schedule>.row>span{justify-self:end;max-width:min(46%,180px)}
    .check{display:grid!important;grid-template-columns:24px minmax(0,1fr) auto;align-items:center;column-gap:10px;row-gap:4px;min-width:0!important}
    .check input{display:none!important}
    .check .box{grid-column:1;min-width:24px}
    .check>span:nth-of-type(2){grid-column:2;min-width:0!important;overflow-wrap:anywhere}
    .check>small{grid-column:3;min-width:0;max-width:92px;text-align:right;white-space:normal}
    .actions{grid-template-columns:repeat(2,minmax(0,1fr))!important}
    .actions>button{width:100%}
    .estimate{display:grid!important;grid-template-columns:minmax(0,1fr) auto;align-items:start}
    .estimate>b{justify-self:end;text-align:right;max-width:46%}
    .hero .row{display:grid!important;grid-template-columns:minmax(0,1fr) auto;align-items:start}
    .hero .dday{min-width:0;max-width:42vw;overflow-wrap:anywhere}
    .nav{box-sizing:border-box;width:min(600px,calc(100% - 18px - env(safe-area-inset-left) - env(safe-area-inset-right)))!important;grid-template-columns:repeat(4,minmax(0,1fr))!important}
    .nav button{min-width:0;padding:8px 4px;font-size:clamp(11px,3.2vw,14px)}
    .month-calendar,.calendar-grid{min-width:0!important;max-width:100%;overflow:hidden}
    .calendar-day{min-width:0!important}
    .calendar-event{max-width:100%}
    table{width:100%;max-width:100%;table-layout:fixed}
    th,td{overflow-wrap:anywhere;word-break:break-word}
    @media(max-width:480px){
      .card{padding:12px!important;border-radius:17px!important}
      .hero{padding:15px!important}
      .hero .row{grid-template-columns:minmax(0,1fr) auto!important;gap:8px}
      .hero h1{font-size:clamp(22px,7vw,27px)!important}
      .hero .dday{font-size:clamp(18px,6vw,23px)!important;max-width:38vw}
      .summary,.risk-grid,.stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      .setting>.row{grid-template-columns:minmax(0,1fr)!important}
      .setting>.row>button,.setting>.row>.chip{justify-self:stretch!important;max-width:100%!important;width:100%;margin-top:6px}
      .schedule>.row{grid-template-columns:minmax(0,1fr) auto!important}
      .schedule>.row>span{max-width:42vw}
    }
    @media(max-width:370px){
      .grid,.actions,.summary,.risk-grid,.stats-grid{grid-template-columns:minmax(0,1fr)!important}
      .stats{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:5px}
      .stat{padding:8px 5px!important;text-align:center}
      .stat b{font-size:12px}
      .check{grid-template-columns:24px minmax(0,1fr)}
      .check>small{grid-column:2;text-align:left;max-width:100%}
      .subject>.row,.schedule>.row,.estimate{grid-template-columns:minmax(0,1fr)!important}
      .subject>.row>b,.schedule>.row>span,.estimate>b{justify-self:start!important;max-width:100%!important;text-align:left;margin-top:4px}
      .hero .row{grid-template-columns:minmax(0,1fr)!important}
      .hero .dday{max-width:100%;text-align:left!important}
    }
  `;
  document.head.appendChild(style);

  function clampOverflow(){
    document.querySelectorAll('.card,.subject,.setting,.schedule,.risk-card,.note-card').forEach(element=>{
      element.style.maxWidth='100%';
      element.style.minWidth='0';
    });
  }

  const oldRender=render;
  render=function(){oldRender();requestAnimationFrame(clampOverflow)};
  clampOverflow();
})();