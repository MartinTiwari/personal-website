// Tiny Web Audio synth — no audio files. OFF by default.
let ctx = null;
let enabled = false;

export function soundOn() { return enabled; }

export function toggleSound() {
  enabled = !enabled;
  if (enabled && !ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (enabled) blip('ui');
  return enabled;
}

// kinds: ui, open, close, xp, achieve, collect, launch
export function blip(kind = 'ui') {
  if (!enabled || !ctx) return;
  if (ctx.state === 'suspended') ctx.resume();
  const t = ctx.currentTime;
  const spec = {
    ui:      [[660, .05, 'square', .04]],
    open:    [[440, .07, 'square', .05], [660, .07, 'square', .05, .06], [880, .09, 'square', .05, .12]],
    close:   [[520, .06, 'square', .04], [330, .08, 'square', .04, .05]],
    xp:      [[880, .06, 'triangle', .06], [1174, .1, 'triangle', .06, .05]],
    achieve: [[523, .1, 'square', .06], [659, .1, 'square', .06, .09], [784, .12, 'square', .06, .18], [1046, .22, 'square', .07, .27]],
    collect: [[987, .05, 'triangle', .06], [1318, .09, 'triangle', .06, .04]],
    launch:  [[110, .5, 'sawtooth', .08], [220, .4, 'sawtooth', .05, .1]],
  }[kind] || [[660, .05, 'square', .04]];

  for (const [freq, dur, type, gain, delay = 0] of spec) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t + delay);
    g.gain.linearRampToValueAtTime(gain, t + delay + .01);
    g.gain.exponentialRampToValueAtTime(.0001, t + delay + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t + delay); o.stop(t + delay + dur + .05);
  }
}
