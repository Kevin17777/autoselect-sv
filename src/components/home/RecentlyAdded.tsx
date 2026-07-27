import { useState, useEffect, useRef, useCallback } from 'react';
import type { Vehicle } from '../../types/automotive';
import { formatCurrency } from '../../utils/formatCurrency';

type Props = {
  vehicles: Vehicle[];
  onSelect: (v: Vehicle) => void;
  modalOpen?: boolean;
};

const imgUrl = (s: string) => s.match(/url\(([^)]+)\)/)?.[1] || '';

export default function RecentlyAdded({ vehicles, onSelect, modalOpen }: Props) {
  const newArrivals = vehicles.filter((v) => v.isNewArrival);
  const [index, setIndex] = useState(0);
  const [slideW, setSlideW] = useState(320);
  const [committedPos, setCommittedPos] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ startX: 0, startY: 0, startIdx: 0, active: false, delta: 0, deltaY: 0, isMouse: false, velocity: 0, lastMoveTime: 0, lastMoveX: 0, startPos: 0 });
  const pausedRef = useRef(false);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const justDragged = useRef(false);
  const animRef = useRef(0);
  const slideWRef = useRef(slideW);
  const currentOffsetRef = useRef(0);
  const committedIdxRef = useRef(0);
  slideWRef.current = slideW;

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setSlideW(w >= 1024 ? 400 : 320);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    if (modalOpen) {
      pausedRef.current = true;
      clearTimeout(pauseTimer.current);
    } else {
      clearTimeout(pauseTimer.current);
      pausedRef.current = false;
    }
  }, [modalOpen]);

  useEffect(() => {
    setCommittedPos(index * slideW);
    currentOffsetRef.current = index * slideW;
  }, [index, slideW]);

  const getVisible = useCallback(() => {
    if (containerRef.current) {
      return Math.max(1, Math.floor(containerRef.current.clientWidth / slideW));
    }
    return 3;
  }, [slideW]);

  const getMax = useCallback(() => {
    return Math.max(0, newArrivals.length - getVisible());
  }, [newArrivals.length, getVisible]);

  const goTo = useCallback((i: number) => {
    setIndex(i);
    committedIdxRef.current = i;
  }, []);

  const wrapTo = useCallback((i: number) => {
    const max = getMax();
    if (max < 0) return;
    const wrapped = ((i % (max + 1)) + (max + 1)) % (max + 1);
    goTo(wrapped);
  }, [getMax, goTo]);

  useEffect(() => {
    if (newArrivals.length <= 1) return;
    const timer = setInterval(() => {
      if (!pausedRef.current) {
        setIndex((prev) => {
          const sw = slideWRef.current;
          const visible = containerRef.current ? Math.max(1, Math.floor(containerRef.current.clientWidth / sw)) : 3;
          const max = Math.max(0, newArrivals.length - visible);
          const next = prev >= max ? 0 : prev + 1;
          committedIdxRef.current = next;
          return next;
        });
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [newArrivals.length]);

  const pause = () => {
    pausedRef.current = true;
    clearTimeout(pauseTimer.current);
  };

  const resume = () => {
    if (modalOpen) return;
    clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => {
      pausedRef.current = false;
    }, 4000);
  };

  const setTrack = (pos: number, animate: boolean) => {
    const el = trackRef.current;
    if (!el) return;
    el.style.transition = animate ? 'transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none';
    el.style.transform = `translateX(-${pos}px)`;
    currentOffsetRef.current = pos;
  };

  const snapTo = (i: number) => {
    const max = getMax();
    const clamped = Math.max(0, Math.min(i, max));
    goTo(clamped);
    setCommittedPos(clamped * slideW);
    setTrack(clamped * slideW, true);
  };

  const startDrag = (clientX: number, clientY: number, isMouse: boolean) => {
    cancelAnimationFrame(animRef.current);
    justDragged.current = false;
    pause();
    const now = Date.now();
    let actualPos = currentOffsetRef.current;
    if (trackRef.current) {
      const m = window.getComputedStyle(trackRef.current).transform;
      if (m && m !== 'none') {
        const match = m.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,\s*(-?\d+\.?\d*)/);
        if (match) actualPos = Math.abs(parseFloat(match[1]));
      }
    }
    setCommittedPos(actualPos);
    setTrack(actualPos, false);
    drag.current = {
      startX: clientX, startY: clientY, startIdx: committedIdxRef.current,
      active: true, delta: 0, deltaY: 0,
      isMouse, velocity: 0, lastMoveTime: now, lastMoveX: clientX, startPos: actualPos,
    };
  };

  const endDrag = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;

    const wasHorizontal = Math.abs(d.delta) > 10 && Math.abs(d.delta) > Math.abs(d.deltaY);

    if (d.isMouse && wasHorizontal) {
      justDragged.current = true;
      const velPxPerMs = d.velocity;
      if (Math.abs(velPxPerMs) > 0.2) {
        const max = getMax();
        let pos = d.startPos - d.delta;
        let v = velPxPerMs;
        let lastStamp = 0;
        const maxPos = max * slideW;

        const animate = (stamp: number) => {
          if (!lastStamp) lastStamp = stamp;
          const dt = Math.min(stamp - lastStamp, 32);
          lastStamp = stamp;
          v *= Math.pow(0.997, dt);
          pos -= v * dt;
          pos = Math.max(0, Math.min(pos, maxPos));
          setTrack(pos, false);

          if (Math.abs(v) > 0.05) {
            animRef.current = requestAnimationFrame(animate);
          } else {
            const nearest = Math.round(pos / slideW);
            snapTo(nearest);
            resume();
          }
        };

        animRef.current = requestAnimationFrame(animate);
        return;
      }
    }

    if (wasHorizontal) {
      justDragged.current = true;
      const max = getMax();
      const idxChange = Math.round(-d.delta / slideW);
      let newIdx = Math.max(0, Math.min(d.startIdx + idxChange, max));
      if (newIdx === d.startIdx) {
        if (d.delta > 80) newIdx = Math.max(0, Math.min(d.startIdx - 1, max));
        else if (d.delta < -80) newIdx = Math.max(0, Math.min(d.startIdx + 1, max));
      }
      snapTo(newIdx);
    } else if (Math.abs(d.delta) > 5 || Math.abs(d.deltaY) > 5) {
      const el = trackRef.current;
      if (el) {
        el.style.transition = 'transform 0.3s ease';
        el.style.transform = `translateX(-${currentOffsetRef.current}px)`;
      }
    }

    resume();
  };

  const handleCardTap = (v: Vehicle, e: React.TouchEvent) => {
    const d = drag.current;
    if (Math.abs(d.delta) > 30 || Math.abs(d.deltaY) > 30) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    onSelect(v);
  };

  if (newArrivals.length === 0) {
    return (
      <section className="py-24 bg-deep/40">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-white/40 uppercase tracking-[0.25em] font-semibold mb-2">Recién ingresados</p>
          <h2 className="text-3xl md:text-4xl font-black mb-4">Últimos en llegar</h2>
          <p className="text-white/40">Próximamente nuevos vehículos</p>
        </div>
      </section>
    );
  }

  const showArrows = newArrivals.length > getVisible();

  return (
    <section className="py-24 bg-deep/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-[0.25em] font-semibold mb-2">Recién ingresados</p>
            <h2 className="text-3xl md:text-4xl font-black">Últimos en llegar</h2>
          </div>
          {showArrows && (
            <div className="flex gap-2">
              <button onClick={() => wrapTo(index - 1)}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={() => wrapTo(index + 1)}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <div ref={containerRef} className="overflow-hidden select-none lg:px-12" style={{ touchAction: 'pan-y', cursor: 'default' }}
          onMouseEnter={() => { pausedRef.current = true; clearTimeout(pauseTimer.current); }}
          onMouseUp={endDrag}
          onMouseLeave={() => { endDrag(); if (!modalOpen) { clearTimeout(pauseTimer.current); pausedRef.current = false; } }}
          onMouseDown={(e) => startDrag(e.clientX, e.clientY, true)}
          onMouseMove={(e) => {
            if (!drag.current.active) return;
            const now = Date.now();
            const d = drag.current;
            d.delta = e.clientX - d.startX;
            const dt = now - d.lastMoveTime;
            if (dt > 20) {
              d.velocity = (e.clientX - d.lastMoveX) / dt;
              d.lastMoveTime = now;
              d.lastMoveX = e.clientX;
            }
            setTrack(d.startPos - d.delta, false);
          }}
          onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY, false)}
          onTouchMove={(e) => {
            if (!drag.current.active) return;
            const t = e.touches[0];
            drag.current.delta = t.clientX - drag.current.startX;
            drag.current.deltaY = t.clientY - drag.current.startY;
            const dx = Math.abs(drag.current.delta);
            const dy = Math.abs(drag.current.deltaY);
            if (dx > 10 && dx > dy * 2) {
              e.preventDefault();
              setTrack(drag.current.startPos - drag.current.delta, false);
            }
          }}
          onTouchEnd={endDrag}
        >
          <div ref={trackRef} className="flex gap-5" style={{
            transform: `translateX(-${committedPos}px)`,
            transition: 'transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
          }}>
            {newArrivals.map((v) => (
              <div key={v.id} className="min-w-[300px] lg:min-w-[380px] card-premium group cursor-pointer"
                onTouchEnd={(e) => handleCardTap(v, e)}
                onClick={() => { if (justDragged.current) { justDragged.current = false; return; } const d = drag.current; if (Math.abs(d.delta) > 30) return; onSelect(v); }}
              >
                <div className="h-40 lg:h-52 flex items-end p-5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-center bg-cover blur scale-110" style={{ backgroundImage: `url(${imgUrl(v.image)})` }} />
                  <div className="absolute inset-0 bg-center bg-contain bg-no-repeat" style={{ backgroundImage: `url(${imgUrl(v.image)})` }} />
                  <div className="relative z-10">
                    <p className="text-white/50 text-xs">{v.brand}</p>
                    <p className="text-white font-bold text-lg">{v.model}</p>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sport font-bold text-xl">{formatCurrency(v.price)}</p>
                    <span className="badge-blue text-[10px]">{v.condition}</span>
                  </div>
                  <div className="flex gap-2 text-xs text-white/40">
                    <span>{v.transmission}</span>
                    <span>·</span>
                    <span>{v.fuel}</span>
                    <span>·</span>
                    <span>{v.mileage > 0 ? `${v.mileage.toLocaleString()} km` : '0 km'}</span>
                  </div>
                  {v.colorVariants && v.colorVariants.length > 0 && (
                    <div className="flex gap-1">
                      <span className="w-3 h-3 rounded-full border border-white/20" style={{ background: v.color }} />
                      {v.colorVariants.map((cv, i) => (
                        <span key={i} className="w-3 h-3 rounded-full border border-white/20" style={{ background: cv.color }} />
                      ))}
                    </div>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); if (justDragged.current) { justDragged.current = false; return; } const d = drag.current; if (Math.abs(d.delta) > 30) return; onSelect(v); }} className="btn-outline w-full text-xs py-2">
                    Ver disponible
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
  );
}