(function(){
  const durations={
    'p:quantity:theory:l1':2340,
    'p:quantity:theory:l2':2400,
    'p:quantity:theory:l3':1920,
    'p:quantity:theory:l4':2160,
    'p:quantity:theory:l5':2400,
    'p:quantity:theory:l6':2100,
    'p:quantity:theory:l7':2820,
    'p:quantity:theory:l8':1980,
    'p:quantity:theory:l9':2220,
    'p:quantity:theory:l10':2160,
    'p:quantity:theory:l11':2100,
    'p:quantity:theory:l12':2160,
    'p:quantity:theory:l13':2160,
    'p:quantity:theory:l14':2940
  };
  if(!S.lectureDurations||typeof S.lectureDurations!=='object'||Array.isArray(S.lectureDurations))S.lectureDurations={};
  Object.entries(durations).forEach(([key,value])=>{
    if(!Number.isFinite(Number(S.lectureDurations[key])))S.lectureDurations[key]=value;
  });
  save();
  if(typeof render==='function')render();
})();