import type { Vehicle } from '../../types/automotive';
import { formatCurrency } from '../../utils/formatCurrency';
import useReveal from '../../hooks/useReveal';

type Props = {
  vehicle: Vehicle | undefined;
  onSelect: (v: Vehicle) => void;
};

export default function FeaturedVehicle({ vehicle: v, onSelect }: Props) {
  const { ref: textRef, visible: textVisible } = useReveal(0.5);
  const { ref: imgRef, visible: imgVisible } = useReveal(0.5);

  if (!v) return null;

  return (
    <section className="py-24 relative overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div ref={textRef} className={`space-y-6 transition-all duration-700 ${textVisible ? 'animate-fade-in-down' : 'opacity-0'}`}>
            <div className="flex gap-3 items-center">
              <span className="text-sport text-xs uppercase tracking-[0.3em] font-semibold">Vehículo premium</span>
              <span className="bg-sport/20 border border-sport/30 text-sport text-[10px] font-bold px-2.5 py-0.5 rounded-full">Más vendido</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black leading-tight">
              {v.brand}
              <br />
              <span className="text-sport">{v.model}</span>
            </h2>
            <p className="text-white/50 text-lg leading-relaxed">{v.description}</p>

            <div className="flex flex-wrap gap-3">
              <div className="glass-panel px-4 py-3 flex items-center gap-3">
                <span className="text-white/30 text-xs uppercase tracking-wider">Precio</span>
                <span className="text-white font-bold">{formatCurrency(v.price)}</span>
              </div>
              <div className="glass-panel px-4 py-3 flex items-center gap-3">
                <span className="text-white/30 text-xs uppercase tracking-wider">Motor</span>
                <span className="text-white font-semibold">{v.fuel}</span>
              </div>
              <div className="glass-panel px-4 py-3 flex items-center gap-3">
                <span className="text-white/30 text-xs uppercase tracking-wider">Transmisión</span>
                <span className="text-white font-semibold">{v.transmission}</span>
              </div>
              <div className="glass-panel px-4 py-3 flex items-center gap-3">
                <span className="text-white/30 text-xs uppercase tracking-wider">Año</span>
                <span className="text-white font-semibold">{v.year}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => onSelect(v)} className="btn-sport">
                Ver ficha completa
              </button>
              <button className="btn-outline">
                Solicitar prueba de manejo
              </button>
            </div>
          </div>

          <div ref={imgRef} className={`relative hidden lg:block transition-all duration-700 ${imgVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
            <div className="absolute -inset-10 bg-sport/5 rounded-[60px] blur-3xl" />
            <div className="relative h-[550px] rounded-3xl flex items-end p-8 cursor-pointer" onClick={() => onSelect(v)} style={{
              background: v.image,
              boxShadow: '0 50px 100px -20px rgba(0,0,0,0.8)',
            }}>
              <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                <div className="glass-panel px-3 py-2">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Precio contado</p>
                  <p className="text-white font-bold text-xl">{formatCurrency(v.price)}</p>
                </div>
                <div className="glass-panel px-3 py-2 text-right">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Kilometraje</p>
                  <p className="text-white font-semibold text-sm">{v.mileage > 0 ? `${v.mileage.toLocaleString()} km` : 'Nuevo'}</p>
                </div>
              </div>
              <div className="glass-panel p-5 w-full">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white/50 text-xs">Cuota estimada</p>
                    <p className="text-white font-bold text-2xl">{formatCurrency(Math.round(v.price * 0.1 * 0.03 + v.price * 0.1 / 48))}/mes</p>
                  </div>
                  <span className="badge-sport text-[10px]">{v.condition}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
