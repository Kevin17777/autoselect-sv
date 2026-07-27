import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Vehicle } from '../../types/automotive';
import { formatCurrency } from '../../utils/formatCurrency';
import useReveal from '../../hooks/useReveal';

type Props = {
  vehicles: Vehicle[];
  onSelectVehicle: (v: Vehicle) => void;
  showBounce?: boolean;
};

export default function ImmersiveHero({ vehicles, onSelectVehicle, showBounce }: Props) {
  const navigate = useNavigate();
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const { ref: textRef, visible: textVisible } = useReveal(0.5);
  const { ref: imgRef, visible: imgVisible } = useReveal(0.5);

  const brands = [...new Set(vehicles.map((v) => v.brand))].sort();
  const models = brand ? vehicles.filter((v) => v.brand === brand).map((v) => v.model) : [];
  const uniqueModels = [...new Set(models)];

  const featured = vehicles.filter((v) => v.featured)[0];
  const showVehicle = featured || vehicles[0];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (brand) params.set('brand', brand);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (year) params.set('year', year);
    navigate(`/inventario?${params.toString()}`);
  };

  return (
    <section className={`relative min-h-screen flex items-center overflow-hidden bg-deep/20 border-t border-white/10 ${showBounce ? 'animate-gentle-bounce' : ''}`}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-white/50 z-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 w-full pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div ref={textRef} className={`space-y-6 ${textVisible ? 'animate-fade-in-down' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 bg-sport/20 border border-sport/30 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 bg-sport rounded-full animate-pulse" />
              <span className="text-xs text-sport font-semibold uppercase tracking-wider">AutoSelect SV</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
              Encuentra tu
              <br />
              <span className="text-sport">próximo auto</span>
            </h1>

            <p className="text-white/60 text-lg max-w-md">
              El vehículo que buscas está más cerca de lo que crees. Nuevos, importados y seminuevos con los mejores precios del país.
            </p>

            <div className="glass-panel p-5 space-y-4 max-w-lg">
              <p className="text-xs text-white/40 uppercase tracking-wider font-medium">Buscador inteligente</p>
              <div className="grid grid-cols-2 gap-3">
                <select value={brand} onChange={(e) => { setBrand(e.target.value); setModel(''); }} className="select-premium text-xs">
                  <option value="">Marca</option>
                  {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <select value={model} onChange={(e) => setModel(e.target.value)} className="select-premium text-xs">
                  <option value="">Modelo</option>
                  {uniqueModels.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={year} onChange={(e) => setYear(e.target.value)} className="select-premium text-xs">
                  <option value="">Año</option>
                  {[2024, 2023, 2022, 2021, 2020].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="select-premium text-xs">
                  <option value="">Precio máx.</option>
                  <option value="15000">$15,000</option>
                  <option value="25000">$25,000</option>
                  <option value="35000">$35,000</option>
                  <option value="50000">$50,000</option>
                  <option value="80000">$80,000+</option>
                </select>
              </div>
              <button onClick={handleSearch} className="btn-sport w-full text-xs py-3">
                Buscar vehículos
              </button>
            </div>
          </div>

          {showVehicle && (
            <div ref={imgRef} className={`hidden lg:block ${imgVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
              <div className="relative">
                <div className="absolute -inset-4 bg-sport/10 rounded-3xl blur-2xl" />
                <div className="relative card-premium overflow-hidden cursor-pointer" onClick={() => onSelectVehicle(showVehicle)}>
                  <div className="h-72 rounded-t-xl flex items-end p-6 relative" style={{ background: showVehicle.image }}>
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="badge-sport text-[10px]">Destacado</span>
                      {showVehicle.isNewArrival && <span className="bg-coin-green/20 text-coin-green text-[10px] font-bold px-2 py-0.5 rounded-full">Nuevo</span>}
                    </div>
                    <div>
                      <p className="text-white/60 text-xs font-medium">{showVehicle.brand}</p>
                      <p className="text-white font-bold text-3xl">{showVehicle.model}</p>
                      <p className="text-white/50 text-sm">{showVehicle.year}</p>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sport font-bold text-3xl">{formatCurrency(showVehicle.price)}</p>
                      <div className="text-right text-xs text-white/50">
                        <p>{showVehicle.fuel}</p>
                        <p>{showVehicle.transmission}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => onSelectVehicle(showVehicle)} className="btn-sport flex-1 text-xs py-2.5">
                        Ver detalles
                      </button>
                      <button className="btn-outline flex-1 text-xs py-2.5">
                        Prueba de manejo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{
        background: 'linear-gradient(to top, rgba(10,10,10,0.25) 0%, transparent 100%)',
      }} />
    </section>
  );
}
