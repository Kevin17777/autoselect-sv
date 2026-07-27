import { useState, useMemo } from 'react';
import type { Vehicle } from '../../types/automotive';
import { formatCurrency } from '../../utils/formatCurrency';
import AutocompleteInput from '../shared/AutocompleteInput';

type Props = { vehicles: Vehicle[] };

type SpecKey = keyof typeof specDefs;

const specDefs = {
  'Precio': (v: Vehicle) => formatCurrency(v.price),
  'Año': (v: Vehicle) => v.year.toString(),
  'Combustible': (v: Vehicle) => v.fuel,
  'Transmisión': (v: Vehicle) => v.transmission,
  'Millaje': (v: Vehicle) => v.mileage > 0 ? `${v.mileage.toLocaleString()} km` : 'Nuevo',
  'Condición': (v: Vehicle) => v.condition,
};

export default function VehicleComparator({ vehicles }: Props) {
  const [car1Id, setCar1Id] = useState('');
  const [car2Id, setCar2Id] = useState('');
  const [car1Search, setCar1Search] = useState('');
  const [car2Search, setCar2Search] = useState('');

  const car1 = vehicles.find((v) => v.id === car1Id);
  const car2 = vehicles.find((v) => v.id === car2Id);

  const vehicleLabel = (v: Vehicle) => `${v.brand} ${v.model} ${v.year}`;

  const selectCar1 = (v: Vehicle) => {
    setCar1Id(v.id);
    setCar1Search(vehicleLabel(v));
  };

  const selectCar2 = (v: Vehicle) => {
    setCar2Id(v.id);
    setCar2Search(vehicleLabel(v));
  };

  const winner = useMemo(() => {
    if (!car1 || !car2) return null;
    const w: Record<string, 'left' | 'right' | 'tie'> = {};
    w['Precio'] = car1.price < car2.price ? 'left' : car2.price < car1.price ? 'right' : 'tie';
    w['Año'] = car1.year > car2.year ? 'left' : car2.year > car1.year ? 'right' : 'tie';
    w['Millaje'] = car1.mileage < car2.mileage ? 'left' : car2.mileage < car1.mileage ? 'right' : 'tie';
    w['Combustible'] = 'tie';
    w['Transmisión'] = 'tie';
    w['Condición'] = 'tie';
    return w;
  }, [car1, car2]);

  return (
    <section className="py-24 bg-deep/40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-xs text-white/40 uppercase tracking-[0.25em] font-semibold mb-2">Comparador</p>
          <h2 className="text-4xl md:text-5xl font-black">Compara vehículos</h2>
        </div>

        <div className="glass-panel p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-start mb-8">
            <AutocompleteInput<Vehicle>
              items={vehicles}
              value={car1Search}
              onChange={(v) => { setCar1Search(v); setCar1Id(''); }}
              onSelect={selectCar1}
              getLabel={vehicleLabel}
              getId={(v) => v.id}
              excludeId={car2Id}
              renderItem={(v) => (
                <>
                  <span className="font-medium">{v.brand} {v.model}</span>
                  <span className="text-white/40 ml-2">{v.year} · {formatCurrency(v.price)}</span>
                </>
              )}
            />
            <div className="text-center text-white/20 font-black text-2xl pt-2">VS</div>
            <AutocompleteInput<Vehicle>
              items={vehicles}
              value={car2Search}
              onChange={(v) => { setCar2Search(v); setCar2Id(''); }}
              onSelect={selectCar2}
              getLabel={vehicleLabel}
              getId={(v) => v.id}
              excludeId={car1Id}
              renderItem={(v) => (
                <>
                  <span className="font-medium">{v.brand} {v.model}</span>
                  <span className="text-white/40 ml-2">{v.year} · {formatCurrency(v.price)}</span>
                </>
              )}
            />
          </div>

          {car1 && car2 && (
            <div className="overflow-x-auto mx-auto max-w-2xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-3 text-left text-white/40 font-medium w-32">Especificación</th>
                    <th className={`p-3 text-center font-bold ${winner?.['Precio'] === 'right' ? 'opacity-50' : ''}`}>
                      <span className="text-sport">{car1.brand} {car1.model}</span>
                      {winner?.['Precio'] === 'left' && <span className="ml-2 text-[10px] text-coin-green">✓ Mejor</span>}
                    </th>
                    <th className={`p-3 text-center font-bold ${winner?.['Precio'] === 'left' ? 'opacity-50' : ''}`}>
                      <span className="text-sport">{car2.brand} {car2.model}</span>
                      {winner?.['Precio'] === 'right' && <span className="ml-2 text-[10px] text-coin-green">✓ Mejor</span>}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(Object.keys(specDefs) as SpecKey[]).map((label) => {
                    const w = winner?.[label];
                    const get = specDefs[label];
                    return (
                      <tr key={label} className="border-b border-white/5">
                        <td className="p-3 text-white/40">{label}</td>
                        <td className={`p-3 text-center font-medium ${w === 'left' ? 'text-coin-green bg-coin-green/5' : w === 'right' ? 'text-white/50' : 'text-white'}`}>{get(car1)}</td>
                        <td className={`p-3 text-center font-medium ${w === 'right' ? 'text-coin-green bg-coin-green/5' : w === 'left' ? 'text-white/50' : 'text-white'}`}>{get(car2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!car1 && !car2 && (
            <p className="text-center text-white/30 text-sm py-8">Selecciona dos vehículos para comparar</p>
          )}
        </div>
      </div>
    </section>
  );
}
