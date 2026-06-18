(function(){
  document.documentElement.style.colorScheme='light dark';
  document.body.classList.add('theme-v21');
  const style=document.createElement('style');
  style.id='themeV21';
  style.textContent=`
  :root{
    --bg:#f2f3f5;--surface:#ffffff;--surface-2:#f7f8f9;--surface-3:#edf1ef;
    --text:#13231f;--muted:#6f7d78;--line:#e1e6e4;--primary:#0f6b5c;
    --primary-2:#188a75;--primary-soft:#e2f2ee;--danger:#d84a56;--warning:#b7780b;
    --shadow:0 10px 30px rgba(24,53,45,.08);--shadow-strong:0 16px 40px rgba(24,53,45,.16);
    --radius-xl:26px;--radius-lg:20px;--radius-md:14px;
  }
  *{scrollbar-width:none}
  *::-webkit-scrollbar{display:none}
  html{background:var(--bg)}
  body.theme-v21{background:linear-gradient(180deg,#eef3f1 0,#f5f6f7 260px,#f2f3f5 100%);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Apple SD Gothic Neo","Noto Sans KR",sans-serif;letter-spacing:-.2px}
  .app{max-width:760px;padding:10px 10px 112px}
  .hero{position:relative;overflow:hidden;background:linear-gradient(145deg,#0d5147 0%,#0f6b5c 48%,#1a8c78 100%);border-radius:30px;padding:22px 20px 18px;box-shadow:0 18px 44px rgba(15,107,92,.24);isolation:isolate}
  .hero:before,.hero:after{content:"";position:absolute;border-radius:50%;pointer-events:none;z-index:-1}
  .hero:before{width:240px;height:240px;right:-100px;top:-120px;background:radial-gradient(circle,rgba(255,255,255,.22),rgba(255,255,255,0) 67%)}
  .hero:after{width:190px;height:190px;left:-100px;bottom:-130px;background:radial-gradient(circle,rgba(110,233,208,.28),rgba(110,233,208,0) 70%)}
  .hero h1{font-size:30px;line-height:1.12;margin:5px 0 8px;font-weight:900;letter-spacing:-1.2px}
  .hero p{font-size:13px;opacity:.82}
  .dday{padding:8px 11px;border-radius:18px;background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.2);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);font-size:24px;min-width:82px}
  .stats{gap:8px;margin-top:17px}
  .stat{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.16);border-radius:16px;padding:11px}
  .stat small{font-size:11px}.stat b{display:block;margin-top:3px;font-size:16px}
  .card{background:rgba(255,255,255,.95);border:1px solid rgba(212,221,218,.85);border-radius:var(--radius-xl);padding:17px;margin-top:13px;box-shadow:var(--shadow);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
  .head{align-items:center}.head h2{font-size:21px;letter-spacing:-.7px;font-weight:900}.muted{color:var(--muted);font-size:12px;line-height:1.48}
  .badge,.chip{border-radius:999px;padding:7px 10px;font-size:11px;font-weight:900;background:var(--primary-soft);color:var(--primary);border:1px solid rgba(15,107,92,.08)}
  button{border-radius:14px;min-height:44px;font-weight:850;transition:transform .14s ease,filter .14s ease,background .2s ease}
  button:active{transform:scale(.975);filter:brightness(.97)}
  .primary{background:linear-gradient(145deg,var(--primary),var(--primary-2));color:#fff;box-shadow:0 8px 18px rgba(15,107,92,.2)}
  .light{background:var(--surface-3);color:var(--text)}
  .danger-btn{background:#fdebec;color:#b9323d}.warning-btn{background:#fff3cb;color:#7c5906}
  .date-tools{grid-template-columns:48px 1fr 48px;gap:9px}.date-tools input,.field input,.field select,.field textarea{background:var(--surface-2);border:1px solid var(--line);border-radius:14px;color:var(--text);min-height:46px;padding:10px 12px;outline:none;transition:border .2s ease,box-shadow .2s ease}
  .date-tools input:focus,.field input:focus,.field select:focus,.field textarea:focus{border-color:rgba(15,107,92,.55);box-shadow:0 0 0 4px rgba(15,107,92,.09)}
  .date-tools button{background:var(--surface-3);color:var(--text);font-size:24px}.today-jump{background:transparent;border:1px solid var(--line);color:var(--primary)}
  .summary{gap:9px}.summary div{background:linear-gradient(145deg,#f8faf9,#f1f5f3);border:1px solid var(--line);border-radius:17px;padding:13px}.summary b{font-size:24px;letter-spacing:-.8px}.summary small{font-size:11px}
  .notice,.carry-title{border-radius:16px;padding:13px 14px;background:linear-gradient(145deg,#edf8f5,#e7f3f0);border:1px solid #cfe5df;line-height:1.5}
  .carry-title{background:linear-gradient(145deg,#fff9e8,#fff5d5);border-color:#ecdba6}
  .carry-title.danger{background:#fdeaea;border-color:#f0c2c6;color:#8c2630}
  .subject{position:relative;overflow:hidden;border:1px solid var(--line);border-left:0;border-radius:20px;padding:14px;margin-top:10px;background:var(--surface)}
  .subject:before{content:"";position:absolute;left:0;top:0;bottom:0;width:6px;background:var(--subject-color)}
  .subject.done{background:linear-gradient(145deg,#f4faf8,#edf6f3)}
  .subject h3{font-size:17px;letter-spacing:-.45px}
  .check{min-height:50px;border-radius:15px;background:var(--surface-2);border:1px solid var(--line);padding:11px 12px}.check.on{background:color-mix(in srgb,var(--subject-color) 11%,var(--surface));border-color:color-mix(in srgb,var(--subject-color) 24%,var(--line))}
  .box{width:25px;height:25px;border-radius:9px;background:var(--surface);border-color:#b7c5c0}.check.on .box{box-shadow:0 5px 12px color-mix(in srgb,var(--subject-color) 25%,transparent)}
  .progress{padding:10px 0 2px}.prow{font-size:13px}.bar{height:7px;background:#e8edeb}.bar i{border-radius:999px;background:linear-gradient(90deg,var(--subject-color),color-mix(in srgb,var(--subject-color) 70%,#fff))}
  .schedule{border:1px solid var(--line);border-radius:18px;background:var(--surface);box-shadow:0 4px 14px rgba(22,52,44,.04)}
  .setting{border:1px solid var(--line);border-radius:20px;background:linear-gradient(145deg,var(--surface),var(--surface-2));padding:14px}
  .setting h3{font-size:17px}.field label{font-size:11px;letter-spacing:.1px}.install-box{border-radius:20px;background:linear-gradient(145deg,#edf8f5,#f8fffc)}
  .stats-box{border-radius:17px;background:linear-gradient(145deg,#fafbfb,#f1f4f3);border:1px solid var(--line)}.stats-box b{letter-spacing:-.6px}
  .note-card{border:1px solid var(--line);border-left:0;border-radius:20px;position:relative;overflow:hidden}.note-card:before{content:"";position:absolute;left:0;top:0;bottom:0;width:6px;background:var(--subject-color)}
  .nav{bottom:max(10px,env(safe-area-inset-bottom));width:min(620px,calc(100% - 20px));gap:4px;padding:7px 8px;border-radius:24px;background:rgba(247,249,248,.79);border:1px solid rgba(207,218,214,.85);box-shadow:0 18px 44px rgba(25,47,41,.2);backdrop-filter:blur(24px) saturate(165%);-webkit-backdrop-filter:blur(24px) saturate(165%)}
  .nav button{min-height:52px;border-radius:18px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:11px;font-weight:800;color:#71807b}
  .nav button:before{display:block;font-size:17px;line-height:1}
  .nav button[data-v="today"]:before{content:"◉"}.nav button[data-v="schedule"]:before{content:"▦"}.nav button[data-v="records"]:before{content:"◔"}.nav button[data-v="settings"]:before{content:"⚙︎"}
  .nav button.on{background:linear-gradient(145deg,var(--primary),var(--primary-2));color:#fff;box-shadow:0 8px 18px rgba(15,107,92,.22)}
  .risk-card{box-shadow:0 12px 28px rgba(30,54,47,.09)}.risk-status{box-shadow:inset 0 0 0 1px currentColor}
  .month-calendar{background:var(--surface);border:1px solid var(--line);border-radius:24px;padding:0 8px 10px;overflow:hidden;box-shadow:var(--shadow)}
  .month-title{top:-1px;margin:0 -8px;padding:15px 13px 11px;background:rgba(255,255,255,.88);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid rgba(225,230,228,.8);font-size:24px}
  .calendar-weekday{padding:10px 0 8px;border-bottom:1px solid var(--line)}
  .calendar-day{background:var(--surface);border-bottom:1px solid var(--line);min-height:94px;border-radius:0}.calendar-day:nth-child(7n+1){background:#fffafa}.calendar-day:nth-child(7n){background:#f8fbff}.calendar-day.selected{background:#e9f5f2;box-shadow:inset 0 0 0 2px rgba(15,107,92,.45)}
  .calendar-event{border-radius:7px;font-size:9px;padding:4px 5px}.day-number{font-size:14px}
  .calendar-tools button{border-radius:14px}.calendar-tools button.on{background:linear-gradient(145deg,var(--primary),var(--primary-2));box-shadow:0 7px 16px rgba(15,107,92,.2)}
  .notification-state{border:1px solid var(--line)}
  @media(max-width:460px){
    .app{padding:8px 8px 108px}.hero{padding:19px 17px 17px;border-radius:27px}.hero h1{font-size:27px}.card{padding:15px;border-radius:23px}.head h2{font-size:20px}.summary b{font-size:22px}.month-calendar{border-radius:20px;padding-left:4px;padding-right:4px}.month-title{margin-left:-4px;margin-right:-4px}.calendar-day{min-height:88px}.nav{width:calc(100% - 16px)}
  }
  @media(prefers-color-scheme:dark){
    :root{--bg:#111615;--surface:#1b2220;--surface-2:#202925;--surface-3:#27312e;--text:#f2f6f4;--muted:#9eaaa6;--line:#303c38;--primary:#3bb69c;--primary-2:#2a967f;--primary-soft:#183d34;--shadow:0 10px 30px rgba(0,0,0,.24)}
    html,body.theme-v21{background:linear-gradient(180deg,#101715 0,#141917 260px,#111615 100%)}
    .card{background:rgba(27,34,32,.96);border-color:#303c38}.hero{box-shadow:0 18px 44px rgba(0,0,0,.34)}
    .summary div,.stats-box,.setting{background:linear-gradient(145deg,#202825,#1a211f)}
    .date-tools input,.field input,.field select,.field textarea{background:#202825;border-color:#35413d;color:#f2f6f4}
    .subject,.schedule,.month-calendar{background:#1b2220;border-color:#303c38}.subject.done{background:linear-gradient(145deg,#1c2c27,#17241f)}
    .check{background:#202825;border-color:#303c38}.check.on{background:color-mix(in srgb,var(--subject-color) 18%,#18201d)}
    .box{background:#151a18}.notice{background:#17332c;border-color:#285245}.carry-title{background:#322b18;border-color:#574b28}.carry-title.danger{background:#3a2023;border-color:#643139;color:#ffb3ba}
    .nav{background:rgba(24,31,29,.78);border-color:#35413d;box-shadow:0 18px 44px rgba(0,0,0,.44)}
    .month-title{background:rgba(27,34,32,.9);border-bottom-color:#303c38}.calendar-day{background:#1b2220;border-bottom-color:#303c38}.calendar-day:nth-child(7n+1){background:#241c1d}.calendar-day:nth-child(7n){background:#182129}.calendar-day.rest{background:#202422}.calendar-day.postponed{background:#302519}.calendar-day.selected{background:#153d34}
    .calendar-legend span,.notification-state{background:#202825;color:#a8b3af;border-color:#303c38}.install-box{background:linear-gradient(145deg,#17342c,#1a2824)}
    .notify-toast{background:#f1f5f3;color:#17221f}
  }
  `;
  document.head.appendChild(style);
})();