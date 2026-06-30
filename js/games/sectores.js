// ============================================================================
// Sectores 🗂️ — the COMPLEX one (5th game, for when he's older).
// Straight from crypto-top100-sector-dashboard: crypto isn't one thing — coins
// belong to SECTORS. Show a real coin, tap its sector. 3 choices (harder), real
// tickers (reading), real categories (the seed of "diversify across sectors").
//
// Sector names stay English (real crypto vocabulary). The question is localized.
// ============================================================================

const SECTORS = {
  bitcoin: { emoji:'🟠', label:'BITCOIN' },   // store of value
  l1:      { emoji:'⛓️', label:'LAYER 1' },   // base blockchains
  defi:    { emoji:'🏦', label:'DEFI'    },   // crypto banks
  meme:    { emoji:'🐶', label:'MEME'    },   // fun coins
  ai:      { emoji:'🤖', label:'AI'      },   // robot coins
  stable:  { emoji:'💵', label:'STABLE'  },   // dollar coins
};

const COINS = [
  { e:'🟠', name:'Bitcoin',  t:'BTC',  s:'bitcoin' },
  { e:'🟢', name:'Bitcoin Cash', t:'BCH', s:'bitcoin' },
  { e:'🔷', name:'Ethereum', t:'ETH',  s:'l1' },
  { e:'🟣', name:'Solana',   t:'SOL',  s:'l1' },
  { e:'🔵', name:'Cardano',  t:'ADA',  s:'l1' },
  { e:'🔺', name:'Avalanche',t:'AVAX', s:'l1' },
  { e:'🦄', name:'Uniswap',  t:'UNI',  s:'defi' },
  { e:'👻', name:'Aave',     t:'AAVE', s:'defi' },
  { e:'🏛️', name:'Maker',    t:'MKR',  s:'defi' },
  { e:'🐶', name:'Dogecoin', t:'DOGE', s:'meme' },
  { e:'🐕', name:'Shiba Inu',t:'SHIB', s:'meme' },
  { e:'🐸', name:'Pepe',     t:'PEPE', s:'meme' },
  { e:'🤖', name:'Fetch.ai', t:'FET',  s:'ai' },
  { e:'🧠', name:'Bittensor',t:'TAO',  s:'ai' },
  { e:'🎨', name:'Render',   t:'RNDR', s:'ai' },
  { e:'💵', name:'Tether',   t:'USDT', s:'stable' },
  { e:'💲', name:'USD Coin', t:'USDC', s:'stable' },
  { e:'🟡', name:'Dai',      t:'DAI',  s:'stable' },
];

let state = null;

function start(root, services){
  const t = services.i18n;
  root.innerHTML = `
    <div class="game sectores">
      <div class="stage" id="scStage">
        <div class="prompt">${t.t('sc_prompt')}</div>
        <div class="coin-card" id="scCoin"></div>
      </div>
      <div class="choices" id="scChoices"></div>
    </div>`;
  state = {
    stage: root.querySelector('#scStage'),
    coinEl: root.querySelector('#scCoin'),
    choices: root.querySelector('#scChoices'),
    services, locked:false, timer:null,
  };
  newRound();
}

function pickKeys(n, exclude){
  const pool = Object.keys(SECTORS).filter(k => !exclude.includes(k));
  const out = [];
  while (out.length < n && pool.length) out.push(pool.splice((Math.random()*pool.length)|0, 1)[0]);
  return out;
}

function newRound(){
  const s = state; if (!s) return;
  s.locked = false;
  s.stage.querySelectorAll('.praise, .confetti').forEach(n => n.remove());

  const coin = COINS[(Math.random()*COINS.length)|0];
  s.coinEl.innerHTML = `<span class="c-emoji">${coin.e}</span>
    <span class="c-name">${coin.name}</span><span class="c-ticker">${coin.t}</span>`;

  // 3 options: the correct sector + 2 distractors, shuffled
  const opts = [coin.s, ...pickKeys(2, [coin.s])];
  for (let i = opts.length - 1; i > 0; i--){ const j = (Math.random()*(i+1))|0; [opts[i],opts[j]]=[opts[j],opts[i]]; }

  s.choices.innerHTML = opts.map(k => {
    const sec = SECTORS[k];
    return `<button class="choice sector" data-correct="${k === coin.s ? '1':'0'}">
      <span class="ani">${sec.emoji}</span><span class="word">${sec.label}</span>
    </button>`;
  }).join('');

  [...s.choices.querySelectorAll('.choice')].forEach(b => b.addEventListener('click', () => onChoose(b)));
}

function onChoose(btn){
  const s = state; if (!s || s.locked) return;
  s.services.audio.unlock();
  if (btn.dataset.correct === '1'){
    s.locked = true;
    s.services.audio.good();
    btn.classList.add('win');
    s.services.reward(btn);
    praise(s.stage, s.services.i18n.praise());
    confetti(s.stage);
    s.timer = setTimeout(newRound, 1100);
  } else {
    s.services.audio.bad();
    btn.classList.remove('wrong'); void btn.offsetWidth; btn.classList.add('wrong');
  }
}

function stop(){ const s = state; if (!s) return; clearTimeout(s.timer); state = null; }

function el(tag, cls){ const e = document.createElement(tag); if (cls) e.className = cls; return e; }
function praise(stage, text){ const p = el('div','praise'); p.textContent = text; stage.appendChild(p); setTimeout(()=>p.remove(),1100); }
function confetti(stage){
  const wrap = el('div','confetti'); const bits=['🎉','⭐','🪙','✨','🗂️'];
  for(let i=0;i<14;i++){ const c=document.createElement('span'); c.textContent=bits[(Math.random()*bits.length)|0]; c.style.left=(Math.random()*100)+'%'; c.style.animationDelay=(Math.random()*0.25)+'s'; wrap.appendChild(c);}
  stage.appendChild(wrap); setTimeout(()=>wrap.remove(),1300);
}

export default { id:'sectores', title:'Sectores', icon:'🗂️', start, stop };
