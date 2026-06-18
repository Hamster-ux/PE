(function(){
  const durations={
    'w:mech:core:l1':3180,
    'w:mech:core:l2':2760,
    'w:mech:core:l3':2640,
    'w:mech:core:l4':2820,
    'w:mech:core:l5':2220,
    'w:mech:core:l6':2580,
    'w:mech:core:l7':2340,
    'w:mech:core:l8':2400,
    'w:mech:core:l9':2460,
    'w:mech:core:l10':2460,
    'w:survey:core:l1':1860,
    'w:survey:core:l2':1860,
    'w:survey:core:l3':1860,
    'w:survey:core:l4':1860,
    'w:survey:core:l5':1920,
    'w:survey:core:l6':1860
  };
  if(!S.lectureDurations||typeof S.lectureDurations!=='object'||Array.isArray(S.lectureDurations))S.lectureDurations={};
  Object.entries(durations).forEach(([key,value])=>{
    if(!Number.isFinite(Number(S.lectureDurations[key])))S.lectureDurations[key]=value;
  });
  save();
  if(typeof render==='function')render();
})();