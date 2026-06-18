(function(){
  let deferredInstall=null;
  try{
    if(!document.querySelector('link[rel="manifest"]')){const link=document.createElement('link');link.rel='manifest';link.href='manifest.webmanifest?v=25';document.head.appendChild(link)}
    if(/\/(app-v25|app)\.html$/.test(location.pathname))history.replaceState(null,'',location.pathname.replace(/(app-v25|app)\.html$/,''));
  }catch(e){}

  const style=document.createElement('style');
  style.textContent=`
    .home-install-v24{background:linear-gradient(145deg,#edf8f5,#f8fffc)!important;border-color:#cfe5df!important}
    .home-install-v24 .install-steps{margin:10px 0 0;padding-left:21px;line-height:1.75;font-size:13px}
    .home-install-v24 .install-state{margin-top:9px;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.65);border:1px solid var(--line);font-size:12px;color:var(--muted)}
    @media(prefers-color-scheme:dark){.home-install-v24{background:linear-gradient(145deg,#17342c,#1a2824)!important;border-color:#285245!important}.home-install-v24 .install-state{background:#202825}}
  `;
  document.head.appendChild(style);

  function isStandalone(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true}
  function isIOS(){return /iphone|ipad|ipod/i.test(navigator.userAgent)}
  function isSafari(){return /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent)}

  function stateText(){
    if(isStandalone())return'현재 홈 화면 앱으로 실행 중이에요.';
    if(isIOS()&&isSafari())return'Safari 공유 버튼에서 “홈 화면에 추가”를 선택해 주세요.';
    if(isIOS())return'이 화면을 Safari로 연 뒤 공유 → 홈 화면에 추가를 선택해 주세요.';
    if(deferredInstall)return'아래 설치 버튼을 누르면 홈 화면에 추가할 수 있어요.';
    return'브라우저 메뉴에서 “홈 화면에 추가” 또는 “앱 설치”를 선택해 주세요.';
  }

  function showGuide(){
    if(isStandalone())return alert('이미 홈 화면 앱으로 실행 중이에요.');
    if(deferredInstall){deferredInstall.prompt();deferredInstall.userChoice.finally(()=>{deferredInstall=null;render()});return}
    if(isIOS()&&isSafari())alert('Safari 아래쪽 공유 버튼(네모에서 위로 화살표) → “홈 화면에 추가” → 오른쪽 위 “추가” 순서로 눌러 주세요.');
    else if(isIOS())alert('현재 화면을 Safari에서 연 뒤 공유 버튼 → “홈 화면에 추가”를 눌러 주세요. ChatGPT 앱 안 브라우저에서는 해당 메뉴가 보이지 않을 수 있어요.');
    else alert('브라우저 메뉴에서 “홈 화면에 추가” 또는 “앱 설치”를 선택해 주세요.');
  }

  function addInstallCard(){
    const root=$('subjectSettings');if(!root||$('homeInstallCardV24'))return;
    const box=document.createElement('div');box.className='setting home-install-v24';box.id='homeInstallCardV24';
    box.innerHTML=`<div class="row"><div><h3>홈 화면에 앱 추가</h3><div class="muted">아이폰에서 전체 화면 앱처럼 바로 실행할 수 있어요.</div></div><span class="chip">iPhone</span></div><button type="button" class="primary" id="homeInstallBtnV24" style="width:100%;margin-top:10px">${isStandalone()?'설치 완료':'홈 화면 추가 방법 보기'}</button><ol class="install-steps"><li>Safari에서 이 시간표를 엽니다.</li><li>아래쪽 공유 버튼을 누릅니다.</li><li>“홈 화면에 추가”를 선택합니다.</li><li>오른쪽 위 “추가”를 누릅니다.</li></ol><div class="install-state">${stateText()}</div>`;
    root.prepend(box);const btn=$('homeInstallBtnV24');btn.disabled=isStandalone();btn.onclick=showGuide;
  }

  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstall=event;try{render()}catch(e){}});
  window.addEventListener('appinstalled',()=>{deferredInstall=null;try{render()}catch(e){}});
  const previousSettings=settings;settings=function(){previousSettings();addInstallCard()};
  const previousRender=render;render=function(){previousRender();addInstallCard()};
  render();
})();