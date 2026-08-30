import { useEffect, useRef, useState } from 'react';
import './IntroScreen.css';

const LETTERS = [
  { char: 'L', isLedger: true },
  { char: 'E', isLedger: true },
  { char: 'D', isLedger: true },
  { char: 'G', isLedger: true },
  { char: 'E', isLedger: true },
  { char: 'R', isLedger: true },
  { char: 'F', isLedger: false },
  { char: 'R', isLedger: false },
  { char: 'A', isLedger: false },
  { char: 'M', isLedger: false },
  { char: 'E', isLedger: false },
];

// Module-level guard — survives StrictMode's mount→unmount→remount cycle.
let introSoundHasPlayed = false;

function playWhooshSound() {
  if (introSoundHasPlayed) return null;
  introSoundHasPlayed = true;

  let ctx = null;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctx.resume().then(() => {
      if (ctx.state === 'closed') return;
      const now = ctx.currentTime;

      // Low sweep
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(80, now);
      osc1.frequency.exponentialRampToValueAtTime(600, now + 1.2);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.25, now + 0.3);
      gain1.gain.linearRampToValueAtTime(0.15, now + 0.8);
      gain1.gain.linearRampToValueAtTime(0, now + 1.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      // High shimmer
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(200, now);
      osc2.frequency.exponentialRampToValueAtTime(1200, now + 1.0);
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.linearRampToValueAtTime(0.08, now + 0.4);
      gain2.gain.linearRampToValueAtTime(0, now + 1.3);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      // Sub bass
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(40, now);
      osc3.frequency.exponentialRampToValueAtTime(80, now + 1.0);
      gain3.gain.setValueAtTime(0, now);
      gain3.gain.linearRampToValueAtTime(0.15, now + 0.2);
      gain3.gain.linearRampToValueAtTime(0, now + 1.4);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);

      // Impact chime — synced to land at zoom-through moment (~1.3s)
      const osc4 = ctx.createOscillator();
      const gain4 = ctx.createGain();
      osc4.type = 'triangle';
      osc4.frequency.setValueAtTime(880, now + 1.25);
      osc4.frequency.exponentialRampToValueAtTime(440, now + 1.7);
      gain4.gain.setValueAtTime(0, now + 1.25);
      gain4.gain.linearRampToValueAtTime(0.18, now + 1.3);
      gain4.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      osc4.connect(gain4);
      gain4.connect(ctx.destination);

      osc1.start(now); osc1.stop(now + 2);
      osc2.start(now); osc2.stop(now + 2);
      osc3.start(now); osc3.stop(now + 2);
      osc4.start(now + 1.25); osc4.stop(now + 2);

      setTimeout(() => { if (ctx.state !== 'closed') ctx.close(); }, 3000);
    });
  } catch (e) {
    // Web Audio not supported
  }
  return ctx;
}

// Phases:
//  'enter'  — letters animating in
//  'hold'   — settled, tagline visible
//  'zoom'   — Netflix punch-through zoom
//  'flash'  — radial flash overlay
//  'done'   — invisible, app underneath
export default function IntroScreen({ onComplete }) {
  const [phase, setPhase] = useState('enter');
  const prefersReducedMotion = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const audioCtxRef = useRef(null);

  useEffect(() => {
    // Reduced-motion: instant crossfade, no zoom or flash
    if (prefersReducedMotion.current) {
      const t = setTimeout(() => {
        setPhase('done');
        onComplete();
      }, 500);
      return () => clearTimeout(t);
    }

    // Fire sound immediately on mount
    const soundTimer = setTimeout(() => {
      audioCtxRef.current = playWhooshSound();
    }, 50);

    // Letters settle by ~1100ms; brief hold until 1300ms
    const holdTimer = setTimeout(() => setPhase('hold'), 1100);

    // Zoom-through punch fires at 1300ms — this is the cinematic hit
    const zoomTimer = setTimeout(() => setPhase('zoom'), 1300);

    // Flash overlay starts at 1350ms (50ms into zoom for overlap)
    const flashTimer = setTimeout(() => setPhase('flash'), 1350);

    // Auth page starts fading in at 1450ms (while zoom is still happening)
    // We call onComplete here — App.jsx renders auth underneath the splash
    const appRevealTimer = setTimeout(() => onComplete(), 1450);

    // Fully hide splash overlay after app is already visible
    const doneTimer = setTimeout(() => setPhase('done'), 2100);

    return () => {
      clearTimeout(soundTimer);
      clearTimeout(holdTimer);
      clearTimeout(zoomTimer);
      clearTimeout(flashTimer);
      clearTimeout(appRevealTimer);
      clearTimeout(doneTimer);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, [onComplete]);

  const isGone = phase === 'done';

  return (
    <div
      className={`intro-screen intro-phase-${phase}`}
      style={{ pointerEvents: isGone ? 'none' : 'all' }}
      aria-hidden="true"
    >
      {/* Radial flash overlay — shown during 'flash' phase */}
      <div className="intro-flash" />

      <div className={`intro-content intro-content-${phase}`}>
        <h1 className="intro-logo">
          {LETTERS.map((item, i) => (
            <span
              key={i}
              className={`intro-letter ${item.isLedger ? 'letter-white' : 'letter-red'}`}
              style={{ animationDelay: `${i * 80 + 200}ms` }}
            >
              {item.char}
            </span>
          ))}
        </h1>
        <div className="intro-line" />
        <p className="intro-tagline">WHERE EVERY RUPEE HAS A STORY</p>
      </div>
    </div>
  );
}
