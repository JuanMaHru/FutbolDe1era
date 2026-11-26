/**
 * Efectos de sonido sintetizados con Web Audio (sin archivos, sin derechos de terceros).
 * Solo suenan después de una interacción del usuario, como exige el navegador.
 */
import { read, write } from "./storage";

export type Sfx = "kick" | "flip" | "near" | "hit" | "win" | "lose" | "click";

let ctx: AudioContext | null = null;
let muted: boolean | null = null;

export function isMuted(): boolean {
  if (muted === null) muted = read<boolean>("muted", false);
  return muted;
}
export function setMuted(v: boolean) {
  muted = v;
  write("muted", v);
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(c: AudioContext, freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.2, slideTo?: number) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(c.destination);
  o.start(start);
  o.stop(start + dur + 0.02);
}

function noise(c: AudioContext, start: number, dur: number, gain: number, filterFreq: number, q = 0.8) {
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = filterFreq;
  f.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(f).connect(g).connect(c.destination);
  src.start(start);
}

/** Silbato de árbitro: dos tonos agudos con trino. */
function whistle(c: AudioContext, t: number, dur: number) {
  const o = c.createOscillator();
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.value = 2900;
  lfo.frequency.value = 28;
  lfoGain.gain.value = 120;
  lfo.connect(lfoGain).connect(o.frequency);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.09, t + 0.02);
  g.gain.setValueAtTime(0.09, t + dur - 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t); lfo.start(t);
  o.stop(t + dur); lfo.stop(t + dur);
}

export function play(s: Sfx) {
  if (isMuted()) return;
  const c = ac();
  if (!c) return;
  const t = c.currentTime + 0.01;
  switch (s) {
    case "click":
      tone(c, 660, t, 0.06, "triangle", 0.08);
      break;
    case "kick": // patada: golpe grave + chasquido
      tone(c, 150, t, 0.16, "sine", 0.5, 45);
      noise(c, t, 0.06, 0.25, 1800, 1.2);
      break;
    case "flip":
      tone(c, 420, t, 0.05, "triangle", 0.05);
      break;
    case "near":
      tone(c, 520, t, 0.08, "triangle", 0.07);
      break;
    case "hit":
      tone(c, 780, t, 0.1, "triangle", 0.08);
      break;
    case "win": // silbato + hinchada + acorde
      whistle(c, t, 0.35);
      noise(c, t + 0.2, 2.2, 0.35, 900, 0.4);
      [523, 659, 784, 1046].forEach((f, i) => tone(c, f, t + 0.25 + i * 0.09, 0.5, "triangle", 0.09));
      break;
    case "lose": // tres pitazos finales
      whistle(c, t, 0.22);
      whistle(c, t + 0.3, 0.22);
      whistle(c, t + 0.6, 0.6);
      break;
  }
}
