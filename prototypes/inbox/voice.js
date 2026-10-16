/* Shared prototype voice helper. Uses only the browser's Web Speech API. No network calls from this file. */
(function(){
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var V = {
    tts: 'speechSynthesis' in window,
    stt: !!SR,
    quiet: false,
    active: null,
    redact: function(t){
      if(!V.quiet) return t.replace(/\[\[|\]\]/g,'');
      return t.replace(/\[\[[^\]]*\]\]/g,'details on screen')
              .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g,'details on screen')
              .replace(/\$\s?\d[\d,]*(\.\d+)?/g,'details on screen')
              .replace(/\(?\d{3}\)?[ -]?\d{3}-\d{4}/g,'details on screen');
    },
    show: function(t){ return t.replace(/\[\[|\]\]/g,''); },
    speak: function(text){
      return new Promise(function(res){
        if(!V.tts){ res(); return; }
        try{
          speechSynthesis.cancel();
          var u = new SpeechSynthesisUtterance(V.redact(text));
          u.lang='en-US'; u.rate=1.0;
          var done=false, fin=function(){ if(!done){done=true;res();} };
          u.onend=fin; u.onerror=fin;
          setTimeout(fin, Math.min(20000, 1500 + text.length*80));
          speechSynthesis.speak(u);
        }catch(e){ res(); }
      });
    },
    stop: function(){ try{ if(V.tts) speechSynthesis.cancel(); if(V.active) V.active.abort(); }catch(e){} V.active=null; },
    /* One-shot listen. Resolves with lowercase transcript, or '' on timeout/no speech, or rejects {error} on permission problems. */
    listen: function(ms){
      return new Promise(function(res, rej){
        if(!SR){ rej({error:'unsupported'}); return; }
        var r; try{ r = new SR(); }catch(e){ rej({error:'unsupported'}); return; }
        V.active = r;
        r.lang='en-US'; r.interimResults=false; r.maxAlternatives=3; r.continuous=false;
        var got=false, t=setTimeout(function(){ try{r.stop();}catch(e){} }, ms||8000);
        r.onresult=function(e){ got=true; clearTimeout(t); V.active=null; res(String(e.results[0][0].transcript||'').toLowerCase().trim()); };
        r.onerror=function(e){ clearTimeout(t); V.active=null;
          if(e.error==='not-allowed'||e.error==='service-not-allowed'||e.error==='audio-capture') rej({error:e.error}); else res(''); };
        r.onend=function(){ clearTimeout(t); V.active=null; if(!got) res(''); };
        try{ r.start(); }catch(e){ clearTimeout(t); rej({error:'start-failed'}); }
      });
    },
    words: function(t){ return ' '+String(t||'').toLowerCase().replace(/[^a-z0-9' ]/g,' ').replace(/\s+/g,' ')+' '; },
    has: function(t, list){ var w=V.words(t); return list.some(function(x){ return w.indexOf(' '+x+' ')>=0; }); },
    command: function(t){
      if(V.has(t,['undo','go back'])) return 'undo';
      if(V.has(t,['repeat','say again','again'])) return 'repeat';
      if(V.has(t,['pause','stop'])) return 'pause';
      if(V.has(t,['details','tell me more','more detail'])) return 'details';
      if(V.has(t,['needs detail','need detail','needs a closer look'])) return 'needsdetail';
      if(V.has(t,['skip','next'])) return 'skip';
      if(V.has(t,['later','not now'])) return 'later';
      if(V.has(t,['confirm','confirm send'])) return 'confirm';
      if(V.has(t,['yes','yeah','yep','yup','sure','okay','ok','accept'])) return 'yes';
      if(V.has(t,['no','nope','nah'])) return 'no';
      return null;
    },
    num: function(t){
      var w=V.words(t), m=w.match(/\d+(\.\d+)?/); if(m) return parseFloat(m[0]);
      var u={zero:0,one:1,two:2,to:2,too:2,three:3,four:4,for:4,five:5,six:6,seven:7,eight:8,ate:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,a:1,an:1};
      var tn={twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
      var toks=w.trim().split(' '), n=null;
      for(var i=0;i<toks.length;i++){
        if(tn[toks[i]]!=null){ n=(n||0)+tn[toks[i]]; }
        else if(u[toks[i]]!=null && toks[i]!=='a' && toks[i]!=='an' && toks[i]!=='to' && toks[i]!=='for'){ n=(n||0)+u[toks[i]]; }
        else if(toks[i]==='hundred'){ n=(n||1)*100; }
        else if(n!=null && toks[i]==='point' && u[toks[i+1]]!=null){ n+=u[toks[i+1]]/10; i++; }
      }
      return n;
    },
    unsupportedNote: function(){
      if(V.stt && V.tts) return '';
      if(!V.stt && V.tts) return 'Voice answers are not supported on this browser. It can still read items aloud. Please tap to answer.';
      return 'Voice is not supported on this browser. Please tap to answer.';
    },
    micHelp: 'The microphone is off for this page. Tapping still works. To use voice, allow the microphone for this site in your browser settings and try again. If asked, choose "Allow" (not "Never allow").'
  };
  window.V = V;
})();
