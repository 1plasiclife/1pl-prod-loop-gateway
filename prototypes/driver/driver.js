/* 1PL Driver flow: TEST PROTOTYPE with EXAMPLE DATA. No network, no real maps, no real location. */
(function(){
var STOPS=[{name:'Example Middle School',window:'2:30–3:15 PM',addr:'(example address)',notes:'Check in at the front office. Bins are by the side gate.',contact:'Front office (example), [[(555) 010-0000]]'},
           {name:'Example Elementary',window:'3:30–4:00 PM',addr:'(example address)',notes:'Bins are behind the cafeteria.',contact:'Custodian (example), [[(555) 010-0001]]'}];
var STEPS=[{id:'inspect_bins',t:'Check the bins'},{id:'pickup_bags',t:'Pick up the full bags'},{id:'tag_school_color',t:'Tag bags with the school color'},
           {id:'record_bag_count',t:'How many bags?'},{id:'install_bags',t:'Put new bags in the bins'},{id:'impact_photo',t:'Take a photo'},
           {id:'bring_to_vehicle',t:'Bags to vehicle'},{id:'load_secured',t:'Load secured'}];
var S={si:0,phase:'today',step:0,bags:0,photo:false,hf:false,gen:0,log:[],undo:null};
var $=function(i){return document.getElementById(i);},body=$('body'),bottom=$('bottom');
function esc(t){return V.show(String(t)).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
function btn(c,l,f,id){var b=document.createElement('button');b.className=c;b.textContent=l;b.onclick=f;if(id)b.id=id;return b;}
function now(){var d=new Date();return d.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});}
function toast(t,undo){$('toastText').innerHTML=t;$('undoBtn').classList.toggle('hidden',!undo);S.undo=undo||null;$('toast').classList.remove('hidden');clearTimeout(S.tt);S.tt=setTimeout(function(){$('toast').classList.add('hidden');S.undo=null;},3000);}
$('undoBtn').onclick=function(){if(S.undo){var u=S.undo;S.undo=null;u();$('toast').classList.add('hidden');render();}};
function setHF(on){S.hf=on;$('hfPill').textContent='🎧 Hands-free: '+(on?'on':'off');if(!on){S.gen++;V.stop();}}
$('hfPill').onclick=function(){setHF(!S.hf);render();};
function stop(){return STOPS[S.si];}
function chat(first){S.gen++;V.stop();var s=stop();Chat.open({about:s.name+' pickup',handsFree:S.hf,firstQuestion:first,chips:['What\'s the gate code?','Who\'s the contact?','Where are the bins?'],
  qa:[{k:['gate','code'],a:'No gate code is listed for this stop (example). The notes say: '+s.notes},{k:['contact','who','phone','call'],a:'The contact is '+s.contact+'.'},{k:['bins','where'],a:s.notes}],onClose:render});}
function problem(){S.prev=S.phase;S.phase='problem';render();}
function startDrive(){S.gen++;var m=document.createElement('div');m.className='modal';m.id='maps';
  m.innerHTML='<div class="sheet"><h2>Open navigation?</h2><div class="small">Prototype: these buttons don\'t open a real map.</div><button class="later" id="mG">Open in Google Maps (mock)</button><button class="later" id="mA">Open in Apple Maps (mock)</button><button class="no" id="mS" style="font-size:22px;min-height:60px">No thanks, just start</button></div>';
  document.body.appendChild(m);var go=function(){m.remove();S.phase='driving';S.started=now();S.log.push('Start Drive '+S.started);toast('<b>✓ Drive started</b> at '+S.started,function(){S.phase='today';});render();};
  $('mG').onclick=go;$('mA').onclick=go;$('mS').onclick=go;}
function arrive(){S.phase='checklist';S.step=0;S.arrived=now();S.log.push('Arrived '+S.arrived);toast('<b>✓ Arrived</b> at '+S.arrived,function(){S.phase='driving';});render();}
function stepDone(){var st=STEPS[S.step];if(st.id==='record_bag_count'&&S.bags<1){toast('Please set the number of bags first.');return;}
  if(st.id==='impact_photo'&&!S.photo){toast('Tap "Take photo" first (or report a problem).');return;}
  var prev=S.step;S.step++;toast('<b>✓</b> '+st.t,function(){S.step=prev;});if(S.step>=STEPS.length)S.phase='complete';render();}
function complete(){S.log.push('Complete '+stop().name+' · '+S.bags+' bags');S.phase='done';render();}
function next(){if(S.si+1<STOPS.length){S.si++;S.phase='today';S.bags=0;S.photo=false;S.step=0;}else S.phase='alldone';render();}
function render(){body.innerHTML='';bottom.innerHTML='';var s=stop(),note=V.unsupportedNote();
  var hdr='<div class="count" id="counter">Today · Stop '+(S.si+1)+' of '+STOPS.length+'</div><div class="prog"><div style="width:'+Math.round(S.si/STOPS.length*100+({today:0,driving:15,checklist:25+S.step*2,complete:45,done:50}[S.phase]||0))+'%"></div></div>';
  if(S.phase==='today'){$('title').textContent='My pickups';
    body.innerHTML=hdr+'<h1 id="stopName">'+esc(s.name)+'</h1><div class="rec">Pickup window '+s.window+' (example)<br>Opened from your calendar event ✓</div>'+
      '<div class="small">📍 Location is optional. It only helps show you got there. The prototype never asks for it.</div>'+(note&&S.hf?'<div class="note">'+note+'</div>':'');
    body.appendChild(btn('later','💬 Ask about this stop',function(){chat();},'askBtn'));
    bottom.appendChild(btn('yes full','▶ Start Drive',startDrive,'startBtn'));bottom.appendChild(btn('later full','⚠ Report a problem',problem,'probBtn'));
    if(S.hf){var g=++S.gen;V.speak('Your next stop is '+s.name+'. Say start drive when you are ready.').then(function(){return V.listen(8000);}).then(function(t){if(g!==S.gen)return;
      if(V.has(t,['start drive','start','drive','go']))confirm6('Start drive to '+s.name+'?',function(){$('startBtn').click();},render);else if(t&&t.split(' ').length>2)chat(t);}).catch(function(){setHF(false);render();});}
    return;}
  if(S.phase==='driving'){$('title').textContent='Driving';
    body.innerHTML=hdr+'<h1>On the way to '+esc(s.name)+'</h1><div class="count">Started '+S.started+'</div><div class="small">When you get there, tap I\'m Here. Maps can\'t tell LOOP you\'ve arrived.</div>';
    body.appendChild(btn('later','💬 Ask about this stop',function(){chat();},'askBtn'));
    bottom.appendChild(btn('yes full','✓ I\'m Here',function(){confirm6('Arrived at '+s.name+'?',arrive);},'hereBtn'));bottom.appendChild(btn('later full','⚠ Report a problem',problem,'probBtn'));
    if(S.hf){var g2=++S.gen;V.speak('Say I\'m here when you arrive.').then(function(){return V.listen(8000);}).then(function(t){if(g2!==S.gen)return;if(V.has(t,["i'm here",'im here','here','arrived']))$('hereBtn').click();}).catch(function(){});}
    return;}
  if(S.phase==='checklist'){$('title').textContent='Pickup';
    body.innerHTML='<div class="count" id="counter">'+esc(s.name)+' · step '+(S.step+1)+' of '+STEPS.length+'</div><div class="prog"><div style="width:'+Math.round(S.step/STEPS.length*100)+'%"></div></div>';
    STEPS.forEach(function(st,i){var d=document.createElement('div');d.className='chk'+(i<S.step?' done':i===S.step?' cur':'');d.textContent=(i<S.step?'✓ ':i===S.step?'➜ ':'☐ ')+st.t+(st.id==='record_bag_count'&&i<S.step?': '+S.bags:'');if(i===S.step||i<S.step||i===S.step+1)body.appendChild(d);});
    var cur=STEPS[S.step];
    if(cur.id==='record_bag_count'){var w=document.createElement('div');w.style.cssText='display:flex;gap:16px;align-items:center;justify-content:center;font-size:48px;font-weight:800;color:#276749';
      w.appendChild(btn('no','−',function(){S.bags=Math.max(0,S.bags-1);render();},'minus'));var n=document.createElement('span');n.id='bagN';n.textContent=S.bags;w.appendChild(n);w.appendChild(btn('no','+',function(){S.bags=Math.min(99,S.bags+1);render();},'plus'));
      [].forEach.call(w.querySelectorAll('button'),function(b){b.style.width='84px';});body.appendChild(w);}
    if(cur.id==='impact_photo'){body.appendChild(btn('later',S.photo?'📷 Photo taken ✓ (mock)':'📷 Take photo (mock)',function(){S.photo=true;render();},'photoBtn'));}
    var sm=document.createElement('div');sm.className='small';sm.textContent='Weight is recorded at the Station, not here.';body.appendChild(sm);
    bottom.appendChild(btn('yes full',cur.id==='record_bag_count'?'Save '+S.bags+' bag'+(S.bags===1?'':'s'):'Done',function(){if(cur.id==='record_bag_count'&&S.bags>0)confirm6('Save '+S.bags+' bags?',stepDone);else stepDone();},'stepBtn'));
    bottom.appendChild(btn('later','💬 Ask',function(){chat();},'askBtn'));bottom.appendChild(btn('later','⚠ Problem',problem,'probBtn'));
    if(S.hf){var g3=++S.gen;V.speak(cur.t+(cur.id==='record_bag_count'?'. Say the number of bags.':'. Say done when finished.')).then(function(){return V.listen(8000);}).then(function(t){if(g3!==S.gen)return;
      if(cur.id==='record_bag_count'){var n2=V.num(t);if(n2&&n2>=1&&n2<=99){S.bags=Math.round(n2);render();confirm6('Save '+S.bags+' bags?',stepDone);}}
      else if(V.has(t,['done','finished','complete','yes','next']))stepDone();else if(V.has(t,['problem']))problem();}).catch(function(){});}
    return;}
  if(S.phase==='complete'){$('title').textContent='Pickup';body.innerHTML=hdr+'<h1>Ready to finish '+esc(s.name)+'?</h1><div class="rec">'+S.bags+' bags · photo ✓ · bags in vehicle ✓</div>';
    bottom.appendChild(btn('yes full','✓ Complete Pickup',function(){confirm6('Complete pickup at '+s.name+'?',complete);},'completeBtn'));bottom.appendChild(btn('later full','⚠ Report a problem',problem,'probBtn'));return;}
  if(S.phase==='done'){var nx=STOPS[S.si+1];$('title').textContent='Pickup done';
    body.innerHTML='<div class="big">✅</div><h1 class="c">Done at '+esc(s.name)+'</h1><div class="rec">'+S.bags+' bags · photo saved · bags in vehicle</div>'+(nx?'<div class="count c">Next stop: '+esc(nx.name)+'</div>':'');
    bottom.appendChild(btn('yes full',nx?'▶ Next stop':'Finish for today',next,'nextBtn'));
    if(S.hf)V.speak('Nice work. '+(nx?'Next stop: '+nx.name+'.':'That was your last stop.'));return;}
  if(S.phase==='alldone'){$('title').textContent='My pickups';body.innerHTML='<div class="big">🎉</div><h1 class="c" id="allDone">All pickups done today</h1><div class="count c">Thank you! Drive safe.</div>';
    body.appendChild(btn('later','Start over (prototype)',function(){S.si=0;S.phase='today';S.bags=0;S.photo=false;render();},'restartBtn'));return;}
  if(S.phase==='problem'){$('title').textContent='Report a problem';body.innerHTML='<h1>What went wrong?</h1>';var g=document.createElement('div');g.className='grid';
    ['🔒 Can\'t get in','🗑 No bags or bins','🚗 Running late','🤕 Safety issue','📷 Can\'t take photo','✏ Something else'].forEach(function(r,i){var b=btn('tile',r,function(){S.reason=r;[].forEach.call(g.children,function(x){x.classList.remove('on');});b.classList.add('on');},'reason'+i);g.appendChild(b);});
    body.appendChild(g);var r=document.createElement('div');r.className='chatin';r.innerHTML='<input id="probNote" placeholder="Say or type what happened (optional)" aria-label="What happened">';body.appendChild(r);
    var sm2=document.createElement('div');sm2.className='small';sm2.textContent='Tip: use your keyboard\'s mic key to talk. If it\'s a safety emergency, call 911 first.';body.appendChild(sm2);
    bottom.appendChild(btn('yes full','Send to office',function(){if(!S.reason){toast('Pick what went wrong first.');return;}var nt=$('probNote').value.trim();
      confirm6('Send "'+S.reason.replace(/^\S+\s/,'')+'"'+(nt?' with your note':'')+' to the office?',function(){S.log.push('Problem: '+S.reason);S.reason=null;S.phase=S.prev;toast('<b>✓ Sent</b> (prototype: nothing really sent)');render();});},'sendProb'));
    bottom.appendChild(btn('later full','Back',function(){S.phase=S.prev;render();},'backBtn'));return;}
}
window.__drv=S;render();
})();
