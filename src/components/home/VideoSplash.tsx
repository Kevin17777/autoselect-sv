import { useRef, useEffect, useState } from 'react';

type Props = {
  onArrowShow?: (visible: boolean) => void;
};

type Phase = 'video1' | 'logo' | 'video2';

export default function VideoSplash({ onArrowShow }: Props) {
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const phaseRef = useRef<Phase>('video1');
  const [phase, setPhase] = useState<Phase>('video1');
  const [showArrow, setShowArrow] = useState(false);
  const arrowTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    if (phase === 'logo' && !showArrow && !hasScrolledRef.current) {
      arrowTimerRef.current = setTimeout(() => {
        if (!hasScrolledRef.current) {
          setShowArrow(true);
          onArrowShow?.(true);
        }
      }, 1500);
    }
    return () => clearTimeout(arrowTimerRef.current);
  }, [phase, onArrowShow, showArrow]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 0) {
        hasScrolledRef.current = true;
        if (showArrow) {
          setShowArrow(false);
          onArrowShow?.(false);
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [showArrow, onArrowShow]);

  useEffect(() => {
    const v1 = video1Ref.current;
    const v2 = video2Ref.current;
    if (!v1 || !v2) return;

    let timer: ReturnType<typeof setTimeout>;

    const onVideo1End = () => {
      phaseRef.current = 'logo';
      setPhase('logo');
      timer = setTimeout(() => {
        phaseRef.current = 'video2';
        setPhase('video2');
        v2.play();
      }, 2000);
    };

    const onVideo2End = () => {
      phaseRef.current = 'video1';
      setPhase('video1');
      v1.play();
    };

    v1.addEventListener('ended', onVideo1End);
    v2.addEventListener('ended', onVideo2End);

    return () => {
      v1.removeEventListener('ended', onVideo1End);
      v2.removeEventListener('ended', onVideo2End);
      clearTimeout(timer);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-black">
      <video ref={video1Ref} autoPlay muted playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'blur(1.5px)', opacity: phase === 'video1' ? 1 : 0, transition: 'opacity 1s' }}
      >
        <source src="/video.mp4" type="video/mp4" />
      </video>

      <video ref={video2Ref} muted playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'blur(4px)', opacity: phase === 'video2' ? 1 : 0, transition: 'opacity 1s' }}
      >
        <source src="/video2.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 pointer-events-none" />

      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${phase === 'logo' ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.02) 70%, transparent 90%)' }}
      />

      <div className={`relative z-10 w-full text-center transition-all duration-[1500ms] ${phase !== 'video1' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex items-center gap-3 justify-center">
          <svg className="w-14 h-14 text-sport" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight">
            AutoSelect <span className="text-sport">SV</span>
          </h1>
        </div>
        <p className="text-white/60 text-xl max-w-lg mx-auto mt-4">
          Tu mejor opción en autos nuevos y usados
        </p>
      </div>

      <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-opacity duration-700 cursor-pointer ${showArrow ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <span className="text-white/40 text-xs uppercase tracking-[0.2em] font-medium">Scroll</span>
        <svg className="w-5 h-5 text-white/50 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

    </section>
  );
}
