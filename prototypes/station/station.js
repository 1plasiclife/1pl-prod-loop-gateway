/* 1PL Station 1 (kiosk) flow: TEST PROTOTYPE with EXAMPLE DATA. No network. */
(function(){
var WORKERS=['Example A.','Example B.','Example C.','Example D.','Example E.'];
var SCHOOLS=[{n:'Example School 1',c:'🟢'},{n:'Example School 2',c:'🔵'},{n:'Example School 3',c:'🟠'}];
var MATS=['Plastic','Paper','Metal'];
var S={phase:'checkin',worker:null,since:0,school:null,bagOpen:false,bins:{},weighed:[],tasks:[{t:'Rinse and stack lids (example)',d:false},{t:'Wipe down the sorting table (example)',d:false},{t:'Fold empty bags (example)',d:false}],undo:null};
var $=function(i){return document.getElementById(i);},body=$('body'),bottom=$('bottom');
function btn(c,l,f,id){var b=document.createElement('button');b.className=c;b.textContent=l;b.onclick=f;if(id)b.id=id;return b;}
function toast(t,undo){$('toastText').innerHTML=t;$('undoBtn').classList.toggle('hidden',!undo);S.undo=undo||null;$('toast').classList.remove('hidden');clearTimeout(S.tt);S.tt=setTimeout(function(){$('toast').classList.add('hidden');S.undo=null;},3000);}
$('undoBtn').onclick=function(){if(S.undo){var u=S.undo;S.undo=null;u();$('toast').classList.add('hidden');render();}};
function mins(){var m=Math.max(0,Math.round((Date.now()-S.since)/60000));return Math.floor(m/60)+' h '+(m%60)+' min';}
function total(){return S.weighed.reduce(function(a,w){return a+w.lb;},0);}
function chat(){Chat.open({about:'Sorting at Station 1',chips:['Which bin does this go in?','How do I fix a wrong weight?','What counts as my hours?'],
  qa:[{k:['bin','go in','where'],a:'Example answer: clean plastic bottles go in Plastic, paper and cardboard in Paper, cans in Metal.'},
      {k:['fix','wrong','mistake'],a:'Use Undo right after saving. Later, tell the supervisor and they can correct it (example).'},
      {k:['hours','count'],a:'Every role\'s time counts, from check-in to End shift (example).'}],onClose:render});}
function pending(){return MATS.filter(function(m){return S.bins[m]==='full';});}
function weigh(mat){S.phase='weigh';S.mat=mat;render();}
function saveWeight(mat,lb){S.weighed.push({mat:mat,lb:lb,school:S.school});S.bins[mat]='empty';S.phase='sort';
  toast('<b>✓ Saved</b> '+mat+' · '+lb+' lb',function(){S.weighed.pop();S.bins[mat]='full';});render();}
function render(){body.innerHTML='';bottom.innerHTML='';$('who').textContent=S.worker?('👤 '+S.worker+' · '+mins()):'';
  var steps='<div class="count">'+['Sign in','Select school','Sort & weigh','End shift'].map(function(s,i){var cur={checkin:0,school:1,sort:2,weigh:2,volunteer:2,checkout:3}[S.phase];return (i===cur?'<b style="color:#276749">➜ '+s+'</b>':s);}).join(' → ')+'</div>';
  if(S.phase==='checkin'){$('title').textContent='Station 1 · Sorting';
    body.innerHTML='<h1>Hello! Who\'s working?</h1><div class="count">Tap your name. (In LOOP you can also scan your badge.) Every role\'s hours count.</div>';
    var g=document.createElement('div');g.className='grid3';WORKERS.forEach(function(w,i){g.appendChild(btn('tile',w,function(){signIn(w);},'w'+i));});body.appendChild(g);
    var n=V.unsupportedNote();if(n){var d=document.createElement('div');d.className='note';d.textContent=n;body.appendChild(d);}
    bottom.appendChild(btn('yes full','🎤 Talk: say your name',function(){if(!V.stt){toast('Voice isn\'t available here. Please tap your name.');return;}
      V.listen(8000).then(function(t){var w=WORKERS.filter(function(x){return t.indexOf(x.toLowerCase().split(' ')[1].replace('.',''))>=0;})[0];
        if(w)confirm6('Sign in as '+w+'?',function(){signIn(w);});else toast('Didn\'t catch a name. Please tap your name.');}).catch(function(){toast(V.micHelp);});},'talkBtn'));return;}
  if(S.phase==='school'){$('title').textContent='Station 1';body.innerHTML=steps+'<h1>Next: tap a school to start sorting</h1>';
    var g2=document.createElement('div');g2.className='grid3';SCHOOLS.forEach(function(s,i){g2.appendChild(btn('tile',s.c+' '+s.n,function(){S.school=s.n;S.bagOpen=true;S.phase='sort';toast('<b>Bag open</b> for '+s.n);render();},'s'+i));});body.appendChild(g2);
    body.appendChild(btn('later','📋 My volunteer tasks',function(){S.phase='volunteer';render();},'volBtn'));body.appendChild(btn('later','💬 Ask',chat,'askBtn'));
    bottom.appendChild(btn('no full','End shift (clock out)',function(){S.phase='checkout';render();},'endBtn'));return;}
  if(S.phase==='sort'){$('title').textContent='Sort & weigh · '+S.school;
    body.innerHTML=steps+'<h1>Sort the bag. When a bin is full, tap it to weigh.</h1>';var g3=document.createElement('div');g3.className='grid3';
    MATS.forEach(function(m,i){var st=S.bins[m];g3.appendChild(btn('tile'+(st==='full'?' on':''),m+(st==='full'?' · FULL, weigh now':''),function(){S.bins[m]='full';weigh(m);},'bin'+i));});body.appendChild(g3);
    if(S.weighed.length){var l=document.createElement('div');l.className='box';l.id='weighLog';l.textContent='Weighed today: '+S.weighed.map(function(w){return w.mat+' '+w.lb+' lb';}).join(', ')+' · total '+total()+' lb';body.appendChild(l);}
    var r=document.createElement('div');r.className='grid';r.appendChild(btn('later','📋 Volunteer tasks',function(){S.phase='volunteer';render();},'volBtn'));r.appendChild(btn('later','💬 Ask',chat,'askBtn'));body.appendChild(r);
    bottom.appendChild(btn('yes','Close bag',function(){var p=pending();if(p.length){toast('Weigh '+p[0]+' first, then close the bag.');return;}S.bagOpen=false;S.phase='school';toast('<b>✓ Bag closed</b>');render();},'closeBag'));
    bottom.appendChild(btn('no','End shift',function(){S.phase='checkout';render();},'endBtn'));return;}
  if(S.phase==='weigh'){$('title').textContent='Weigh · '+S.mat;
    body.innerHTML=steps+'<h1>Put the '+S.mat+' bin on the scale</h1><div class="count">Type the weight, or tap 🎤 and say it (for example "'+S.mat.toLowerCase()+' twenty-five pounds").</div>'+
      '<div style="display:flex;gap:12px;align-items:center;justify-content:center"><input id="lbs" inputmode="decimal" aria-label="Weight in pounds" style="font:inherit;font-size:56px;font-weight:800;width:200px;text-align:center;border:3px solid #276749;border-radius:16px;color:#276749"><span style="font-size:36px;font-weight:800;color:#276749">lb</span></div><div id="heard" class="small c"></div>';
    var mic=btn('later','🎤 Say the weight',function(){if(!V.stt){$('heard').textContent='Voice isn\'t available on this browser. Please type the weight (your keyboard\'s mic key also works).';return;}
      mic.classList.add('listening');V.listen(8000).then(function(t){mic.classList.remove('listening');var n=V.num(t);$('heard').textContent='Heard: "'+t+'"';
        if(n&&n>0&&n<1000){$('lbs').value=n;var m2=MATS.filter(function(x){return t.indexOf(x.toLowerCase())>=0;})[0]||S.mat;confirm6(m2+' · '+n+' lb. Save?',function(){saveWeight(m2,n);});}
        else $('heard').textContent+=' · I didn\'t catch a number. Please try again or type it.';}).catch(function(){mic.classList.remove('listening');$('heard').textContent=V.micHelp;});},'micBtn');
    body.appendChild(mic);
    bottom.appendChild(btn('yes','✓ Save weight',function(){var n=parseFloat($('lbs').value);if(!(n>0&&n<1000)){$('heard').textContent='Please enter a weight between 0 and 1000 lb.';return;}confirm6(S.mat+' · '+n+' lb. Save?',function(){saveWeight(S.mat,n);});},'saveW'));
    bottom.appendChild(btn('no','Back',function(){S.phase='sort';render();},'backBtn'));return;}
  if(S.phase==='volunteer'){$('title').textContent='Volunteer tasks';body.innerHTML='<h1>Your tasks today, '+S.worker+'</h1>';
    S.tasks.forEach(function(t,i){var b=btn('chk'+(t.d?' done':''),(t.d?'✓ ':'☐ ')+t.t,function(){t.d=!t.d;render();},'task'+i);b.style.cssText='width:100%;text-align:left;background:'+(t.d?'#eef7ea':'#fff');body.appendChild(b);});
    var h=document.createElement('div');h.className='rec';h.textContent='Your time today: '+mins()+' (counts toward your hours)';body.appendChild(h);
    bottom.appendChild(btn('yes full','Back to sorting',function(){S.phase=S.bagOpen?'sort':'school';render();},'backBtn'));return;}
  if(S.phase==='checkout'){$('title').textContent='End shift';var p=pending(),blocked=S.bagOpen||p.length;
    body.innerHTML='<div class="big">👋</div><h1 class="c">Ready to finish, '+S.worker+'?</h1><div class="rec c">Today: '+mins()+' · '+S.weighed.length+' bins weighed · '+total()+' lb sorted · '+S.tasks.filter(function(t){return t.d;}).length+' tasks done</div>'+
      (blocked?'<div class="note" id="blocked">⚠ '+(p.length?'Weigh '+p[0]+' first, then close the bag.':'The bag for '+S.school+' is still open. Close the bag first.')+'</div>':'');
    var eb=btn('yes','✓ End shift (clock out)',function(){if(blocked)return;S.log=(S.log||[]);S.phase='bye';render();},'clockOut');eb.disabled=!!blocked;bottom.appendChild(eb);
    bottom.appendChild(btn('no','Keep working',function(){S.phase=S.bagOpen?'sort':'school';render();},'keepBtn'));return;}
  if(S.phase==='bye'){$('title').textContent='Station 1';body.innerHTML='<div class="big">🎉</div><h1 class="c" id="byeTitle">Thanks, '+S.worker+'! See you next time.</h1><div class="count c">Your hours are saved (prototype: nothing really saved).</div>';
    bottom.appendChild(btn('yes full','Next person',function(){S.phase='checkin';S.worker=null;S.weighed=[];S.bins={};S.school=null;S.bagOpen=false;S.tasks.forEach(function(t){t.d=false;});render();},'nextPerson'));}
}
function signIn(w){S.worker=w;S.since=Date.now();S.phase='school';toast('<b>✓ Signed in:</b> '+w,function(){S.worker=null;S.phase='checkin';});render();}
setInterval(function(){if(S.worker)$('who').textContent='👤 '+S.worker+' · '+mins();},30000);
window.__st=S;render();
})();
