import { useState } from 'react';

const defaultBrands = [
  { name: 'Toyota', country: 'Japón' },
  { name: 'Honda', country: 'Japón' },
  { name: 'Nissan', country: 'Japón' },
  { name: 'Mazda', country: 'Japón' },
  { name: 'Kia', country: 'Corea del Sur' },
  { name: 'Hyundai', country: 'Corea del Sur' },
  { name: 'BMW', country: 'Alemania' },
  { name: 'Mercedes-Benz', country: 'Alemania' },
  { name: 'Audi', country: 'Alemania' },
  { name: 'Tesla', country: 'EE.UU.' },
  { name: 'Ford', country: 'EE.UU.' },
  { name: 'Chevrolet', country: 'EE.UU.' },
  { name: 'Mitsubishi', country: 'Japón' },
  { name: 'Suzuki', country: 'Japón' },
];

export default function BrandAdmin() {
  const [brands] = useState(defaultBrands);

  return (
    <div className="card-premium p-6">
      <h3 className="font-bold text-white text-lg mb-6">Marcas registradas</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {brands.map((b) => (
          <div key={b.name} className="glass-panel p-4 text-center group hover:border-sport/40 transition-all">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-sport/20 transition-colors">
              <span className="text-white font-black text-lg">{b.name[0]}</span>
            </div>
            <p className="text-white font-bold text-sm">{b.name}</p>
            <p className="text-white/30 text-[10px]">{b.country}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
