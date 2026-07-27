import type { Review } from '../../types/automotive';
import useReveal from '../../hooks/useReveal';

const reviews: Review[] = [
  { id: 'r1', name: 'Carlos Mendoza', text: 'Excelente atención. Me ayudaron con el financiamiento y en 3 días ya tenía mi Toyota Hilux. Totalmente recomendados.', rating: 5, vehicle: 'Toyota Hilux 2024' },
  { id: 'r2', name: 'María José Flores', text: 'Compré mi Honda CR-V con ellos. El traspaso fue rapidísimo y el auto estaba impecable. Volvería a comprar sin dudar.', rating: 5, vehicle: 'Honda CR-V 2024' },
  { id: 'r3', name: 'Roberto Gómez', text: 'Buscaba una pickup y encontré la Ford Ranger a mejor precio que en otros lados. Negocio transparente y sin rodeos.', rating: 5, vehicle: 'Ford Ranger Wildtrak 2024' },
  { id: 'r4', name: 'Ana Lucía Martínez', text: 'El proceso de compra fue muy sencillo. Me explicaron cada paso y la camioneta llegó exactamente como la prometieron.', rating: 4, vehicle: 'Hyundai Tucson 2023' },
];

const initials = (name: string) => name.split(' ').map((s) => s[0]).join('').slice(0, 2);

const avatarColors = ['bg-sport', 'bg-blue-500', 'bg-coin-green', 'bg-purple-500'];

function ReviewCard({ r, i }: { r: Review; i: number }) {
  const { ref, visible } = useReveal(0.4);
  const anim = i % 2 === 0 ? 'animate-slide-in-left' : 'animate-slide-in-right';

  return (
    <div ref={ref} className={`glass-panel p-6 space-y-4 ${visible ? anim : 'opacity-0'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${avatarColors[i]} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
          {initials(r.name)}
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">{r.name}</p>
          <p className="text-white/30 text-xs">{r.vehicle}</p>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: r.rating }).map((_, j) => (
            <svg key={j} className="w-3.5 h-3.5 text-sport" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          ))}
        </div>
      </div>
      <p className="text-white/70 text-sm leading-relaxed">"{r.text}"</p>
    </div>
  );
}

export default function Reviews() {
  return (
    <section className="py-24 bg-deep/40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-xs text-white/40 uppercase tracking-[0.25em] font-semibold mb-2">Testimonios</p>
          <h2 className="text-3xl md:text-4xl font-black">Lo que dicen nuestros clientes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {reviews.map((r, i) => (
            <ReviewCard key={r.id} r={r} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
