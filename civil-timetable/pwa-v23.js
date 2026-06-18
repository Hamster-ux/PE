(function(){
  let deferredInstall=null;
  let registration=null;
  const RELOAD_KEY='civilPwaV24Reloaded';

  const style=document.createElement('style');
  style.textContent=`
    .pwa-state-v23{margin-top:9px;padding:10px 12px;border-radius:12px;background:var(--surface-2,#f4f7f6);border:1px solid var(--line,#dfe8e5);font-size:12px;color:var(--muted,#71827d)}
  `;
  document.head.appendChild(style);

  function standalone(){return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}
  function ios(){return /iphone|ipad|ipod/i.test(navigator.userAgent)}

  function activateWaiting(reg){
    const worker=reg&&reg.waiting;
    if(worker)worker.postMessage({type:'SKIP_WAITING'});
  }

  async function registerWorker(){
    if(!('serviceWorker'in navigator))return null;
    try{
      registration=await navigator.serviceWorker.register('./sw.js?v=5',{scope:'./'});
      activateWaiting(registration);
      registration.addEventListener('updatefound',()=>{
        const worker=registration.installing;
        if(!worker)return;
        worker.addEventListener('statechange',()=>{
          if(worker.state==='installed')activateWaiting(registration);
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange',()=>{
        if(sessionStorage.getItem(RELOAD_KEY)==='1')return;
        sessionStorage.setItem(RELOAD_KEY,'1');
        location.reload();
      });
      setTimeout(()=>sessionStorage.removeItem(RELOAD_KEY),5000);
      return registration;
    }catch(e){console.warn('서비스 워커 등록 실패',e);return null}
  }

  function stateText(){
    if(standalone())return'홈 화면 앱으로 실행 중이에요. 새 버전은 자동으로 적용됩니다.';
    if(deferredInstall)return'설치 버튼을 눌러 홈 화면 앱으로 추가할 수 있어요.';
    if(ios())return'Safari 공유 버튼 → 홈 화면에 추가를 누르면 전체 화면 앱으로 사용할 수 있어요.';
    return'브라우저 메뉴에서 홈 화면에 추가 또는 앱 설치를 선택해 주세요.';
  }

  function addPwaSettings(){
    const root=$('subjectSettings');
    if(!root||$('pwaCardV23'))return;
    const box=document.createElement('div');box.className='setting';box.id='pwaCardV23';
    box.innerHTML=`<div class="row"><div><h3>홈 화면 앱·자동 업데이트</h3><div class="muted">전체 화면 실행, 오프라인 열기, 새 버전 자동 적용을 지원합니다.</div></div><span class="chip">V24</span></div><div class="actions"><button type="button" class="primary" id="installAppV23">홈 화면 앱 설치</button><button type="button" class="light" id="checkUpdateV23">업데이트 확인</button></div><div class="pwa-state-v23" id="pwaStateV23">${stateText()}</div>`;
    root.prepend(box);
    const install=$('installAppV23');
    install.disabled=standalone();
    install.textContent=standalone()?'설치 완료':'홈 화면 앱 설치';
    install.onclick=async()=>{
      if(deferredInstall){
        deferredInstall.prompt();
        await deferredInstall.userChoice.catch(()=>{});
        deferredInstall=null;render();return;
      }
      if(ios())alert('Safari 아래쪽 공유 버튼을 누른 뒤 “홈 화면에 추가”를 선택해 주세요.');
      else alert('브라우저 메뉴에서 “앱 설치” 또는 “홈 화면에 추가”를 선택해 주세요.');
    };
    $('checkUpdateV23').onclick=async()=>{
      const reg=registration||await registerWorker();
      if(!reg)return alert('업데이트 확인 기능을 사용할 수 없어요.');
      await reg.update().catch(()=>{});
      activateWaiting(reg);
      alert('업데이트 확인을 완료했어요. 새 버전이 있으면 자동으로 적용됩니다.');
    };
  }

  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;try{render()}catch(_){}});
  window.addEventListener('appinstalled',()=>{deferredInstall=null;try{render()}catch(_){}});
  window.addEventListener('online',()=>{registration&&registration.update().then(()=>activateWaiting(registration)).catch(()=>{})});

  const previousSettings=settings;
  settings=function(){previousSettings();addPwaSettings()};
  const previousRender=render;
  render=function(){previousRender();addPwaSettings()};

  registerWorker();
  render();
})();