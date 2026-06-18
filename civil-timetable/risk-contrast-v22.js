(function(){
  const style=document.createElement('style');
  style.id='riskContrastV22';
  style.textContent=`
    .risk-card .head h2{color:var(--text)!important;font-weight:950!important}
    .risk-card .head .muted{color:#4d5c57!important;font-weight:700!important}
    .risk-card .risk-status{background:var(--risk-color,#0f6b5c)!important;color:#fff!important;border:0!important;box-shadow:0 7px 16px color-mix(in srgb,var(--risk-color,#0f6b5c) 25%,transparent)!important;text-shadow:0 1px 1px rgba(0,0,0,.18)}
    .risk-card .risk-dot{background:#fff!important;box-shadow:0 0 0 3px rgba(255,255,255,.2)}
    .risk-card .risk-box{background:#f7f9f8!important;border-color:#d8e0dd!important}
    .risk-card .risk-box small{color:#53615c!important;font-weight:750!important}
    .risk-card .risk-box b{color:#10231e!important;font-weight:950!important;font-size:18px!important}
    .risk-card .notice{background:#f5f7f6!important;color:#14231f!important;border:2px solid var(--risk-color,#0f6b5c)!important;box-shadow:none!important}
    .risk-card .notice b{color:#14231f!important;font-weight:950!important}
    @media(prefers-color-scheme:dark){
      .risk-card .head h2{color:#f7fbf9!important}
      .risk-card .head .muted{color:#c1cbc7!important}
      .risk-card .risk-box{background:#222a27!important;border-color:#3a4642!important}
      .risk-card .risk-box small{color:#b9c5c0!important}
      .risk-card .risk-box b{color:#ffffff!important}
      .risk-card .notice{background:#222a27!important;color:#ffffff!important;border-color:var(--risk-color,#3bb69c)!important}
      .risk-card .notice b{color:#ffffff!important}
    }
  `;
  document.head.appendChild(style);
})();