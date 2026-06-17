(function(){
  try{
    S.subjects.forEach(s=>s.targetRounds=1);
    const struct=S.subjects.find(s=>s.id==='struct');
    if(struct)struct.theoryTotal=41;
    S.roundDefaultsV16=true;
    save();
    render();
  }catch(e){
    console.warn('필기 기본값 적용 실패',e);
  }
})();