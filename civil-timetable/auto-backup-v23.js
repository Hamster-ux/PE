(function(){
  const BACKUP_KEY='civilPlannerAutoBackupsV23';
  const MAX_BACKUPS=3;

  function readBackups(){
    try{
      const value=JSON.parse(localStorage.getItem(BACKUP_KEY)||'[]');
      return Array.isArray(value)?value:[];
    }catch(e){return[]}
  }

  function writeBackups(items){
    try{localStorage.setItem(BACKUP_KEY,JSON.stringify(items.slice(0,MAX_BACKUPS)))}catch(e){console.warn('자동 백업 저장 실패',e)}
  }

  function backupDate(value){
    try{return iso(new Date(value))}catch(e){return''}
  }

  function createSafetyBackup(reason,quiet){
    try{
      const snapshot=JSON.parse(JSON.stringify(S));
      const item={id:Date.now()+'-'+Math.random().toString(36).slice(2,7),createdAt:new Date().toISOString(),reason:reason||'자동 백업',data:snapshot};
      const items=readBackups();
      items.unshift(item);
      writeBackups(items);
      if(!quiet&&typeof alert==='function')alert('현재 상태를 안전 백업했어요.');
      return item;
    }catch(e){
      console.warn('안전 백업 생성 실패',e);
      if(!quiet&&typeof alert==='function')alert('안전 백업을 만들지 못했어요.');
      return null;
    }
  }

  function restoreSafetyBackup(id){
    const item=readBackups().find(x=>x.id===id);
    if(!item)return alert('선택한 백업을 찾지 못했어요.');
    if(!confirm(`${new Date(item.createdAt).toLocaleString('ko-KR')} 상태로 되돌릴까요?\n현재 상태는 먼저 자동 백업됩니다.`))return;
    createSafetyBackup('백업 복원 직전',true);
    try{
      localStorage.setItem(K,JSON.stringify(item.data));
      location.reload();
    }catch(e){alert('백업을 복원하지 못했어요.')}
  }

  function removeSafetyBackup(id){
    if(!confirm('이 안전 백업을 삭제할까요?'))return;
    writeBackups(readBackups().filter(x=>x.id!==id));
    render();
  }

  function dailyBackup(){
    const today=iso(new Date()),latest=readBackups()[0];
    if(!latest||backupDate(latest.createdAt)!==today)createSafetyBackup('일일 자동 백업',true);
  }

  function formatBackup(item){
    const d=new Date(item.createdAt);
    return `${d.toLocaleDateString('ko-KR')} ${d.toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}`;
  }

  function addBackupSettings(){
    const root=$('subjectSettings');
    if(!root||$('autoBackupCardV23'))return;
    const items=readBackups(),box=document.createElement('div');
    box.className='setting';box.id='autoBackupCardV23';
    box.innerHTML=`<div class="row"><div><h3>자동 안전 백업</h3><div class="muted">하루 한 번, 설정 저장 전, 체크 초기화 전에 자동으로 보관합니다. 최근 3개만 유지합니다.</div></div><button type="button" class="primary" id="backupNowV23">지금 백업</button></div><div id="backupListV23" style="margin-top:10px"></div>`;
    const list=box.querySelector('#backupListV23');
    if(!items.length)list.innerHTML='<div class="empty">아직 저장된 안전 백업이 없어요.</div>';
    items.forEach(item=>{
      const row=document.createElement('div');row.className='schedule';
      row.innerHTML=`<div class="row"><div><b>${formatBackup(item)}</b><div class="muted">${item.reason||'자동 백업'}</div></div><span class="chip">${Object.keys(item.data&&item.data.checks||{}).length}개 체크</span></div><div class="actions"><button type="button" class="primary" data-restore="${item.id}">이 상태로 복원</button><button type="button" class="light" data-delete="${item.id}">삭제</button></div>`;
      list.appendChild(row);
    });
    root.prepend(box);
    $('backupNowV23').onclick=()=>{createSafetyBackup('사용자 수동 백업',false);render()};
    box.querySelectorAll('[data-restore]').forEach(b=>b.onclick=()=>restoreSafetyBackup(b.dataset.restore));
    box.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>removeSafetyBackup(b.dataset.delete));
    const importButton=$('importBackupV18');
    if(importButton&&!importButton.dataset.safetyPatched){
      importButton.dataset.safetyPatched='1';
      importButton.addEventListener('click',()=>createSafetyBackup('외부 백업 복원 전',true),true);
    }
  }

  function patchMainActions(){
    const saveButton=$('saveBtn'),resetButton=$('resetBtn');
    if(saveButton&&!saveButton.dataset.safetyPatched){
      const original=saveButton.onclick;
      saveButton.dataset.safetyPatched='1';
      saveButton.onclick=function(e){createSafetyBackup('설정 저장 전',true);return original&&original.call(this,e)};
    }
    if(resetButton&&!resetButton.dataset.safetyPatched){
      const original=resetButton.onclick;
      resetButton.dataset.safetyPatched='1';
      resetButton.onclick=function(e){createSafetyBackup('체크 초기화 전',true);return original&&original.call(this,e)};
    }
  }

  const previousSettings=settings;
  settings=function(){previousSettings();addBackupSettings();patchMainActions()};

  const previousRender=render;
  render=function(){previousRender();addBackupSettings();patchMainActions()};

  window.civilSafetyBackup={create:createSafetyBackup,restore:restoreSafetyBackup,list:readBackups};
  dailyBackup();
  patchMainActions();
  render();
})();