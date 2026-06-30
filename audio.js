// Sound effects only, no words — synthesized with Web Audio so there are no
// files to host and it works offline. iOS requires the context to be resumed
// from inside a user gesture, so we lazily create/resume on the first tap.
let ctx = null;

function ac(){
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// play one tone
function tone(freq, start, dur, type = 'sine', gain = 0.22){
  const c = ac();
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0); osc.stop(t0 + dur + 0.02);
}

export const Audio = {
  unlock(){ ac(); },                                   // call once on first tap
  good(){ tone(523,0,.12,'triangle'); tone(784,.1,.18,'triangle'); }, // C->G, happy
  bad(){ tone(196,0,.18,'sine',.18); },                // soft low boop, not harsh
  coin(){ tone(988,0,.07,'square',.14); tone(1319,.06,.09,'square',.12); },
  star(){ [659,784,988,1319].forEach((f,i)=>tone(f,i*.08,.16,'triangle',.16)); },
};
