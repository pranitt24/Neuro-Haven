import { useEffect, useRef } from "react";

// Web Audio only. No audio files. The AudioContext is created / resumed
// inside click handlers (unlock) because browsers block autoplay.
function createEngine() {
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null;
  let master = null;
  let voice = null;
  let volume = 0.3;
  const buffers = {};

  function unlock() {
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = volume;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function noise(kind) {
    if (buffers[kind]) return buffers[kind];
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === "brown") {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      } else {
        d[i] = w * 0.5;
      }
    }
    buffers[kind] = buf;
    return buf;
  }

  function stop() {
    if (!voice || !ctx) return;
    const old = voice;
    voice = null;
    old.gain.gain.cancelScheduledValues(ctx.currentTime);
    old.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
    setTimeout(() => {
      try {
        old.nodes.forEach((n) => n.stop && n.stop());
        old.nodes.forEach((n) => n.disconnect());
        old.gain.disconnect();
      } catch {
        /* already stopped */
      }
    }, 900);
  }

  function start(type, vol) {
    if (type === "off") return stop();
    if (!unlock()) return;
    volume = vol;
    master.gain.setTargetAtTime(volume, ctx.currentTime, 0.1);
    stop();

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(master);
    const nodes = [];

    const src = ctx.createBufferSource();
    src.loop = true;
    nodes.push(src);

    if (type === "rain") {
      src.buffer = noise("white");
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 900;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 7000;
      const g = ctx.createGain();
      g.gain.value = 0.45;
      src.connect(hp).connect(lp).connect(g).connect(gain);
      nodes.push(hp, lp, g);
    } else if (type === "brown") {
      src.buffer = noise("brown");
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 900;
      src.connect(lp).connect(gain);
      nodes.push(lp);
    } else {
      // soft wind: brown noise, low-passed, with a very slow gain LFO
      src.buffer = noise("brown");
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 600;
      lp.Q.value = 0.7;
      const windGain = ctx.createGain();
      windGain.gain.value = 0.6;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.09;
      const depth = ctx.createGain();
      depth.gain.value = 0.3;
      lfo.connect(depth).connect(windGain.gain);
      lfo.start();
      src.connect(lp).connect(windGain).connect(gain);
      nodes.push(lp, windGain, lfo, depth);
    }

    src.start();
    gain.gain.setTargetAtTime(1, ctx.currentTime, 0.6); // gentle fade-in
    voice = { gain, nodes };
  }

  function setVolume(v) {
    volume = v;
    if (ctx && master) master.gain.setTargetAtTime(v, ctx.currentTime, 0.1);
  }

  // short, quiet, three-note chime
  function chime() {
    if (!unlock()) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f;
      const t = now + i * 0.28;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.07, t + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 1.7);
    });
  }

  function dispose() {
    stop();
    setTimeout(() => ctx && ctx.close && ctx.close().catch(() => {}), 1000);
  }

  return { unlock, start, stop, setVolume, chime, dispose };
}

export default function useAmbientSound() {
  const ref = useRef(null);
  if (!ref.current) ref.current = createEngine();
  useEffect(() => () => ref.current && ref.current.dispose(), []);
  return ref.current;
}
