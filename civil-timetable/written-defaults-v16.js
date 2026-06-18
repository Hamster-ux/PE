(function(){
  try{
    let changed=false;
    if(!S.roundDefaultsV16){
      S.subjects.forEach(s=>{
        if(!Number.isFinite(Number(s.targetRounds))||Number(s.targetRounds)<1){s.targetRounds=1;changed=true}
      });
      const struct=S.subjects.find(s=>s.id==='struct');
      if(struct&&(struct.theoryTotal===null||struct.theoryTotal===undefined||Number(struct.theoryTotal)<=0)){struct.theoryTotal=41;changed=true}
      S.roundDefaultsV16=true;
      changed=true;
    }
    if(changed){save();render()}
  }catch(e){
    console.warn('필기 기본값 적용 실패',e);
  }
})();