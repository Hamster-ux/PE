(function(){
  const durations={
    'w:struct:core:l1':1920,
    'w:struct:core:l2':1920,
    'w:struct:core:l3':1860,
    'w:struct:core:l4':1860,
    'w:struct:core:l5':1860,
    'w:struct:core:l6':1980,
    'w:soil:core:l1':2040,
    'w:soil:core:l2':1860,
    'w:soil:core:l3':1860,
    'w:soil:core:l4':1920,
    'w:soil:core:l5':1860,
    'w:soil:core:l6':1680
  };
  if(!S.lectureDurations||typeof S.lectureDurations!=='object'||Array.isArray(S.lectureDurations))S.lectureDurations={};
  Object.entries(durations).forEach(([key,value])=>{
    if(!Number.isFinite(Number(S.lectureDurations[key])))S.lectureDurations[key]=value;
  });
  save();
  if(typeof render==='function')render();
})();