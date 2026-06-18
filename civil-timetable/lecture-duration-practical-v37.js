(function(){
  const durations={'p:quantity:theory:l1':2340,'p:quantity:theory:l2':2400,'p:quantity:theory:l3':1920,'p:quantity:theory:l4':2160,'p:quantity:theory:l5':2400,'p:quantity:theory:l6':2100,'p:quantity:theory:l7':2820,'p:quantity:theory:l8':1980,'p:quantity:theory:l9':2220,'p:quantity:theory:l10':2160,'p:quantity:theory:l11':2100,'p:quantity:theory:l12':2160,'p:quantity:theory:l13':2160,'p:quantity:theory:l14':2940};
  const times=[36,38,32,31,31,39,34,33,29,31,33,36,34,37,34,37,41,39,32,34,32,32,33,33,36,38,42,39,43,34,32,35,34,34,43,45,29,41,44,44,31,35,38,35,32,55];
  const subjectId=(S.practicalSubjects&&S.practicalSubjects[1]&&S.practicalSubjects[1].id)||'course2';
  times.forEach((m,i)=>durations[`p:${subjectId}:theory:l${i+1}`]=m*60);
  if(!S.lectureDurations||typeof S.lectureDurations!=='object'||Array.isArray(S.lectureDurations))S.lectureDurations={};
  Object.entries(durations).forEach(([key,value])=>{if(!Number.isFinite(Number(S.lectureDurations[key])))S.lectureDurations[key]=value});
  save();if(typeof render==='function')render();
})();