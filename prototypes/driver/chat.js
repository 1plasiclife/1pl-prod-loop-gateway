/* Ask-about-this chat: canned EXAMPLE answers only. No network. */
(function(){
  var C = {};
  C.open = function(opts){
    // opts: {about, qa:[{k:[keywords], a:'answer', draft?:'text'}], onDraft(text), handsFree}
    var m=document.createElement('div'); m.className='modal'; m.id='chatModal';
    m.innerHTML='<div class="sheet" role="dialog" aria-label="Ask about this" style="height:88vh">'+
      '<div style="display:flex;justify-content:space-between;align-items:center"><h2 style="margin:0">💬 Ask about this</h2><button class="pill" id="chatClose">Back</button></div>'+
      '<div class="small">About: <b></b></div>'+
      '<div class="note" style="font-size:13px">Prototype: answers are <b>scripted example answers</b>, not from a real bot. The chat never takes an action.</div>'+
      '<div class="chips"></div><div class="msgs" aria-live="polite"></div>'+
      '<div class="chatin"><input id="chatInput" placeholder="Type a question…" aria-label="Your question"><button class="mic" id="chatMic" aria-label="Ask by voice">🎤</button><button class="pill" id="chatSend">Send</button></div>'+
      '<div class="bottom" style="position:static;padding:0" id="chatActs"></div></div>';
    document.body.appendChild(m);
    m.querySelector('.small b').textContent=opts.about;
    var msgs=m.querySelector('.msgs'), chips=m.querySelector('.chips'), acts=m.querySelector('#chatActs');
    var lastDraft=null;
    function add(cls, text, ex){ var d=document.createElement('div'); d.className='msg '+cls;
      if(ex){ var s=document.createElement('span'); s.className='ex-tag'; s.textContent='EXAMPLE ANSWER'; d.appendChild(s); }
      d.appendChild(document.createTextNode(V.show(text))); msgs.appendChild(d); msgs.scrollTop=1e6; return d; }
    function answer(q){
      if(!q) return; add('me', q);
      var th=add('bot','Thinking…');
      var lq=V.words(q), hit=null;
      opts.qa.forEach(function(x){ if(!hit && x.k.some(function(k){ return lq.indexOf(k)>=0; })) hit=x; });
      setTimeout(function(){
        th.remove();
        var a = hit ? hit.a : "I don't have that in this item's notes (example). In the real version, I'd ask the owning bot and the answer would appear here.";
        add('bot', a, true);
        if(hit && hit.draft){ lastDraft=hit.draft; acts.innerHTML='<button class="yes full" id="useDraft" style="font-size:22px;min-height:60px">Use new draft</button>';
          acts.querySelector('#useDraft').onclick=function(){ if(opts.onDraft) opts.onDraft(lastDraft); close(); }; }
        if(opts.handsFree && V.tts) V.speak(a);
      }, 700);
    }
    (opts.chips||[]).forEach(function(c){ var b=document.createElement('button'); b.className='chip'; b.textContent=c; b.onclick=function(){ answer(c); }; chips.appendChild(b); });
    var inp=m.querySelector('#chatInput');
    m.querySelector('#chatSend').onclick=function(){ var q=inp.value.trim(); inp.value=''; answer(q); };
    inp.onkeydown=function(e){ if(e.key==='Enter'){ m.querySelector('#chatSend').click(); } };
    var micB=m.querySelector('#chatMic');
    micB.onclick=function(){
      if(!V.stt){ add('bot', V.unsupportedNote()+' You can also use your keyboard\'s mic key in the text box.'); return; }
      micB.classList.add('listening');
      V.listen(8000).then(function(t){ micB.classList.remove('listening'); if(t) answer(t); else add('bot','I didn\'t catch that. Tap 🎤 to try again, or type.'); })
        .catch(function(){ micB.classList.remove('listening'); add('bot', V.micHelp); });
    };
    function close(){ V.stop(); m.remove(); if(opts.onClose) opts.onClose(); }
    m.querySelector('#chatClose').onclick=close;
    if(opts.firstQuestion) answer(opts.firstQuestion);
    return {answer:answer, close:close};
  };
  window.Chat = C;
})();
