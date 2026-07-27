import { useEffect, useRef } from 'react';

const KF_COUNT = 6;
const MORPH_KFS = Array.from({ length: KF_COUNT }, (_, i) => `
@keyframes lm${i} {
0% { transform: scale(0.97, 0.72) rotate(0deg); border-radius: 48%52%52%48%/50%50%48%52%; }
50% { transform: scale(1.02, 0.85) rotate(0deg); border-radius: 50%50%48%52%/52%48%52%48%; }
100% { transform: scale(0.97, 0.72) rotate(0deg); border-radius: 48%52%50%50%/50%50%52%48%; }
}
`).join('');

const INITIAL_COUNT = 35;
const MIN_W = 70;
const MAX_W = 480;
const SPEED_MIN_VH = 0.6;
const SPEED_MAX_VH = 3.5;
const MERGE_DIST = 0.55;
const BOUNCE_DIST = 0.7;
const BOUNCE_SPEED = 40;

const kinds = [0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1];

const palettes = [
  'radial-gradient(circle at 40% 25%, rgba(255,170,50,0.65) 0%, rgba(240,100,30,0.25) 50%, transparent 80%)',
  'radial-gradient(circle at 45% 30%, rgba(255,140,35,0.6) 0%, rgba(235,80,25,0.2) 50%, transparent 80%)',
  'radial-gradient(circle at 38% 28%, rgba(255,160,55,0.65) 0%, rgba(245,90,28,0.25) 50%, transparent 80%)',
  'radial-gradient(circle at 42% 25%, rgba(255,130,30,0.6) 0%, rgba(230,70,20,0.2) 50%, transparent 80%)',
  'radial-gradient(circle at 35% 30%, rgba(255,180,65,0.65) 0%, rgba(240,110,32,0.25) 50%, transparent 80%)',
  'radial-gradient(circle at 43% 28%, rgba(255,150,40,0.6) 0%, rgba(235,85,22,0.2) 50%, transparent 80%)',
];

type BlobState = {
  el: HTMLDivElement;
  topPx: number;
  leftPx: number;
  w: number;
  h: number;
  ty: number;
  tx: number;
  vx: number;
  speedVh: number;
  kind: number;
  ptx: number;
  pty: number;
};

export default function LavaLampBg() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current!;

    const parent = container.parentElement!;
    const vh = window.innerHeight;
    let pageHeight = Math.max(parent.offsetHeight, vh * 2);

    const blobs: BlobState[] = [];

    function randW() { return MIN_W + Math.random() * (MAX_W - MIN_W); }

    const cw = () => parent.offsetWidth;

    function speedFor(w: number) {
      const f = 1 - Math.max(0, Math.min(1, (w - MIN_W) / (MAX_W - MIN_W)));
      return SPEED_MIN_VH + f * (SPEED_MAX_VH - SPEED_MIN_VH);
    }

    function syncEl(b: BlobState) {
      b.el.style.translate = `${b.tx.toFixed(1)}px ${b.ty.toFixed(1)}px`;
    }

    function removeBlob(b: BlobState) {
      b.el.remove();
    }

    function renderEl(b: BlobState) {
      b.el.style.cssText = [
        'position:absolute',
        `top:${b.topPx.toFixed(1)}px`,
        `left:${b.leftPx.toFixed(1)}px`,
        `width:${b.w.toFixed(1)}px`,
        `height:${b.h.toFixed(1)}px`,
        `opacity:${(0.45 + (b.kind % 5) * 0.05).toFixed(2)}`,
        `background:${palettes[b.kind % palettes.length]}`,
        `filter:blur(${2 + (b.kind % 3) * 3}px)`,
        `animation:lm${b.kind} ${(Math.random() * 30 + 25).toFixed(1)}s ease-in-out ${(-Math.random() * 5).toFixed(1)}s infinite`,
        'contain:paint style',
      ].join(';');
    }

    function createBlobEl(b: BlobState) {
      const el = document.createElement('div');
      b.el = el;
      renderEl(b);
      el.style.translate = `${b.tx.toFixed(1)}px ${b.ty.toFixed(1)}px`;
      container!.appendChild(el);
    }

    function respawnBlob(b: BlobState) {
      b.topPx = pageHeight + Math.random() * vh * 0.5;
      b.leftPx = (8 + Math.random() * 84) / 100 * cw() - b.w / 2;
      b.ty = 0;
      b.tx = 0;
      b.vx = 0;
      b.ptx = 0;
      b.pty = 0;
      b.el.style.top = `${b.topPx.toFixed(1)}px`;
      b.el.style.left = `${b.leftPx.toFixed(1)}px`;
    }

    for (let i = 0; i < INITIAL_COUNT; i++) {
      const el = document.createElement('div');
      const w = randW();
      const h = w * 1.15;
      const topPx = Math.random() * pageHeight;
      const leftPx = (8 + Math.random() * 84) / 100 * cw() - w / 2;
      const ty = -(Math.random() * 300);
      el.style.cssText = [
        'position:absolute',
        `top:${topPx.toFixed(1)}px`,
        `left:${leftPx.toFixed(1)}px`,
        `width:${w.toFixed(1)}px`,
        `height:${h.toFixed(1)}px`,
        `opacity:${(0.45 + (i % 5) * 0.05).toFixed(2)}`,
        `background:${palettes[kinds[i % kinds.length]]}`,
        `filter:blur(${2 + (kinds[i % kinds.length] % 3) * 3}px)`,
        `animation:lm${kinds[i % kinds.length]} ${(Math.random() * 30 + 25).toFixed(1)}s ease-in-out ${-(i * 0.8).toFixed(1)}s infinite`,
        'contain:paint style',
      ].join(';');
      el.style.translate = `0 ${ty.toFixed(1)}px`;
      container.appendChild(el);
      blobs.push({
        el, topPx, leftPx, w, h, ty, tx: 0, vx: 0,
        speedVh: speedFor(w),
        kind: kinds[i % kinds.length],
        ptx: 0, pty: ty,
      });
    }

    let running = true;
    let prevTime = performance.now();
    let collisionSkip = 0;

    function frame(now: number) {
      if (!running) return;
      const dt = Math.min((now - prevTime) / 1000, 0.05);
      prevTime = now;
      const ph = Math.max(parent.offsetHeight, vh * 2);
      if (ph > 0) pageHeight = ph;

      for (const b of blobs) {
        const rise = b.speedVh * vh * 0.01 * dt;
        b.ptx = b.tx;
        b.pty = b.ty;
        b.ty -= rise;
        b.tx += b.vx * dt;
        b.vx *= 0.98;
        if (b.topPx + b.ty + b.h < -vh * 0.5) {
          respawnBlob(b);
        }
      }

      collisionSkip++;
      if (collisionSkip % 8 === 0) {
        for (let i = 0; i < blobs.length; i++) {
          for (let j = i + 1; j < blobs.length; j++) {
            const a = blobs[i];
            const b = blobs[j];
            const ax = a.leftPx + a.w / 2 + a.tx;
            const ay = a.topPx + a.h / 2 + a.ty;
            const bx = b.leftPx + b.w / 2 + b.tx;
            const by = b.topPx + b.h / 2 + b.ty;
            const dx = bx - ax, dy = by - ay;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const combinedR = (a.w + b.w) / 2;

            if (dist >= combinedR * BOUNCE_DIST) continue;

            const avx = (a.tx - a.ptx) / dt;
            const avy = (a.ty - a.pty) / dt;
            const bvx = (b.tx - b.ptx) / dt;
            const bvy = (b.ty - b.pty) / dt;
            const relSpeed = Math.sqrt((avx - bvx) ** 2 + (avy - bvy) ** 2);

            if (relSpeed > BOUNCE_SPEED) {
              const overlap = combinedR * BOUNCE_DIST - dist;
              const nx = dx / dist || 0;
              const ny = dy / dist || 0;
              const push = overlap * 0.5;
              const vImpulse = Math.min(overlap * 8, 200);
              a.tx -= nx * push; a.ty -= ny * push;
              b.tx += nx * push; b.ty += ny * push;
              a.vx -= nx * vImpulse;
              a.ty -= ny * vImpulse * 0.1;
              b.vx += nx * vImpulse;
              b.ty += ny * vImpulse * 0.1;
            } else if (dist < combinedR * MERGE_DIST) {
              const areaA = a.w * a.h;
              const areaB = b.w * b.h;
              const newW = Math.sqrt((areaA + areaB) / 1.15);
              const newH = newW * 1.15;
              if (newW > MAX_W) continue;
              const [keep, remove] = areaA >= areaB ? [a, b] : [b, a];
              const newCx = (ax * areaA + bx * areaB) / (areaA + areaB);
              const newCy = (ay * areaA + by * areaB) / (areaA + areaB);
              keep.w = newW;
              keep.h = newH;
              keep.topPx = newCy - newH / 2;
              keep.leftPx = newCx - newW / 2;
              keep.tx = 0;
              keep.ty = 0;
              keep.ptx = 0;
              keep.pty = 0;
              keep.speedVh = speedFor(newW);
              const newKind = Math.floor(Math.random() * KF_COUNT);
              keep.kind = newKind;
              keep.el.style.top = `${keep.topPx.toFixed(1)}px`;
              keep.el.style.left = `${keep.leftPx.toFixed(1)}px`;
              keep.el.style.width = `${keep.w.toFixed(1)}px`;
              keep.el.style.height = `${keep.h.toFixed(1)}px`;
              keep.el.style.translate = '0 0px';
              removeBlob(remove);
              blobs.splice(blobs.indexOf(remove), 1);
              if (j >= blobs.length) break;
            }
          }
        }
      }

      for (let bi = 0; bi < blobs.length; bi++) {
        const b = blobs[bi];
        if (b.w <= MAX_W) continue;
        const splitInto = 2 + Math.floor(Math.random() * 1);
        const area = b.w * b.h;
        const children: BlobState[] = [];
        let remainingArea = area;
        for (let s = 0; s < splitInto; s++) {
          const isLast = s === splitInto - 1;
          const childArea = isLast ? remainingArea : remainingArea * (0.3 + Math.random() * 0.2);
          remainingArea -= childArea;
          const cw = Math.sqrt(childArea / 1.15);
          const ch = cw * 1.15;
          if (cw < MIN_W) continue;
          const angle = (s / splitInto) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
          const spread = b.w * 0.4;
          const child: BlobState = {
            el: null as unknown as HTMLDivElement,
            topPx: b.topPx + Math.sin(angle) * spread,
            leftPx: b.leftPx + Math.cos(angle) * spread,
            w: cw, h: ch,
            ty: 0, tx: 0, vx: Math.cos(angle) * (50 + Math.random() * 80),
            speedVh: speedFor(cw),
            kind: Math.floor(Math.random() * KF_COUNT),
            ptx: 0, pty: 0,
          };
          createBlobEl(child);
          children.push(child);
        }
        removeBlob(b);
        blobs.splice(bi, 1, ...children);
        break;
      }

      for (const b of blobs) {
        if (b.el) syncEl(b);
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);

    return () => {
      running = false;
      blobs.forEach(b => { if (b.el) b.el.remove(); });
    };
  }, []);

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 0, left: 0,
      width: '100%', height: '100%',
      zIndex: -1,
      pointerEvents: 'none', userSelect: 'none',
      overflow: 'hidden',
    }} aria-hidden="true">
      <style>{MORPH_KFS}</style>
    </div>
  );
}
