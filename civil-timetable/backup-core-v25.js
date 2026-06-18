(function(){
  const KEY='civilPlannerAutoBackupsV25',OLD='civilPlannerAutoBackupsV23',MAX=3,VERSION=25;
  const isObject=v=>v&&typeof v==='object'&&!Array.isArray(v);
  const copy=v=>JSON.parse(JSON.stringify(v));
  const validDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||''));
  function validate(v){const errors=[];if(!isObject(v))errors.push('데이터 형식 오류');if(!Array.isArray(v&&v.subjects)||!v.subjects.length)errors.push('필기 과목 없음');if(!Array.isArray(v&&v.practicalSubjects)||!v.practicalSubjects.length)errors.push('실기 과목 없음');if(!isObject(v&&v.checks))errors.push('체크 데이터 오류');if(!isObject(v&&v.reviews))errors.push('복습 데이터 오류');if(!isObject(v&&v.notes))errors.push('메모 데이터 오류');if(!validDate(v&&v.startDate))errors.push('시작일 오류');if(!validDate(v&&v.examDate))errors.push('시험일 오류');return{ok:errors.length===0,errors}}
  function hash(v){const text=JSON.stringify(v);let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16)}
  function raw(key){try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[]}catch{return[]}}
  function normalize(x){if(!isObject(x)||!isObject(x.data))return null;const check=validate(x.data);return{id:String(x.id||Date.now()),version:Number(x.version||x.schema)||23,createdAt:x.createdAt||new Date().toISOString(),reason:x.reason||'자동 백업',fingerprint:x.fingerprint||hash(x.data),valid:check.ok,errors:check.errors,data:x.data}}
  function write(items){try{localStorage.setItem(KEY,JSON.stringify(items.slice(0,MAX)))}catch(e){console.warn('백업 저장 실패',e)}}
  function list(){let items=raw(KEY).map(normalize).filter(Boolean);if(!items.length){items=raw(OLD).map(normalize).filter(Boolean).slice(0,MAX);if(items.length)write(items)}return items.slice(0,MAX)}
  function create(reason,quiet){const data=copy(S),check=validate(data);if(!check.ok){if(!quiet)alert('데이터 오류로 백업하지 못했어요.\n'+check.errors.join('\n'));return null}const fp=hash(data),items=list();if(items[0]&&items[0].fingerprint===fp){if(!quiet)alert('최근 백업과 내용이 같아요.');return items[0]}const item={id:Date.now()+'-'+Math.random().toString(36).slice(2,6),version:VERSION,createdAt:new Date().toISOString(),reason:reason||'자동 백업',fingerprint:fp,valid:true,errors:[],data};items.unshift(item);write(items);if(!quiet)alert('안전 백업을 만들었어요.');return item}
  function preview(item){const d=item.data||{};return`시작 ${d.startDate||'-'} · 시험 ${d.examDate||'-'}\n강의 체크 ${Object.keys(d.checks||{}).length}개 · 복습 ${Object.keys(d.reviews||{}).length}개`}
  function restore(id){const item=list().find(x=>x.id===id);if(!item)return alert('백업을 찾지 못했어요.');const check=validate(item.data);if(!check.ok)return alert('손상된 백업이라 복원할 수 없어요.\n'+check.errors.join('\n'));if(!confirm(`${new Date(item.createdAt).toLocaleString('ko-KR')} 상태로 복원할까요?\n\n${preview(item)}\n\n현재 상태는 먼저 백업됩니다.`))return;create('복원 직전',true);try{localStorage.setItem(K,JSON.stringify(item.data));location.reload()}catch{alert('복원하지 못했어요.')}}
  function remove(id){write(list().filter(x=>x.id!==id))}
  const latest=list()[0],today=iso(new Date());if(!latest||iso(new Date(latest.createdAt))!==today)create('일일 자동 백업',true);
  window.civilBackupV25={list,create,restore,remove,validate,preview};
})();