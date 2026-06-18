(function(){
  function addCard(){
    const api=window.civilBackupV25,root=$('subjectSettings');
    if(!api||!root||$('autoBackupCardV25'))return;
    const items=api.list(),box=document.createElement('div');
    box.className='setting';box.id='autoBackupCardV25';
    box.innerHTML='<div class="row"><div><h3>자동 안전 백업</h3><div class="muted">변경된 경우에만 최근 정상 상태 3개를 보관합니다.</div></div><button class="primary" id="backupNowV25">지금 백업</button></div><div id="backupListV25"></div>';
    const list=box.querySelector('#backupListV25');
    if(!items.length)list.innerHTML='<div class="empty">저장된 백업이 없어요.</div>';
    items.forEach(item=>{
      const check=api.validate(item.data),row=document.createElement('div');
      row.className='schedule';
      row.innerHTML=`<div class="row"><div><b>${new Date(item.createdAt).toLocaleString('ko-KR')}</b><div class="muted">${item.reason} · V${item.version}</div></div><span class="chip">${check.ok?'정상':'손상'}</span></div><div class="muted" style="white-space:pre-line;margin-top:7px">${api.preview(item)}</div><div class="actions"><button class="primary" data-restore="${item.id}" ${check.ok?'':'disabled'}>미리보기 후 복원</button><button class="light" data-delete="${item.id}">삭제</button></div>`;
      list.appendChild(row);
    });
    root.prepend(box);
    $('backupNowV25').onclick=()=>{api.create('수동 백업',false);render()};
    box.querySelectorAll('[data-restore]').forEach(button=>button.onclick=()=>api.restore(button.dataset.restore));
    box.querySelectorAll('[data-delete]').forEach(button=>button.onclick=()=>{if(confirm('이 백업을 삭제할까요?')){api.remove(button.dataset.delete);render()}});
  }

  function patchActions(){
    const api=window.civilBackupV25;if(!api)return;
    [['saveBtn','설정 저장 전'],['resetBtn','체크 초기화 전']].forEach(([id,reason])=>{
      const button=$(id);if(!button||button.dataset.backupV25)return;
      const original=button.onclick;button.dataset.backupV25='1';
      button.onclick=function(event){api.create(reason,true);return original&&original.call(this,event)};
    });
    const importButton=$('importBackupV18');
    if(importButton&&!importButton.dataset.backupV25){importButton.dataset.backupV25='1';importButton.addEventListener('click',()=>api.create('외부 복원 전',true),true)}
  }

  const previousSettings=settings;settings=function(){previousSettings();addCard();patchActions()};
  const previousRender=render;render=function(){previousRender();addCard();patchActions()};
  patchActions();render();
})();