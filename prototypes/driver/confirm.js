/* Spoken-yes-within-6-seconds confirm with tap fallback. Nothing is saved unless Yes. */
window.confirm6=function(text,onYes,onNo){
  var old=document.getElementById('c6');if(old)old.remove();
  var m=document.createElement('div');m.className='modal';m.id='c6';
  m.innerHTML='<div class="sheet" role="dialog" aria-label="Confirm"><h2 id="c6t"></h2><div class="speak" id="c6s">Say <b>"yes"</b> within <b id="c6n">6</b> s, or tap Yes.</div>'+
   '<div class="bottom" style="position:static;padding:0"><button class="yes" id="c6y">Yes</button><button class="no" id="c6x">Cancel</button></div></div>';
  document.body.appendChild(m);document.getElementById('c6t').textContent=text;
  var done=false,n=6,iv=setInterval(function(){n--;var e=document.getElementById('c6n');if(e)e.textContent=Math.max(0,n);if(n<=0){clearInterval(iv);var s=document.getElementById('c6s');if(s&&!done)s.innerHTML='Didn\'t hear "yes". <b>Tap Yes to save</b>, or Cancel.';}},1000);
  function fin(ok){if(done)return;done=true;clearInterval(iv);V.stop();m.remove();if(ok)onYes&&onYes();else onNo&&onNo();}
  document.getElementById('c6y').onclick=function(){fin(true);};document.getElementById('c6x').onclick=function(){fin(false);};
  if(V.stt){V.speak(text+' Say yes to save.').then(function(){if(done)return;return V.listen(6000);}).then(function(t){if(!done&&t&&V.command(t)==='yes')fin(true);else if(!done&&t&&V.command(t)==='no')fin(false);}).catch(function(){var s=document.getElementById('c6s');if(s&&!done)s.innerHTML=V.micHelp+' <b>Tap Yes to save.</b>';});}
  else {var s=document.getElementById('c6s');s.innerHTML='Voice isn\'t available on this browser. <b>Tap Yes to save.</b>';}
  return fin;
};
