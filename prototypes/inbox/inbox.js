/* 1PL Supervisor Decision Inbox: TEST PROTOTYPE with EXAMPLE DATA only. No network calls. */
(function(){
var QUICK=[
 {id:'q1',q:'Publish the fixed wording on the pickup page?',rec:'Yes',why:'It was checked, and it can be undone in 15 minutes.'},
 {id:'q2',q:'File the new cleaning checklist with the station notes?',rec:'Yes',why:'It is an internal document only.'},
 {id:'q3',q:'Move the weekly team check-in to Thursday?',rec:'Yes',why:'Two people asked for it, and nothing else is booked then.'},
 {id:'q4',q:'Archive last month\'s finished pickup reminders?',rec:'Yes',why:'They are done, and archiving can be undone.'},
 {id:'q5',q:'Turn on the shorter daily summary for bots?',rec:'No',why:'The long one caught two problems last week.'},
 {id:'q6',q:'Add the example school to the fall pickup list?',rec:'Yes',why:'They asked, and there is room on the route.'}
];
var DETAIL=[
 {id:'d1',cat:'Emails',q:'Send the reply to the grant contact?',rec:'Yes',why:'The draft answers their question.',tier2:true,
  action:'Send an email to [[the grant contact (example)]] with the subject "Thanks for your visit".',
  ctx:'To: [[example.contact@example.org]]\nSubject: Thanks for your visit\n"Thank you for visiting our station last week. Here are the answers to your three questions…"',
  chips:['Who sent this?','What\'s the deadline?','What happens if I say no?','Make it shorter'],
  qa:[{k:['who'],a:'The grant contact emailed on Monday (example). Our office assistant drafted the reply.'},
      {k:['deadline','when','due'],a:'They asked for an answer by Friday (example).'},
      {k:['say no','if i say no','happens'],a:'Nothing is sent. The draft stays saved, and I\'ll ask again tomorrow.'},
      {k:['short','draft','reply','rewrite'],a:'Here is a shorter draft (example): "Thanks for visiting! Answers attached. Happy to talk more." Nothing has been sent.',draft:'Thanks for visiting! Answers attached. Happy to talk more.'}]},
 {id:'d2',cat:'Grants and funding',q:'Apply for the example community recycling grant?',rec:'Later',why:'The deadline is a month away, and the budget page isn\'t ready.',
  ctx:'Example grant, up to [[$5,000]] (example). Deadline in about 4 weeks (example). Needs a budget page and one letter.',
  chips:['How much is it?','What\'s missing?','Who would write it?'],
  qa:[{k:['much','amount','money'],a:'Up to $5,000 (example).'},{k:['missing','need'],a:'A one-page budget and one support letter (example).'},{k:['who','write'],a:'The grants assistant would draft it for your review (example).'}]},
 {id:'d3',cat:'Money and finance',q:'Approve this week\'s card expenses as sorted?',rec:'Yes',why:'All 4 match receipts.',tier2:true,
  action:'Mark 4 card expenses totaling [[$212.40]] (example) as approved.',
  ctx:'4 expenses (example): bags [[$84.00]], fuel [[$61.40]], gloves [[$27.00]], printing [[$40.00]].',
  chips:['Which ones?','Any odd ones?'],qa:[{k:['which','list'],a:'Bags, fuel, gloves and printing (example amounts on screen).'},{k:['odd','unusual','strange'],a:'None look unusual (example).'}]},
 {id:'d4',cat:'Social',q:'Post the example pickup-day photo reel?',rec:'Change',why:'Use the version without children\'s faces.',
  ctx:'Two versions of the reel (example). Version B has no faces.',chips:['Why version B?'],qa:[{k:['why','version'],a:'Version B avoids showing students\' faces (example).'}]}
];
var S={stage:'start',qi:0,di:0,ans:{},hf:false,quiet:false,undo:null,gen:0,misses:0,needsTap:{},quick:QUICK.slice(),detail:DETAIL.slice(),t0:0};
var $=function(id){return document.getElementById(id);};
var body=$('body'),bottom=$('bottom');
function lc(t){return t.charAt(0).toLowerCase()+t.slice(1);}
function esc(t){return V.show(String(t)).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}).replace(/\n/g,'<br>');}
function btn(cls,label,fn,id){var b=document.createElement('button');b.className=cls;b.textContent=label;b.onclick=fn;if(id)b.id=id;return b;}
function setHF(on){S.hf=on;$('hfPill').textContent='🎧 Hands-free: '+(on?'on':'off');if(!on){S.gen++;V.stop();}}
$('hfPill').onclick=function(){setHF(!S.hf);render();if(S.hf)loop();};

function toast(text){$('toastText').innerHTML=text;$('toast').classList.remove('hidden');clearTimeout(S.tt);S.tt=setTimeout(function(){$('toast').classList.add('hidden');S.undo=null;},3000);}
$('undoBtn').onclick=doUndo;
function doUndo(){if(!S.undo)return;var u=S.undo;S.undo=null;delete S.ans[u.id];S.stage=u.stage;S.qi=u.qi;S.di=u.di;if(u.restore)u.restore();$('toast').classList.add('hidden');S.gen++;render();if(S.hf)loop();}

function record(item,a,note){S.undo={id:item.id,stage:S.stage,qi:S.qi,di:S.di};S.ans[item.id]={a:a,note:note||'',q:item.q};S.misses=0;
  toast('<b>✓ '+a+'</b> saved'+(note?': "'+esc(note)+'"':''));}
function nextQuick(){S.qi++;if(S.qi>=S.quick.length)S.stage='review1';}
function nextDetail(){S.di++;if(S.di>=S.detail.length)S.stage='review2';}

function quickAnswer(a){var it=S.quick[S.qi];if(!it)return;record(it,a);nextQuick();S.gen++;render();if(S.hf)loop();}
function needsDetail(){var it=S.quick[S.qi];var cp=S.quick.slice(),dp=S.detail.slice();S.undo={id:'_',stage:S.stage,qi:S.qi,di:S.di,restore:function(){S.quick=cp;S.detail=dp;}};
  S.detail.push({id:it.id,cat:'Moved from quick questions',q:it.q,rec:it.rec,why:it.why,ctx:'You moved this here to look at it more closely.',qa:[]});
  S.quick.splice(S.qi,1);if(S.qi>=S.quick.length)S.stage='review1';toast('Moved to <b>Needs a closer look</b>');S.gen++;render();if(S.hf)loop();}

function detailAnswer(a,note){var it=S.detail[S.di];if(!it)return;
  if(a==='Yes'&&it.tier2){tier2(it,note);return;}
  record(it,a,note);nextDetail();S.gen++;render();if(S.hf)loop();}

function tier2(it,note){S.gen++;var m=document.createElement('div');m.className='modal';m.id='t2';
  m.innerHTML='<div class="sheet" role="dialog" aria-label="Confirm"><h2>Please confirm</h2><div class="rec" style="border-color:#b00020"><b>This will:</b><br>'+esc(it.action)+'</div>'+
  '<div class="small">This is an important action (an email, money, signature, account, deletion or live change), so it always needs a tap, even in hands-free mode. Prototype: nothing is really sent.</div>'+
  '<div class="bottom" style="position:static;padding:0"><button class="yes" id="t2ok">Confirm</button><button class="no" id="t2no">Cancel</button></div></div>';
  document.body.appendChild(m);
  $('t2ok').onclick=function(){m.remove();record(it,'Yes (confirmed)',note);nextDetail();render();if(S.hf)loop();};
  $('t2no').onclick=function(){m.remove();render();if(S.hf)loop();};
  if(S.hf){var g=S.gen;V.speak('Please confirm. This will: '+it.action+' Say confirm, then tap Confirm. Or say cancel.').then(function(){return listenCmd(g);}).then(function(t){
    if(g!==S.gen||!document.getElementById('t2'))return;
    if(V.has(t,['cancel','no'])){$('t2no').click();return;}
    if(V.command(t)==='confirm'||V.command(t)==='yes'){$('t2ok').style.outline='6px solid #62BB46';V.speak('Now tap Confirm to finish.');}
  });}
}

function openChat(it,first){S.gen++;V.stop();Chat.open({about:V.show(it.q),qa:it.qa||[],chips:it.chips||['Who sent this?','What happens if I say no?'],handsFree:S.hf,firstQuestion:first,
  onDraft:function(d){it.ctx='NEW DRAFT (example): "'+d+'"';it.why='You asked for a shorter draft.';toast('Draft updated. Nothing sent.');},
  onClose:function(){render();}});}

function stars(){var n=Object.keys(S.ans).length;return n;}
function render(){
  body.innerHTML='';bottom.innerHTML='';var note=V.unsupportedNote();
  if(S.stage==='start'){$('title').textContent='1PL Decisions';
    var est=Math.max(1,Math.round(S.quick.length*10/60));
    body.innerHTML='<div class="hero"><h1>'+S.quick.length+' quick questions</h1><div class="count">About '+est+' minute'+(est>1?'s':'')+'. Then '+S.detail.length+' that need a closer look. Every answer keeps plastic moving. ♻</div></div>';
    var t1=btn('toggle','',function(){var on=t1.getAttribute('aria-checked')!=='true';t1.setAttribute('aria-checked',on);setHF(on);});
    t1.setAttribute('role','switch');t1.setAttribute('aria-checked',S.hf||(V.stt&&V.tts));t1.id='hfToggle';t1.innerHTML='<span>🎧 Hands-free (talk to answer)</span><span class="sw"></span>';
    var t2=btn('toggle','',function(){var on=t2.getAttribute('aria-checked')!=='true';t2.setAttribute('aria-checked',on);S.quiet=V.quiet=on;});
    t2.setAttribute('role','switch');t2.setAttribute('aria-checked',S.quiet);t2.id='quietToggle';t2.innerHTML='<span>🤫 Quiet mode (don\'t read names, amounts or emails)</span><span class="sw"></span>';
    body.appendChild(t1);body.appendChild(t2);
    if(note){var n=document.createElement('div');n.className='note';n.id='vnote';n.textContent=note;body.appendChild(n);}
    var p=document.createElement('div');p.className='small';p.textContent='Tapping Start may ask to use your microphone (hands-free only). Choose "Allow". You can always tap instead.';body.appendChild(p);
    var sb=btn('yes full','▶ Start',function(){S.t0=Date.now();S.stage=S.quick.length?'quick':'detail';setHF(t1.getAttribute('aria-checked')==='true'&&(V.stt||V.tts));render();if(S.hf)loop();},'startBtn');sb.style.minHeight='104px';bottom.appendChild(sb);
    var s2=document.createElement('div');s2.className='small c full';s2.textContent='You can stop any time. Nothing is lost.';bottom.appendChild(s2);return;}
  if(S.stage==='quick'){var it=S.quick[S.qi];$('title').textContent='Quick questions';
    body.innerHTML='<div class="count" id="counter">'+(S.qi+1)+' of '+S.quick.length+'</div><div class="prog"><div style="width:'+Math.round(S.qi/S.quick.length*100)+'%"></div></div>'+
      '<h1 id="qtext">'+esc(it.q)+'</h1><div class="rec"><b>We suggest: '+it.rec+'</b><br>'+esc(it.why)+'</div>'+
      (S.needsTap[it.id]?'<div class="note">I couldn\'t hear an answer. Please tap.</div>':'')+
      (S.hf?'<div class="speak" id="speak">🔊 Reading this out, then listening 🎤<br><span style="opacity:.85">Say yes, no or later. Or: repeat, skip, needs detail, undo, pause.</span></div>':'')+
      (note&&S.hf?'<div class="note">'+note+'</div>':'');
    var row=document.createElement('div');row.className='grid';
    row.appendChild(btn('later','💬 Ask about this',function(){openChat(it);},'askBtn'));
    row.appendChild(btn('later','Needs a closer look',needsDetail,'ndBtn'));body.appendChild(row);
    bottom.appendChild(btn('yes','Yes',function(){quickAnswer('Yes');},'yesBtn'));bottom.appendChild(btn('no','No',function(){quickAnswer('No');},'noBtn'));
    bottom.appendChild(btn('later full','Later',function(){quickAnswer('Later');},'laterBtn'));return;}
  if(S.stage==='review1'||S.stage==='review2'){$('title').textContent='Review my answers';
    var ids=(S.stage==='review1'?S.quick:S.detail).map(function(x){return x.id;});
    var h='<h1>'+(S.stage==='review1'?'Quick questions done!':'Closer-look items done!')+'</h1><div class="count">Tap any answer to change it.</div>';
    body.innerHTML=h;
    ids.forEach(function(id,i){var a=S.ans[id];if(!a)return;var b=btn('toggle','',function(){delete S.ans[id];if(S.stage==='review1'){S.stage='quick';S.qi=i;}else{S.stage='detail';S.di=i;}render();});
      b.innerHTML='<span>'+esc(a.q)+'</span><b style="color:#276749">'+esc(a.a)+'</b>';b.className='toggle review-item';body.appendChild(b);});
    var rb=btn('later','🔊 Hear my answers',function(){readReview(ids);},'hearBtn');body.appendChild(rb);
    bottom.appendChild(btn('yes full',S.stage==='review1'?(S.detail.length?'Continue to closer-look items':'Finish'):'Finish',function(){
      if(S.stage==='review1'&&S.detail.length){S.stage='detail';S.di=0;}else S.stage='done';S.gen++;render();if(S.hf)loop();},'contBtn'));return;}
  if(S.stage==='detail'){var d=S.detail[S.di];$('title').textContent='Needs a closer look';
    body.innerHTML='<div class="count" id="counter">'+esc(d.cat)+' · '+(S.di+1)+' of '+S.detail.length+'</div><div class="prog"><div style="width:'+Math.round(S.di/S.detail.length*100)+'%"></div></div>'+
      '<h1 id="qtext">'+esc(d.q)+'</h1><div class="rec"><b>We suggest: '+d.rec+'</b><br>'+esc(d.why)+'</div><div class="box" id="ctx">'+esc(d.ctx)+'</div>'+
      (S.hf?'<div class="speak">🔊 Say yes, no, later, or say your own answer. Say "tell me more" for details, or ask any question.</div>':'');
    var r2=document.createElement('div');r2.className='chatin';r2.innerHTML='<input id="noteIn" placeholder="Or type your answer / changes…" aria-label="Your answer">';
    r2.appendChild(btn('pill','Save',function(){var v=$('noteIn').value.trim();if(v)detailAnswer('Change',v);},'noteSave'));body.appendChild(r2);
    body.appendChild(btn('later','💬 Ask about this',function(){openChat(d);},'askBtn'));
    bottom.appendChild(btn('yes',d.tier2?'Yes…':'Yes',function(){detailAnswer('Yes');},'yesBtn'));
    bottom.appendChild(btn('no','No',function(){detailAnswer('No');},'noBtn'));
    bottom.appendChild(btn('later full','Later',function(){detailAnswer('Later');},'laterBtn'));return;}
  if(S.stage==='done'){$('title').textContent='1PL Decisions';var mins=Math.max(1,Math.round((Date.now()-S.t0)/60000));
    body.innerHTML='<div class="big">🎉</div><h1 class="c" id="doneTitle">All caught up</h1><div class="count c">'+stars()+' answered in about '+mins+' minute'+(mins>1?'s':'')+'.</div>';
    body.appendChild(btn('later','🔊 Hear my answers',function(){readReview(Object.keys(S.ans));}));
    body.appendChild(btn('later','Start over (prototype)',function(){S.stage='start';S.qi=S.di=0;S.ans={};S.quick=QUICK.slice();S.detail=DETAIL.slice();render();},'restartBtn'));
    var e=document.createElement('div');e.className='small c';e.textContent='We\'ll let you know when something new comes in.';body.appendChild(e);
    if(S.hf)V.speak('All caught up. Nice work.');}
}
function readReview(ids){var t=ids.map(function(id){var a=S.ans[id];return a?(a.q+' '+a.a+'.'):'';}).join(' ');V.speak(t||'No answers yet.');}

/* Hands-free loop */
function listenCmd(g){return V.listen(8000).catch(function(e){if(g===S.gen){setHF(false);render();var n=document.createElement('div');n.className='note';n.id='micNote';n.textContent=V.micHelp;body.prepend(n);}return '';});}
function miss(it,g){S.misses++;if(S.misses>=2){S.needsTap[it.id]=true;S.misses=0;V.speak('I\'ll mark that one for a tap and move on.');
  if(S.stage==='quick')nextQuick();else nextDetail();render();loop();return Promise.resolve(undefined);}
  return V.speak('Sorry, say yes, no or later.').then(function(){return listenCmd(g);});}
function loop(){
  if(!S.hf)return;var g=++S.gen;
  if(S.stage==='quick'){var it=S.quick[S.qi];
    var text='Question '+(S.qi+1)+' of '+S.quick.length+'. '+it.q+' We suggest '+it.rec+', because '+lc(it.why)+' Say '+it.rec.toLowerCase()+' to accept.';
    V.speak(text).then(function(){return listenCmd(g);}).then(function handle(t){
      if(g!==S.gen||!S.hf)return;var c=V.command(t);
      if(c==='yes')return quickAnswer('Yes');if(c==='no')return quickAnswer('No');if(c==='later'||c==='skip')return quickAnswer('Later');
      if(c==='needsdetail')return needsDetail();if(c==='undo')return doUndo();if(c==='repeat')return loop();
      if(c==='details')return V.speak(it.why).then(function(){return listenCmd(g);}).then(handle);
      if(c==='pause'){setHF(false);render();return V.speak('Paused. Tap Hands-free to continue.');}
      if(t&&t.split(' ').length>2){openChat(it,t);return;}
      return miss(it,g).then(function(t2){if(t2!==undefined&&g===S.gen)return handle(t2);});
    });return;}
  if(S.stage==='review1'||S.stage==='review2'){var ids=(S.stage==='review1'?S.quick:S.detail).map(function(x){return x.id;});
    var n=ids.filter(function(i){return S.ans[i];}).length;
    V.speak('Done with this part. You answered '+n+'. Say "hear my answers" to review, or yes to continue.').then(function(){return listenCmd(g);}).then(function(t){
      if(g!==S.gen)return;if(V.has(t,['hear','review','read']))return V.speak(ids.map(function(id){var a=S.ans[id];return a?a.q+' '+a.a+'.':'';}).join(' ')).then(loop);
      if(V.command(t)==='yes'){$('contBtn').click();}});return;}
  if(S.stage==='detail'){var d=S.detail[S.di];
    V.speak(d.cat+'. '+d.q+' We suggest '+d.rec+', because '+lc(d.why)+' Say yes, no, later, or your own answer.').then(function(){return listenCmd(g);}).then(function h(t){
      if(g!==S.gen||!S.hf)return;var c=V.command(t),wc=t?t.split(' ').length:0;
      if(wc&&wc<=3&&c){if(c==='yes')return detailAnswer('Yes');if(c==='no')return detailAnswer('No');if(c==='later'||c==='skip')return detailAnswer('Later');
        if(c==='undo')return doUndo();if(c==='repeat')return loop();if(c==='details')return V.speak(d.ctx).then(function(){return listenCmd(g);}).then(h);
        if(c==='pause'){setHF(false);render();return V.speak('Paused.');}}
      if(wc&&/\?$|^(who|what|when|where|why|how|is|are|can|does|do)\b/.test(t)){openChat(d,t);return;}
      if(wc>1){return V.speak('I heard: '+t+'. Save that as your answer? Say yes or no.').then(function(){return listenCmd(g);}).then(function(y){
        if(g!==S.gen)return;if(V.command(y)==='yes')return detailAnswer('Change',t);return loop();});}
      return miss(d,g).then(function(t2){if(t2!==undefined&&g===S.gen)return h(t2);});
    });}
}
window.__inbox=S;render();
})();
