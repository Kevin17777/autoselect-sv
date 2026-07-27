import { useState, useEffect, useMemo } from 'react';
import type { Vehicle } from '../../types/automotive';
import { formatCurrency } from '../../utils/formatCurrency';

type Props = {
  vehicles: Vehicle[];
  searchFilters: { brand?: string; maxPrice?: string; year?: string } | null;
  onClearSearch: () => void;
  onSelect: (v: Vehicle) => void;
};

export default function VehicleCatalog({ vehicles, searchFilters, onClearSearch, onSelect }: Props) {
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    if (searchFilters?.brand) setBrandFilter('');
  }, [searchFilters]);

  const brands = useMemo(() => [...new Set(vehicles.map((v) => v.brand))].sort(), [vehicles]);
  const categories = useMemo(() => [...new Set(vehicles.map((v) => v.category))], [vehicles]);

  const filtered = useMemo(() => {
    let results = [...vehicles];
    if (searchFilters?.brand) {
      results = results.filter((v) => v.brand.toLowerCase().includes(searchFilters.brand!.toLowerCase()));
    }
    if (searchFilters?.maxPrice) {
      const max = parseInt(searchFilters.maxPrice);
      if (max) results = results.filter((v) => v.price <= max);
    }
    if (searchFilters?.year) {
      results = results.filter((v) => v.year.toString() === searchFilters.year);
    }
    if (brandFilter) results = results.filter((v) => v.brand === brandFilter);
    if (categoryFilter) results = results.filter((v) => v.category === categoryFilter);
    return results;
  }, [vehicles, searchFilters, brandFilter, categoryFilter]);

  const isSearching = searchFilters !== null;
  const hasFilters = brandFilter || categoryFilter || isSearching;

  const clearAll = () => {
    setBrandFilter('');
    setCategoryFilter('');
    onClearSearch();
  };

  return (
    <section id="vehicle-catalog" className="py-24 bg-deep">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sport text-xs uppercase tracking-[0.3em] font-semibold mb-2">
              {isSearching ? 'Resultados de búsqueda' : 'Inventario'}
            </p>
            <h2 className="text-3xl md:text-5xl font-black">
              {isSearching
                ? `${filtered.length} vehículo${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`
                : 'Nuestro inventario completo'}
            </h2>
            {!isSearching && (
              <p className="text-white/40 mt-3 text-sm max-w-xl">
                Explora todos los vehículos disponibles. Filtra por marca o categoría para encontrar el auto ideal.
              </p>
            )}
          </div>
          {hasFilters && (
            <button onClick={clearAll} className="text-white/40 hover:text-white text-sm transition-colors whitespace-nowrap">
              Limpiar búsqueda
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 items-center mb-10">
          <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="select-premium text-xs py-2.5 w-auto min-w-[160px]">
            <option value="">Todas las marcas</option>
            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="select-premium text-xs py-2.5 w-auto min-w-[160px]">
            <option value="">Todas categorías</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-xl">No encontramos vehículos con esos criterios.</p>
            <button onClick={clearAll} className="btn-outline mt-6 inline-block text-xs">
              Ver todos los vehículos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((v) => (
              <div key={v.id} className="card-premium cursor-pointer group" onClick={() => onSelect(v)}>
                <div className="h-36 flex items-end p-4" style={{ background: v.image }}>
                  <div>
                    <p className="text-white/50 text-xs">{v.brand}</p>
                    <p className="text-white font-bold text-lg group-hover:text-sport transition-colors">{v.model}</p>
                  </div>
                  {v.featured && <span className="ml-auto text-[10px] text-sport font-bold bg-sport/20 px-2 py-0.5 rounded-full">★ Destacado</span>}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sport font-bold text-xl">{formatCurrency(v.price)}</p>
                    <span className="text-[10px] text-white/40">{v.condition}</span>
                  </div>
                  <div className="flex gap-2 text-[11px] text-white/40 flex-wrap">
                    <span>{v.year}</span><span>·</span><span>{v.transmission}</span><span>·</span><span>{v.fuel}</span><span>·</span>
                    <span>{v.mileage > 0 ? `${v.mileage.toLocaleString()} km` : '0 km'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
