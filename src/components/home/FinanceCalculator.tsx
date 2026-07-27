import { useState, useMemo } from 'react';
import { formatCurrency, calculateMonthlyPayment, generateContactMessage, createWhatsAppLink } from '../../utils/formatCurrency';
import type { Vehicle, CompanyInfo } from '../../types/automotive';
import AutocompleteInput from '../shared/AutocompleteInput';

type Props = { vehicles: Vehicle[]; company: CompanyInfo };

export default function FinanceCalculator({ vehicles, company }: Props) {
  const [selectedId, setSelectedId] = useState(vehicles[0]?.id || '');
  const [search, setSearch] = useState(vehicles[0] ? `${vehicles[0].brand} ${vehicles[0].model} ${vehicles[0].year}` : '');
  const [downPayment, setDownPayment] = useState(5000);
  const [term, setTerm] = useState(48);

  const vehicle = vehicles.find((v) => v.id === selectedId);
  const price = vehicle?.price || 0;
  const minDown = price * 0.2;
  const maxDown = price;

  const monthlyPayment = useMemo(() => calculateMonthlyPayment(price, downPayment, term), [price, downPayment, term]);

  const vehicleLabel = (v: Vehicle) => `${v.brand} ${v.model} ${v.year}`;

  const selectVehicle = (v: Vehicle) => {
    setSelectedId(v.id);
    setSearch(vehicleLabel(v));
    setDownPayment(Math.min(downPayment, v.price));
  };

  return (
    <section className="relative py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-left mb-8">
          <p className="text-xs text-white/40 uppercase tracking-[0.25em] font-semibold mb-2">Calculadora</p>
          <h2 className="text-2xl md:text-3xl font-black">Simula tu financiamiento</h2>
        </div>

        <div className="max-w-3xl mx-auto glass-panel p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Vehículo</label>
                <AutocompleteInput<Vehicle>
                  items={vehicles}
                  value={search}
                  onChange={setSearch}
                  onSelect={selectVehicle}
                  getLabel={vehicleLabel}
                  renderItem={(v) => (
                    <>
                      <span className="font-medium">{v.brand} {v.model}</span>
                      <span className="text-white/40 ml-2">{v.year} · {formatCurrency(v.price)}</span>
                    </>
                  )}
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/40">Prima</span>
                  <span className="text-white font-semibold">{formatCurrency(downPayment)}</span>
                </div>
                <input type="range" min={minDown} max={maxDown} step={100} value={downPayment}
                  onChange={(e) => setDownPayment(+e.target.value)} className="w-full accent-sport" />
                <div className="flex justify-between text-xs text-white/30 mt-1">
                  <span>Mín: {formatCurrency(minDown)}</span>
                  <span>Máx: {formatCurrency(maxDown)}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Plazo</p>
                <div className="grid grid-cols-5 gap-2">
                  {[12, 24, 36, 48, 60].map((m) => (
                    <button key={m} onClick={() => setTerm(m)}
                      className={`py-3 rounded-xl text-sm font-bold transition-all ${term === m ? 'bg-sport text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 flex flex-col justify-between">
              {vehicle ? (
                <>
                  <div className="space-y-4">
                    <p className="font-bold text-lg">{vehicle.brand} {vehicle.model}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Precio</span>
                      <span className="text-white font-semibold">{formatCurrency(price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Prima</span>
                      <span className="text-white font-semibold">- {formatCurrency(downPayment)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">A financiar</span>
                      <span className="text-white font-semibold">{formatCurrency(price - downPayment)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Tasa</span>
                      <span className="text-coin-green font-semibold">10% anual fija</span>
                    </div>
                    <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                      <span className="text-white/40 text-sm">Cuota estimada</span>
                      <span className="text-sport font-black text-3xl">{formatCurrency(Math.round(monthlyPayment))}<span className="text-sm text-white/40">/mes</span></span>
                    </div>
                  </div>
                  <a href={createWhatsAppLink(generateContactMessage(`${vehicle.brand} ${vehicle.model}`, price, monthlyPayment), company?.whatsapp)}
                    target="_blank" rel="noopener noreferrer"
                    className="btn-sport w-full text-center mt-6 text-xs">
                    💬 Me interesa — {formatCurrency(Math.round(monthlyPayment))}/mes
                  </a>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-white/30">Selecciona un vehículo</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
