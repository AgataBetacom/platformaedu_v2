
function openKbdViewer(noteId) {
  var note = savedNotes.find(function(n){ return n.id === noteId; });
  if (!note) return;
  var v   = document.getElementById('kbd-viewer');
  var txt = document.getElementById('kv-text');
  var lbl = document.getElementById('kv-lbl');
  var dot = document.getElementById('kv-dot');
  if (!v || !txt) return;
  txt.textContent = note.text;
  if (lbl) lbl.textContent = 'Strona ' + note.page;
  if (dot) dot.style.background = note.border || '#f59e0b';
  v.style.display = 'flex';
}
function closeKbdViewer() {
  var v = document.getElementById('kbd-viewer');
  if (v) v.style.display = 'none';
}

function openStylusViewer(noteId) {
  var note = savedNotes.find(function(n){ return n.id === noteId; });
  if (!note) return;
  var v   = document.getElementById('stylus-viewer');
  var img = document.getElementById('sv-img');
  var lbl = document.getElementById('sv-lbl');
  var dot = document.getElementById('sv-dot');
  if (!v || !img) return;
  img.src = note.dataUrl;
  if (lbl) lbl.textContent = 'Strona ' + note.page;
  if (dot) dot.style.background = note.border || '#7c3aed';
  v.style.display = 'flex';
}
function closeStylusViewer() {
  var v = document.getElementById('stylus-viewer');
  if (v) v.style.display = 'none';
}


function openAllNotesModal(){
  anmFilter('all');
  openModal('all-notes-modal','all-notes-content');
}
function anmFilter(type){
  ['all','kbd','sty'].forEach(function(t){
    var el=document.getElementById('anm-tab-'+t);
    if(el)el.classList.toggle('active',t===type||(type==='all'&&t==='all'));
  });
  var notes=savedNotes.slice().sort(function(a,b){return a.page-b.page;});
  if(type==='keyboard') notes=notes.filter(function(n){return n.type==='keyboard';});
  if(type==='stylus')   notes=notes.filter(function(n){return n.type==='stylus';});
  var empty=document.getElementById('anm-empty');
  var list =document.getElementById('anm-list');
  if(!notes.length){
    if(empty)empty.classList.remove('hide');
    if(list)list.innerHTML='';
    return;
  }
  if(empty)empty.classList.add('hide');
  // Group by page
  var pages={};
  notes.forEach(function(n){
    if(!pages[n.page])pages[n.page]=[];
    pages[n.page].push(n);
  });
  var html='';
  Object.keys(pages).sort(function(a,b){return a-b;}).forEach(function(pg){
    html+='<div style="margin-bottom:20px;">';
    html+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">';
    html+='<div style="height:1px;width:12px;background:#e2e8f0;"></div>';
    html+='<span style="font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;">Strona '+pg+'</span>';
    html+='<div style="flex:1;height:1px;background:#e2e8f0;"></div>';
    html+='</div>';
    pages[pg].forEach(function(n){
      var isKbd=n.type==='keyboard';
      var accent=n.border||'#f59e0b';
      html+='<div class="anm-card" style="border-left:3px solid '+accent+';margin-bottom:8px;">';
      html+='<div class="anm-card-head">';
      html+='<div class="anm-type">'+(isKbd?'⌨️ Tekstowa':'✏️ Odręczna')+'<span class="anm-ts">'+n.ts+'</span></div>';
      html+='<button class="anm-page-btn" onclick="closeModal(&quot;all-notes-modal&quot;,&quot;all-notes-content&quot;);goToPage('+n.page+')">📄 Przejdź do str. '+n.page+' →</button>';
      html+='</div>';
      html+='<div class="anm-card-body">';
      if(isKbd){
        html+='<p class="anm-text">'+n.text.replace(/</g,'&lt;')+'</p>';
      } else {
        html+='<img class="anm-img" src="'+n.dataUrl+'" alt="Notatka odręczna" />';
      }
      html+='</div></div>';
    });
    html+='</div>';
  });
  if(list)list.innerHTML=html;
}

function pnavKey(e){if(e.key==="Enter"){pnavJump();var inp=document.getElementById("pnav-input");if(inp)inp.blur();}}
function pnavJump(){var inp=document.getElementById("pnav-input");if(!inp)return;var v=parseInt(inp.value,10);if(!isNaN(v))goToPage(v);else inp.value=currentPage;}

let fcIndex=0;let fcRound=1;let fcPool=[];let fcBadSet=new Set();let fcAnswered=new Set();const flashcards=[{q:'Co to jest indukcja elektromagnetyczna?',a:'Zjawisko powstawania SEM w przewodniku wskutek zmian strumienia pola magnetycznego (Faraday, 1831).'},{q:'Co mówi reguła Lenza?',a:'Prąd indukowany zawsze przeciwdziała zmianie strumienia, która go wywołała.'},{q:'Jednostka indukcyjności?',a:'Henr [H]. 1H = 1 Wb/A.'},{q:'Co to jest strumień pola magnetycznego?',a:'Miara liczby linii pola przechodzących przez daną powierzchnię. Φ = B·A·cosα'},{q:'Zastosowania indukcji elektromagnetycznej?',a:'Generatory, transformatory, ładowarki indukcyjne, silniki elektryczne.'},{q:'Prawo Faradaya — wzór?',a:'ε = -dΦ/dt. SEM jest równa szybkości zmiany strumienia.'}];function openFlashcards(title){document.getElementById('fc-book-title').textContent=title;fcReset();switchTab('flashcards');}
function fcReset(){fcRound=1;fcIndex=0;fcPool=flashcards.map((_,i)=>i);fcBadSet=new Set();fcAnswered=new Set();fcShowMain();renderFlashcard();fcUpdateBadge();}
function fcStartRetryRound(){fcPool=[...fcBadSet];fcBadSet=new Set();fcAnswered=new Set();fcIndex=0;fcRound++;fcShowMain();renderFlashcard();fcUpdateBadge();}
function fcShowMain(){document.getElementById('fc-main').classList.remove('hide');document.getElementById('fc-all-done').classList.add('hide');document.getElementById('fc-retry-screen').classList.add('hide');const roundBadge=document.getElementById('fc-round-badge');if(roundBadge){roundBadge.textContent=fcRound===1?'Runda 1':`Runda ${fcRound} — powtórka`;roundBadge.className=fcRound===1?'text-xs font-extrabold text-white bg-primary px-3 py-1 rounded-full':'text-xs font-extrabold text-white bg-red-500 px-3 py-1 rounded-full';}}
function renderFlashcard(){const card=document.getElementById('current-flashcard');if(card)card.classList.remove('flipped');const realIdx=fcPool[fcIndex];const fc=flashcards[realIdx];if(!fc)return;document.getElementById('fc-question').textContent=fc.q;document.getElementById('fc-answer').textContent=fc.a;document.getElementById('fc-counter').textContent=(fcIndex+1)+' / '+fcPool.length;const dotsEl=document.getElementById('fc-dots');if(dotsEl){dotsEl.innerHTML=fcPool.map((pidx,i)=>{const isBad=fcBadSet.has(pidx);const isDone=fcAnswered.has(pidx)&&!isBad;const isCurr=i===fcIndex;let cls='w-3 h-3 rounded-full flex-shrink-0 ';if(isCurr)cls+='bg-primary ring-2 ring-primary/40';else if(isBad)cls+='bg-red-400';else if(isDone)cls+='bg-emerald-400';else cls+='bg-slate-200';return`<div class="${cls}"></div>`;}).join('');}}
function flipCard(){document.getElementById('current-flashcard').classList.toggle('flipped');}
function fcNav(dir){const newIdx=fcIndex+dir;if(newIdx<0||newIdx>=fcPool.length)return;fcIndex=newIdx;renderFlashcard();}
function markFlashcard(result){const realIdx=fcPool[fcIndex];if(result==='bad'){fcBadSet.add(realIdx);fcAnswered.delete(realIdx);}else{fcBadSet.delete(realIdx);fcAnswered.add(realIdx);}
fcUpdateBadge();const card=document.getElementById('current-flashcard');if(card){card.style.transition='opacity 0.18s ease, transform 0.18s ease';card.style.opacity='0';card.style.transform=result==='bad'?'translateX(-12px)':'translateX(12px)';setTimeout(()=>{card.style.transition='';card.style.opacity='1';card.style.transform='';if(fcIndex+1>=fcPool.length){fcEndOfRound();}else{fcIndex++;renderFlashcard();}},180);}else{if(fcIndex+1>=fcPool.length){fcEndOfRound();}
else{fcIndex++;renderFlashcard();}}}
function fcEndOfRound(){if(fcBadSet.size===0){document.getElementById('fc-main').classList.add('hide');document.getElementById('fc-all-done').classList.remove('hide');}else{document.getElementById('fc-main').classList.add('hide');document.getElementById('fc-retry-screen').classList.remove('hide');const msgEl=document.getElementById('fc-retry-msg');if(msgEl){msgEl.textContent=`Masz ${fcBadSet.size} ${fcBadSet.size === 1 ? 'kartę' : fcBadSet.size < 5 ? 'karty' : 'kart'} do powtórzenia. Przejdźmy przez nie jeszcze raz!`;}}}
function fcUpdateBadge(){const badge=document.getElementById('fc-bad-badge');if(!badge)return;if(fcBadSet.size>0){badge.textContent=`✗ ${fcBadSet.size} do powtórki`;badge.classList.remove('hidden');}else{badge.classList.add('hidden');}}
let selectedBooks=0;const PKG_LIMITS={podstawowy:2,rozszerzony:3};let pkgSel={podstawowy:0,rozszerzony:0};let cartItems=[];let hasSubscription=true;let currentBook='Fizyka: Magnetyzm';let currentEmoji='🧲';let currentPage=14;let totalPages=62;let currentChapterNum=3;function setWelcomeVariant(v){hasSubscription=v==='sub';document.getElementById('welcome-sub').classList.toggle('hide',v!=='sub');document.getElementById('welcome-nosub').classList.toggle('hide',v!=='nosub');document.getElementById('btn-variant-sub').className=v==='sub'?'text-xs font-extrabold px-4 py-2 rounded-full bg-primary text-white transition-all':'text-xs font-extrabold px-4 py-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all';document.getElementById('btn-variant-nosub').className=v==='nosub'?'text-xs font-extrabold px-4 py-2 rounded-full bg-primary text-white transition-all':'text-xs font-extrabold px-4 py-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all';}
function startSelection(variant){hasSubscription=variant==='sub';document.getElementById('app-sidebar').classList.remove('hide');document.getElementById('app-header').classList.remove('hide');const subSection=document.getElementById('section-subscription');const subStatusBar=document.getElementById('sub-status-bar');const legendSub=document.getElementById('legend-sub');const section2Label=document.getElementById('section2-label');if(hasSubscription){subSection.classList.remove('hide');subStatusBar.classList.remove('hide');if(legendSub)legendSub.classList.remove('hide');section2Label.textContent='✨ Chcesz więcej? Dobierz kolejne tytuły';}else{subSection.classList.add('hide');subStatusBar.classList.add('hide');if(legendSub)legendSub.classList.add('hide');section2Label.textContent='📚 Dostępne tytuły';}
switchTab('catalog');}
function openBook(title,emoji,color,progress){currentBook=title;currentEmoji=emoji;const titleEl=document.getElementById('reader-book-title');if(titleEl)titleEl.textContent=emoji+' '+title;switchTab('reader');if(typeof updateBreadcrumb==='function')updateBreadcrumb(currentChapterNum||3,currentPage||14);setTimeout(()=>{buildThumbPanel();resetZoom();setViewMode('single');initDrawingCanvas();},50);}
function openQuickReview(title,emoji){document.getElementById('qr-book-title').textContent=title;document.getElementById('qr-book-emoji').textContent=emoji;switchTab('quickreview');}
const QUIZ_COLORS=['#e53935','#1e88e5','#fdd835','#43a047'];const QUIZ_SHAPES=['▲','◆','●','■'];const QUIZ_PALETTES={2:[QUIZ_COLORS[0],QUIZ_COLORS[1]],3:[QUIZ_COLORS[0],QUIZ_COLORS[1],QUIZ_COLORS[2]],4:QUIZ_COLORS};let quizQuestions=[{type:'choice',q:'Kto i kiedy odkrył zjawisko indukcji elektromagnetycznej?',opts:['Michael Faraday, 1831','Isaac Newton, 1687','James Watt, 1764','Nikola Tesla, 1887'],correct:0,pts:10,image:null,bg:null},{type:'truefalse',q:'Reguła Lenza mówi, że prąd indukowany WZMACNIA zmianę strumienia magnetycznego.',opts:['Prawda','Fałsz'],correct:1,pts:10,image:null,bg:null},{type:'typed',q:'Jak brzmi jednostka siły elektromotorycznej (SEM)?',answer:'volt',acceptedAnswers:['volt','v','wolty','wolts'],pts:10,image:null,bg:null},{type:'choice',q:'Jaka jest jednostka indukcyjności własnej?',opts:['Amper','Volt','Henr','Wat'],correct:2,pts:10,image:null,bg:null},{type:'sort',q:'Uszereguj chronologicznie odkrycia fizyczne:',items:['Prawo grawitacji Newtona (1687)','Elektryczność Franklina (1752)','Indukcja Faradaya (1831)','Elektrony Thomsona (1897)'],correctOrder:[0,1,2,3],pts:10,image:null,bg:null}];let qzScore=0;let qzIndex=0;let qzAnswered=false;let qzPlayMode='immediate';let qzResults=[];let qzSortOrder=[];let qzDragSource=null;let qzCreatorMode=false;let qzCreatorData=[];let qzActiveEdit=null;let testScore=0;let currentQuestion=1;let totalQuestions=5;let answered=false;let completedTests={};function openTest(title,mode){const el=document.getElementById('creator-title-label');if(el)el.textContent='Quiz: '+(title||'Test');qzPlayMode=mode||'immediate';qzCreatorMode=false;const creator=document.getElementById('quiz-creator-view');const player=document.getElementById('quiz-player-view');if(creator)creator.classList.add('hide');if(player)player.style.display='';const testKey=title||'default';if(completedTests[testKey]){showTestRetakeScreen(testKey,title);switchTab('test');return;}
quizStart(quizQuestions,qzPlayMode);switchTab('test');}
function showTestRetakeScreen(testKey,title){const player=document.getElementById('quiz-player-view');if(!player)return;const prev=completedTests[testKey];const pct=prev.pct;const emoji=pct>=80?'🏆':pct>=50?'👍':'💪';const msg=pct>=80?'Świetny wynik!':pct>=50?'Dobry wynik!':'Ćwicz dalej!';player.style.display='';player.style.background='linear-gradient(135deg,#4c1d95 0%,#6d28d9 45%,#7c3aed 100%)';const scroll=document.getElementById('quiz-scroll-area');const summary=document.getElementById('quiz-summary-screen');const topbar=document.getElementById('quiz-topbar');if(scroll)scroll.style.display='none';if(summary)summary.style.display='none';if(topbar)topbar.style.display='none';let retakeEl=document.getElementById('quiz-retake-screen');if(!retakeEl){retakeEl=document.createElement('div');retakeEl.id='quiz-retake-screen';player.appendChild(retakeEl);}
retakeEl.style.display='';retakeEl.innerHTML=`
<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;text-align:center;"><div style="font-size:64px;margin-bottom:16px;">${emoji}</div><h2 style="font-size:26px;font-weight:800;color:white;margin:0 0 8px;">${title || 'Test'}</h2><p style="color:rgba(255,255,255,0.7);font-weight:600;font-size:14px;margin:0 0 28px;">Ten test masz już rozwiązany</p><div style="background:rgba(255,255,255,0.15);backdrop-filter:blur(12px);border-radius:20px;padding:28px 36px;margin-bottom:28px;min-width:260px;"><p style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.65);text-transform:uppercase;letter-spacing:0.08em;margin:0 0 10px;">Twój ostatni wynik</p><div style="font-size:52px;font-weight:900;color:white;line-height:1;margin-bottom:8px;">${pct}%</div><div style="height:8px;background:rgba(255,255,255,0.2);border-radius:4px;overflow:hidden;margin-bottom:8px;"><div style="height:100%;width:${pct}%;background:${pct>=80?'#34d399':pct>=50?'#fbbf24':'#f87171'};border-radius:4px;transition:width 1s ease;"></div></div><p style="font-size:13px;color:rgba(255,255,255,0.7);font-weight:600;margin:0;">${prev.pts} / ${prev.max} pkt · ${prev.date}</p></div><p style="color:rgba(255,255,255,0.55);font-size:13px;font-weight:500;margin:0 0 20px;">${msg} Chcesz spróbować ponownie?</p><div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;"><button onclick="startQuizFromRetake('${testKey}')" style="background:white;color:#4c1d95;border:none;border-radius:14px;font-weight:800;font-size:14px;padding:14px 30px;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.25);transition:transform 0.1s;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">🔄 Rozwiąż ponownie</button><button onclick="switchTab('dashboard')" style="background:rgba(255,255,255,0.18);color:white;border:none;border-radius:14px;font-weight:700;font-size:14px;padding:14px 24px;cursor:pointer;">← Biblioteka</button></div></div>`;retakeEl.style.cssText='display:flex;flex-direction:column;flex:1;overflow-y:auto;';}
function startQuizFromRetake(testKey){const player=document.getElementById('quiz-player-view');const retakeEl=document.getElementById('quiz-retake-screen');const scroll=document.getElementById('quiz-scroll-area');const topbar=document.getElementById('quiz-topbar');if(retakeEl)retakeEl.style.display='none';if(topbar)topbar.style.display='';if(scroll)scroll.style.display='flex';quizStart(quizQuestions,qzPlayMode);}
function openQuizCreator(title){qzCreatorMode=true;qzCreatorData=JSON.parse(JSON.stringify(quizQuestions));const creator=document.getElementById('quiz-creator-view');const player=document.getElementById('quiz-player-view');if(creator)creator.classList.remove('hide');if(player)player.style.display='none';renderCreatorList();switchTab('test');}
// ════════ TEST/QUIZ — list-style player (matches ex.html /task-set/ layout) ════════
function quizStart(questions, mode) {
  qzScore = 0;
  qzIndex = 0;
  qzAnswered = false;
  qzResults = [];
  qzPlayMode = mode || 'immediate';
  // qzAnswers[i] = {checked, correct, userAns, correctAns, awarded}
  window._qzList = (questions && questions.length) ? questions : quizQuestions;
  window._qzAnswers = window._qzList.map(() => null);
  window._qzSortState = {}; // per-question slot state, key=qIdx
  const summary = document.getElementById('quiz-summary-screen');
  const scroll = document.getElementById('quiz-scroll-area');
  if (summary) { summary.style.display = 'none'; summary.style.flex = ''; }
  if (scroll) { scroll.style.display = ''; scroll.scrollTop = 0; }
  const titleEl = document.getElementById('quiz-title-label');
  const creatorTitle = document.getElementById('creator-title-label');
  if (titleEl && creatorTitle) titleEl.textContent = creatorTitle.textContent || 'Test do rozdziału';
  quizRenderListAll();
  quizUpdateProgress();
}

function quizCreatorStartPlay(mode) {
  const player = document.getElementById('quiz-player-view');
  const creator = document.getElementById('quiz-creator-view');
  if (creator) creator.classList.add('hide');
  if (player) player.style.display = '';
  quizStart(qzCreatorData.length ? qzCreatorData : quizQuestions, mode || 'immediate');
}
function quizCreatorPreview() { quizCreatorStartPlay('immediate'); }

function quizRenderListAll() {
  const set = document.getElementById('quiz-task-set');
  if (!set) return;
  const list = window._qzList || quizQuestions;
  const TYPE_LABELS = {
    choice: 'Wybierz jedną odpowiedź',
    truefalse: 'Prawda czy fałsz?',
    typed: 'Wpisz odpowiedź',
    sort: 'Ułóż w odpowiedniej kolejności'
  };
  const LETTERS = ['A','B','C','D','E','F'];
  set.innerHTML = list.map((q, i) => {
    let bodyHtml = '';
    if (q.type === 'choice' || q.type === 'truefalse') {
      const twoCol = q.opts.length >= 3 ? ' is-twocol' : '';
      bodyHtml = '<div class="quiz-q-answers' + twoCol + '" id="qzAns_' + i + '">' +
        q.opts.map((opt, j) =>
          '<button class="quiz-q-ans" type="button" data-i="' + i + '" data-j="' + j + '" onclick="quizPickChoice(' + i + ',' + j + ')">' +
            '<span class="quiz-q-ans-letter">' + LETTERS[j] + '</span>' +
            '<span class="quiz-q-ans-text">' + opt + '</span>' +
          '</button>'
        ).join('') +
      '</div>';
    } else if (q.type === 'typed') {
      bodyHtml = '<div class="quiz-q-typed-row">' +
        '<input class="quiz-q-typed-input" id="qzTyped_' + i + '" type="text" placeholder="Wpisz odpowiedź…" autocomplete="off"' +
          ' onkeydown="if(event.key===\'Enter\'){event.preventDefault();quizCheckTyped(' + i + ')}">' +
      '</div>';
    } else if (q.type === 'sort') {
      const order = q.items.map((_, k) => k);
      for (let k = order.length - 1; k > 0; k--) {
        const r = Math.floor(Math.random() * (k + 1));
        [order[k], order[r]] = [order[r], order[k]];
      }
      window._qzSortState[i] = { slots: new Array(order.length).fill(-1) };
      bodyHtml = '<div class="quiz-q-sort-grid">' +
        '<div>' +
          '<div class="quiz-q-sort-col-label">Przeciągnij tutaj →</div>' +
          order.map((_, pos) =>
            '<div class="quiz-q-sort-slot" id="qzSlot_' + i + '_' + pos + '" data-i="' + i + '" data-pos="' + pos + '"' +
              ' ondragover="event.preventDefault();this.classList.add(\'drag-active\')"' +
              ' ondragleave="this.classList.remove(\'drag-active\')"' +
              ' ondrop="quizSortDrop(event,' + i + ',' + pos + ')">' + (pos + 1) + '</div>'
          ).join('') +
        '</div>' +
        '<div>' +
          '<div class="quiz-q-sort-col-label">Elementy</div>' +
          '<div id="qzPool_' + i + '">' +
            order.map(origIdx =>
              '<div class="quiz-q-sort-item" id="qzItem_' + i + '_' + origIdx + '" draggable="true" data-i="' + i + '" data-orig="' + origIdx + '"' +
                ' ondragstart="quizSortDragStart(event,' + i + ',' + origIdx + ')"' +
                ' ondragend="this.classList.remove(\'dragging\')">' +
                '<span class="quiz-q-sort-grip">⠿</span><span>' + q.items[origIdx] + '</span>' +
              '</div>'
            ).join('') +
          '</div>' +
        '</div>' +
      '</div>';
    }

    const checkBtnLabel = q.type === 'sort' ? 'Zatwierdź kolejność ✓' : 'Sprawdź';
    const checkFn = q.type === 'choice' || q.type === 'truefalse'
      ? 'quizCheckChoice(' + i + ')'
      : (q.type === 'typed' ? 'quizCheckTyped(' + i + ')' : 'quizCheckSort(' + i + ')');

    return '<div class="quiz-q-card" id="qzCard_' + i + '">' +
      '<div class="quiz-q-banner">' +
        '<span class="quiz-q-num">Pytanie ' + (i + 1) + '. (0–' + (q.pts || 10) + ')</span>' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<span class="quiz-q-type-tag">' + (TYPE_LABELS[q.type] || '') + '</span>' +
          '<span class="quiz-q-status-pill" id="qzStatus_' + i + '"></span>' +
        '</div>' +
      '</div>' +
      (q.image ? '<img class="quiz-q-image" src="' + q.image + '" alt="">' : '') +
      '<p class="quiz-q-text">' + q.q + '</p>' +
      bodyHtml +
      '<div class="quiz-q-actions" id="qzActs_' + i + '">' +
        '<button class="quiz-q-btn quiz-q-btn--primary" id="qzCheckBtn_' + i + '" onclick="' + checkFn + '">' + checkBtnLabel + '</button>' +
      '</div>' +
      '<div class="quiz-q-fb" id="qzFb_' + i + '"></div>' +
    '</div>';
  }).join('');

  // Append finish bar
  const total = list.length;
  set.insertAdjacentHTML('beforeend',
    '<div class="quiz-finish-bar">' +
      '<button class="quiz-finish-btn" id="quiz-finish-btn" onclick="quizFinishTest()">Zobacz podsumowanie →</button>' +
    '</div>'
  );
}

function quizPickChoice(i, j) {
  if (window._qzAnswers && window._qzAnswers[i] && window._qzAnswers[i].checked) return;
  const wrap = document.getElementById('qzAns_' + i);
  if (!wrap) return;
  wrap.querySelectorAll('.quiz-q-ans').forEach(b => b.classList.remove('sel'));
  const btn = wrap.querySelector('[data-j="' + j + '"]');
  if (btn) btn.classList.add('sel');
  // Track selection
  if (!window._qzAnswers[i]) window._qzAnswers[i] = {};
  window._qzAnswers[i].selected = j;
}

function quizCheckChoice(i) {
  const ans = window._qzAnswers[i];
  if (ans && ans.checked) return;
  const sel = ans && typeof ans.selected === 'number' ? ans.selected : -1;
  if (sel < 0) {
    quizFlashCheckBtn(i, 'Wybierz odpowiedź');
    return;
  }
  const q = window._qzList[i];
  const isCorrect = sel === q.correct;
  const wrap = document.getElementById('qzAns_' + i);
  if (wrap) {
    wrap.querySelectorAll('.quiz-q-ans').forEach((b, k) => {
      b.disabled = true;
      b.classList.remove('sel');
      if (k === q.correct) b.classList.add('ok');
      else if (k === sel) b.classList.add('err');
      else b.classList.add('dim');
    });
  }
  quizFinalizeAnswer(i, isCorrect, q.opts[sel], q.opts[q.correct],
    isCorrect ? '✓ Poprawna odpowiedź! +' + q.pts + ' pkt'
              : '✗ Niepoprawnie. Prawidłowa odpowiedź: ' + q.opts[q.correct]);
}

function quizCheckTyped(i) {
  if (window._qzAnswers[i] && window._qzAnswers[i].checked) return;
  const inp = document.getElementById('qzTyped_' + i);
  const val = inp ? inp.value.trim() : '';
  if (!val) { quizFlashCheckBtn(i, 'Wpisz odpowiedź'); return; }
  const q = window._qzList[i];
  const accepted = q.acceptedAnswers || [q.answer];
  const isCorrect = accepted.some(a => a.toLowerCase() === val.toLowerCase());
  if (inp) {
    inp.disabled = true;
    inp.classList.add(isCorrect ? 'ok' : 'err');
  }
  quizFinalizeAnswer(i, isCorrect, val, q.answer,
    isCorrect ? '✓ Poprawnie! +' + q.pts + ' pkt'
              : '✗ Niepoprawnie. Poprawna odpowiedź: ' + q.answer);
}

function quizSortDragStart(e, i, origIdx) {
  window._qzDrag = { i, origIdx };
  if (e && e.dataTransfer) e.dataTransfer.setData('text/plain', String(origIdx));
  setTimeout(() => {
    const el = document.getElementById('qzItem_' + i + '_' + origIdx);
    if (el) el.classList.add('dragging');
  }, 0);
}
function quizSortDrop(e, i, slotPos) {
  e.preventDefault();
  const slot = document.getElementById('qzSlot_' + i + '_' + slotPos);
  if (slot) slot.classList.remove('drag-active');
  if (!window._qzDrag || window._qzDrag.i !== i) return;
  const origIdx = window._qzDrag.origIdx;
  const item = document.getElementById('qzItem_' + i + '_' + origIdx);
  if (!item) return;
  const state = window._qzSortState[i];
  if (!state) return;
  // If slot already filled, return its current item to pool
  if (state.slots[slotPos] !== -1) {
    const prev = state.slots[slotPos];
    const prevEl = document.getElementById('qzItem_' + i + '_' + prev);
    const pool = document.getElementById('qzPool_' + i);
    if (prevEl && pool) pool.appendChild(prevEl);
  }
  // If item was in another slot, clear it
  const prevSlot = state.slots.findIndex(v => v === origIdx);
  if (prevSlot !== -1) state.slots[prevSlot] = -1;
  state.slots[slotPos] = origIdx;
  if (slot) {
    slot.innerHTML = '';
    slot.appendChild(item);
    slot.classList.add('filled');
  }
  window._qzDrag = null;
}
function quizCheckSort(i) {
  if (window._qzAnswers[i] && window._qzAnswers[i].checked) return;
  const q = window._qzList[i];
  const state = window._qzSortState[i];
  if (!state || state.slots.some(v => v === -1)) {
    quizFlashCheckBtn(i, 'Wypełnij wszystkie miejsca');
    return;
  }
  const all = state.slots;
  const isCorrect = all.every((origIdx, pos) => origIdx === q.correctOrder[pos]);
  // Lock dragging + visually mark slots
  document.querySelectorAll('#qzCard_' + i + ' .quiz-q-sort-item').forEach(it => it.setAttribute('draggable', 'false'));
  all.forEach((origIdx, pos) => {
    const slot = document.getElementById('qzSlot_' + i + '_' + pos);
    if (!slot) return;
    if (origIdx === q.correctOrder[pos]) slot.classList.add('ok');
    else slot.classList.add('err');
  });
  const userStr = all.map(idx => q.items[idx]).join(' → ');
  const correctStr = q.correctOrder.map(idx => q.items[idx]).join(' → ');
  quizFinalizeAnswer(i, isCorrect, userStr, correctStr,
    isCorrect ? '✓ Idealna kolejność! +' + q.pts + ' pkt'
              : '✗ Zła kolejność. Poprawna: ' + correctStr);
}

function quizFlashCheckBtn(i, msg) {
  const btn = document.getElementById('qzCheckBtn_' + i);
  if (!btn) return;
  const orig = btn.textContent;
  btn.textContent = msg;
  btn.style.background = '#f59e0b';
  setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 1300);
}

function quizFinalizeAnswer(i, isCorrect, userAns, correctAns, fbMsg) {
  const q = window._qzList[i];
  const awarded = isCorrect ? (q.pts || 10) : 0;
  qzScore += awarded;
  if (isCorrect) qzResults.push({ correct: true, userAns, correctAns, q: q.q });
  else qzResults.push({ correct: false, userAns, correctAns, q: q.q });
  window._qzAnswers[i] = { checked: true, correct: isCorrect, userAns, correctAns, awarded };

  const card = document.getElementById('qzCard_' + i);
  if (card) card.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
  const status = document.getElementById('qzStatus_' + i);
  if (status) {
    status.textContent = isCorrect ? '✓ Poprawnie' : '✗ Błąd';
    status.className = 'quiz-q-status-pill show ' + (isCorrect ? 'ok' : 'err');
  }
  const fb = document.getElementById('qzFb_' + i);
  if (fb) {
    fb.className = 'quiz-q-fb show ' + (isCorrect ? 'ok' : 'err');
    fb.innerHTML = '<span class="quiz-q-fb-icon">' + (isCorrect ? '✅' : '❌') + '</span><span>' + fbMsg + '</span>';
  }
  // Hide/disable check button
  const acts = document.getElementById('qzActs_' + i);
  if (acts) acts.style.display = 'none';

  quizUpdateProgress();
}

function quizUpdateProgress() {
  const list = window._qzList || quizQuestions;
  const ans = window._qzAnswers || [];
  const total = list.length;
  const checked = ans.filter(a => a && a.checked).length;
  const okCount = ans.filter(a => a && a.checked && a.correct).length;
  const errCount = ans.filter(a => a && a.checked && !a.correct).length;

  const fill = document.getElementById('quiz-progress-fill');
  if (fill) fill.style.width = (total ? (checked / total) * 100 : 0) + '%';
  const ctr = document.getElementById('quiz-counter-badge');
  if (ctr) ctr.textContent = checked + ' / ' + total;
  const okEl = document.getElementById('quiz-score-ok');
  if (okEl) okEl.textContent = okCount;
  const errEl = document.getElementById('quiz-score-err');
  if (errEl) errEl.textContent = errCount;
  const cnt = document.getElementById('quiz-checked-count');
  if (cnt) cnt.textContent = checked + ' / ' + total;
}

function quizFinishTest() {
  const list = window._qzList || quizQuestions;
  const ans = window._qzAnswers || [];
  const checked = ans.filter(a => a && a.checked).length;
  // If user hasn't answered everything, ask
  if (checked < list.length) {
    const remaining = list.length - checked;
    if (!confirm('Pozostały ' + remaining + ' niesprawdzone pytanie(a). Zakończyć test mimo to?')) return;
    // Auto-mark unanswered as wrong
    list.forEach((q, i) => {
      if (!ans[i] || !ans[i].checked) {
        const card = document.getElementById('qzCard_' + i);
        if (card) card.classList.add('is-wrong');
        const status = document.getElementById('qzStatus_' + i);
        if (status) { status.textContent = '— Pominięte'; status.className = 'quiz-q-status-pill show err'; }
        window._qzAnswers[i] = { checked: true, correct: false, userAns: '(brak)', correctAns: q.correct !== undefined ? (q.opts ? q.opts[q.correct] : '') : (q.answer || (q.correctOrder ? q.correctOrder.map(k => q.items[k]).join(' → ') : '')), awarded: 0 };
        qzResults.push({ correct: false, userAns: '(brak odpowiedzi)', correctAns: window._qzAnswers[i].correctAns, q: q.q });
      }
    });
  }
  quizShowSummary();
}

function quizShowSummary() {
  const scroll = document.getElementById('quiz-scroll-area');
  const summary = document.getElementById('quiz-summary-screen');
  if (scroll) scroll.style.display = 'none';
  if (summary) { summary.style.display = ''; summary.style.flex = '1'; summary.scrollTop = 0; }
  const fill = document.getElementById('quiz-progress-fill');
  if (fill) fill.style.width = '100%';

  const list = window._qzList || quizQuestions;
  const total = list.length;
  const maxPts = list.reduce((s, q) => s + (q.pts || 10), 0);
  const correct = qzResults.filter(r => r.correct).length;
  const pct = maxPts > 0 ? Math.round(qzScore / maxPts * 100) : 0;
  const titleEl = document.getElementById('creator-title-label');
  const tKey = (titleEl ? titleEl.textContent.replace('Quiz: ', '') : null) || currentBook || 'default';
  completedTests[tKey] = { pct, pts: qzScore, max: maxPts, date: new Date().toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }) };

  const endEmoji = document.getElementById('quiz-end-emoji');
  const endTitle = document.getElementById('quiz-end-title');
  const endSub = document.getElementById('quiz-end-subtitle');
  const scoreDisp = document.getElementById('quiz-final-score-display');
  const scoreBar = document.getElementById('quiz-score-bar');
  const pctLabel = document.getElementById('quiz-pct-label');
  const emoji = pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪';
  const title = pct >= 80 ? 'Świetna robota!' : pct >= 50 ? 'Nieźle!' : 'Warto poćwiczyć!';
  const sub = correct + ' z ' + total + ' poprawnych · ' + qzScore + ' / ' + maxPts + ' pkt';
  if (endEmoji) endEmoji.textContent = emoji;
  if (endTitle) endTitle.textContent = title;
  if (endSub) endSub.textContent = sub;
  if (scoreDisp) scoreDisp.textContent = qzScore + ' / ' + maxPts;
  if (pctLabel) pctLabel.textContent = pct + '% poprawnych';
  if (scoreBar) {
    scoreBar.style.width = '0%';
    scoreBar.style.background = pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';
    setTimeout(() => { scoreBar.style.width = pct + '%'; }, 100);
  }

  const reviewSection = document.getElementById('quiz-review-section');
  const reviewList = document.getElementById('quiz-review-list');
  const wrongs = qzResults.filter(r => !r.correct);
  if (reviewSection && reviewList) {
    if (wrongs.length > 0) {
      reviewSection.style.display = '';
      reviewList.innerHTML = wrongs.map(r =>
        '<div style="background:white;border:1px solid #fecaca;border-radius:14px;padding:14px 18px;margin-bottom:10px;display:flex;gap:12px;align-items:flex-start;">' +
          '<span style="font-size:20px;flex-shrink:0;">❌</span>' +
          '<div style="flex:1;">' +
            '<p style="font-weight:700;font-size:13px;color:#0b2a75;margin:0 0 6px;line-height:1.4;">' + r.q + '</p>' +
            '<p style="font-size:12px;color:#dc2626;margin:0 0 3px;">Twoja odpowiedź: ' + r.userAns + '</p>' +
            '<p style="font-size:12px;color:#16a34a;margin:0;font-weight:700;">Poprawna: ' + r.correctAns + '</p>' +
          '</div>' +
        '</div>'
      ).join('');
    } else {
      reviewSection.style.display = '';
      reviewList.innerHTML = '<div style="text-align:center;background:#dcfce7;border:1px solid #86efac;border-radius:14px;color:#15803d;font-weight:800;padding:18px;">🎉 Wszystkie odpowiedzi poprawne!</div>';
    }
  }
}

function quizRetake() { quizStart(window._qzList || quizQuestions, qzPlayMode); }
function setQuizPlayMode(mode){qzPlayMode=mode;['immediate','summary'].forEach(m=>{const btn=document.getElementById('qmode-btn-'+m);if(btn){btn.style.background=m===mode?'white':'transparent';btn.style.color=m===mode?'#4c1d95':'rgba(255,255,255,0.7)';}});}
const CREATOR_TYPE_LABELS={choice:'Wybór jednokrotny',truefalse:'Prawda/Fałsz',typed:'Wpisz odpowiedź',sort:'Kolejność'};const CREATOR_ANS_COLORS=['#e53935','#1e88e5','#fdd835','#43a047'];function renderCreatorList(){const list=document.getElementById('creator-q-list');if(!list)return;list.innerHTML=qzCreatorData.map((q,i)=>`
<button onclick="creatorSelectQuestion(${i})"
style="width:100%;background:${i === qzActiveEdit ? '#eff6ff' : 'white'};border:2px solid ${i === qzActiveEdit ? '#176cd2' : '#e2e8f0'};border-radius:12px;padding:10px 12px;cursor:pointer;text-align:left;transition:all 0.15s;display:flex;align-items:center;gap:8px;"
onmouseover="if(${i}!==qzActiveEdit)this.style.borderColor='#93c5fd'" onmouseout="if(${i}!==qzActiveEdit)this.style.borderColor='#e2e8f0'"><span style="width:22px;height:22px;background:${i === qzActiveEdit ? '#176cd2' : '#e2e8f0'};border-radius:6px;color:${i === qzActiveEdit ? 'white' : '#64748b'};font-weight:800;font-size:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i+1}</span><div style="flex:1;overflow:hidden;"><p style="font-size:11px;font-weight:700;color:#1e293b;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${q.q || 'Bez treści'}</p><p style="font-size:10px;color:#94a3b8;margin:0;font-weight:600;">${CREATOR_TYPE_LABELS[q.type] || q.type}</p></div><button onclick="event.stopPropagation();creatorDeleteQuestion(${i})" style="background:#fef2f2;border:none;border-radius:6px;width:20px;height:20px;color:#ef4444;font-size:11px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;">✕</button></button>`).join('');}
function creatorSelectQuestion(idx){qzActiveEdit=idx;renderCreatorList();renderCreatorEditor(idx);}
function creatorAddQuestion(){qzCreatorData.push({type:'choice',q:'',opts:['','','',''],correct:0,pts:10,image:null,bg:null});qzActiveEdit=qzCreatorData.length-1;renderCreatorList();renderCreatorEditor(qzActiveEdit);}
function creatorDeleteQuestion(idx){qzCreatorData.splice(idx,1);if(qzActiveEdit>=qzCreatorData.length)qzActiveEdit=qzCreatorData.length-1;renderCreatorList();if(qzActiveEdit>=0)renderCreatorEditor(qzActiveEdit);else document.getElementById('creator-editor-inner').innerHTML='<p class="text-center text-slate-400 font-medium text-sm mt-16">Wybierz pytanie lub dodaj nowe ＋</p>';}
function renderCreatorEditor(idx){const q=qzCreatorData[idx];if(!q)return;const inner=document.getElementById('creator-editor-inner');if(!inner)return;const typeOptions=Object.entries(CREATOR_TYPE_LABELS).map(([v,l])=>`<option value="${v}" ${q.type===v?'selected':''}>${l}</option>`).join('');const bgOptions=[['','— Domyślny'],['purple','Fioletowy'],['blue','Niebieski'],['red','Czerwony'],['green','Zielony'],['teal','Morski']].map(([v,l])=>`<option value="${v}" ${(q.bg||'')===v?'selected':''}>${l}</option>`).join('');let answersHtml='';if(q.type==='choice'){const n=Math.max(2,Math.min(4,(q.opts||[]).length||4));if(!q.opts||q.opts.length<2)q.opts=Array(4).fill('');answersHtml=`
<div style="display:flex;flex-direction:column;gap:8px;"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;"><p style="font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Odpowiedzi (${n})</p><div style="display:flex;gap:6px;">
${n > 2 ? `<button onclick="creatorRemoveOpt(${idx})"style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:3px 10px;font-size:11px;font-weight:700;color:#ef4444;cursor:pointer;">− Usuń</button>` : ''}
${n < 4 ? `<button onclick="creatorAddOpt(${idx})"style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:3px 10px;font-size:11px;font-weight:700;color:#176cd2;cursor:pointer;">+Dodaj</button>` : ''}
</div></div>
${q.opts.slice(0,n).map((opt,i) => `<div style="display:flex;align-items:center;gap:10px;"><div style="width:18px;height:18px;border-radius:5px;background:${CREATOR_ANS_COLORS[i]};flex-shrink:0;"></div><span style="font-size:13px;font-weight:700;color:#64748b;width:18px;flex-shrink:0;">${QUIZ_SHAPES[i]}</span><input type="text"value="${opt}"placeholder="Treść odpowiedzi ${i+1}…"
onchange="qzCreatorData[${idx}].opts[${i}]=this.value"
style="flex:1;border:2px solid #e2e8f0;border-radius:10px;padding:8px 12px;font-size:13px;font-weight:600;outline:none;transition:border-color 0.15s;"
onfocus="this.style.borderColor='#176cd2'"onblur="this.style.borderColor='#e2e8f0'"><label style="display:flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:#16a34a;cursor:pointer;white-space:nowrap;"><input type="radio"name="correct-${idx}"value="${i}"${q.correct===i?'checked':''}
onchange="qzCreatorData[${idx}].correct=${i};renderCreatorList()"
style="accent-color:#16a34a;width:15px;height:15px;cursor:pointer;">Poprawna</label></div>`).join('')}
</div>`;}else if(q.type==='truefalse'){answersHtml=`
<div style="display:flex;gap:12px;">
${['Prawda','Fałsz'].map((opt,i) => `<label style="flex:1;display:flex;align-items:center;gap:10px;background:${q.correct===i?'#dcfce7':'#f8fafc'};border:2px solid ${q.correct===i?'#16a34a':'#e2e8f0'};border-radius:12px;padding:12px 16px;cursor:pointer;transition:all 0.15s;"><input type="radio"name="tf-${idx}"value="${i}"${q.correct===i?'checked':''}
onchange="qzCreatorData[${idx}].correct=${i};renderCreatorEditor(${idx})"
style="accent-color:#16a34a;width:16px;height:16px;"><span style="font-size:15px;font-weight:800;color:${q.correct===i?'#16a34a':'#1e293b'};">${opt}</span>${q.correct===i?'<span style="margin-left:auto;font-size:13px;">✓</span>':''}</label>`).join('')}
</div>`;}else if(q.type==='typed'){answersHtml=`
<div><p style="font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Poprawna odpowiedź</p><input type="text" value="${q.answer||''}" placeholder="Wpisz poprawną odpowiedź…"
onchange="qzCreatorData[${idx}].answer=this.value"
style="width:100%;border:2px solid #e2e8f0;border-radius:10px;padding:10px 14px;font-size:14px;font-weight:700;outline:none;transition:border-color 0.15s;box-sizing:border-box;"
onfocus="this.style.borderColor='#176cd2'" onblur="this.style.borderColor='#e2e8f0'"><p style="font-size:11px;color:#94a3b8;margin-top:6px;font-weight:500;">Możesz wpisać wiele akceptowanych form oddzielonych przecinkiem.</p></div>`;}else if(q.type==='sort'){const items=q.items||[];answersHtml=`
<div><p style="font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">Elementy (w poprawnej kolejności od góry)</p>
${items.map((item, i) => `<div style="display:flex;align-items:center;gap:10px;margin-bottom:7px;"><span style="width:24px;height:24px;background:#e2e8f0;border-radius:6px;font-size:12px;font-weight:800;color:#64748b;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i+1}</span><input type="text"value="${item}"placeholder="Element ${i+1}…"
onchange="qzCreatorData[${idx}].items[${i}]=this.value"
style="flex:1;border:2px solid #e2e8f0;border-radius:10px;padding:8px 12px;font-size:13px;font-weight:600;outline:none;transition:border-color 0.15s;"
onfocus="this.style.borderColor='#176cd2'"onblur="this.style.borderColor='#e2e8f0'"></div>`).join('')}
<button onclick="creatorAddSortItem(${idx})" style="margin-top:4px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:4px 12px;font-size:11px;font-weight:700;color:#176cd2;cursor:pointer;">+ Dodaj element</button></div>`;}
inner.innerHTML=`
<div class="creator-q-card active-edit" style="background:white;border-radius:18px;border:2px solid #176cd2;box-shadow:0 0 0 3px rgba(23,108,210,0.1);overflow:hidden;"><div style="height:8px;background:${q.bg ? {purple:'#7c3aed',blue:'#1e40af',red:'#b91c1c',green:'#065f46',teal:'#0f766e'}[q.bg]||'#7c3aed' : '#7c3aed'};"></div><div style="padding:20px 24px;space-y:16px;"><div style="display:flex;gap:12px;margin-bottom:16px;"><div style="flex:1;"><p style="font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 5px;">Typ pytania</p><select onchange="qzCreatorData[${idx}].type=this.value;if(this.value==='truefalse'){qzCreatorData[${idx}].opts=['Prawda','Fałsz'];qzCreatorData[${idx}].correct=0;}else if(this.value==='sort'&&!qzCreatorData[${idx}].items){qzCreatorData[${idx}].items=['','',''];qzCreatorData[${idx}].correctOrder=[0,1,2];}renderCreatorEditor(${idx});renderCreatorList();"
style="width:100%;border:2px solid #e2e8f0;border-radius:10px;padding:8px 12px;font-size:13px;font-weight:700;outline:none;background:white;cursor:pointer;">
${typeOptions}
</select></div><div style="flex:1;"><p style="font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 5px;">Kolor tła</p><select onchange="qzCreatorData[${idx}].bg=this.value;renderCreatorEditor(${idx})"
style="width:100%;border:2px solid #e2e8f0;border-radius:10px;padding:8px 12px;font-size:13px;font-weight:700;outline:none;background:white;cursor:pointer;">
${bgOptions}
</select></div><div><p style="font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 5px;">Pkt</p><input type="number" value="${q.pts||10}" min="1" max="100"
onchange="qzCreatorData[${idx}].pts=parseInt(this.value)||10"
style="width:68px;border:2px solid #e2e8f0;border-radius:10px;padding:8px 10px;font-size:13px;font-weight:700;outline:none;text-align:center;"></div></div><div style="margin-bottom:16px;"><p style="font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 5px;">Treść pytania</p><textarea rows="2" placeholder="Wpisz pytanie…"
onchange="qzCreatorData[${idx}].q=this.value;renderCreatorList()"
style="width:100%;border:2px solid #e2e8f0;border-radius:10px;padding:10px 14px;font-size:14px;font-weight:600;resize:none;outline:none;transition:border-color 0.15s;box-sizing:border-box;line-height:1.4;"
onfocus="this.style.borderColor='#176cd2'" onblur="this.style.borderColor='#e2e8f0'">${q.q||''}</textarea></div><div style="margin-bottom:16px;">${answersHtml}</div><div style="margin-top:4px;"><p style="font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 5px;">Obraz (opcjonalnie)</p><div style="border:2px dashed #e2e8f0;border-radius:12px;padding:16px;text-align:center;cursor:pointer;transition:border-color 0.15s;"
onclick="creatorTriggerImageUpload(${idx})"
onmouseover="this.style.borderColor='#93c5fd'" onmouseout="this.style.borderColor='#e2e8f0'">
${q.image
? `<img src="${q.image}"style="max-height:120px;border-radius:8px;object-fit:cover;">`
: `<div style="color:#94a3b8;"><div style="font-size:24px;margin-bottom:4px;">🖼️</div><p style="font-size:12px;font-weight:600;margin:0;">Kliknij,aby dodać obraz</p></div>`}
</div><input type="file" id="creator-img-upload-${idx}" accept="image/*" style="display:none;"
onchange="creatorLoadImage(${idx},this)"></div></div></div>`;}
function creatorAddOpt(idx){const q=qzCreatorData[idx];if(!q.opts)q.opts=[];if(q.opts.length<4){q.opts.push('');renderCreatorEditor(idx);}}
function creatorRemoveOpt(idx){const q=qzCreatorData[idx];if(q.opts&&q.opts.length>2){q.opts.pop();if(q.correct>=q.opts.length)q.correct=q.opts.length-1;renderCreatorEditor(idx);}}
function creatorAddSortItem(idx){const q=qzCreatorData[idx];if(!q.items)q.items=[];q.items.push('');q.correctOrder=q.items.map((_,i)=>i);renderCreatorEditor(idx);}
function creatorTriggerImageUpload(idx){const inp=document.getElementById('creator-img-upload-'+idx);if(inp)inp.click();}
function creatorLoadImage(idx,input){const file=input.files[0];if(!file)return;const reader=new FileReader();reader.onload=e=>{qzCreatorData[idx].image=e.target.result;renderCreatorEditor(idx);};reader.readAsDataURL(file);}
function selectAnswer(el,isCorrect,pts){}
function nextQuestion(){quizNextQuestion();}
function saveTestResult(){openModal('save-test-modal','save-test-modal-content');}
function retakeTest(){quizRetake();}
function confirmExitTest(){if(confirm('Wyjść z quizu? Postęp zostanie utracony.'))switchTab('dashboard');}
function changePage(dir){goToPage(currentPage+dir);}
function jumpToInputPage(){
  const inp=document.getElementById('page-jump-input');
  if(!inp) return;
  const val=parseInt(inp.value,10);
  if(!isNaN(val)) goToPage(val);
  else inp.value=currentPage;
}
let currentViewMode='single';function setViewMode(mode){currentViewMode=mode;['single','double','spine'].forEach(m=>{const btn=document.getElementById('vmode-'+m);if(!btn)return;if(m===mode){btn.classList.add('active');}else{btn.classList.remove('active');}});const layoutSingle=document.getElementById('book-layout-single');const layoutDouble=document.getElementById('book-layout-double');const spine=document.getElementById('book-spine');if(mode==='single'){layoutSingle.classList.remove('hide');layoutDouble.classList.add('hide');}else{layoutSingle.classList.add('hide');layoutDouble.classList.remove('hide');updateDoublePageLabels();if(spine)spine.classList.toggle('hide',mode!=='spine');}}
function updateDoublePageLabels(){const left=Math.max(1,currentPage-1);const right=currentPage;const lEl=document.getElementById('dbl-left-page-num');const rEl=document.getElementById('dbl-right-page-num');const range=document.getElementById('dbl-range-label');if(lEl)lEl.textContent='Strona '+left;if(rEl)rEl.textContent='Strona '+right;if(range)range.textContent=left+'–'+right;}
let thumbPanelOpen=true;function buildThumbPanel(){const list=document.getElementById('thumb-list');if(!list)return;list.innerHTML='';const chapterColors=[['#f8fafc','#e2e8f0']];for(let p=1;p<=totalPages;p++){const chIdx=0;const[bg,line]=chapterColors[chIdx];const item=document.createElement('div');item.className='thumb-item'+(p===currentPage?' active':'');item.id='thumb-'+p;item.onclick=()=>goToPage(p);const lines=generateThumbLines(p);item.innerHTML=`
<div class="thumb-page" style="background:${bg};">
${lines}
${p % 4 === 0 ? `<div style="margin-top:4px;height:12px;background:${line};border-radius:3px;opacity:0.6;"></div>` : ''}
</div><div class="thumb-label">${p}</div>`;list.appendChild(item);}
scrollThumbToPage(currentPage);}
function generateThumbLines(pageNum){const seed=pageNum*31;const count=6+(seed%4);let html='';for(let i=0;i<count;i++){const w=50+((seed+i*13)%35);const isDark=(seed+i)%3===0;html+=`<div class="thumb-line${isDark ? ' dark' : ''}" style="width:${w}%;"></div>`;}
return html;}
function scrollThumbToPage(p){const item=document.getElementById('thumb-'+p);if(item)item.scrollIntoView({block:'nearest',behavior:'smooth'});}
function updateThumbActive(p){document.querySelectorAll('.thumb-item').forEach(el=>el.classList.remove('active'));const item=document.getElementById('thumb-'+p);if(item){item.classList.add('active');scrollThumbToPage(p);}}
function toggleThumbPanel(){thumbPanelOpen=!thumbPanelOpen;const panel=document.getElementById('thumb-panel');const toggle=document.getElementById('thumb-panel-toggle');if(panel)panel.classList.toggle('collapsed',!thumbPanelOpen);if(toggle){toggle.style.background=thumbPanelOpen?'':'#eff6ff';toggle.style.borderColor=thumbPanelOpen?'':'#93c5fd';toggle.style.color=thumbPanelOpen?'':'#176cd2';}}
let rightPanelOpen=true;function toggleRightPanel(){rightPanelOpen=!rightPanelOpen;const panel=document.getElementById('right-panel');const topBtn=document.getElementById('toolkit-topbar-toggle');const stickyBtn=document.getElementById('toolkit-toggle-btn');if(panel)panel.classList.toggle('collapsed',!rightPanelOpen);if(stickyBtn)stickyBtn.classList.toggle('hide',rightPanelOpen);if(topBtn){topBtn.style.background=rightPanelOpen?'':'#eff6ff';topBtn.style.borderColor=rightPanelOpen?'':'#93c5fd';topBtn.style.color=rightPanelOpen?'':'#176cd2';topBtn.title=rightPanelOpen?'Ukryj przybornik':'Pokaż przybornik';}}
let currentZoom=100;const ZOOM_MIN=50;const ZOOM_MAX=200;const ZOOM_STEP=10;function adjustZoom(delta){currentZoom=Math.max(ZOOM_MIN,Math.min(ZOOM_MAX,currentZoom+delta));applyZoom();}
function resetZoom(){currentZoom=100;applyZoom();}
function applyZoom(){const inner=document.getElementById('book-viewport-inner');const label=document.getElementById('zoom-value-inline');if(inner){inner.style.transform=`scale(${currentZoom / 100})`;inner.style.transformOrigin=currentZoom<=100?'top center':'top left';}
if(label)label.textContent=currentZoom+'%';}
document.addEventListener('wheel',function(e){const reader=document.getElementById('view-reader');if(!reader||reader.classList.contains('hide'))return;if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();adjustZoom(e.deltaY<0?ZOOM_STEP:-ZOOM_STEP);},{passive:false});function goToPage(p){currentPage=Math.max(1,Math.min(totalPages,p));
  // Update input + total
  const inp=document.getElementById('page-jump-input');
  if(inp) inp.value=currentPage;
  const tot=document.getElementById('total-pages-display');
  if(tot) tot.textContent=totalPages;
  // Legacy display (kept for compatibility)
  const display=document.getElementById('current-page-display');
  if(display)display.textContent=currentPage+' / '+totalPages;
  // Progress bar
  const pct=Math.round((currentPage/totalPages)*100);
  const bar=document.getElementById('reader-progress-bar');
  if(bar) bar.style.width=pct+'%';
  const pctEl=document.getElementById('reader-progress-pct');
  if(pctEl) pctEl.textContent=pct+'%';
  // Disable/enable first/last buttons
  const first=document.getElementById('pnav-first');
  const prev=document.getElementById('pnav-prev');
  const next=document.getElementById('pnav-next');
  const last=document.getElementById('pnav-last');
  if(first) first.disabled=currentPage<=1;
  if(prev)  prev.disabled=currentPage<=1;
  if(next)  next.disabled=currentPage>=totalPages;
  if(last)  last.disabled=currentPage>=totalPages;
  var _inp=document.getElementById("pnav-input");if(_inp)_inp.value=currentPage;var _tot=document.getElementById("pnav-total");if(_tot)_tot.textContent=totalPages;var _pct2=Math.round((currentPage/totalPages)*100);var _bar=document.getElementById("pnav-bar");if(_bar)_bar.style.width=_pct2+"%";var _pp=document.getElementById("pnav-pct");if(_pp)_pp.textContent=_pct2+"%";var _f=document.getElementById("pnav-first");if(_f)_f.disabled=currentPage<=1;var _p=document.getElementById("pnav-prev");if(_p)_p.disabled=currentPage<=1;var _n=document.getElementById("pnav-next");if(_n)_n.disabled=currentPage>=totalPages;var _l=document.getElementById("pnav-last");if(_l)_l.disabled=currentPage>=totalPages;updateThumbActive(currentPage);if(currentViewMode!=='single')updateDoublePageLabels();if(typeof updateBreadcrumb==='function')updateBreadcrumb(currentChapterNum,currentPage);const inner=document.getElementById('book-viewport-inner');if(inner){inner.style.opacity='0.4';setTimeout(()=>{inner.style.opacity='1';},180);}}
let activeTool=null;let drawColor='#fbbf24';let drawOpacity=0.5;let drawStroke=2;let isDrawing=false;let startX=0,startY=0;let currentPreviewRect=null;let markerPath=null;let markerPoints=[];let drawings=[];function initDrawingCanvas(){const area=document.getElementById('book-page-area');const canvas=document.getElementById('drawing-canvas');if(!area||!canvas)return;function resizeCanvas(){canvas.width=area.offsetWidth;canvas.height=area.offsetHeight;canvas.style.width=area.offsetWidth+'px';canvas.style.height=area.offsetHeight+'px';}
resizeCanvas();new ResizeObserver(resizeCanvas).observe(area);}
function selectDrawTool(tool){if(activeTool===tool){cancelDrawTool();return;}
activeTool=tool;['tool-rect-outline','tool-rect-fill','tool-marker'].forEach(id=>{const btn=document.getElementById(id);if(btn)btn.classList.toggle('active',id==='tool-'+tool);});const opts=document.getElementById('draw-color-opts');if(opts)opts.classList.remove('hide');const opRow=document.getElementById('opacity-row');if(opRow)opRow.style.display=tool==='rect-outline'?'none':'';const label=document.getElementById('active-tool-label');const names={'rect-outline':'Prostokąt (obrys)','rect-fill':'Prostokąt (wypełniony)','marker':'Marker'};if(label)label.textContent=names[tool]||tool;const defaults={'rect-outline':'#3b82f6','rect-fill':'#f59e0b','marker':'#fbbf24'};if(defaults[tool]){drawColor=defaults[tool];document.querySelectorAll('.color-swatch').forEach(s=>{s.classList.toggle('selected',s.dataset.color===drawColor);});const cpick=document.getElementById('custom-color-pick');if(cpick)cpick.value=drawColor;}
const canvas=document.getElementById('drawing-canvas');if(canvas){canvas.classList.add('active');canvas.classList.toggle('marker-mode',tool==='marker');attachCanvasListeners(canvas);}
const area=document.getElementById('book-page-area');if(area)area.style.cursor=tool==='marker'?'crosshair':'crosshair';}
function cancelDrawTool(){activeTool=null;['tool-rect-outline','tool-rect-fill','tool-marker'].forEach(id=>{const btn=document.getElementById(id);if(btn)btn.classList.remove('active');});const opts=document.getElementById('draw-color-opts');if(opts)opts.classList.add('hide');const canvas=document.getElementById('drawing-canvas');if(canvas){canvas.classList.remove('active','marker-mode');detachCanvasListeners(canvas);}
const area=document.getElementById('book-page-area');if(area)area.style.cursor='crosshair';}
function attachCanvasListeners(canvas){detachCanvasListeners(canvas);canvas._onMouseDown=onCanvasMouseDown;canvas._onMouseMove=onCanvasMouseMove;canvas._onMouseUp=onCanvasMouseUp;canvas.addEventListener('mousedown',onCanvasMouseDown);canvas.addEventListener('mousemove',onCanvasMouseMove);canvas.addEventListener('mouseup',onCanvasMouseUp);canvas.addEventListener('mouseleave',onCanvasMouseUp);}
function detachCanvasListeners(canvas){if(canvas._onMouseDown)canvas.removeEventListener('mousedown',canvas._onMouseDown);if(canvas._onMouseMove)canvas.removeEventListener('mousemove',canvas._onMouseMove);if(canvas._onMouseUp){canvas.removeEventListener('mouseup',canvas._onMouseUp);canvas.removeEventListener('mouseleave',canvas._onMouseUp);}}
function getCanvasPos(e,canvas){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
function onCanvasMouseDown(e){if(!activeTool)return;e.stopPropagation();isDrawing=true;const pos=getCanvasPos(e,this);startX=pos.x;startY=pos.y;if(activeTool==='marker'){startMarkerPath(pos);}else{startRectPreview(pos);}}
function onCanvasMouseMove(e){if(!isDrawing||!activeTool)return;const pos=getCanvasPos(e,this);if(activeTool==='marker'){continueMarkerPath(pos);}else{updateRectPreview(pos);}}
function onCanvasMouseUp(e){if(!isDrawing||!activeTool)return;isDrawing=false;if(activeTool==='marker'){finalizeMarkerPath();}else{const pos=getCanvasPos(e,this);finalizeRect(pos);}}
function startRectPreview(pos){const layer=document.getElementById('shapes-layer');if(!layer)return;const ns='http://www.w3.org/2000/svg';const rect=document.createElementNS(ns,'rect');rect.id='preview-rect';if(activeTool==='rect-outline'){rect.setAttribute('fill','none');rect.setAttribute('stroke',drawColor);rect.setAttribute('stroke-width',drawStroke);rect.setAttribute('rx','3');}else{rect.setAttribute('fill',drawColor);rect.setAttribute('fill-opacity',drawOpacity);rect.setAttribute('stroke','none');rect.setAttribute('rx','3');}
rect.setAttribute('x',startX);rect.setAttribute('y',startY);rect.setAttribute('width','0');rect.setAttribute('height','0');layer.appendChild(rect);currentPreviewRect=rect;}
function updateRectPreview(pos){if(!currentPreviewRect)return;const x=Math.min(startX,pos.x);const y=Math.min(startY,pos.y);const w=Math.abs(pos.x-startX);const h=Math.abs(pos.y-startY);currentPreviewRect.setAttribute('x',x);currentPreviewRect.setAttribute('y',y);currentPreviewRect.setAttribute('width',w);currentPreviewRect.setAttribute('height',h);}
function finalizeRect(pos){if(!currentPreviewRect)return;const x=parseFloat(currentPreviewRect.getAttribute('x'));const y=parseFloat(currentPreviewRect.getAttribute('y'));const w=parseFloat(currentPreviewRect.getAttribute('width'));const h=parseFloat(currentPreviewRect.getAttribute('height'));if(w<5||h<5){currentPreviewRect.remove();currentPreviewRect=null;return;}
const id='shape_'+Date.now();currentPreviewRect.id=id;currentPreviewRect.style.pointerEvents='all';currentPreviewRect.style.cursor='pointer';currentPreviewRect.addEventListener('click',function(e){e.stopPropagation();showShapeBubble(id,e.clientX,e.clientY);});drawings.push({id,tool:activeTool,x,y,w,h,color:drawColor,opacity:drawOpacity,stroke:drawStroke});currentPreviewRect=null;updateDrawClearBtn();}
function startMarkerPath(pos){const layer=document.getElementById('shapes-layer');if(!layer)return;const ns='http://www.w3.org/2000/svg';const path=document.createElementNS(ns,'path');markerPoints=[pos];path.id='preview-marker';path.setAttribute('stroke',drawColor);path.setAttribute('stroke-width',drawStroke*6);path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');path.setAttribute('fill','none');path.setAttribute('opacity',drawOpacity);path.setAttribute('d',`M ${pos.x} ${pos.y}`);layer.appendChild(path);markerPath=path;}
function continueMarkerPath(pos){if(!markerPath)return;markerPoints.push(pos);let d=`M ${markerPoints[0].x} ${markerPoints[0].y}`;for(let i=1;i<markerPoints.length-1;i++){const mx=(markerPoints[i].x+markerPoints[i+1].x)/2;const my=(markerPoints[i].y+markerPoints[i+1].y)/2;d+=` Q ${markerPoints[i].x} ${markerPoints[i].y} ${mx} ${my}`;}
if(markerPoints.length>1){const last=markerPoints[markerPoints.length-1];d+=` L ${last.x} ${last.y}`;}
markerPath.setAttribute('d',d);}
function finalizeMarkerPath(){if(!markerPath||markerPoints.length<2){if(markerPath)markerPath.remove();markerPath=null;markerPoints=[];return;}
const id='shape_'+Date.now();markerPath.id=id;markerPath.style.pointerEvents='all';markerPath.style.cursor='pointer';markerPath.addEventListener('click',function(e){e.stopPropagation();showShapeBubble(id,e.clientX,e.clientY);});drawings.push({id,tool:'marker',points:[...markerPoints],color:drawColor,opacity:drawOpacity,stroke:drawStroke});markerPath=null;markerPoints=[];updateDrawClearBtn();}
function showShapeBubble(id,cx,cy){document.querySelectorAll('.shape-bubble').forEach(b=>b.remove());const bubble=document.createElement('div');bubble.className='shape-bubble hotspot-bubble';bubble.style.cssText=`position:fixed;left:${cx}px;top:${cy - 10}px;transform:translate(-50%,-100%);z-index:500;min-width:160px;`;bubble.innerHTML=`
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;"><span style="font-size:11px;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:0.05em;">Adnotacja</span><button onclick="this.closest('.shape-bubble').remove()" style="background:#f1f5f9;border:none;border-radius:8px;width:22px;height:22px;cursor:pointer;font-size:11px;color:#64748b;font-weight:700;flex-shrink:0;line-height:1;padding:0;">✕</button></div><button onclick="removeDrawing('${id}');this.closest('.shape-bubble').remove();" style="width:100%;font-size:11px;font-weight:700;color:#ef4444;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:6px 10px;cursor:pointer;text-align:center;">🗑 Usuń adnotację</button>`;bubble.addEventListener('click',e=>e.stopPropagation());document.body.appendChild(bubble);setTimeout(()=>document.addEventListener('click',function cb(){bubble.remove();document.removeEventListener('click',cb);},{once:true}),0);}
function removeDrawing(id){drawings=drawings.filter(d=>d.id!==id);const el=document.getElementById(id);if(el)el.remove();updateDrawClearBtn();}
function clearAllDrawings(){const layer=document.getElementById('shapes-layer');if(layer)layer.innerHTML='';drawings=[];const tkBadge=document.getElementById('tk-draw-badge');if(tkBadge){tkBadge.textContent='0';tkBadge.classList.remove('visible');}}
function updateDrawClearBtn(){const n=drawings.length;const tkBadge=document.getElementById('tk-draw-badge');if(tkBadge){tkBadge.textContent=n;tkBadge.classList.toggle('visible',n>0);}}
function setDrawColor(color,el){drawColor=color;document.querySelectorAll('.color-swatch').forEach(s=>s.classList.remove('selected'));if(el)el.classList.add('selected');const cpick=document.getElementById('custom-color-pick');if(cpick)cpick.value=color;}
function setDrawColorFromPicker(color){drawColor=color;document.querySelectorAll('.color-swatch').forEach(s=>s.classList.remove('selected'));}
function setDrawOpacity(val){drawOpacity=parseFloat(val)/100;const lbl=document.getElementById('opacity-val');if(lbl)lbl.textContent=val+'%';}
function setStrokeWidth(val){drawStroke=parseInt(val);const lbl=document.getElementById('stroke-width-val');if(lbl)lbl.textContent=val;}
function toggleTkSection(id){const section=document.getElementById(id);if(!section)return;section.classList.toggle('open');}
function openTkSection(id){const section=document.getElementById(id);if(section)section.classList.add('open');}
function setHotspotFilter(value){hotspotFilter=value;try{sessionStorage.setItem('hs_filter',value);}catch(e){}
['all','user','pub'].forEach(k=>{const btn=document.getElementById('hf-'+k);if(!btn)return;const isActive=(k==='pub'?'publisher':k)===value;btn.style.background=isActive?'white':'';btn.style.color=isActive?'#0b2a75':'';btn.style.fontWeight=isActive?'800':'';btn.style.boxShadow=isActive?'0 1px 3px rgba(0,0,0,0.1)':'';});applyHotspotFilter();}
function syncFilterRadios(){setHotspotFilter(hotspotFilter);}
let noteMode='keyboard';let noteColor='#fef3c7';let noteBorder='#f59e0b';let savedNotes=[];let stylusTool='pen';let stylusColor='#1e293b';let stylusSize=3;let stylusDrawing=false;let stylusHistory=[];let noteCtx=null;let stylusLastX=0,stylusLastY=0;function openNoteModal(){const overlay=document.getElementById('note-modal-overlay');const label=document.getElementById('note-page-label');if(label)label.textContent='Strona '+currentPage;if(overlay)overlay.classList.add('open');
  // On mobile: split layout so book is visible above notes
  if(window.innerWidth<=1024){
    var vr=document.getElementById('view-reader');
    if(vr)vr.classList.add('note-mobile-open');
  }switchNoteMode(noteMode);refreshNotesList();if(noteMode==='stylus')setTimeout(initStylusCanvas,30);if(noteMode==='keyboard'){setTimeout(()=>{const ta=document.getElementById('note-text-input');if(ta)ta.focus();},60);}}
function closeNoteModal(){const overlay=document.getElementById('note-modal-overlay');if(overlay)overlay.classList.remove('open');var vr=document.getElementById('view-reader');if(vr)vr.classList.remove('note-mobile-open');}
function handleNoteOverlayClick(e){if(e.target===document.getElementById('note-modal-overlay'))closeNoteModal();}
function switchNoteMode(mode){noteMode=mode;const kPanel=document.getElementById('note-keyboard-panel');const sPanel=document.getElementById('note-stylus-panel');const kTab=document.getElementById('note-tab-keyboard');const sTab=document.getElementById('note-tab-stylus');const isKeyboard=mode==='keyboard';kPanel.classList.toggle('hide',!isKeyboard);sPanel.classList.toggle('hide',isKeyboard);kTab.classList.toggle('active',isKeyboard);sTab.classList.toggle('active',!isKeyboard);if(mode==='stylus')setTimeout(initStylusCanvas,40);}
function setNoteColor(bg,border,btn){noteColor=bg;noteBorder=border;const ta=document.getElementById('note-text-input');if(ta){ta.style.background=bg;ta.style.borderColor=border;ta.style.outlineColor=border;}
document.querySelectorAll('#note-color-row button').forEach(b=>{b.style.borderWidth='2px';b.style.borderColor='transparent';b.style.transform='scale(1)';});if(btn){btn.style.borderColor=border;btn.style.transform='scale(1.18)';}}
function saveKeyboardNote(){const ta=document.getElementById('note-text-input');const txt=ta?ta.value.trim():'';if(!txt){if(ta){ta.style.borderColor='#ef4444';ta.focus();}return;}
const note={id:'note_'+Date.now(),type:'keyboard',page:currentPage,text:txt,color:noteColor,border:noteBorder,ts:new Date().toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit'})};savedNotes.push(note);if(ta){ta.value='';ta.style.borderColor='';}
refreshNotesList();updateNotesCountBadge();flashNoteConfirm('💛 Notatka zapisana!');}
function initStylusCanvas(){const canvas=document.getElementById('note-canvas');if(!canvas)return;const wrap=document.getElementById('stylus-canvas-wrap');if(wrap){const W=wrap.clientWidth;if(W>0){canvas.width=W*window.devicePixelRatio;canvas.style.width=W+'px';}}
noteCtx=canvas.getContext('2d');noteCtx.scale(window.devicePixelRatio,window.devicePixelRatio);noteCtx.lineCap='round';noteCtx.lineJoin='round';noteCtx.strokeStyle=stylusColor;noteCtx.lineWidth=stylusSize;canvas.onpointerdown=onStylusDown;canvas.onpointermove=onStylusMove;canvas.onpointerup=onStylusUp;canvas.onpointerleave=onStylusUp;canvas.setPointerCapture;}
function onStylusDown(e){e.preventDefault();stylusDrawing=true;const pos=getStylusPos(e);stylusLastX=pos.x;stylusLastY=pos.y;if(noteCtx)stylusHistory.push(noteCtx.getImageData(0,0,e.target.width,e.target.height));if(stylusHistory.length>30)stylusHistory.shift();const ph=document.getElementById('stylus-placeholder');if(ph)ph.style.display='none';if(stylusTool==='eraser'){noteCtx.globalCompositeOperation='destination-out';noteCtx.lineWidth=stylusSize*4;}else if(stylusTool==='marker'){noteCtx.globalCompositeOperation='source-over';noteCtx.globalAlpha=0.35;noteCtx.lineWidth=stylusSize*5;}else{noteCtx.globalCompositeOperation='source-over';noteCtx.globalAlpha=1;noteCtx.lineWidth=stylusSize;}
noteCtx.strokeStyle=stylusColor;noteCtx.beginPath();noteCtx.moveTo(stylusLastX,stylusLastY);this.setPointerCapture(e.pointerId);}
function onStylusMove(e){if(!stylusDrawing||!noteCtx)return;e.preventDefault();const pos=getStylusPos(e);const mx=(stylusLastX+pos.x)/2;const my=(stylusLastY+pos.y)/2;noteCtx.quadraticCurveTo(stylusLastX,stylusLastY,mx,my);noteCtx.stroke();noteCtx.beginPath();noteCtx.moveTo(mx,my);stylusLastX=pos.x;stylusLastY=pos.y;}
function onStylusUp(e){if(!stylusDrawing)return;stylusDrawing=false;if(noteCtx){noteCtx.globalAlpha=1;noteCtx.globalCompositeOperation='source-over';}}
function getStylusPos(e){const canvas=document.getElementById('note-canvas');const r=canvas.getBoundingClientRect();const dpr=window.devicePixelRatio||1;const scaleX=(canvas.width/dpr)/r.width;const scaleY=(canvas.height/dpr)/r.height;return{x:(e.clientX-r.left)*scaleX,y:(e.clientY-r.top)*scaleY};}
function setStylusTool(tool){stylusTool=tool;['stylus-pen','stylus-marker','stylus-eraser'].forEach(id=>{const btn=document.getElementById(id);if(btn)btn.classList.toggle('active',id==='stylus-'+tool);});}
function setStylusColor(color,btn){stylusColor=color;document.querySelectorAll('#stylus-colors button').forEach(b=>b.classList.remove('selected'));if(btn)btn.classList.add('selected');if(noteCtx)noteCtx.strokeStyle=color;}
function setStylusSize(val){stylusSize=parseInt(val);const lbl=document.getElementById('stylus-size-val');if(lbl)lbl.textContent=val;if(noteCtx)noteCtx.lineWidth=stylusSize;}
function stylusUndo(){if(!noteCtx||stylusHistory.length===0)return;const snap=stylusHistory.pop();noteCtx.putImageData(snap,0,0);if(stylusHistory.length===0){const ph=document.getElementById('stylus-placeholder');if(ph)ph.style.display='';}}
function stylusClear(){const canvas=document.getElementById('note-canvas');if(!noteCtx||!canvas)return;stylusHistory.push(noteCtx.getImageData(0,0,canvas.width,canvas.height));noteCtx.clearRect(0,0,canvas.width,canvas.height);const ph=document.getElementById('stylus-placeholder');if(ph)ph.style.display='';}
function saveStylusNote(){const canvas=document.getElementById('note-canvas');if(!canvas)return;const ctx=canvas.getContext('2d');const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;const isEmpty=!data.some(v=>v>0);if(isEmpty){flashNoteConfirm('⚠️ Narysuj coś, zanim zapiszesz','#ef4444');return;}
const dataUrl=canvas.toDataURL('image/png');const note={id:'snote_'+Date.now(),type:'stylus',page:currentPage,dataUrl,ts:new Date().toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit'})};savedNotes.push(note);stylusClear();refreshNotesList();updateNotesCountBadge();flashNoteConfirm('✏️ Notatka odręczna zapisana!','#0b2a75');}
function refreshNotesList(){const pageNotes=savedNotes.filter(n=>n.page===currentPage);const kbdNotes=pageNotes.filter(n=>n.type==='keyboard');const styNotes=pageNotes.filter(n=>n.type==='stylus');const kList=document.getElementById('keyboard-notes-list');const kHint=document.getElementById('no-notes-hint');const kBadge=document.getElementById('kbd-notes-badge');if(kList){if(kbdNotes.length===0){kList.innerHTML='';if(kHint){kHint.style.display='';kList.appendChild(kHint);}}else{kList.innerHTML=kbdNotes.map(n=>`
<div class="note-item" id="${n.id}" style="border-color:${n.border||'#e2e8f0'};"><div class="note-item-header" onclick="openKbdViewer('${n.id}')"><div style="width:10px;height:10px;border-radius:3px;background:${n.border||'#f59e0b'};flex-shrink:0;"></div><span style="font-size:11px;font-weight:700;color:#1e293b;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${n.text.substring(0,38)}${n.text.length>38?'…':''}</span><button onclick="event.stopPropagation();goToPage(n.page);closeNoteModal()" title="Przejdź do strony ${n.page}" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:1px 7px;font-size:10px;font-weight:800;color:#1e40af;cursor:pointer;flex-shrink:0;display:flex;align-items:center;gap:3px;white-space:nowrap;"><span style="font-size:9px;">📄</span> str. ${n.page}</button><span style="font-size:10px;color:#94a3b8;flex-shrink:0;">${n.ts}</span><button onclick="event.stopPropagation();deleteNote('${n.id}')" style="background:#fef2f2;border:none;border-radius:6px;width:20px;height:20px;cursor:pointer;color:#ef4444;font-size:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-left:4px;">✕</button></div><div class="note-item-body" style="background:${n.color||'#fef3c7'};">${n.text}</div></div>`).join('');}
if(kBadge){kBadge.textContent=kbdNotes.length;kBadge.classList.toggle('hide',kbdNotes.length===0);}}
const sList=document.getElementById('stylus-notes-list');const sHint=document.getElementById('no-stylus-hint');const sBadge=document.getElementById('stylus-notes-badge');if(sList){if(styNotes.length===0){sList.innerHTML='';if(sHint){sHint.style.display='';sList.appendChild(sHint);}}else{sList.innerHTML=styNotes.map(n=>`
<div class="note-item stylus-note" id="${n.id}"><div class="note-item-header" onclick="openStylusViewer('${n.id}')"><span style="font-size:11px;font-weight:700;color:#1e293b;">✏️ Notatka odręczna · ${n.ts}</span><button onclick="event.stopPropagation();goToPage(n.page);closeNoteModal()" title="Przejdź do strony ${n.page}" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:1px 7px;font-size:10px;font-weight:800;color:#1e40af;cursor:pointer;display:flex;align-items:center;gap:3px;white-space:nowrap;"><span style="font-size:9px;">📄</span> str. ${n.page}</button><button onclick="event.stopPropagation();deleteNote('${n.id}')" style="background:#fef2f2;border:none;border-radius:6px;width:20px;height:20px;cursor:pointer;color:#ef4444;font-size:10px;display:flex;align-items:center;justify-content:center;">✕</button></div><div class="note-item-body" style="padding:8px;"><img src="${n.dataUrl}" style="width:100%;border-radius:8px;border:1px solid #e2e8f0;" alt="Notatka odręczna"/></div></div>`).join('');}
if(sBadge){sBadge.textContent=styNotes.length;sBadge.classList.toggle('hide',styNotes.length===0);}}}
function toggleNoteItem(id){const item=document.getElementById(id);if(item)item.classList.toggle('expanded');}
function deleteNote(id){savedNotes=savedNotes.filter(n=>n.id!==id);refreshNotesList();updateNotesCountBadge();}
function updateNotesCountBadge(){const count=savedNotes.filter(n=>n.page===currentPage).length;const row=document.getElementById('notes-count-row');const span=document.getElementById('notes-count');const tkBadge=document.getElementById('tk-notes-badge');if(row)row.classList.toggle('hide',count===0);if(span)span.textContent=count;if(tkBadge){tkBadge.textContent=count;tkBadge.classList.toggle('visible',count>0);}}
function flashNoteConfirm(msg,color='#f59e0b'){const btns=document.querySelectorAll('[onclick="openNoteModal()"]');btns.forEach(btn=>{const orig=btn.innerHTML;const origBg=btn.style.background;btn.innerHTML=`<span class="text-sm font-black leading-none">✓</span><span class="flex-1 text-left">${msg}</span>`;btn.style.background=color;setTimeout(()=>{btn.innerHTML=orig;btn.style.background=origBg;},1800);});}
const CHAPTER_MAP={1:{roman:'I',name:'Pole magnetyczne',sections:[{minPage:8,maxPage:11,name:'Pole magnetyczne — podstawy'},{minPage:12,maxPage:14,name:'Siła magnetyczna i ładunki'},{minPage:15,maxPage:19,name:'Elektromagnesy i zastosowania'},{minPage:20,maxPage:24,name:'Pole magnetyczne Ziemi'},]},2:{roman:'II',name:'Siła magnetyczna',sections:[{minPage:26,maxPage:29,name:'Siła Lorentza'},{minPage:30,maxPage:32,name:'Siła na przewodnik z prądem'},{minPage:33,maxPage:37,name:'Reguła prawej dłoni'},]},3:{roman:'III',name:'Indukcja elektromagnetyczna',sections:[{minPage:40,maxPage:44,name:'Zjawisko indukcji'},{minPage:45,maxPage:49,name:'Prawo Faradaya'},{minPage:50,maxPage:55,name:'Reguła Lenza'},]},4:{roman:'IV',name:'Transformatory i prąd zmienny',sections:[{minPage:58,maxPage:61,name:'Prąd przemienny'},{minPage:62,maxPage:65,name:'Transformator'},{minPage:66,maxPage:70,name:'Przesył energii'},]},5:{roman:'V',name:'Generatory i alternatory',sections:[{minPage:72,maxPage:75,name:'Generator prądu przemiennego'},{minPage:76,maxPage:79,name:'Alternator samochodowy'},]},};function updateBreadcrumb(chNum,page){const ch=CHAPTER_MAP[chNum];if(!ch)return;const bcChapter=document.getElementById('bc-chapter');const bcSection=document.getElementById('bc-section');if(bcChapter)bcChapter.textContent='Rozdział '+ch.roman;if(bcSection){let sectionName=ch.name;if(page&&ch.sections){const sec=ch.sections.find(s=>page>=s.minPage&&page<=s.maxPage);if(sec)sectionName=sec.name;}
bcSection.textContent=sectionName;bcSection.title=sectionName;}}
function goToChapter(n,page){if(n>0){currentChapterNum=n;updateBreadcrumb(n,page);const lbl=document.getElementById('reader-chapter-label');if(lbl){const names=['','Pole magnetyczne','Siła magnetyczna','Indukcja elektromagnetyczna','Transformatory','Generatory'];if(names[n])lbl.textContent='Rozdział '+n;}}
if(page)goToPage(page);}
document.addEventListener('click',function(e){if(!e.target.closest('.book-menu'))closeAllMenus();if(!e.target.closest('#hotspot-picker')&&!e.target.closest('#hotspot-inline-form')){closeHotspotPicker();}});let hotspots=[];let pendingHotspotPos=null;let hotspotFilter=(function(){try{return sessionStorage.getItem('hs_filter')||'all';}catch(e){return'all';}})();const PUBLISHER_HOTSPOTS=[{id:'pub_1',typeId:'text',type:{id:'text',label:'Tekst',icon:'✏️',color:'#10b981'},source:'publisher',data:{label:'Faraday odkrył indukcję w 1831 roku, pracując z magnesami i cewkami. Zjawisko stało się fundamentem elektrotechniki.'},x:70,y:10,page:14},{id:'pub_2',typeId:'link',type:{id:'link',label:'Łącze',icon:'🔗',color:'#0b2a75'},source:'publisher',data:{label:'https://pl.wikipedia.org/wiki/Indukcja_elektromagnetyczna'},x:28,y:52,page:14},{id:'pub_3',typeId:'image',type:{id:'image',label:'Obraz',icon:'🖼️',color:'#3b82f6'},source:'publisher',data:{label:'Schemat ilustrujący linie pola wokół zwojnicy (materiał wydawnictwa)',thumbUrl:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="140" viewBox="0 0 200 140"><rect width="200" height="140" fill="#0b2a75"/><ellipse cx="100" cy="70" rx="55" ry="35" fill="none" stroke="#60a5fa" stroke-width="2.5" stroke-dasharray="8,4"/><ellipse cx="100" cy="70" rx="38" ry="22" fill="none" stroke="#93c5fd" stroke-width="2" stroke-dasharray="6,4"/><ellipse cx="100" cy="70" rx="22" ry="12" fill="none" stroke="#bfdbfe" stroke-width="1.5" stroke-dasharray="4,4"/><rect x="84" y="55" width="32" height="30" rx="4" fill="#1e3a8a" stroke="#60a5fa" stroke-width="1.5"/><text x="100" y="74" text-anchor="middle" font-size="9" fill="#93c5fd" font-family="sans-serif" font-weight="700">ZWOJNICA</text><text x="100" y="125" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.6)" font-family="sans-serif">Linie pola magnetycznego</text></svg>')},x:55,y:78,page:14},{id:'pub_4',typeId:'eduexpert',type:{id:'eduexpert',label:'eduExpert',icon:'🎓',color:'#10b981'},source:'publisher',data:{label:'Indukcja_Elektromagnetyczna_R4'},x:42,y:30,page:14},];const HOTSPOT_TYPES=[{id:'image',label:'Obraz',icon:'🖼️',color:'#3b82f6',accept:'image/*',multi:false},{id:'gallery',label:'Galeria',icon:'🗂️',color:'#8b5cf6',accept:'image/*',multi:true},{id:'video',label:'Wideo',icon:'🎬',color:'#ef4444',accept:'video/*',multi:false},{id:'audio',label:'Dźwięk',icon:'🎵',color:'#f59e0b',accept:'audio/*',multi:false},{id:'file',label:'Plik',icon:'📄',color:'#64748b',accept:'*/*',multi:false},{id:'link',label:'Łącze',icon:'🔗',color:'#0b2a75',accept:null,multi:false},{id:'text',label:'Tekst',icon:'✏️',color:'#ec4899',accept:null,multi:false},];const EDUEXPERT_TYPE={id:'eduexpert',label:'eduExpert',icon:'🎓',color:'#10b981',accept:null,multi:false};const BOOK_PAGE_INDEX={1:['pole magnetyczne','magnes','bieguny','linie pola','ferromagnetyk'],2:['siła magnetyczna','ładunek','ruch','przewodnik','prawo amperego','cewka'],3:['elektromagnes','rdzeń','zwojnica','temperatura curie','MRI','głośnik'],4:['siła elektromotoryczna','SEM','indukcja elektromagnetyczna','faraday','1831','strumień','zmiana pola','reguła lenza','prąd indukcyjny','zwojnica','magnes'],5:['transformator','uzwojenie','prąd zmienny','napięcie','stosunek zwojów'],6:['generator','alternator','prądnica','wirnik','stojan','turbina','elektrownia'],7:['prawo faradaya','wzór','strumień magnetyczny','weber'],8:['samoindukcja','indukcyjność własna','cewka indukcyjna','henr'],9:['indukcja wzajemna','sprzężenie','dwie cewki'],10:['ładowarka bezprzewodowa','karta zbliżeniowa','qi','indukcja w praktyce'],11:['obliczenia','zadania','przykłady','oblicz napięcie'],12:['podsumowanie','kluczowe wzory','definicje'],13:['test wiedzy','pytania sprawdzające','magnetyzm'],14:['zjawisko indukcji','faraday','zwojnica','magnes','reguła lenza','generatory','alternatory','transformatory'],15:['prąd indukcyjny w pętli','maxwell','biot-savart'],};document.addEventListener('DOMContentLoaded',initHotspotSystem);document.addEventListener('DOMContentLoaded',function(){startSelection('sub');});if(document.readyState!=='loading'){setTimeout(initHotspotSystem,0);setTimeout(function(){startSelection('sub');},0);}function initHotspotSystem(){initHotspotZone();initToolbarButton();loadPublisherHotspots();syncFilterRadios();}
function initHotspotZone(){const area=document.getElementById('book-page-area');if(!area)return;area.addEventListener('click',function(e){if(e.target.closest('.hotspot-pin'))return;if(e.target.closest('#hotspot-picker'))return;if(e.target.closest('#hotspot-inline-form'))return;if(e.target.tagName==='BUTTON')return;if(e.target.tagName==='A')return;e.stopPropagation();const rect=area.getBoundingClientRect();pendingHotspotPos={x:((e.clientX-rect.left)/rect.width)*100,y:((e.clientY-rect.top)/rect.height)*100};showHotspotPicker(e.clientX,e.clientY,'user');});}
function initToolbarButton(){const btn=document.getElementById('add-hotspot-btn');if(!btn)return;btn.addEventListener('click',function(e){e.stopPropagation();const area=document.getElementById('book-page-area');if(!area)return;const rect=area.getBoundingClientRect();pendingHotspotPos={x:50,y:18};showHotspotPicker(rect.left+rect.width*0.5,rect.top+65,'user');});}
function loadPublisherHotspots(){PUBLISHER_HOTSPOTS.forEach(hs=>{if(!hotspots.find(h=>h.id===hs.id)){hotspots.push(hs);renderHotspotPin(hs);}});applyHotspotFilter();renderHotspotList();}
function showHotspotPicker(clientX,clientY,source){closeHotspotPicker();const picker=document.createElement('div');picker.id='hotspot-picker';picker.className='hotspot-picker';const vw=window.innerWidth,vh=window.innerHeight;const pw=290,ph=HOTSPOT_TYPES.length*46+60;let left=clientX+10;let top=clientY-10;if(left+pw>vw-8)left=clientX-pw-10;if(top+ph>vh-8)top=vh-ph-8;if(top<8)top=8;picker.style.cssText=`left:${left}px;top:${top}px;`;picker.innerHTML=`
<div style="padding:12px 16px 10px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;"><p style="font-size:11px;font-weight:800;color:#0b2a75;text-transform:uppercase;letter-spacing:0.08em;margin:0;">Typ hotspota</p><button id="picker-close-btn" style="background:#f1f5f9;border:none;border-radius:8px;width:22px;height:22px;cursor:pointer;font-size:11px;color:#64748b;font-weight:700;line-height:1;padding:0;">✕</button></div>
${HOTSPOT_TYPES.map(t => `<button class="hotspot-type-btn"data-type="${t.id}"data-source="${source}"><span class="hotspot-type-icon"style="background:${t.color}1a;">${t.icon}</span><span style="font-size:13px;font-weight:600;color:#1e293b;flex:1;text-align:left;">${t.label}</span></button>`).join('')}`;picker.addEventListener('click',function(e){e.stopPropagation();if(e.target.closest('#picker-close-btn')){closeHotspotPicker();pendingHotspotPos=null;return;}
const btn=e.target.closest('[data-type]');if(btn)selectHotspotType(btn.dataset.type,btn.dataset.source);});document.body.appendChild(picker);}
function closeHotspotPicker(){const p=document.getElementById('hotspot-picker');if(p)p.remove();const f=document.getElementById('hotspot-inline-form');if(f)f.remove();}
function selectHotspotType(typeId,source){closeHotspotPicker();const type=HOTSPOT_TYPES.find(t=>t.id===typeId);if(!type)return;if(type.accept){const input=document.createElement('input');input.type='file';input.accept=type.accept;if(type.multi)input.multiple=true;input.style.display='none';document.body.appendChild(input);input.onchange=()=>{if(input.files&&input.files.length>0)
commitHotspot(typeId,type,{label:Array.from(input.files).map(f=>f.name).join(', ')},source);input.remove();};input.oncancel=()=>{input.remove();pendingHotspotPos=null;};input.click();}else{showInlineForm(typeId,type,source);}}
function showInlineForm(typeId,type,source){const area=document.getElementById('book-page-area');const aRect=area?area.getBoundingClientRect():null;const left=aRect?Math.max(8,aRect.left+aRect.width/2-180):window.innerWidth/2-180;const top=aRect?aRect.top+60:200;const form=document.createElement('div');form.id='hotspot-inline-form';form.style.cssText=`position:fixed;left:${left}px;top:${top}px;z-index:600;width:360px;`;const inputHtml=typeId==='text'?`<textarea id="hs-input" placeholder="Wpisz treść notatki…" rows="3"
style="width:100%;border:2px solid #e2e8f0;border-radius:12px;padding:10px 12px;font-size:13px;font-family:inherit;resize:vertical;outline:none;box-sizing:border-box;transition:border 0.15s;"></textarea>`:`<input id="hs-input" type="url" placeholder="Wklej adres URL, np. https://…"
style="width:100%;border:2px solid #e2e8f0;border-radius:12px;padding:10px 12px;font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;transition:border 0.15s;">`;form.innerHTML=`<div style="background:white;border-radius:18px;box-shadow:0 16px 48px rgba(11,42,117,0.18);border:1px solid rgba(226,232,240,0.9);overflow:hidden;"><div style="background:#0b2a75;padding:12px 16px;display:flex;align-items:center;gap:8px;"><span style="font-size:18px;">${type.icon}</span><p style="font-size:12px;font-weight:800;color:white;text-transform:uppercase;letter-spacing:0.06em;margin:0;flex:1;">Nowy hotspot — ${type.label}</p><button id="hs-close-btn" style="background:rgba(255,255,255,0.18);border:none;border-radius:8px;width:24px;height:24px;cursor:pointer;font-size:12px;color:white;font-weight:700;line-height:1;padding:0;">✕</button></div><div style="padding:16px;">
${inputHtml}
<div style="display:flex;gap:8px;margin-top:12px;"><button id="hs-confirm-btn" style="flex:1;background:#176cd2;color:white;border:none;border-radius:12px;padding:11px;font-size:13px;font-weight:700;cursor:pointer;transition:background 0.15s;">Dodaj hotspot ＋</button><button id="hs-cancel-btn" style="background:#f1f5f9;color:#1e293b;border:none;border-radius:12px;padding:11px 14px;font-size:13px;font-weight:600;cursor:pointer;">Anuluj</button></div></div></div>`;form.addEventListener('click',e=>e.stopPropagation());document.body.appendChild(form);form.querySelector('#hs-close-btn').addEventListener('click',()=>{closeHotspotPicker();pendingHotspotPos=null;});form.querySelector('#hs-cancel-btn').addEventListener('click',()=>{closeHotspotPicker();pendingHotspotPos=null;});form.querySelector('#hs-confirm-btn').addEventListener('click',()=>{const inp=document.getElementById('hs-input');const val=inp?inp.value.trim():'';if(!val){if(inp){inp.style.borderColor='#ef4444';inp.focus();}return;}
commitHotspot(typeId,type,{label:val},source);closeHotspotPicker();});const inp=document.getElementById('hs-input');if(inp){inp.addEventListener('focus',()=>{inp.style.borderColor='#176cd2';});inp.addEventListener('blur',()=>{inp.style.borderColor='#e2e8f0';});inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&typeId==='link')form.querySelector('#hs-confirm-btn').click();});setTimeout(()=>inp.focus(),60);}}
function commitHotspot(typeId,type,data,source){if(!pendingHotspotPos)pendingHotspotPos={x:50,y:18};const id='hs_'+Date.now();const hs={id,typeId,type,data,source:source||'user',x:pendingHotspotPos.x,y:pendingHotspotPos.y,page:currentPage};hotspots.push(hs);pendingHotspotPos=null;renderHotspotPin(hs);applyHotspotFilter();updateHotspotCount();flashToolbarConfirm();}
function flashToolbarConfirm(){const btn=document.getElementById('add-hotspot-btn');if(!btn)return;const orig=btn.innerHTML;btn.innerHTML='<span style="font-size:14px;line-height:1;">✓</span> Dodano!';btn.style.background='#10b981';setTimeout(()=>{btn.innerHTML=orig;btn.style.background='';},1400);}
function renderHotspotPin(hs){const layer=document.getElementById('hotspot-pins-layer');if(!layer)return;const isPublisher=hs.source==='publisher';const pin=document.createElement('div');pin.className=`hotspot-pin pin-${hs.typeId}`;pin.id='pin_'+hs.id;pin.dataset.source=hs.source;pin.style.cssText=`left:${hs.x}%;top:${hs.y}%;pointer-events:all;`;pin.title=(isPublisher?'📚 Wydawnictwo: ':'👤 Twój: ')+hs.type.label+' — '+hs.data.label;const headBorder=isPublisher?'border:2.5px solid #f59e0b !important;':'';const dotHtml=isPublisher?`<div style="position:absolute;top:-3px;right:-3px;width:10px;height:10px;background:#f59e0b;border-radius:50%;border:1.5px solid white;z-index:1;"></div>`:'';pin.innerHTML=`
<div class="hotspot-pin-inner"><div class="hotspot-pin-head" style="${headBorder}"><span>${hs.type.icon}</span></div><div class="hotspot-pin-tip"></div></div>${dotHtml}`;pin.addEventListener('click',e=>{e.stopPropagation();showHotspotBubble(hs,pin);});layer.appendChild(pin);}
function showHotspotBubble(hs,pinEl){document.querySelectorAll('.hotspot-bubble').forEach(b=>b.remove());const r=pinEl.getBoundingClientRect();const isPublisher=hs.source==='publisher';if(hs.typeId==='eduexpert'){const bubble=document.createElement('div');bubble.className='hotspot-bubble';bubble.style.cssText=`position:fixed;left:${r.left + r.width/2}px;top:${r.top - 10}px;transform:translate(-50%,-100%);z-index:500;width:320px;padding:0;overflow:hidden;border-radius:16px;`;bubble.innerHTML=`
<div style="background:linear-gradient(135deg,#065f46,#10b981);padding:10px 14px;display:flex;align-items:center;gap:8px;"><span style="font-size:16px;">🎓</span><p style="color:white;font-size:12px;font-weight:800;margin:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${hs.data.label}</p><button onclick="this.closest('.hotspot-bubble').remove()" style="background:rgba(255,255,255,0.2);border:none;border-radius:7px;width:22px;height:22px;color:white;cursor:pointer;font-weight:700;font-size:11px;flex-shrink:0;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;">✕</button></div><div style="background:#0f2027;height:160px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;"><div style="position:absolute;inset:0;background:linear-gradient(135deg,#0f2027,#203a43,#2c5364);"></div><div style="position:relative;z-index:1;text-align:center;"><div style="font-size:28px;margin-bottom:8px;">🎓</div><p style="color:rgba(255,255,255,0.7);font-size:11px;font-weight:500;margin:0 0 12px;">Zasób eduExpert</p><button onclick="this.innerHTML='⏸ Zatrzymaj';this.style.background='#059669';" style="background:#10b981;color:white;border:none;border-radius:10px;padding:8px 20px;font-size:12px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">▶ Uruchom</button></div></div>
${!isPublisher ? `<div style="padding:8px 12px;background:white;"><button onclick="removeHotspot('${hs.id}');this.closest('.hotspot-bubble').remove();"style="font-size:11px;font-weight:700;color:#ef4444;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:4px 10px;cursor:pointer;">🗑 Usuń hotspot</button></div>` : ''}`;bubble.addEventListener('click',e=>e.stopPropagation());document.body.appendChild(bubble);setTimeout(()=>document.addEventListener('click',function cb(){bubble.remove();document.removeEventListener('click',cb);},{once:true}),0);return;}
const bubble=document.createElement('div');bubble.className='hotspot-bubble';bubble.style.cssText=`position:fixed;left:${r.left + r.width/2}px;top:${r.top - 10}px;transform:translate(-50%,-100%);z-index:500;min-width:240px;max-width:300px;`;bubble.innerHTML=`
<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap;"><span style="font-size:12px;font-weight:800;color:${hs.type.color};text-transform:uppercase;letter-spacing:0.05em;">${hs.type.icon} ${hs.type.label}</span><span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:8px;${isPublisher ? 'background:#fef3c7;color:#92400e;' : 'background:#eff6ff;color:#1e40af;'}">
${isPublisher ? '📚 Wydawnictwo' : '👤 Twój hotspot'}
</span><button onclick="this.closest('.hotspot-bubble').remove()" style="margin-left:auto;background:#f1f5f9;border:none;border-radius:8px;width:22px;height:22px;cursor:pointer;font-size:11px;color:#64748b;font-weight:700;flex-shrink:0;line-height:1;padding:0;">✕</button></div><p style="font-size:12px;color:#334155;font-weight:500;word-break:break-all;margin:0 0 10px;line-height:1.5;">${hs.data.label}</p>
${!isPublisher
? `<button onclick="removeHotspot('${hs.id}');this.closest('.hotspot-bubble').remove();"style="font-size:11px;font-weight:700;color:#ef4444;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:4px 10px;cursor:pointer;">🗑 Usuń hotspot</button>`
: `<p style="font-size:10px;color:#94a3b8;font-style:italic;margin:0;">Hotspot wydawnictwa — nie można usunąć</p>`}`;bubble.addEventListener('click',e=>e.stopPropagation());document.body.appendChild(bubble);setTimeout(()=>document.addEventListener('click',function cb(){bubble.remove();document.removeEventListener('click',cb);},{once:true}),0);}
function removeHotspot(id){hotspots=hotspots.filter(h=>h.id!==id);const pin=document.getElementById('pin_'+id);if(pin)pin.remove();updateHotspotCount();}
function setHotspotFilter(value){hotspotFilter=value;try{sessionStorage.setItem('hs_filter',value);}catch(e){}
document.querySelectorAll('.hs-filter-btn').forEach(btn=>{const isActive=(value==='all'&&btn.id==='hf-all')||(value==='user'&&btn.id==='hf-user');btn.classList.toggle('active',isActive);btn.classList.toggle('bg-white',isActive);btn.classList.toggle('text-navy',isActive);btn.classList.toggle('shadow-sm',isActive);btn.classList.toggle('text-slate-500',!isActive);});applyHotspotFilter();renderHotspotList();}
function applyHotspotFilter(){document.querySelectorAll('.hotspot-pin').forEach(pin=>{const src=pin.dataset.source||'user';const show=hotspotFilter==='all'||(hotspotFilter==='user'&&src==='user');pin.style.display=show?'':'none';});}
function syncFilterRadios(){setHotspotFilter(hotspotFilter);}
function updateHotspotCount(){const n=hotspots.filter(h=>h.source==='user').length;const tkBadge=document.getElementById('tk-hotspot-badge');if(tkBadge){tkBadge.textContent=hotspots.length;tkBadge.classList.toggle('visible',hotspots.length>0);}
renderHotspotList();}
function renderHotspotList(){const listEl=document.getElementById('hs-list');const emptyEl=document.getElementById('hs-list-empty');if(!listEl)return;const filtered=hotspots.filter(h=>hotspotFilter==='all'||(hotspotFilter==='user'&&h.source==='user'));listEl.querySelectorAll('.hs-list-item').forEach(el=>el.remove());if(filtered.length===0){if(emptyEl)emptyEl.style.display='';return;}
if(emptyEl)emptyEl.style.display='none';filtered.forEach(hs=>{const isPublisher=hs.source==='publisher';const iconBg=hs.type.color+'22';const srcColor=isPublisher?'#f59e0b':'#176cd2';const srcLabel=isPublisher?'Wydawnictwo':'Mój';const hasThumb=(hs.typeId==='image'||hs.typeId==='gallery')&&hs.data&&hs.data.thumbUrl;const shortLabel=hs.data&&hs.data.label?hs.data.label.substring(0,40)+(hs.data.label.length>40?'…':''):'';const item=document.createElement('div');item.className='hs-list-item';item.dataset.hsId=hs.id;item.innerHTML=`
<div class="hs-list-item-icon" style="background:${iconBg};">${hs.type.icon}</div><div class="hs-list-item-body"><div class="hs-list-item-label">${hs.type.label}${shortLabel ? ': ' + shortLabel : ''}</div><div class="hs-list-item-meta"><span class="hs-source-dot" style="background:${srcColor};"></span><span>${srcLabel}</span>
${hs.page ? `<span style="color:#cbd5e1;">·</span><span>str.${hs.page}</span>` : ''}
</div></div>
${hasThumb ? `<img class="hs-thumb"src="${hs.data.thumbUrl}"alt="Podgląd"onclick="event.stopPropagation();openHsLightbox('${hs.id}')"title="Kliknij, aby powiększyć"/>` : ''}
${!isPublisher ? `<button onclick="event.stopPropagation();removeHotspot('${hs.id}')"style="flex-shrink:0;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:3px 7px;font-size:10px;font-weight:700;color:#ef4444;cursor:pointer;">✕</button>` : ''}
`;item.addEventListener('click',()=>{const pin=document.getElementById('pin_'+hs.id);if(pin){pin.scrollIntoView({behavior:'smooth',block:'center'});pin.style.filter='brightness(1.5) drop-shadow(0 0 8px rgba(23,108,210,0.8))';setTimeout(()=>{pin.style.filter='';},900);}});listEl.appendChild(item);});}
function openHsLightbox(hsId){const hs=hotspots.find(h=>h.id===hsId);if(!hs||!hs.data||!hs.data.thumbUrl)return;const lb=document.getElementById('hs-img-lightbox');const img=document.getElementById('hs-lb-img');const cap=document.getElementById('hs-lb-caption');if(!lb||!img)return;img.src=hs.data.thumbUrl;if(cap)cap.textContent=hs.data.label||hs.type.label;lb.classList.add('open');}
function closeHsLightbox(){const lb=document.getElementById('hs-img-lightbox');if(lb)lb.classList.remove('open');}
function runBookSearch(){const input=document.getElementById('book-search-input');const query=(input?input.value.trim():'').toLowerCase();const results=document.getElementById('book-search-results');const empty=document.getElementById('book-search-empty');if(!results||!empty)return;results.classList.add('hide');empty.classList.add('hide');if(!query||query.length<2)return;const matches=Object.entries(BOOK_PAGE_INDEX).filter(([,kws])=>kws.some(kw=>kw.includes(query)||query.includes(kw.split(' ')[0]))).map(([p])=>parseInt(p)).sort((a,b)=>a-b);if(matches.length===0){empty.classList.remove('hide');return;}
results.innerHTML=matches.map(p=>{const isCurrent=p===currentPage;return`<button onclick="goToSearchPage(${p})"
style="width:100%;display:flex;align-items:center;gap:8px;padding:7px 10px;border:none;border-radius:12px;cursor:pointer;background:${isCurrent ? 'rgba(23,108,210,0.10)' : 'transparent'};transition:background 0.15s;"
onmouseover="if(!${isCurrent}) this.style.background='#f8fafc'"
onmouseout="if(!${isCurrent}) this.style.background='transparent'"><span style="width:26px;height:26px;border-radius:8px;background:${isCurrent ? '#176cd2' : '#f1f5f9'};color:${isCurrent ? 'white' : '#475569'};font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${p}</span><span style="font-size:12px;font-weight:${isCurrent ? '700' : '600'};color:${isCurrent ? '#176cd2' : '#1e293b'};flex:1;text-align:left;">Strona ${p}${isCurrent ? ' <span style="font-size:10px;font-weight:600;color:#64748b;">(tu jesteś)</span>' : ''}</span><span style="font-size:11px;color:${isCurrent ? '#176cd2' : '#94a3b8'};">→</span></button>`;}).join('');results.classList.remove('hide');}
function goToSearchPage(pageNum){goToPage(pageNum);runBookSearch();}
function openChapterDrawer(){openTocDrawer();}
function closeChapterDrawer(){const dd=document.getElementById('chapter-dropdown');if(dd)dd.classList.remove('open');}
function toggleReviewChapter(id){const body=document.getElementById(id);if(body)body.classList.toggle('open');}
function toggleRvShelf(shelfId,rowEl){const shelf=document.getElementById(shelfId);if(!shelf)return;const isOpen=shelf.classList.contains('open');const chapter=rowEl.closest('.review-chapter-body');if(chapter){chapter.querySelectorAll('.rv-resource-shelf.open').forEach(s=>{if(s.id!==shelfId){s.classList.remove('open');const row=s.previousElementSibling;if(row&&row.classList.contains('rv-topic-row')){row.classList.remove('active');}
const subList=s.nextElementSibling;if(subList&&subList.classList.contains('rv-sub-list'))subList.style.display='none';}});}
if(isOpen){shelf.classList.remove('open');rowEl.classList.remove('active');const subList=shelf.nextElementSibling;if(subList&&subList.classList.contains('rv-sub-list'))subList.style.display='none';}else{shelf.classList.add('open');rowEl.classList.add('active');const subList=shelf.nextElementSibling;if(subList&&subList.classList.contains('rv-sub-list'))subList.style.display='block';setTimeout(()=>rowEl.scrollIntoView({block:'nearest',behavior:'smooth'}),50);}}
function toggleRvTopic(id,headerEl){const body=document.getElementById(id);if(!body)return;const isOpen=body.classList.contains('open');body.classList.toggle('open');if(headerEl){headerEl.classList.toggle('open',!isOpen);const chevron=headerEl.querySelector('.rv-topic-chevron');if(chevron)chevron.style.transform=!isOpen?'rotate(180deg)':'';}}
function toggleBookMenu(id){closeAllMenus();const m=document.getElementById(id);if(m)m.classList.toggle('hide');}
function closeAllMenus(){document.querySelectorAll('.book-menu-dropdown').forEach(m=>m.classList.add('hide'));}
function switchTab(tabId){document.querySelectorAll('#content-area > div[id^="view-"]').forEach(el=>el.classList.add('hide'));document.querySelectorAll('.nav-btn').forEach(btn=>{btn.classList.remove('bg-primary','text-white','shadow-md');btn.classList.add('hover:bg-white/10','text-slate-300');const icon=btn.querySelector('span');if(icon)icon.classList.add('opacity-80');});const view=document.getElementById('view-'+tabId);if(view)view.classList.remove('hide');const navMap={reader:'dashboard',quickreview:'dashboard',flashcards:'dashboard',test:'dashboard'};const navTabId=navMap[tabId]||tabId;const btn=document.getElementById('nav-'+navTabId);if(btn){btn.classList.remove('text-slate-300','hover:bg-white/10');btn.classList.add('bg-primary','text-white','shadow-md');const icon=btn.querySelector('span');if(icon)icon.classList.remove('opacity-80');}}
let darkMode=false;function applyDark(on){darkMode=!!on;document.body.classList.toggle('dark',darkMode);document.documentElement.classList.toggle('dark',darkMode);}
window.addEventListener('message',function(e){if(e.data&&e.data.type==='setDark'){applyDark(e.data.isDark);}});
try{window.parent.postMessage({type:'ready',module:'ib'},'*');}catch(err){}
function toggleDarkMode(){darkMode=!darkMode;document.body.classList.toggle('dark',darkMode);document.documentElement.classList.toggle('dark',darkMode);try{localStorage.setItem('eduu_dark',darkMode?'1':'0');}catch(e){}
const lbl=document.getElementById('dm-menu-label');const ico=document.getElementById('dm-menu-icon');if(lbl)lbl.textContent=darkMode?'Tryb jasny':'Tryb kontrastowy';if(ico)ico.textContent=darkMode?'☀️':'🌙';document.body.style.backgroundColor=darkMode?'#0f172a':'#f4f7fb';const toggleIcon=document.getElementById('dm-toggle-icon');if(toggleIcon)toggleIcon.textContent=darkMode?'🌙':'☀️';
try{if(window.parent&&window.parent!==window){window.parent.postMessage({type:'darkState',isDark:darkMode},'*');}}catch(e){}}
(function(){try{const saved=localStorage.getItem('eduu_dark');if(saved==='1'){darkMode=true;document.body.classList.add('dark');document.body.style.backgroundColor='#0f172a';}}catch(e){}})();function toggleHeaderMenu(e){if(e)e.stopPropagation();const dd=document.getElementById('header-menu-dropdown');if(dd)dd.classList.toggle('hide');}
document.addEventListener('click',function(e){const wrap=document.getElementById('header-menu-wrap');if(wrap&&!wrap.contains(e.target)){const dd=document.getElementById('header-menu-dropdown');if(dd&&!dd.classList.contains('hide'))dd.classList.add('hide');}});function openExternalLink(type){const urls={regulamin:'#regulamin',podrecznik:'#podrecznik-uzytkownika',};window.open(urls[type]||'#','_blank','noopener,noreferrer');const dd=document.getElementById('header-menu-dropdown');if(dd)dd.classList.add('hide');}
let scormPlaying=false;let scormProgressInterval=null;function toggleScormPlay(){const btn=document.getElementById('scorm-play-btn');const bar=document.getElementById('scorm-progress-bar');scormPlaying=!scormPlaying;if(scormPlaying){if(btn){btn.innerHTML='⏸ Zatrzymaj';btn.style.background='#059669';}
let pct=parseFloat(bar?bar.style.width:'0')||0;scormProgressInterval=setInterval(()=>{pct=Math.min(100,pct+0.3);if(bar)bar.style.width=pct+'%';if(pct>=100){clearInterval(scormProgressInterval);scormPlaying=false;if(btn){btn.innerHTML='✓ Ukończono';btn.style.background='#065f46';}}},100);}else{clearInterval(scormProgressInterval);if(btn){btn.innerHTML='▶ Uruchom';btn.style.background='#10b981';}}}
function finishSelection(){document.getElementById('nav-catalog').classList.remove('bg-primary','text-white','shadow-md');document.getElementById('nav-catalog').classList.add('hover:bg-white/10','text-slate-300');try{window.parent.postMessage({type:'booksOnboardingDone'},'*');}catch(e){}switchTab('dashboard');}
function togglePackageBook(btn,cardId){const card=document.getElementById(cardId);const level=(card&&card.getAttribute('data-level'))||'podstawowy';const isSelected=btn.classList.contains('selected-pkg');if(!isSelected){if(pkgSel[level]>=PKG_LIMITS[level]){showLimitToast(level);return;}
btn.classList.add('selected-pkg','bg-primary/10','text-primary','border-primary/30');btn.classList.remove('bg-slate-50','text-slate-500','border-slate-100');btn.innerHTML='✓ W pakiecie';card.classList.add('book-in-package');pkgSel[level]++;}else{btn.classList.remove('selected-pkg','bg-primary/10','text-primary','border-primary/30');btn.classList.add('bg-slate-50','text-slate-500','border-slate-100');btn.innerHTML='Wybierz +';card.classList.remove('book-in-package');pkgSel[level]--;}
updatePackageBar();}
function updatePackageBar(){
  [['podstawowy','pods'],['rozszerzony','roz']].forEach(function(pair){
    var lvl=pair[0],key=pair[1],max=PKG_LIMITS[lvl],n=pkgSel[lvl];
    var disp=document.getElementById('count-'+key);if(disp)disp.textContent=String(n);
    for(var i=1;i<=max;i++){var seg=document.querySelector('[data-seg="'+key+'-'+i+'"]');if(seg){seg.classList.toggle('filled',i<=n);}}
    var full=n>=max;
    document.querySelectorAll('.sklep-book-card[data-level="'+lvl+'"]').forEach(function(card){
      var b=card.querySelector('.pkg-select-btn');if(!b)return;var sel=b.classList.contains('selected-pkg');
      if(full&&!sel){card.classList.add('lvl-locked');b.classList.add('pkg-locked');b.innerHTML='🔒 Limit poziomu';}
      else{card.classList.remove('lvl-locked');b.classList.remove('pkg-locked');if(!sel)b.innerHTML='Wybierz +';}
    });
  });
  var hint=document.getElementById('counter-hint');var total=pkgSel.podstawowy+pkgSel.rozszerzony;
  if(hint){if(total===0){hint.textContent='2 z poziomu podstawowego · 3 z rozszerzonego';}else{var rp=PKG_LIMITS.podstawowy-pkgSel.podstawowy,rr=PKG_LIMITS.rozszerzony-pkgSel.rozszerzony;hint.textContent='Pozostało: '+rp+' podst. · '+rr+' rozsz.';}}
  var confirmBtn=document.getElementById('confirm-btn');if(confirmBtn){var allChosen=(pkgSel.podstawowy>=PKG_LIMITS.podstawowy)&&(pkgSel.rozszerzony>=PKG_LIMITS.rozszerzony);confirmBtn.disabled=!allChosen;confirmBtn.className='cf-cta';}
}
function showLimitToast(level){var nm=level==='rozszerzony'?'rozszerzonego':'podstawowego';var max=PKG_LIMITS[level]||0;var word=(max>=2&&max<=4)?'książki':'książek';var toast=document.createElement('div');toast.className='fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-navy text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-2xl';toast.innerHTML='⚠️ Limit poziomu '+nm+' to '+max+' '+word;document.body.appendChild(toast);setTimeout(function(){toast.remove();},2500);}
function toggleExtraBook(btn,cardId,price,name){const card=document.getElementById(cardId);const inCart=btn.classList.contains('in-cart');if(!inCart){btn.classList.add('in-cart','bg-accent/10','text-accent','border-accent/30');btn.classList.remove('bg-slate-50','text-slate-500','border-slate-100');btn.innerHTML='✓ Dodano do listy';card.classList.add('book-in-list');cartItems.push({id:cardId,name,price});
  // Notify global cart in parent
  try{window.parent.gCartAdd(cardId,name,price,'📖','ib');}catch(e){}
}else{btn.classList.remove('in-cart','bg-accent/10','text-accent','border-accent/30');btn.classList.add('bg-slate-50','text-slate-500','border-slate-100');btn.innerHTML='Dodaj do listy +';card.classList.remove('book-in-list');cartItems=cartItems.filter(i=>i.id!==cardId);
  // Notify global cart in parent
  try{window.parent.gCartRemove(cardId);}catch(e){}
}
updatePurchaseBar();}
function updatePurchaseBar(){
  // Sync to shared localStorage
  try { localStorage.setItem('sharedCart_ib', JSON.stringify(cartItems)); } catch(e){}
  const panel=document.getElementById('purchase-panel');const count=document.getElementById('cart-count');const total=document.getElementById('cart-total');const list=document.getElementById('cart-items-list');if(cartItems.length>0){panel.classList.remove('hidden-panel');panel.classList.add('visible');}else{panel.classList.add('hidden-panel');panel.classList.remove('visible');}
count.textContent=cartItems.length;const sum=cartItems.reduce((a,i)=>a+i.price,0);total.textContent=sum+' zł';list.innerHTML=cartItems.map(item=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 4px;border-bottom:1px solid #f1f5f9;gap:10px"><div style="display:flex;align-items:center;gap:8px;min-width:0"><span style="width:26px;height:26px;border-radius:7px;background:rgba(79,70,229,.10);color:#4f46e5;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span><span style="font-weight:700;color:#0b2a75;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.name}</span></div><span style="font-weight:800;color:#0b2a75;font-size:12px;flex-shrink:0">${item.price} zł</span></div>`).join('');}
function clearCart(){cartItems=[];document.querySelectorAll('.extra-btn.in-cart').forEach(btn=>{btn.classList.remove('in-cart','bg-accent/10','text-accent','border-accent/30');btn.classList.add('bg-slate-50','text-slate-500','border-slate-100');btn.innerHTML='Dodaj do listy +';});document.querySelectorAll('.book-in-list').forEach(card=>card.classList.remove('book-in-list'));updatePurchaseBar();}
function openRedirectModal(){
  // Hide cart panel
  var cp = document.getElementById('purchase-panel');
  if (cp) { cp.classList.add('hidden-panel'); cp.classList.remove('visible'); }
  // Merge with EX cart from localStorage
  let allCartItems = [...cartItems];
  try {
    const exItems = JSON.parse(localStorage.getItem('sharedCart_ex') || '[]');
    exItems.forEach(function(item) {
      if (!allCartItems.find(i => i.id === item.id)) allCartItems.push(item);
    });
  } catch(e) {}
  const list=document.getElementById('modal-books-list');list.innerHTML='';allCartItems.forEach(item=>{list.innerHTML+=`<div class="flex items-center justify-between bg-slate-50 rounded-xl p-3"><div class="flex items-center gap-3"><span class="text-xl">📚</span><span class="font-bold text-navy text-sm">${item.name}</span></div><span class="font-extrabold text-navy">${item.price} zł</span></div>`;});const sum=allCartItems.reduce((acc,i)=>acc+i.price,0);document.getElementById('modal-total').textContent=sum+' zł';openModal('redirect-modal','redirect-modal-content');}
function closeRedirectModal(){closeModal('redirect-modal','redirect-modal-content');}
function simulateRedirect(){closeRedirectModal();const overlay=document.createElement('div');overlay.className='fixed inset-0 bg-bglight z-50 flex flex-col items-center justify-center gap-6';overlay.innerHTML=`<div class="text-6xl animate-pulse">🏛️</div><div class="text-center"><p class="text-xl font-extrabold text-navy mb-2">Przekierowanie do sklepu wydawnictwa…</p><p class="text-slate-500 font-medium text-sm">Symulacja</p></div><div class="flex gap-2 mt-4"><div class="w-2 h-2 bg-primary rounded-full animate-bounce"></div><div class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay:0.15s"></div><div class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay:0.3s"></div></div>`;document.body.appendChild(overlay);setTimeout(()=>{overlay.innerHTML=`<div class="text-6xl">✅</div><div class="text-center"><p class="text-xl font-extrabold text-navy mb-2">Płatność potwierdzona!</p><p class="text-slate-500 font-medium text-sm">Token dostępu odebrany</p></div><div class="bg-white border border-slate-200 rounded-2xl px-6 py-3 font-mono text-xs text-slate-400 shadow-sm">token: edu_${Math.random().toString(36).substr(2,12).toUpperCase()}</div>`;setTimeout(()=>{document.body.removeChild(overlay);showSuccessModal();},1800);},2500);}
function showSuccessModal(){const successBooks=document.getElementById('success-books');successBooks.innerHTML='';cartItems.forEach(item=>{successBooks.innerHTML+=`<div class="flex items-center gap-3 text-sm font-bold text-emerald-700"><span class="text-emerald-500">✓</span><span>📚 ${item.name}</span></div>`;const card=document.getElementById(item.id);if(card)card.classList.add('book-unlocked');});openModal('success-modal','success-modal-content');}
function closeSuccessAndGoToDashboard(){closeModal('success-modal','success-modal-content');clearCart();setTimeout(()=>switchTab('dashboard'),350);}
function toggleEl(id){document.getElementById(id).classList.toggle('hide');}
function openModal(modalId,contentId){const modal=document.getElementById(modalId);const content=document.getElementById(contentId);modal.classList.remove('hide');setTimeout(()=>{modal.classList.remove('opacity-0');content.classList.remove('scale-95','opacity-0');},10);}
function closeModal(modalId,contentId){const modal=document.getElementById(modalId);const content=document.getElementById(contentId);modal.classList.add('opacity-0');content.classList.add('scale-95','opacity-0');setTimeout(()=>modal.classList.add('hide'),300);}
function readerToolActivate(id){document.querySelectorAll('.reader-tool-pill').forEach(p=>p.classList.remove('active'));const btn=document.getElementById('rtool-'+id);if(btn)btn.classList.add('active');setTimeout(()=>{if(btn)btn.classList.remove('active');},400);}
function openSummaryModal(){openModal('summary-modal','summary-content');}
function openMindmapModal(){openModal('mindmap-modal','mindmap-content');}
function setSummaryFormat(fmt){const allFormats=['notes','video','audio','scorm','image'];allFormats.forEach(f=>{const tab=document.getElementById('sf-'+f);const content=document.getElementById('sf-content-'+f);const isActive=f===fmt;if(tab){tab.className=isActive?'sf-tab active flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold border transition-all bg-primary/10 border-primary/25 text-primary':'sf-tab flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold border transition-all bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100';}
if(content)content.classList.toggle('hide',!isActive);});const footer=document.getElementById('summary-footer');if(footer)footer.classList.toggle('hide',fmt==='scorm');}
let audioPlaying=false;let audioInterval=null;function toggleAudioPlayer(){audioPlaying=!audioPlaying;const btn=document.getElementById('audio-play-btn');if(btn)btn.innerHTML=audioPlaying?'⏸':'▶';if(audioPlaying){let progress=0;audioInterval=setInterval(()=>{progress=Math.min(100,progress+0.4);const bars=document.querySelectorAll('[id^="wb-"]');const filled=Math.floor(progress/100*bars.length);bars.forEach((b,i)=>{b.style.opacity=i<filled?'1':'0.35';});const secs=Math.floor(progress/100*255);const timeEl=document.getElementById('audio-time');if(timeEl)timeEl.textContent=Math.floor(secs/60)+':'+String(secs%60).padStart(2,'0');if(progress>=100){clearInterval(audioInterval);audioPlaying=false;if(btn)btn.innerHTML='▶';}},100);}else{clearInterval(audioInterval);}}
function seekAudio(e){const bar=document.getElementById('waveform-bar');if(!bar)return;const rect=bar.getBoundingClientRect();const pct=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));const bars=document.querySelectorAll('[id^="wb-"]');const filled=Math.floor(pct*bars.length);bars.forEach((b,i)=>{b.style.opacity=i<filled?'1':'0.35';});const secs=Math.floor(pct*255);const timeEl=document.getElementById('audio-time');if(timeEl)timeEl.textContent=Math.floor(secs/60)+':'+String(secs%60).padStart(2,'0');}
let mmScale=1;let mmLbScale=1;let mmDragActive=false;let mmDragStart={x:0,y:0};let mmScrollStart={x:0,y:0};function mmZoom(delta){mmScale=Math.max(0.2,Math.min(4,mmScale+delta));const img=document.getElementById('mm-png-img');if(img)img.style.transform=`scale(${mmScale})`;const lbl=document.getElementById('mm-zoom-label');if(lbl)lbl.textContent=Math.round(mmScale*100)+'%';}
function mmZoomReset(){mmScale=1;const img=document.getElementById('mm-png-img');if(img)img.style.transform='scale(1)';const lbl=document.getElementById('mm-zoom-label');if(lbl)lbl.textContent='100%';}
function mmFullscreen(){const src=document.getElementById('mm-png-img')?.src;if(!src)return;const lb=document.getElementById('mm-lightbox');const lbImg=document.getElementById('mm-lb-img');if(lb&&lbImg){lbImg.src=src;mmLbScale=1;lbImg.style.transform='scale(1)';document.getElementById('mm-lb-zoom-label').textContent='100%';lb.classList.remove('hide');lb.style.display='flex';}}
function mmLbZoom(delta){mmLbScale=Math.max(0.2,Math.min(5,mmLbScale+delta));const img=document.getElementById('mm-lb-img');if(img)img.style.transform=`scale(${mmLbScale})`;const lbl=document.getElementById('mm-lb-zoom-label');if(lbl)lbl.textContent=Math.round(mmLbScale*100)+'%';}
function mmStartDrag(e){const container=document.getElementById('mm-png-container');if(!container)return;mmDragActive=true;mmDragStart={x:e.clientX,y:e.clientY};mmScrollStart={x:container.scrollLeft,y:container.scrollTop};const img=document.getElementById('mm-png-img');if(img)img.style.cursor='grabbing';const onMove=(ev)=>{if(!mmDragActive)return;container.scrollLeft=mmScrollStart.x-(ev.clientX-mmDragStart.x);container.scrollTop=mmScrollStart.y-(ev.clientY-mmDragStart.y);};const onUp=()=>{mmDragActive=false;const img2=document.getElementById('mm-png-img');if(img2)img2.style.cursor='grab';document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);};document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);}
function loadMindmapPng(file){const reader=new FileReader();reader.onload=(e)=>{const img=document.getElementById('mm-png-img');const container=document.getElementById('mm-png-container');const builtin=document.getElementById('mm-builtin');const hint=document.getElementById('mm-upload-hint');const zoomControls=document.getElementById('mm-zoom-controls');if(img)img.src=e.target.result;if(container)container.classList.remove('hide');if(builtin)builtin.classList.add('hide');if(hint)hint.classList.add('hide');if(zoomControls)zoomControls.classList.remove('hide');mmZoomReset();};reader.readAsDataURL(file);}
function openMindmapFilePicker(){openCustomFilePicker({title:'Wgraj mapę myśli',subtitle:'Wybierz plik PNG, JPG lub SVG z mapą myśli',accept:'image/*',icon:'🧠',onConfirm:(file)=>{loadMindmapPng(file);}});}
let cfpCallback=null;let cfpSelectedFile=null;let cfpAccept='*';function openCustomFilePicker(opts){cfpCallback=opts.onConfirm||null;cfpSelectedFile=null;cfpAccept=opts.accept||'*';const titleEl=document.getElementById('cfp-title');const subtitleEl=document.getElementById('cfp-subtitle');const iconEl=document.getElementById('cfp-icon');const typeHint=document.getElementById('cfp-type-hint');const confirmBtn=document.getElementById('cfp-confirm-btn');const preview=document.getElementById('cfp-preview');const hiddenInput=document.getElementById('cfp-hidden-input');if(titleEl)titleEl.textContent=opts.title||'Wybierz plik';if(subtitleEl)subtitleEl.textContent=opts.subtitle||'Kliknij, aby wybrać plik z komputera';if(iconEl)iconEl.textContent=opts.icon||'📂';if(typeHint)typeHint.textContent=opts.typeHint||'lub kliknij, aby wybrać z dysku';if(confirmBtn){confirmBtn.disabled=true;confirmBtn.className='flex-1 py-3 bg-slate-200 text-slate-400 font-extrabold rounded-xl transition-all text-sm cursor-not-allowed';}
if(preview)preview.classList.add('hide');if(hiddenInput){hiddenInput.accept=cfpAccept;hiddenInput.value='';}
const picker=document.getElementById('custom-file-picker');if(picker)picker.classList.remove('hide');}
function closeCustomFilePicker(){const picker=document.getElementById('custom-file-picker');if(picker)picker.classList.add('hide');cfpCallback=null;cfpSelectedFile=null;}
function triggerSystemFilePicker(){const inp=document.getElementById('cfp-hidden-input');if(inp)inp.click();}
function handleCfpFileSelect(input){if(input.files&&input.files[0])cfpSetFile(input.files[0]);}
function handleFileDrop(e){e.preventDefault();const dz=document.getElementById('cfp-dropzone');if(dz)dz.classList.remove('border-primary','bg-primary/5');if(e.dataTransfer.files&&e.dataTransfer.files[0])cfpSetFile(e.dataTransfer.files[0]);}
function cfpSetFile(file){cfpSelectedFile=file;const preview=document.getElementById('cfp-preview');const nameEl=document.getElementById('cfp-preview-name');const sizeEl=document.getElementById('cfp-preview-size');const iconEl2=document.getElementById('cfp-preview-icon');const confirmBtn=document.getElementById('cfp-confirm-btn');const ext=file.name.split('.').pop().toLowerCase();const icons={png:'🖼️',jpg:'🖼️',jpeg:'🖼️',svg:'🖼️',pdf:'📄',mp4:'🎬',mp3:'🎵',wav:'🎵',gif:'🖼️'};if(iconEl2)iconEl2.textContent=icons[ext]||'📄';if(nameEl)nameEl.textContent=file.name;const kb=(file.size/1024).toFixed(0);if(sizeEl)sizeEl.textContent=kb>1024?(kb/1024).toFixed(1)+' MB':kb+' KB';if(preview)preview.classList.remove('hide');if(confirmBtn){confirmBtn.disabled=false;confirmBtn.className='flex-1 py-3 bg-primary hover:bg-blue-700 text-white font-extrabold rounded-xl transition-all text-sm cursor-pointer';}}
function cfpClearFile(){cfpSelectedFile=null;const preview=document.getElementById('cfp-preview');const confirmBtn=document.getElementById('cfp-confirm-btn');const inp=document.getElementById('cfp-hidden-input');if(preview)preview.classList.add('hide');if(confirmBtn){confirmBtn.disabled=true;confirmBtn.className='flex-1 py-3 bg-slate-200 text-slate-400 font-extrabold rounded-xl transition-all text-sm cursor-not-allowed';}
if(inp)inp.value='';}
function confirmCustomFilePicker(){if(!cfpSelectedFile)return;const file=cfpSelectedFile;closeCustomFilePicker();if(cfpCallback)cfpCallback(file);}
const HOTSPOT_ACCEPT_LABELS={'image/*':{title:'Wgraj zdjęcie / obraz',subtitle:'Obsługiwane formaty: PNG, JPG, GIF, SVG',icon:'🖼️'},'image/*,video/*':{title:'Wgraj zdjęcia lub wideo',subtitle:'Obsługiwane formaty: PNG, JPG, MP4, MOV',icon:'📷'},'video/*':{title:'Wgraj film',subtitle:'Obsługiwane formaty: MP4, MOV, AVI',icon:'🎬'},'audio/*':{title:'Wgraj plik audio',subtitle:'Obsługiwane formaty: MP3, WAV, OGG',icon:'🎵'},'*':{title:'Wgraj plik',subtitle:'Wybierz plik z dysku',icon:'📎'},};const _origSelectHotspotType=selectHotspotType;
function toggleCardInfo(id,event){if(event){event.stopPropagation();}
const target=document.getElementById(id);if(!target)return;const isOpen=target.classList.contains('open');document.querySelectorAll('.card-info-dropdown.open').forEach(d=>{if(d.id!==id)d.classList.remove('open');});target.classList.toggle('open',!isOpen);}
document.addEventListener('click',function(e){if(!e.target.closest('.card-info-menu')){document.querySelectorAll('.card-info-dropdown.open').forEach(d=>d.classList.remove('open'));}});const BOOK_PDF_URLS={'Fizyka: Magnetyzm':'#pdf-fizyka-magnetyzm','Matematyka: Ułamki':'#pdf-matematyka-ulamki','Biologia: Genetyka':'#pdf-biologia-genetyka','Historia Starożytna':'#pdf-historia-starozytna','Informatyka: Python':'#pdf-informatyka-python','J. Polski: Lektury':'#pdf-jezyk-polski-lektury','Geografia: Klimat':'#pdf-geografia-klimat','Chemia: Pierwiastki':'#pdf-chemia-pierwiastki','Sztuka: Historia':'#pdf-sztuka-historia','Astronomia: Kosmos':'#pdf-astronomia-kosmos','Historia Nowożytna':'#pdf-historia-nowozytna',};function openBookInfo(title){
  if (typeof window.openInfoModalIB === 'function') {
    window.openInfoModalIB(title, 'book');
  }
  document.querySelectorAll('.card-info-dropdown.open').forEach(d=>d.classList.remove('open'));
}
function openPdfPreview(title){openBookInfo(title);}
let scormInterval=null;let scormPct=0;function resetScormProgress(){scormPct=0;clearInterval(scormInterval);const bar=document.getElementById('scorm-progress-bar');const pctEl=document.getElementById('scorm-pct');const timeEl=document.getElementById('scorm-time');if(bar)bar.style.width='0%';if(pctEl)pctEl.textContent='0%';if(timeEl)timeEl.textContent='0:00';}
selectHotspotType=function(typeId,source){closeHotspotPicker();const type=HOTSPOT_TYPES.find(t=>t.id===typeId);if(!type)return;if(type.accept){const labelKey=Object.keys(HOTSPOT_ACCEPT_LABELS).find(k=>type.accept.includes(k.split('/')[0]))||'*';const opts=HOTSPOT_ACCEPT_LABELS[labelKey]||HOTSPOT_ACCEPT_LABELS['*'];openCustomFilePicker({title:opts.title,subtitle:opts.subtitle+(type.multi?' (można wybrać wiele)':''),icon:opts.icon,accept:type.accept,onConfirm:(file)=>{commitHotspot(typeId,type,{label:file.name},source);}});}else{showInlineForm(typeId,type,source);}};
function openTocDrawer(){document.getElementById('toc-overlay').classList.add('open');document.getElementById('toc-drawer').classList.add('open');const currentChapterEl=document.getElementById('toc-ch-III');if(currentChapterEl){const header=currentChapterEl.querySelector('.toc-chapter-header');const list=currentChapterEl.querySelector('.toc-section-list');if(header)header.classList.add('open','active');if(list)list.classList.add('open');}
setTimeout(()=>{const input=document.getElementById('toc-search-input');if(input)input.blur();},50);}
function closeTocDrawer(){document.getElementById('toc-overlay').classList.remove('open');document.getElementById('toc-drawer').classList.remove('open');const input=document.getElementById('toc-search-input');if(input){input.value='';tocSearch('');}}
function toggleTocChapter(chId,e){e&&e.stopPropagation();const ch=document.getElementById(chId);const header=ch.querySelector('.toc-chapter-header');const list=ch.querySelector('.toc-section-list');const isOpen=list.classList.contains('open');document.querySelectorAll('.toc-section-list').forEach(l=>l.classList.remove('open'));document.querySelectorAll('.toc-chapter-header').forEach(h=>h.classList.remove('open','active'));if(!isOpen){list.classList.add('open');header.classList.add('open','active');setTimeout(()=>header.scrollIntoView({block:'nearest',behavior:'smooth'}),80);}}
const _origGoToChapter=goToChapter;goToChapter=function(n,page){closeTocDrawer();if(typeof _origGoToChapter==='function')_origGoToChapter(n,page);};function tocSearch(query){const q=query.trim().toLowerCase();const body=document.getElementById('toc-body');if(!body)return;body.querySelectorAll('.toc-highlight').forEach(el=>{el.outerHTML=el.textContent;});if(!q){body.querySelectorAll('.toc-chapter,.toc-item-l0').forEach(el=>el.style.display='');body.querySelectorAll('.toc-section,.toc-special').forEach(el=>el.style.display='');return;}
const highlight=(text)=>{const regex=new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`,'gi');return text.replace(regex,'<mark class="toc-highlight">$1</mark>');};body.querySelectorAll('.toc-chapter').forEach(ch=>{const titleEl=ch.querySelector('.toc-chapter-title');const chTitle=titleEl?titleEl.textContent.toLowerCase():'';let chHasMatch=chTitle.includes(q);ch.querySelectorAll('.toc-section,.toc-special').forEach(sec=>{const t=sec.querySelector('.toc-section-title,.toc-special-title');if(!t)return;const matches=t.textContent.toLowerCase().includes(q);sec.style.display=matches?'':'none';if(matches){chHasMatch=true;t.innerHTML=highlight(t.textContent);}});ch.style.display=chHasMatch?'':'none';if(chHasMatch){const list=ch.querySelector('.toc-section-list');const header=ch.querySelector('.toc-chapter-header');if(list)list.classList.add('open');if(header)header.classList.add('open','active');if(titleEl)titleEl.innerHTML=highlight(titleEl.textContent);}});body.querySelectorAll('.toc-item-l0').forEach(item=>{const t=item.querySelector('.toc-title');if(!t)return;const matches=t.textContent.toLowerCase().includes(q);item.style.display=matches?'':'none';if(matches)t.innerHTML=highlight(t.textContent);});}
document.addEventListener('keydown',function(e){if(e.key==='Escape'){const drawer=document.getElementById('toc-drawer');if(drawer&&drawer.classList.contains('open'))closeTocDrawer();}});
