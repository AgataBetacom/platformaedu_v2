
// ─── STATE & GLOBALS ───────────────────────────────────────────────
const sel={};
let darkOn=false;

// ─── ROUTER / VIEWS ────────────────────────────────────────────────
const views=document.querySelectorAll('.view');
function goView(name,el){
  views.forEach(v=>v.classList.add('hidden'));
  const v=document.getElementById('view-'+name);
  if(v) v.classList.remove('hidden');
  document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));
  const map={dashboard:'dashboard',kurs:'kurs',sklep:'sklep','kurs-math':'kurs','kurs-math-bloki':'kurs','kurs-math-tematy':'kurs',teoria:'kurs',fiszki:'kurs',filmy:'kurs','filmy-after':'kurs','filmy-pauza':'kurs','film-player':'kurs',zadania:'kurs','zadania-tematy':'kurs','zadania-task':'kurs','zadania-task-pol':'kurs',arkusze:'arkusze','arkusze-filmy':'arkusze','arkusze-zadania':'arkusze','arkusz-film-player':'arkusze','arkusze-math':'arkusze',profile:'profile',parent:'profile',settings:'settings'};
  const key=map[name]||name;
  if(el) el.classList.add('active');
  else{const a=document.querySelector('.nav-item[data-v="'+key+'"]');if(a)a.classList.add('active');}
  if(name==='profile') buildHeatmap();
  window.scrollTo({top:0,behavior:'smooth'});
}

// ─── AUTH ──────────────────────────────────────────────────────────
function doLogin(){
  const e=document.getElementById('loginEmail').value.trim();
  const p=document.getElementById('loginPass').value.trim();
  document.getElementById('emailErr').innerText='';
  document.getElementById('passErr').innerText='';
  let ok=true;
  if(!e||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){document.getElementById('emailErr').innerText='Podaj poprawny e-mail';ok=false;}
  if(!p||p.length<6){document.getElementById('passErr').innerText='Min. 6 znaków';ok=false;}
  if(ok){document.getElementById('screen-login').classList.remove('active');document.getElementById('screen-app').classList.add('active');goView('dashboard');toast('Zalogowano! Witaj, Kuba 👋');document.getElementById('ssoBanner').style.display='flex';}
}
function doReset(){const e=document.getElementById('resetEmail').value.trim();if(!e){toast('Podaj e-mail');return;}toast('Link wysłany na '+e);closeModal('modalReset');}
function doLogout(){document.getElementById('screen-app').classList.remove('active');document.getElementById('screen-login').classList.add('active');toast('Wylogowano');}

// ─── DARK MODE ─────────────────────────────────────────────────────
function toggleDark(){
  darkOn = !darkOn;
  document.body.classList.toggle('dark', darkOn);
  document.documentElement.classList.toggle('dark', darkOn);
}
// Listen for shell-initiated dark sync + navigation hooks
window.addEventListener('message', function(e){
  if (!e.data || typeof e.data !== 'object') return;
  if (e.data.type === 'setDark') {
    darkOn = !!e.data.isDark;
    document.body.classList.toggle('dark', darkOn);
    document.documentElement.classList.toggle('dark', darkOn);
  }
  if (e.data.type === 'setParentMode') {
    window.PARENT_MODE = !!e.data.enabled;
    window.PARENT_OWNED = e.data.owned || [];
    window.PARENT_INFORMATIONAL = e.data.informational !== false;
    window.PARENT_CAN_PURCHASE = e.data.canPurchase !== false;
    if (typeof window.applyParentMode === 'function') window.applyParentMode();
  }
});
try { window.parent.postMessage({type:'ready', module:'ex'}, '*'); } catch(err) {}

// ─── MODALS ─────────────────────────────────────────────────────────
function openModal(id){document.getElementById(id).classList.add('show');}
function closeModal(id){document.getElementById(id).classList.remove('show');}

// ─── TOAST ──────────────────────────────────────────────────────────
let toastT;
function toast(msg){
  const el=document.getElementById('toast');
  el.innerText=msg;el.classList.add('show');
  clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),2000);
}

// VIEW TOGGLE (kafelki/lista) – tematy
function setView(mode){
  document.getElementById('tematKafelGrid').classList.toggle('hidden',mode!=='kafel');
  document.getElementById('tematListGrid').classList.toggle('hidden',mode!=='list');
  document.getElementById('vToggleKafel').classList.toggle('on',mode==='kafel');
  document.getElementById('vToggleList').classList.toggle('on',mode==='list');
}
// VIEW TOGGLE – granulki
function setGranView(mode){
  document.getElementById('granKafelGrid').classList.toggle('hidden',mode!=='kafel');
  document.getElementById('granListGrid').classList.toggle('hidden',mode!=='list');
  document.getElementById('gToggleKafel').classList.toggle('on',mode==='kafel');
  document.getElementById('gToggleList').classList.toggle('on',mode==='list');
}

// GRANULKI
let granDone=new Set([1]);
let granCurrent=2; // domyślnie wyświetlana granulka w widoku teorii
function openGranulka(n){
  granCurrent=n;
  // Update kafle — nowy system klas gran-card
  document.querySelectorAll('#granKafelGrid .gran-card').forEach((t,i)=>{
    t.classList.remove('is-done','is-active','is-locked');
    const statusBadge = t.querySelector('.temat-card-status');
    if(granDone.has(i+1) && (i+1) !== n){
      t.classList.add('is-done');
      if(statusBadge){
        statusBadge.className = 'temat-card-status temat-card-status--done';
        statusBadge.innerHTML = '<span class="dzial-pulse"></span>Przejrzana';
      }
    } else if(i+1 === n){
      t.classList.add('is-active');
      if(statusBadge){
        statusBadge.className = 'temat-card-status temat-card-status--active';
        statusBadge.innerHTML = '<span class="dzial-pulse"></span>Aktualna';
      }
    } else {
      // future/locked — pokazuj zablokowaną tylko jeśli wcześniejsza nie ukończona
      const prevDone = granDone.has(i);
      if(!prevDone){
        t.classList.add('is-locked');
        if(statusBadge){
          statusBadge.className = 'temat-card-status temat-card-status--idle';
          statusBadge.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" stroke-width="2"/></svg>Zablokowana';
        }
      } else {
        if(statusBadge){
          statusBadge.className = 'temat-card-status temat-card-status--idle';
          statusBadge.innerHTML = 'Do przejrzenia';
        }
      }
    }
  });

  // Treść
  const content = document.getElementById('granContent');
  const titles = ['Co to są nawiasy w równaniu?','Rozwijanie nawiasów: a(x + b)','Pełny algorytm rozwiązywania'];
  const ledes = [
    'Nawiasy grupują wyrażenia. W równaniu mogą pojawiać się po obu stronach i muszą być rozwinięte przed dalszymi operacjami.',
    'Kiedy przed nawiasem stoi liczba lub wyrażenie, mnożymy każdy składnik nawiasu osobno.',
    'Algorytm rozwiązywania równania z nawiasami — krok po kroku.'
  ];
  const bodies = [
    `<div class="gran-box gran-box--example">
      <div class="gran-box-label">Przykład</div>
      <div class="gran-formula">2(x + 3) = 14 — tu nawiasy trzeba <strong>rozwinąć</strong> przed dalszymi krokami.</div>
    </div>`,
    `<div class="gran-box gran-box--example">
      <div class="gran-box-label">Przykład</div>
      <div class="gran-formula">3(x + 4) = 3·x + 3·4 = <strong>3x + 12</strong></div>
    </div>
    <div class="gran-box gran-box--warn">
      <div class="gran-box-head">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3 2 20h20L12 3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 10v4M12 17v.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        <span>Uwaga na minus</span>
      </div>
      <div class="gran-formula">−2(x − 5) = −2·x + (−2)·(−5) = <strong>−2x + 10</strong></div>
    </div>`,
    `<ol class="gran-steps">
      <li><span class="gran-step-n">1</span><span>Rozwiń nawiasy po obu stronach równania</span></li>
      <li><span class="gran-step-n">2</span><span>Przenieś x-y na lewą stronę, liczby na prawą</span></li>
      <li><span class="gran-step-n">3</span><span>Podziel obie strony przez współczynnik przy <code>x</code></span></li>
      <li><span class="gran-step-n">4</span><span>Sprawdź wynik podstawiając do oryginalnego równania</span></li>
    </ol>`
  ];

  granDone.add(n);
  const allDone = granDone.has(1) && granDone.has(2) && granDone.has(3);
  const isLast = n === 3;

  const nextBtn = isLast
    ? `<button class="btn btn-primary" onclick="goView('filmy')">Przejdź do filmów →</button>`
    : `<button class="btn btn-primary" onclick="openGranulka(${n+1})">Następna granulka →</button>`;

  const doneBoxHtml = isLast ? `
    <div class="gran-done-box">
      <div class="gran-done-ico">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="m5 12 4 4 10-10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="gran-done-body">
        <h3 class="gran-done-title">Wszystkie granulki przejrzane</h3>
        <p class="gran-done-sub">Możesz teraz opcjonalnie utrwalić wiedzę na fiszkach lub przejść od razu do filmów z lektorem.</p>
      </div>
      <div class="gran-done-actions">
        <button class="btn btn-ghost btn-sm" onclick="goView('fiszki')">Fiszki (opcjonalne)</button>
        <button class="btn btn-primary" onclick="goView('filmy')">Przejdź do filmów →</button>
      </div>
    </div>` : '';

  content.innerHTML = `
    <div class="gran-head-row">
      <span class="gran-pill gran-pill--active"><span class="dzial-pulse"></span>Granulka ${n} / 3</span>
    </div>
    <h2 class="gran-h2">${titles[n-1]}</h2>
    <p class="gran-lede">${ledes[n-1]}</p>
    ${bodies[n-1]}
    ${doneBoxHtml}
    <div class="gran-nav">
      <button class="btn btn-ghost" onclick="openGranulka(${Math.max(1,n-1)})"${n===1?' disabled style="opacity:.4"':''}>← Poprzednia</button>
      <span class="gran-nav-count">${n} / 3</span>
      ${nextBtn}
    </div>`;
}
function showGranDone(){ /* deprecated — box jest teraz częścią template w openGranulka */ }

// ZADANIA — tabs
function switchZTab(t){
  document.getElementById('zMath').classList.toggle('hidden',t!=='math');
  document.getElementById('zPol').classList.toggle('hidden',t!=='pol');
  document.getElementById('zTabMath').className='btn btn-sm '+(t==='math'?'btn-primary':'btn-ghost');
  document.getElementById('zTabPol').className='btn btn-sm '+(t==='pol'?'btn-primary':'btn-ghost');
}
function switchATab(t){
  document.getElementById('aMath').classList.toggle('hidden',t!=='math');
  document.getElementById('aPol').classList.toggle('hidden',t!=='pol');
  document.getElementById('aTabMath').className='btn btn-sm '+(t==='math'?'btn-primary':'btn-ghost');
  document.getElementById('aTabPol').className='btn btn-sm '+(t==='pol'?'btn-primary':'btn-ghost');
}

// BREADCRUMB helpers
function goView2(name,labelId,labelVal,titleId,titleVal){
  if(labelId)document.getElementById(labelId).innerText=labelVal||'';
  if(titleId)document.getElementById(titleId).innerText=titleVal||'';
  goView(name);
}

// ─── MCQ (jednokrotny) — legacy ────────────────────────────────────
function pickAns(el,gid){
  document.querySelectorAll('#'+gid+' .ans, #'+gid+' .cke-ans').forEach(a=>a.classList.remove('sel'));
  el.classList.add('sel');
  sel[gid]=el.getAttribute('data-v');
}
function checkAns(gid,correct,fbId,wrongId){
  const chosen=sel[gid];
  const fb=document.getElementById(fbId);
  const wrong=wrongId?document.getElementById(wrongId):null;
  if(!chosen){if(fb){fb.innerText='Wybierz odpowiedź A, B, C lub D.';fb.className='fb show err';}return;}
  document.querySelectorAll('#'+gid+' .ans, #'+gid+' .cke-ans').forEach(a=>{
    const v=a.getAttribute('data-v');
    a.classList.remove('ok','err');
    if(v===correct)a.classList.add('ok');
    else if(v===chosen&&chosen!==correct)a.classList.add('err');
  });
  if(chosen===correct){
    if(wrong)wrong.classList.remove('show');
    if(fb){fb.innerHTML='<strong style="color:var(--green)">✓ Dobrze!</strong> Prawidłowa odpowiedź.';fb.className='fb show ok';}
    const scoreOk=document.getElementById('scoreOk');
    if(scoreOk)scoreOk.innerText=parseInt(scoreOk.innerText||0)+1;
  } else {
    if(fb)fb.className='fb';
    if(wrong)wrong.classList.add('show');
    const scoreErr=document.getElementById('scoreErr');
    if(scoreErr)scoreErr.innerText=parseInt(scoreErr.innerText||0)+1;
  }
}
function resetAnsEl(gid,fbId,wrongId){
  sel[gid]=null;
  document.querySelectorAll('#'+gid+' .ans, #'+gid+' .cke-ans').forEach(a=>a.classList.remove('sel','ok','err'));
  const fb=document.getElementById(fbId);if(fb){fb.className='fb';}
  const w=document.getElementById(wrongId);if(w)w.classList.remove('show');
}
function resetQ(){} // legacy — nowe zadania obsługują mathCheck/pfCheck etc.
function nextTask(){toast('Następne zadanie — wkrótce');}

// ─── TOGGLE PANELS ──────────────────────────────────────────────────
function toggleEl(id){const el=document.getElementById(id);if(el)el.classList.toggle('show');}

// ═══════════════════════════════════════════════
// SILNIK ZESTAWÓW ZADAŃ
// ══════════════════════════════════════════════

// Liczniki per-zestaw
const mathState = {ok:0, err:0, answered:new Set()};
const polState  = {ok:0, err:0, answered:new Set()};

function _getState(qId){ return qId.startsWith('m') ? mathState : polState; }
function _getProgressId(qId){ return qId.startsWith('m') ? 'mathProgressFill' : 'polProgressFill'; }
function _getScoreOkId(qId){ return qId.startsWith('m') ? 'mathScoreOk' : 'polScoreOk'; }
function _getScoreErrId(qId){ return qId.startsWith('m') ? 'mathScoreErr' : 'polScoreErr'; }
function _getTotalTasks(qId){ return qId.startsWith('m') ? 5 : 5; }
function _getSummaryId(qId){ return qId.startsWith('m') ? 'mathSetSummary' : 'polSetSummary'; }
function _getScoreContId(qId){ return qId.startsWith('m') ? 'mathSetScore' : 'polSetScore'; }

function updateSetProgress(qId, isOk) {
  const st = _getState(qId);
  if (!st.answered.has(qId)) {
    st.answered.add(qId);
    if (isOk) st.ok++; else st.err++;
  }
  const total = _getTotalTasks(qId);
  const pct = Math.round((st.answered.size / total) * 100);
  const pfEl = document.getElementById(_getProgressId(qId));
  if (pfEl) pfEl.style.width = pct + '%';
  const okEl = document.getElementById(_getScoreOkId(qId));
  const errEl = document.getElementById(_getScoreErrId(qId));
  if (okEl) {
    const num = okEl.querySelector('.score-hero-num');
    if (num) num.textContent = st.ok;
    else okEl.textContent = '✓ ' + st.ok + ' poprawnych';
  }
  if (errEl) {
    const num = errEl.querySelector('.score-hero-num');
    if (num) num.textContent = st.err;
    else errEl.textContent = '✗ ' + st.err + ' błędnych';
  }
  if (st.answered.size === total) {
    setTimeout(() => showSetSummary(qId), 600);
  }
}

function showSetSummary(qId) {
  const el = document.getElementById(_getSummaryId(qId));
  if (!el || el.style.display !== 'none') return;
  const st = _getState(qId);
  el.style.display = 'block';
  const cont = document.getElementById(_getScoreContId(qId));
  if (cont) {
    cont.innerHTML = `
      <div style="background:var(--green-soft);border:1.5px solid rgba(15,159,110,.25);border-radius:12px;padding:14px 22px;text-align:center">
        <div style="font-size:28px;font-weight:900;color:var(--green)">${st.ok}</div>
        <div style="font-size:12px;color:var(--green);font-weight:700">Poprawne</div>
      </div>
      <div style="background:var(--red-soft);border:1.5px solid rgba(220,38,38,.2);border-radius:12px;padding:14px 22px;text-align:center">
        <div style="font-size:28px;font-weight:900;color:var(--red)">${st.err}</div>
        <div style="font-size:12px;color:var(--red);font-weight:700">Błędne</div>
      </div>
    `;
  }
  el.scrollIntoView({behavior:'smooth', block:'center'});
}

// ── MCQ (jednokrotny) dla zestawów ──────────────────────────────
function mathCheck(gid, correct, fbId, wrongId, qId) {
  const chosen = sel[gid];
  const fb = document.getElementById(fbId);
  const wrong = wrongId ? document.getElementById(wrongId) : null;
  if (!chosen) { if(fb){fb.textContent='Wybierz odpowiedź A, B, C lub D.';fb.className='fb show err';} return; }
  document.querySelectorAll('#'+gid+' .ans, #'+gid+' .cke-ans').forEach(a => {
    const v = a.getAttribute('data-v');
    a.classList.remove('ok','err');
    if (v === correct) a.classList.add('ok');
    else if (v === chosen && chosen !== correct) a.classList.add('err');
  });
  const isOk = chosen === correct;
  if (isOk) {
    if (wrong) wrong.classList.remove('show');
    if (fb) { fb.innerHTML='<strong style="color:var(--green)">✓ Dobrze!</strong> Prawidłowa odpowiedź.'; fb.className='fb show ok'; }
  } else {
    if (fb) fb.className='fb';
    if (wrong) wrong.classList.add('show');
  }
  updateSetProgress(qId, isOk);
}

// ── Prawda / Fałsz ───────────────────────────────────────────────
const pfSelected = {};

function pfPick(key, val) {
  pfSelected[key] = val;
  const P = document.getElementById(key + '_P');
  const F = document.getElementById(key + '_F');
  if (P && F) {
    P.className = 'pf-btn' + (val === 'P' ? ' sel-p' : '');
    F.className = 'pf-btn' + (val === 'F' ? ' sel-f' : '');
  }
}

function pfCheck(keys, corrects, fbId, qId) {
  let allPicked = keys.every(k => pfSelected[k]);
  if (!allPicked) { const fb=document.getElementById(fbId); if(fb){fb.textContent='Oceń każde stwierdzenie.';fb.className='fb show err';} return; }
  let allOk = true;
  keys.forEach((key, i) => {
    const chosen = pfSelected[key];
    const correct = corrects[i];
    const isOk = chosen === correct;
    if (!isOk) allOk = false;
    const chosenBtn = document.getElementById(key + '_' + chosen);
    const correctBtn = document.getElementById(key + '_' + correct);
    // mark wrong choice
    if (!isOk && chosenBtn) { chosenBtn.className = 'pf-btn err'; }
    // always mark correct
    if (correctBtn) correctBtn.className = 'pf-btn ok';
  });
  const fb = document.getElementById(fbId);
  if (allOk) {
    if (fb) { fb.innerHTML='<strong style="color:var(--green)">✓ Wszystko poprawnie!</strong> Pełny punkt.'; fb.className='fb show ok'; }
  } else {
    if (fb) { fb.innerHTML='<strong style="color:var(--red)">✗ Błąd.</strong> Sprawdź zaznaczone poprawki.'; fb.className='fb show err'; }
  }
  updateSetProgress(qId, allOk);
}

// ── Wypełnij luki (fill-input) ────────────────────────────────────
function fillCheck(ids, corrects, fbId, qId) {
  let allOk = true;
  ids.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    const val = el.value.trim().toLowerCase().replace(/\s/g,'');
    const cor = corrects[i].toLowerCase().replace(/\s/g,'');
    if (val === cor) {
      el.className = 'fill-input ok';
    } else if (val === '') {
      allOk = false;
    } else {
      el.className = 'fill-input err';
      allOk = false;
    }
  });
  const fb = document.getElementById(fbId);
  if (allOk) {
    if (fb) { fb.innerHTML='<strong style="color:var(--green)">✓ Poprawnie!</strong>'; fb.className='fb show ok'; }
  } else {
    if (fb) { fb.innerHTML='<strong style="color:var(--red)">✗ Sprawdź błędne pola.</strong>'; fb.className='fb show err'; }
  }
  updateSetProgress(qId, allOk);
}

// ── Chronologiczne / dopasowanie (order-box) ────────────────────
const orderSelected = {};
let orderPicking = null;

function orderPick(boxId, group) {
  // Uproszczone: klikanie kolejno wpisuje B C D A...
  // Dla prototypu: otwiera modal inline z wyborem liter
  const box = document.getElementById(boxId);
  if (!box) return;
  if (orderPicking === boxId) { orderPicking = null; box.classList.remove('filled'); return; }
  // cycle through options A→E
  const opts = ['A','B','C','D','E'];
  const current = box.textContent;
  const idx = opts.indexOf(current);
  const next = opts[(idx + 1) % opts.length];
  box.textContent = next;
  box.classList.add('filled');
  orderSelected[boxId] = next;
}

function orderCheck(ids, corrects, fbId, qId) {
  let allOk = true;
  ids.forEach((id, i) => {
    const box = document.getElementById(id);
    if (!box) return;
    const val = (orderSelected[id] || '?').toUpperCase();
    const cor = corrects[i].toUpperCase();
    if (val === cor) { box.className = 'order-box ok'; }
    else { box.className = 'order-box err'; allOk = false; }
  });
  const fb = document.getElementById(fbId);
  if (allOk) {
    if (fb) { fb.innerHTML='<strong style="color:var(--green)">✓ Poprawna kolejność!</strong>'; fb.className='fb show ok'; }
  } else {
    if (fb) { fb.innerHTML='<strong style="color:var(--red)">✗ Sprawdź ponownie.</strong>'; fb.className='fb show err'; }
  }
  updateSetProgress(qId, allOk);
}

// ── AB/CD double-choice inline ────────────────────────────────────
const abcdSelected = {};

function abcdPick(group, val) {
  abcdSelected[group] = val;
  // Find all buttons in this group and update
  document.querySelectorAll('[id^="' + group + '_"]').forEach(btn => {
    btn.classList.remove('sel','ok','err');
    const btnVal = btn.id.replace(group + '_', '');
    if (btnVal === val) btn.classList.add('sel');
  });
}

function abcdCheck(correctMap, fbId, qId) {
  let allOk = true;
  Object.entries(correctMap).forEach(([group, correct]) => {
    const chosen = abcdSelected[group];
    if (!chosen) { allOk = false; return; }
    document.querySelectorAll('[id^="' + group + '_"]').forEach(btn => {
      btn.classList.remove('sel','ok','err');
      const btnVal = btn.id.replace(group + '_', '');
      if (btnVal === correct) btn.classList.add('ok');
      else if (btnVal === chosen && chosen !== correct) btn.classList.add('err');
    });
    if (chosen !== correct) allOk = false;
  });
  const fb = document.getElementById(fbId);
  const allPicked = Object.keys(correctMap).every(g => abcdSelected[g]);
  if (!allPicked) { if(fb){fb.textContent='Uzupełnij wszystkie pola.';fb.className='fb show err';} return; }
  if (allOk) {
    if (fb) { fb.innerHTML='<strong style="color:var(--green)">✓ Poprawnie!</strong>'; fb.className='fb show ok'; }
  } else {
    if (fb) { fb.innerHTML='<strong style="color:var(--red)">✗ Sprawdź zaznaczenia.</strong>'; fb.className='fb show err'; }
  }
  updateSetProgress(qId, allOk);
}

// ── Wielokrotny wybór ─────────────────────────────────────────────
const multiSel = {};

function multiPick(el, gid) {
  if (!multiSel[gid]) multiSel[gid] = new Set();
  const v = el.getAttribute('data-v');
  if (multiSel[gid].has(v)) { multiSel[gid].delete(v); el.classList.remove('sel'); }
  else { multiSel[gid].add(v); el.classList.add('sel'); }
}

function multiCheck(gid, corrects, fbId, qId) {
  if (!multiSel[gid] || multiSel[gid].size === 0) {
    const fb = document.getElementById(fbId); if(fb){fb.textContent='Zaznacz przynajmniej jedną odpowiedź.';fb.className='fb show err';} return;
  }
  const chosen = [...multiSel[gid]];
  const correctSet = new Set(corrects);
  const chosenSet = new Set(chosen);
  const isOk = corrects.length === chosen.length && corrects.every(c => chosenSet.has(c));
  document.querySelectorAll('#'+gid+' .ans').forEach(a => {
    const v = a.getAttribute('data-v');
    a.classList.remove('sel','ok','err');
    if (correctSet.has(v)) a.classList.add('ok');
    else if (chosenSet.has(v)) a.classList.add('err');
  });
  const fb = document.getElementById(fbId);
  if (isOk) {
    if (fb) { fb.innerHTML='<strong style="color:var(--green)">✓ Wszystkie poprawne!</strong>'; fb.className='fb show ok'; }
  } else {
    if (fb) { fb.innerHTML='<strong style="color:var(--red)">✗ Sprawdź zaznaczenia.</strong>'; fb.className='fb show err'; }
  }
  updateSetProgress(qId, isOk);
}

// ── Otwarte — pokaż model + samoocena ──────────────────────────
function showModelAnswer(modelId, fbId, qId, maxPts) {
  const area = document.getElementById(qId)?.querySelector('.open-answer-area');
  if (area && !area.value.trim()) { toast('Najpierw wpisz swoją odpowiedź'); return; }
  const model = document.getElementById(modelId);
  const fb = document.getElementById(fbId);
  if (model) model.classList.add('show');
  if (fb) { fb.classList.remove('hidden'); }
}

function selfScore(btn, qId, pts) {
  const row = btn.closest('.self-score-row');
  row.querySelectorAll('.self-score-btn').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  const maxPts = row.querySelectorAll('.self-score-btn').length - 1;
  const isOk = pts > 0;
  updateSetProgress(qId, isOk);
}

// ── Nawigacja do zestawu polskiego ────────────────────────────────
function goViewPolish(temat) {
  document.getElementById('zKatLabel').textContent = temat;
  document.getElementById('zKatTitle').textContent = temat;
  // Pokaż odpowiedni zestaw — dla prototypu zawsze rozumienie tekstu
  goView('zadania-task-pol');
}

// ══════════════════════════════════════
// FISZKI — silnik IB-style
// ══════════════════════════════════════
const flashcards2 = [
  { q: 'Co to jest rozwijanie nawiasów?', a: 'Mnożenie każdego składnika nawiasu przez liczbę przed nim.\na(x+b) = ax + ab' },
  { q: 'Co zmienia znak przy przeniesieniu wyrazu?', a: 'Przeniesienie wyrazu na drugą stronę równania zmienia jego znak.\nx+5=12 → x=12−5' },
  { q: 'Jak sprawdzić wynik równania?', a: 'Podstaw wynik do oryginalnego równania.\nObie strony muszą być równe.' },
  { q: 'Co oznacza minus przed nawiasem?', a: '−(x+3) = −x − 3\nMinus mnoży każdy składnik nawiasu.' }
];

let fc2Pool     = [];
let fc2BadSet   = new Set();
let fc2Answered = new Set();
let fc2Index    = 0;
let fc2Round    = 1;

function fc2Flip() {
  document.getElementById('fc2Card').classList.toggle('flipped');
}

function fc2Render() {
  document.getElementById('fc2Card').classList.remove('flipped');
  const realIdx = fc2Pool[fc2Index];
  const fc = flashcards2[realIdx];
  if (!fc) return;
  document.getElementById('fc2Question').textContent = fc.q;
  document.getElementById('fc2Answer').textContent   = fc.a;
  const counterStr = (fc2Index + 1) + ' / ' + fc2Pool.length;
  document.getElementById('fc2Counter').textContent = counterStr;
  const cb = document.getElementById('fc2CounterBottom');
  if (cb) cb.textContent = counterStr;
  // Dots
  const dotsEl = document.getElementById('fc2Dots');
  if (dotsEl) {
    dotsEl.innerHTML = fc2Pool.map((pidx, i) => {
      const isBad  = fc2BadSet.has(pidx);
      const isDone = fc2Answered.has(pidx) && !isBad;
      const isCurr = i === fc2Index;
      let bg = isCurr
        ? 'var(--ep-primary, #4f46e5)'
        : isBad
          ? 'var(--ep-danger, #ef4444)'
          : isDone
            ? 'var(--ep-success, #10b981)'
            : 'var(--ep-border, #e2e8f0)';
      const isMuted = !isCurr && !isBad && !isDone;
      const size = isCurr ? 9 : 7;
      const extra = isCurr ? 'box-shadow:0 0 0 3px color-mix(in oklab, var(--ep-primary, #4f46e5) 18%, transparent);' : '';
      const op = isMuted ? 'opacity:.9;' : '';
      return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};${extra}${op}flex-shrink:0;transition:all .18s"></div>`;
    }).join('');
  }
  fc2UpdateBadge();
}

function fc2ShowMain() {
  document.getElementById('fc2-main').classList.remove('hidden');
  document.getElementById('fc2-all-done').classList.add('hidden');
  document.getElementById('fc2-retry-screen').classList.add('hidden');
  const badge = document.getElementById('fcRoundBadge');
  if (badge) {
    badge.style.display = 'inline-flex';
    badge.textContent = fc2Round === 1 ? 'Runda 1' : `Runda ${fc2Round} — powtórka`;
    badge.className = fc2Round === 1 ? 'chip chip-blue' : 'chip chip-red';
  }
}

function fc2UpdateBadge() {
  const badge = document.getElementById('fcBadBadge');
  if (!badge) return;
  if (fc2BadSet.size > 0) {
    badge.style.display = 'inline-flex';
    badge.textContent = `✗ ${fc2BadSet.size} do powtórki`;
  } else {
    badge.style.display = 'none';
  }
}

function fcReset2() {
  fc2Round    = 1;
  fc2Index    = 0;
  fc2Pool     = flashcards2.map((_, i) => i);
  fc2BadSet   = new Set();
  fc2Answered = new Set();
  fc2ShowMain();
  fc2Render();
}

function fcStartRetry() {
  fc2Pool     = [...fc2BadSet];
  fc2BadSet   = new Set();
  fc2Answered = new Set();
  fc2Index    = 0;
  fc2Round++;
  fc2ShowMain();
  fc2Render();
}

function fc2Nav(dir) {
  const newIdx = fc2Index + dir;
  if (newIdx < 0 || newIdx >= fc2Pool.length) return;
  fc2Index = newIdx;
  fc2Render();
}

function markFC(result) {
  const realIdx = fc2Pool[fc2Index];
  if (result === 'bad') {
    fc2BadSet.add(realIdx);
    fc2Answered.delete(realIdx);
  } else {
    fc2BadSet.delete(realIdx);
    fc2Answered.add(realIdx);
  }
  fc2UpdateBadge();
  // Animacja slide
  const card = document.getElementById('fc2Card');
  if (card) {
    card.style.transition = 'opacity .18s ease, transform .18s ease';
    card.style.opacity = '0';
    card.style.transform = result === 'bad' ? 'translateX(-14px)' : 'translateX(14px)';
    setTimeout(() => {
      card.style.transition = '';
      card.style.opacity = '1';
      card.style.transform = '';
      if (fc2Index + 1 >= fc2Pool.length) {
        fc2EndOfRound();
      } else {
        fc2Index++;
        fc2Render();
      }
    }, 180);
  }
}

function fc2EndOfRound() {
  if (fc2BadSet.size === 0) {
    document.getElementById('fc2-main').classList.add('hidden');
    document.getElementById('fc2-all-done').classList.remove('hidden');
    document.getElementById('fc2-retry-screen').classList.add('hidden');
  } else {
    document.getElementById('fc2-main').classList.add('hidden');
    document.getElementById('fc2-all-done').classList.add('hidden');
    document.getElementById('fc2-retry-screen').classList.remove('hidden');
    const n = fc2BadSet.size;
    const form = n === 1 ? 'kartę' : n < 5 ? 'karty' : 'kart';
    document.getElementById('fc2RetryMsg').textContent = `Masz ${n} ${form} do powtórzenia. Przejdźmy przez nie jeszcze raz!`;
  }
}

// ══════════════════════════════════════
// JĘZYK POLSKI — wkrótce
// ══════════════════════════════════════
function showPolishComingSoon() {
  openModal('modalPolishSoon');
}
function showEnglishComingSoon() {
  openModal('modalEnglishSoon');
}

// ─── HEATMAP ────────────────────────────────────────────────────────
function buildHeatmap(){
  const g=document.getElementById('heatmapGrid');if(!g)return;
  const levels=['','low','low','','mid','high','high','low','','','mid','high','mid','','low','','high','high','mid','low','','','low','mid','high','high','','mid'];
  g.innerHTML=levels.map(l=>`<div class="hm-day ${l}"></div>`).join('');
}

// BLOK TEMATY navigation helpers
function openBlok(blok,icon){
  document.getElementById('blokLabel').innerText=blok;
  document.getElementById('blokTitle').innerText=icon+' '+blok;
  goView('kurs-math-tematy');
}
function goBloki(){goView('kurs-math-bloki');}
function openZKat(kat){
  document.getElementById('zKatLabel').innerText=kat;
  document.getElementById('zKatTitle').innerText=kat;
  goView('zadania-tematy');
}

// ─── INIT ────────────────────────────────────────────────────────────
window.addEventListener('load',()=>{
  fcReset2();
  // patch blok tile clicks
  document.querySelectorAll('#mathBlokGrid .tile').forEach((t,i)=>{
    const titles=['Liczby i działania','Równania i nierówności','Geometria','Funkcje i wykresy'];
    const icons=['🔢','⚖️','📐','📈'];
    t.onclick=()=>openBlok(titles[i],icons[i]);
  });
  // SHOP: filter pills
  document.querySelectorAll('.shop-filter').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.shop-filter').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.shopFilter;
      document.querySelectorAll('.shop-card').forEach(card=>{
        const s = card.dataset.shopStatus;
        const show = f==='all' || s===f;
        card.style.display = show ? '' : 'none';
      });
    });
  });
});

// ─── HAMBURGER NAV ─────────────────────────────────────────────────
function toggleHam(id){
  const d=document.getElementById(id);
  document.querySelectorAll('.ham-drawer').forEach(el=>{
    if(el.id!==id) el.classList.remove('open');
  });
  d.classList.toggle('open');
}
function closeHam(id){const d=document.getElementById(id);if(d)d.classList.remove('open');}
document.addEventListener('click',e=>{
  if(!e.target.closest('.ham-drawer')&&!e.target.closest('.ham-toggle'))
    document.querySelectorAll('.ham-drawer').forEach(d=>d.classList.remove('open'));
});

// ══════════════════════════════════════
// PURCHASE FLOW
// ══════════════════════════════════════

let cartItems = [];

function toggleCartItem(id, name, price, btn) {
  const idx = cartItems.findIndex(i => i.id === id);
  if (idx >= 0) {
    cartItems.splice(idx, 1);
    btn.innerHTML = '+ Dodaj do koszyka';
    btn.classList.remove('in-cart');
    // Notify global cart in parent shell
    try { window.parent.gCartRemove(id); } catch(e) {}
  } else {
    cartItems.push({ id, name, price });
    btn.innerHTML = '✓ W koszyku — kliknij, aby usunąć';
    btn.classList.add('in-cart');
    // Notify global cart in parent shell
    try { window.parent.gCartAdd(id, name, price, '📚', 'ex'); } catch(e) {}
    toast('Dodano "' + name + '" do zakupu 🛍️');
  }
  renderCart();
}

function renderCart() {
  const panel = document.getElementById('cartPanel');
  const countEl = document.getElementById('cartCount');
  const itemsEl = document.getElementById('cartItems');
  countEl.textContent = cartItems.length;
  // Sync to shared localStorage
  try { localStorage.setItem('sharedCart_ex', JSON.stringify(cartItems)); } catch(e){}
  if (cartItems.length === 0) {
    panel.classList.remove('visible');
    itemsEl.innerHTML = '';
    return;
  }
  panel.classList.add('visible');
  itemsEl.innerHTML = cartItems.map(item => {
    const iconMap = {
      polish: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
      eng: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" stroke="currentColor" stroke-width="1.5"/></svg>`,
      default: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M7 9h10M7 13h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
    };
    const icon = iconMap[item.id] || iconMap.default;
    return `
    <div class="cart-item" style="display:flex;align-items:center;gap:10px;padding:10px 4px;border-bottom:1px solid var(--border)">
      <div style="width:30px;height:30px;border-radius:8px;background:var(--soft);color:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0">${icon}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:13px;color:var(--text);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.name}</div>
        <div style="font-size:12px;color:var(--muted);font-weight:700;margin-top:2px">${item.price} zł</div>
      </div>
      <button onclick="removeCartItem('${item.id}')" title="Usuń" style="width:24px;height:24px;border-radius:50%;background:transparent;border:1px solid var(--border);color:var(--muted);font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:.12s" onmouseover="this.style.background='var(--red-soft)';this.style.color='var(--red)';this.style.borderColor='var(--red)'" onmouseout="this.style.background='transparent';this.style.color='var(--muted)';this.style.borderColor='var(--border)'">✕</button>
    </div>
  `;}).join('');
}

function removeCartItem(id) {
  const item = cartItems.find(i => i.id === id);
  cartItems = cartItems.filter(i => i.id !== id);
  const btnMap = { polish: 'btnBuyPolish', eng: 'btnBuyEng' };
  const btn = document.getElementById(btnMap[id]);
  if (btn) { btn.innerHTML = '+ Dodaj do koszyka'; btn.classList.remove('in-cart'); }
  renderCart();
  if (item) toast('"' + item.name + '" usunięto z koszyka');
}

function closeCart() {
  document.getElementById('cartPanel').classList.remove('visible');
}

function openPurchaseModal() {
  // Hide cart panel
  var cp = document.getElementById('cartPanel');
  if (cp) cp.classList.remove('visible');
  // Merge with IB cart from localStorage
  let allItems = [...cartItems];
  try {
    const ibItems = JSON.parse(localStorage.getItem('sharedCart_ib') || '[]');
    ibItems.forEach(function(item) {
      if (!allItems.find(i => i.id === item.id)) allItems.push(item);
    });
  } catch(e) {}
  if (allItems.length === 0) { toast('Dodaj kursy lub książki do zakupu'); return; }
  const summary = document.getElementById('purchaseSummary');
  summary.innerHTML = allItems.map(item => {
    const iconMap = {
      polish: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
      eng: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" stroke="currentColor" stroke-width="1.5"/></svg>`,
      default: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M7 9h10M7 13h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
    };
    const icon = iconMap[item.id] || iconMap.default;
    return `
    <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:12px 14px;gap:12px">
      <div style="display:flex;align-items:center;gap:12px;min-width:0">
        <div style="width:32px;height:32px;border-radius:8px;background:var(--card);color:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0">${icon}</div>
        <span style="font-weight:700;font-size:14px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.name}</span>
      </div>
      <span style="font-weight:800;font-size:14px;color:var(--text);white-space:nowrap">${item.price} zł</span>
    </div>
  `;}).join('');
  // Update total
  const totalEl = document.getElementById('modal-total-ex');
  if (totalEl) totalEl.textContent = allItems.reduce((a,i)=>a+i.price,0) + ' zł';
  document.getElementById('modalPurchase').style.display = 'flex';
}

function startRedirect() {
  document.getElementById('modalPurchase').style.display = 'none';

  // Faza 1: pełnoekranowy overlay — przekierowanie (jak w pliku referencyjnym)
  const overlay = document.createElement('div');
  overlay.id = 'redirectOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px';
  overlay.innerHTML = `
    <div style="font-size:64px;animation:pulse 1.5s infinite">🏛️</div>
    <div style="text-align:center">
      <p style="font-size:20px;font-weight:900;color:var(--text);margin-bottom:8px">Przekierowanie do sklepu wydawnictwa…</p>
      <p style="font-size:14px;color:var(--muted);font-weight:600">Symulacja</p>
    </div>
    <div style="display:flex;gap:8px;margin-top:8px">
      <div class="redirect-dot" style="animation-delay:0s"></div>
      <div class="redirect-dot" style="animation-delay:0.15s"></div>
      <div class="redirect-dot" style="animation-delay:0.3s"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Faza 2: po 2500ms — potwierdzenie płatności (jak w pliku referencyjnym)
  setTimeout(() => {
    const token = 'edu_' + Math.random().toString(36).substr(2,12).toUpperCase();
    overlay.innerHTML = `
      <div style="font-size:64px">✅</div>
      <div style="text-align:center">
        <p style="font-size:20px;font-weight:900;color:var(--text);margin-bottom:8px">Płatność potwierdzona!</p>
        <p style="font-size:14px;color:var(--muted);font-weight:600">Token dostępu odebrany</p>
      </div>
      <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:10px 20px;font-family:monospace;font-size:12px;color:var(--muted);box-shadow:var(--shadow)">token: ${token}</div>
    `;
    // Faza 3: po 1800ms — usuń overlay i pokaż modal sukcesu (jak w pliku referencyjnym)
    setTimeout(() => {
      document.body.removeChild(overlay);
      showPurchaseSuccess();
    }, 1800);
  }, 2500);
}

// Mapa id przycisku dla każdego kursu
const btnMap = { polish: 'btnBuyPolish', eng: 'btnBuyEng' };

function showPurchaseSuccess() {
  const unlocked = document.getElementById('successUnlocked');
  unlocked.innerHTML = cartItems.map(item => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--green-soft);border:1px solid rgba(15,159,110,.2);border-radius:10px">
      <span style="width:20px;height:20px;border-radius:50%;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="m5 12 5 5L20 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
      <span style="font-weight:700;font-size:13px;color:var(--text);flex:1">${item.name}</span>
      <span style="font-size:11px;font-weight:800;color:var(--green);text-transform:uppercase;letter-spacing:.04em">Odblokowano</span>
    </div>
  `).join('');

  // Zaktualizuj stan kart dla wszystkich zakupionych kursów (jak w pliku referencyjnym)
  if (cartItems.find(i => i.id === 'polish')) {
    const badge = document.getElementById('polishStatusBadge');
    if (badge) { badge.className='course-status-badge csb-unlocked'; badge.textContent='✓ Posiadasz ten kurs'; }
    const btn = document.getElementById('btnBuyPolish');
    if (btn) {
      btn.className='btn-buy purchased';
      btn.innerHTML='→ Otwórz kurs';
      btn.disabled=false;
      btn.onclick = function(e){ e.stopPropagation(); goView('kurs'); };
      // Make whole card clickable too
      const card = btn.closest('.mod-card');
      if (card) { card.style.cursor='pointer'; card.onclick = function(){ goView('kurs'); }; }
    }
  }
  if (cartItems.find(i => i.id === 'eng')) {
    const btn = document.getElementById('btnBuyEng');
    if (btn) { btn.className='btn-buy purchased'; btn.innerHTML='✓ Posiadasz kurs'; btn.disabled=true; }
  }

  document.getElementById('modalSuccess').style.display='flex';
}

// Zamknij sukces i wróć do sklepu — odpowiednik closeSuccessAndGoToDashboard() z pliku referencyjnego
function closeSuccessAndReturn() {
  document.getElementById('modalSuccess').style.display = 'none';
  // Clear this module's cart
  cartItems = [];
  renderCart();
  // Clear IB cart too - notify parent to tell IB to clear
  try { localStorage.removeItem('sharedCart_ib'); localStorage.removeItem('sharedCart_ex'); } catch(e) {}
  try { window.parent.sendIb({type:'cartCleared'}); } catch(e) {}
  setTimeout(() => goView('sklep'), 350);
}

// ══════════════════════════════════════════════
// FILMY Z PAUZĄ — silnik
// ══════════════════════════════════════════════

const fpPauses = [
  {
    time: '01:15',
    title: 'Pauza 1 — Rozwiń nawias',
    prompt: 'Lektor prosi: rozwiń nawias i zapisz wyrażenie bez nawiasów.',
    question: 'Rozwiń: <strong>3(x + 4)</strong>',
    answers: ['A. 3x + 4', 'B. 3x + 12', 'C. x + 12', 'D. 3x + 7'],
    correct: 'B',
    resumeMsg: '✓ Brawo! Teraz wznów film — lektor pokaże pełne rozwiązanie.'
  },
  {
    time: '02:50',
    title: 'Pauza 2 — Równanie z nawiasem',
    prompt: 'Lektor zatrzymuje się: rozwiąż równanie zanim pokażę Ci odpowiedź.',
    question: 'Rozwiąż: <strong>2(x + 3) = 14</strong>',
    answers: ['A. x = 4', 'B. x = 7', 'C. x = 3', 'D. x = 11'],
    correct: 'A',
    resumeMsg: '✓ Dokładnie! Wznów film, żeby sprawdzić krok po kroku.'
  },
  {
    time: '03:55',
    title: 'Pauza 3 — Minus przed nawiasem',
    prompt: 'Uwaga na minus! Rozwiąż samodzielnie, zanim lektor wyjaśni błędy.',
    question: 'Upraszczanie: <strong>5 − (2x − 3)</strong>',
    answers: ['A. 3 − 2x', 'B. 5 − 2x − 3', 'C. 8 − 2x', 'D. 2 + 2x'],
    correct: 'C',
    resumeMsg: '✓ Pamiętasz o znaku! Wznów, żeby usłyszeć wyjaśnienie lektora.'
  }
];

let fpCurrentPause = 0;
let fpAnswered = new Set();
let fpSelectedAns = null;
let fpIsPlaying = false;
let fpSimInterval = null;
let fpProgressSec = 0;
const FP_TOTAL_SEC = 260; // 4:20

function fpInit() {
  fpCurrentPause = 0;
  fpAnswered = new Set();
  fpSelectedAns = null;
  fpIsPlaying = false;
  fpProgressSec = 0;
  clearInterval(fpSimInterval);
  fpRenderPauseList();
  fpRenderPause();
  fpUpdateProgress();
  // Start in pause state for first pause
  fpShowPauseOverlay(0);
}

function fpRenderPauseList() {
  const list = document.getElementById('fpPauseList');
  list.innerHTML = fpPauses.map((p, i) => {
    const done = fpAnswered.has(i);
    const active = i === fpCurrentPause;
    const icon = done ? '✓' : active ? '⏸' : '○';
    const color = done ? 'var(--green)' : active ? 'var(--orange)' : 'var(--muted)';
    return `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer" onclick="fpJumpTo(${i})">
        <div style="width:24px;height:24px;border-radius:50%;background:${done ? 'var(--green-soft)' : active ? 'var(--orange-soft)' : 'var(--bg)'};border:1.5px solid ${color};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:${color};flex-shrink:0">${icon}</div>
        <div style="flex:1">
          <div style="font-size:12px;font-weight:700;color:${active ? 'var(--text)' : 'var(--muted)'}">${p.title}</div>
          <div style="font-size:11px;color:var(--muted)">${p.time}</div>
        </div>
      </div>
    `;
  }).join('');
}

function fpRenderPause() {
  const p = fpPauses[fpCurrentPause];
  if (!p) return;

  // Update overlay text
  document.getElementById('fpPauseTitle').textContent = p.title;
  document.getElementById('fpPausePrompt').textContent = p.prompt;
  document.getElementById('fpTitle').textContent = `Filmy z Pauzą — Pauza ${fpCurrentPause + 1}/${fpPauses.length}`;

  // Update info panel below player
  const infoPanel = document.getElementById('fpPauseInfo');
  const infoTitle = document.getElementById('fpPauseInfoTitle');
  const infoPrompt = document.getElementById('fpPauseInfoPrompt');
  if (infoTitle) infoTitle.textContent = `⏸️ Pauza ${fpCurrentPause + 1} z ${fpPauses.length}`;
  if (infoPrompt) infoPrompt.textContent = p.prompt;

  // Nav buttons
  document.getElementById('fpPrevBtn').disabled = fpCurrentPause === 0;
  const isLast = fpCurrentPause === fpPauses.length - 1;
  document.getElementById('fpNextBtn').textContent = isLast ? '✍️ Przejdź do zadań →' : 'Następna pauza →';

  fpUpdateProgress();
  fpRenderPauseList();
}

function fpShowPauseOverlay(idx) {
  const p = fpPauses[idx];
  document.getElementById('fpPauseOverlay').classList.remove('hidden');
  document.getElementById('fpPauseTitle').textContent = p.title;
  document.getElementById('fpPausePrompt').textContent = p.prompt;
  // Show info panel below
  const infoPanel = document.getElementById('fpPauseInfo');
  if (infoPanel) {
    infoPanel.classList.remove('hidden');
    document.getElementById('fpPauseInfoTitle').textContent = `⏸️ Pauza ${idx + 1} z ${fpPauses.length}`;
    document.getElementById('fpPauseInfoPrompt').textContent = p.prompt;
  }
  fpIsPlaying = false;
  document.getElementById('fpControlBtn').textContent = '▶';
  document.getElementById('fpPlayBtn').textContent = '▶';
  clearInterval(fpSimInterval);
}

function fpTogglePlay() {
  if (fpIsPlaying) {
    fpPause();
  } else {
    fpPlay();
  }
}

function fpPlay() {
  const overlay = document.getElementById('fpPauseOverlay');
  overlay.classList.add('hidden');
  // Hide info panel when playing
  const infoPanel = document.getElementById('fpPauseInfo');
  if (infoPanel) infoPanel.classList.add('hidden');
  fpIsPlaying = true;
  document.getElementById('fpControlBtn').textContent = '⏸';
  document.getElementById('fpPlayBtn').textContent = '⏸';
  // Simulate progress
  clearInterval(fpSimInterval);
  fpSimInterval = setInterval(() => {
    fpProgressSec = Math.min(fpProgressSec + 1, FP_TOTAL_SEC);
    const pct = (fpProgressSec / FP_TOTAL_SEC) * 100;
    document.getElementById('fpProgress').style.width = pct + '%';
    const m = Math.floor(fpProgressSec / 60);
    const s = fpProgressSec % 60;
    const tm = Math.floor(FP_TOTAL_SEC / 60);
    const ts = FP_TOTAL_SEC % 60;
    document.getElementById('fpTime').textContent =
      `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} / ${String(tm).padStart(2,'0')}:${String(ts).padStart(2,'0')}`;
  }, 200);
}

function fpPause() {
  fpIsPlaying = false;
  clearInterval(fpSimInterval);
  document.getElementById('fpControlBtn').textContent = '▶';
  document.getElementById('fpPlayBtn').textContent = '▶';
}

function fpPickAns(el, gid) {
  document.querySelectorAll('#' + gid + ' .ans').forEach(a => a.classList.remove('sel'));
  el.classList.add('sel');
  fpSelectedAns = el.getAttribute('data-v');
}

function fpCheckAns() {
  // Simplified: no task panel — mark pause as answered and resume
  fpAnswered.add(fpCurrentPause);
  document.getElementById('fpPauseOverlay').classList.add('hidden');
  const infoPanel = document.getElementById('fpPauseInfo');
  if (infoPanel) infoPanel.classList.add('hidden');
  fpRenderPauseList();
  fpUpdateProgress();
  fpPlay();
}

function fpSkipTask() {
  fpAnswered.add(fpCurrentPause);
  const infoPanel = document.getElementById('fpPauseInfo');
  if (infoPanel) infoPanel.classList.add('hidden');
  fpRenderPauseList();
  fpUpdateProgress();
}

function fpResume() {
  fpPlay();
  setTimeout(() => toast('Lektor kontynuuje wyjaśnienie…'), 400);
}

function fpNextPause() {
  const isLast = fpCurrentPause === fpPauses.length - 1;
  if (isLast) {
    goView('zadania-task');
    return;
  }
  fpCurrentPause++;
  fpPause();
  fpShowPauseOverlay(fpCurrentPause);
  fpRenderPause();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function fpPrevPause() {
  if (fpCurrentPause === 0) return;
  fpCurrentPause--;
  fpPause();
  fpShowPauseOverlay(fpCurrentPause);
  fpRenderPause();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function fpJumpTo(idx) {
  fpCurrentPause = idx;
  fpPause();
  fpShowPauseOverlay(idx);
  fpRenderPause();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function fpUpdateProgress() {
  const done = fpAnswered.size;
  const total = fpPauses.length;
  const pct = Math.round((done / total) * 100);
  document.getElementById('fpProgressBar').style.width = pct + '%';
  document.getElementById('fpProgressLabel').textContent = `${done} / ${total} pauz`;
}

// Inicjalizuj filmy z pauzą przy otwarciu widoku — bez rekurencji
const _goViewBase = goView;
goView = function(name, el) {
  _goViewBase(name, el);
  if (name === 'filmy-pauza') setTimeout(fpInit, 0);
  // Auto-mark granulkę jako odwiedzoną — wejście w widok teorii oznacza wizytę
  if (name === 'teoria') setTimeout(function(){ openGranulka(granCurrent); }, 0);
};

// ── openFilm: wejście do playera z zachowaniem źródła (Filmy lub Filmy z pauzą) ──
function openFilm(source) {
  // source: 'lektor' (Filmy) | 'pauza' (Filmy z pauzą)
  const isP = source === 'pauza';
  const bcSource = document.getElementById('fpBcSource');
  const flowFilmy = document.getElementById('fpFlowFilmy');
  const flowPauza = document.getElementById('fpFlowPauza');

  if (bcSource) {
    bcSource.textContent = isP ? 'Filmy z pauzą' : 'Filmy';
    bcSource.setAttribute('onclick', isP ? "goView('filmy-pauza')" : "goView('filmy')");
  }

  if (flowFilmy && flowPauza) {
    if (isP) {
      // Filmy = done (przeszedł przez), Filmy z pauzą = active
      flowFilmy.classList.remove('is-active');
      flowFilmy.classList.add('is-done');
      flowPauza.classList.remove('is-done');
      flowPauza.classList.add('is-active');
    } else {
      // Filmy = active, Filmy z pauzą = neutralny
      flowFilmy.classList.remove('is-done');
      flowFilmy.classList.add('is-active');
      flowPauza.classList.remove('is-active', 'is-done');
    }
  }

  goView('film-player');
}

// ── MENU TRZECH KROPEK ──────────────────────────────────────────
function toggleDotsMenu() {
  document.getElementById('dotsMenuDropdown').classList.toggle('open');
}
// Zamknij po kliknięciu poza menu
document.addEventListener('click', function(e) {
  const wrap = document.getElementById('dotsMenuWrap');
  if (wrap && !wrap.contains(e.target)) {
    document.getElementById('dotsMenuDropdown').classList.remove('open');
  }
});
function openAboutModal()    { openModal('modalAbout'); }
function openUserGuideModal(){ openModal('modalUserGuide'); }

// ── ARKUSZE CKE — nawigacja wyboru poziomu ───────────────────────
const arkZestLabels = {
  '2024':      '🗂️ Arkusz 2024 · Styczeń 2024 (zad. 1–24)',
  '2025':      '🗂️ Arkusz 2025 · Styczeń 2025 (zad. 1–24)',
  // legacy keys kept for safety
  'wszystkie': '🗂️ Arkusz 2024 · Pełny arkusz (zad. 1–24)',
  'pierwsze':  '🗂️ Arkusz 2024 · Część 1 (zad. 1–8)',
  'drugie':    '🗂️ Arkusz 2024 · Część 2 (zad. 9–17)',
  'trzecie':   '🗂️ Arkusz 2024 · Część 3 (zad. 18–24)'
};

function startArkZadania(poziom) {
  // (deprecated — ekran wyboru usunięty; utrzymane dla kompatybilności)
}

function backToArkWybor() {
  goView('arkusze-filmy');
}

// ── ARKUSZE CKE — silnik filmów ──────────────────────────────────
const arkFilms = [
  { part:'Część 1/3', title:'Arkusz 2024 — Część 1/3', meta:'zad. 1–8 · 12:30', time:'03:00 / 12:30' },
  { part:'Część 2/3', title:'Arkusz 2024 — Część 2/3', meta:'zad. 9–17 · 14:50', time:'00:00 / 14:50' },
  { part:'Część 3/3', title:'Arkusz 2024 — Część 3/3', meta:'zad. 18–24 · 11:20', time:'00:00 / 11:20' }
];
let currentArkFilm = 1;

function arkFilmPlayer(n) {
  currentArkFilm = n;
  const f = arkFilms[n - 1];
  const set = (id,v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('arkFilmPartLabel', f.part);
  set('arkFilmTitle', f.title);
  set('arkFilmMeta', f.meta);
  set('arkFilmTime', f.time);
  set('arkFilmOverlay', f.title);
  [1,2,3].forEach(i => {
    const row = document.getElementById('arkFilmItem' + i);
    const badge = document.getElementById('arkFilmIcon' + i);
    if (row) row.classList.toggle('is-active', i === n);
    if (badge) badge.textContent = i === n ? '▶' : '';
  });
  const prevBtn = document.getElementById('arkFilmPrev');
  const nextBtn = document.getElementById('arkFilmNext');
  if (prevBtn) prevBtn.disabled = n === 1;
  if (nextBtn) nextBtn.textContent = n === arkFilms.length ? 'Przejdź do zadań →' : 'Następna część →';
  goView('arkusz-film-player');
}

function arkFilmNav(dir) {
  const next = currentArkFilm + dir;
  if (next < 1) return;
  if (next > arkFilms.length) { goView('arkusze-zadania'); return; }
  arkFilmPlayer(next);
}

// ── ARKUSZE CKE — silnik zadań (niezależny) ──────────────────────
const arkState = { ok:0, err:0, answered:new Set() };
const ARK_TOTAL = 4;

function arkCheck(gid, correct, fbId, wrongId, qId) {
  const chosen = sel[gid];
  const fb = document.getElementById(fbId);
  const wrong = wrongId ? document.getElementById(wrongId) : null;
  if (!chosen) { if(fb){fb.textContent='Wybierz odpowiedź A, B, C lub D.';fb.className='fb show err';} return; }
  document.querySelectorAll('#'+gid+' .ans').forEach(a => {
    const v = a.getAttribute('data-v');
    a.classList.remove('ok','err');
    if (v === correct) a.classList.add('ok');
    else if (v === chosen && chosen !== correct) a.classList.add('err');
  });
  const isOk = chosen === correct;
  if (isOk) {
    if (wrong) wrong.classList.remove('show');
    if (fb) { fb.innerHTML='<strong style="color:var(--green)">✓ Dobrze!</strong> Prawidłowa odpowiedź.'; fb.className='fb show ok'; }
  } else {
    if (fb) fb.className='fb';
    if (wrong) wrong.classList.add('show');
  }
  _arkUpdateProgress(qId, isOk);
}

function _arkUpdateProgress(qId, isOk) {
  if (!arkState.answered.has(qId)) {
    arkState.answered.add(qId);
    if (isOk) arkState.ok++; else arkState.err++;
  }
  const pct = Math.round((arkState.answered.size / ARK_TOTAL) * 100);
  const pf = document.getElementById('arkProgressFill');
  if (pf) pf.style.width = pct + '%';
  const okEl = document.getElementById('arkScoreOk');
  const errEl = document.getElementById('arkScoreErr');
  if (okEl) okEl.textContent = '✓ ' + arkState.ok + ' poprawnych';
  if (errEl) errEl.textContent = '✗ ' + arkState.err + ' błędnych';
  if (arkState.answered.size === ARK_TOTAL) setTimeout(_arkShowSummary, 600);
}

function _arkShowSummary() {
  const el = document.getElementById('arkSetSummary');
  if (!el || el.style.display !== 'none') return;
  el.style.display = 'block';
  const cont = document.getElementById('arkSetScore');
  if (cont) cont.innerHTML = `
    <div style="background:var(--green-soft);border:1.5px solid rgba(15,159,110,.25);border-radius:12px;padding:14px 22px;text-align:center">
      <div style="font-size:28px;font-weight:900;color:var(--green)">${arkState.ok}</div>
      <div style="font-size:12px;color:var(--green);font-weight:700">Poprawne</div>
    </div>
    <div style="background:var(--red-soft);border:1.5px solid rgba(220,38,38,.2);border-radius:12px;padding:14px 22px;text-align:center">
      <div style="font-size:28px;font-weight:900;color:var(--red)">${arkState.err}</div>
      <div style="font-size:12px;color:var(--red);font-weight:700">Błędne</div>
    </div>`;
  el.scrollIntoView({behavior:'smooth', block:'center'});
}

// Nadpisane pfCheck dla zadań arkusza (arkusze mają własny kontekst)
function pfCheckArk(keys, corrects, fbId, qId) {
  let allPicked = keys.every(k => pfSelected[k]);
  if (!allPicked) { const fb=document.getElementById(fbId); if(fb){fb.textContent='Oceń każde stwierdzenie.';fb.className='fb show err';} return; }
  let allOk = true;
  keys.forEach((key, i) => {
    const chosen = pfSelected[key];
    const correct = corrects[i];
    const isOk = chosen === correct;
    if (!isOk) allOk = false;
    const chosenBtn = document.getElementById(key+'_'+chosen);
    const correctBtn = document.getElementById(key+'_'+correct);
    if (!isOk && chosenBtn) chosenBtn.className = 'pf-btn err';
    if (correctBtn) correctBtn.className = 'pf-btn ok';
  });
  const fb = document.getElementById(fbId);
  if (allOk) {
    if (fb) { fb.innerHTML='<strong style="color:var(--green)">✓ Wszystko poprawnie!</strong>'; fb.className='fb show ok'; }
  } else {
    if (fb) { fb.innerHTML='<strong style="color:var(--red)">✗ Sprawdź zaznaczone poprawki.</strong>'; fb.className='fb show err'; }
  }
  _arkUpdateProgress(qId, allOk);
}

