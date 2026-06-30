// ============================================================================
// Bull or Bear?  — the one trading instinct: which way is it going, up or down?
//   Up   → 🐂 BULL  (green)
//   Down → 🐻 BEAR  (red)
//
// The game loop never changes. Each round just picks a SCENARIO — a different
// *way of showing direction* — from the list below. Adding a new scenario later
// (rocket, candlesticks, a real price line, "preposition before the pump"...) is
// a one-function change: write it, push it into SCENARIOS. That is the growth
// hook you asked for.
//
// A scenario is:  (stage, direction) => cleanupFn
//   stage     : the DOM element to draw into (top ~58% of the screen)
//   direction : 'up' | 'down'  (the correct answer)
//   returns   : a function that removes whatever it added (called next round)
// ============================================================================

// ---- scenarios -------------------------------------------------------------

function arrowScenario(stage, dir){
  const scene = el('div', 'scene');
  const arrow = el('div', 'big-arrow ' + dir);
  arrow.textContent = dir === 'up' ? '⬆️' : '⬇️';
  scene.appendChild(arrow); stage.appendChild(scene);
  return () => scene.remove();
}

function coinScenario(stage, dir){
  const scene = el('div', 'scene');
  const coin = el('div', 'coin ' + dir);
  coin.textContent = '🪙';
  scene.appendChild(coin); stage.appendChild(scene);
  return () => scene.remove();
}

function chartScenario(stage, dir){
  const scene = el('div', 'scene');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'chart');
  svg.setAttribute('viewBox', '0 0 400 240');
  svg.setAttribute('preserveAspectRatio', 'none');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  // a friendly zig-zag that clearly trends up or down
  const d = dir === 'up'
    ? 'M20,210 L110,170 L190,180 L280,90 L380,30'
    : 'M20,30 L110,80 L190,70 L280,160 L380,210';
  path.setAttribute('d', d);
  path.setAttribute('class', dir);
  svg.appendChild(path); scene.appendChild(svg); stage.appendChild(scene);
  return () => scene.remove();
}

const SCENARIOS = [arrowScenario, coinScenario, chartScenario];

// ---- game ------------------------------------------------------------------

let state = null;

function start(root, services){
  root.innerHTML = `
    <div class="game">
      <div class="stage" id="bbStage"></div>
      <div class="choices">
        <button class="choice bull" data-dir="up"   aria-label="Toro, sube">
          <span class="ani">🐂</span><span class="word">⬆️</span>
        </button>
        <button class="choice bear" data-dir="down" aria-label="Oso, baja">
          <span class="ani">🐻</span><span class="word">⬇️</span>
        </button>
      </div>
    </div>`;

  const stage   = root.querySelector('#bbStage');
  const choices = [...root.querySelectorAll('.choice')];
  state = { stage, choices, services, cleanup: null, dir: null, locked: false, timer: null };

  choices.forEach(btn => btn.addEventListener('click', () => onChoose(btn)));
  newRound();
}

function newRound(){
  const s = state; if (!s) return;
  s.locked = false;
  if (s.cleanup){ s.cleanup(); s.cleanup = null; }
  s.choices.forEach(b => b.classList.remove('win', 'wrong'));

  s.dir = Math.random() < 0.5 ? 'up' : 'down';
  const scenario = SCENARIOS[(Math.random() * SCENARIOS.length) | 0];
  s.cleanup = scenario(s.stage, s.dir);
}

function onChoose(btn){
  const s = state; if (!s || s.locked) return;
  s.services.audio.unlock();
  const pick = btn.dataset.dir;

  if (pick === s.dir){
    s.locked = true;                       // correct → celebrate, then next round
    s.services.audio.good();
    btn.classList.add('win');
    s.services.reward(btn);                // coin flies to the jar
    confetti(s.stage);
    s.timer = setTimeout(newRound, 1000);
  } else {
    s.services.audio.bad();                // wrong → soft boop, wobble, try again
    btn.classList.remove('wrong'); void btn.offsetWidth; btn.classList.add('wrong');
  }
}

function stop(){
  const s = state; if (!s) return;
  clearTimeout(s.timer);
  if (s.cleanup) s.cleanup();
  state = null;
}

// ---- helpers ---------------------------------------------------------------

function el(tag, cls){ const e = document.createElement(tag); if (cls) e.className = cls; return e; }

function confetti(stage){
  const wrap = el('div', 'confetti');
  const bits = ['🎉','⭐','🪙','✨','🐂'];
  for (let i = 0; i < 14; i++){
    const s = document.createElement('span');
    s.textContent = bits[(Math.random()*bits.length)|0];
    s.style.left = (Math.random()*100) + '%';
    s.style.animationDelay = (Math.random()*0.25) + 's';
    wrap.appendChild(s);
  }
  stage.appendChild(wrap);
  setTimeout(() => wrap.remove(), 1300);
}

export default { id:'bull-or-bear', title:'Toro o Oso', icon:'🐂', start, stop };
