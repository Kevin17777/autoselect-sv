import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Vehicle } from '../types/automotive';
import { formatCurrency, calculateMonthlyPayment } from '../utils/formatCurrency';
import { Fuel, Calendar, Cog, Gauge, Car, CarFront, Battery } from 'lucide-react';
import VehicleDetailModal from '../components/home/VehicleDetailModal';
import LavaLampBg from '../components/shared/LavaLampBg';

type Props = {
  vehicles: Vehicle[];
};

const SportCarIcon = () => (
  <svg className="w-5 h-auto shrink-0" viewBox="0 0 1000 600" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M287.55,389.163v23.572c6.893-1.17,13.26-3.882,18.737-7.767l-16.667-16.668C288.946,388.62,288.257,388.91,287.55,389.163z M279.837,360.746c-3.792,0-6.866,3.074-6.866,6.866s3.074,6.866,6.866,6.866s6.866-3.074,6.866-6.866S283.629,360.746,279.837,360.746z M279.837,380.23c-1.607,0-2.911,1.303-2.911,2.91s1.303,2.91,2.911,2.91c1.607,0,2.91-1.303,2.91-2.91S281.444,380.23,279.837,380.23z M300.528,377.396l16.667,16.667c3.886-5.477,6.596-11.846,7.766-18.739h-23.574C301.133,376.031,300.848,376.724,300.528,377.396z M300.526,357.829c0.319,0.673,0.608,1.363,0.861,2.07h23.573c-1.17-6.893-3.882-13.261-7.767-18.738L300.526,357.829z M270.056,346.924c0.673-0.319,1.362-0.609,2.07-0.862v-23.572c-6.893,1.17-13.26,3.882-18.738,7.767L270.056,346.924z M258.287,375.324h-23.573c1.17,6.894,3.881,13.262,7.766,18.738l16.668-16.668C258.829,376.722,258.54,376.031,258.287,375.324z M292.456,367.611c0,1.607,1.303,2.91,2.91,2.91s2.91-1.303,2.91-2.91s-1.303-2.91-2.91-2.91S292.456,366.004,292.456,367.611z M306.288,330.255c-5.478-3.885-11.845-6.596-18.738-7.766v23.572c0.707,0.253,1.397,0.542,2.07,0.86L306.288,330.255z M279.837,354.992c1.607,0,2.91-1.303,2.91-2.91s-1.303-2.91-2.91-2.91c-1.607,0-2.911,1.303-2.911,2.91S278.23,354.992,279.837,354.992z M279.837,292.661c-41.394,0-74.951,33.557-74.951,74.951s33.557,74.951,74.951,74.951s74.951-33.557,74.951-74.951S321.231,292.661,279.837,292.661z M279.837,421.148c-29.567,0-53.537-23.969-53.537-53.536s23.969-53.536,53.537-53.536c29.567,0,53.536,23.969,53.536,53.536S309.404,421.148,279.837,421.148z M253.386,404.97c5.477,3.885,11.846,6.596,18.739,7.766v-23.572c-0.708-0.253-1.398-0.542-2.072-0.861L253.386,404.97z M259.146,357.827l-16.667-16.667c-3.886,5.478-6.596,11.847-7.766,18.739h23.575C258.542,359.192,258.827,358.501,259.146,357.827z M267.218,367.611c0-1.607-1.303-2.91-2.91-2.91c-1.607,0-2.91,1.303-2.91,2.91s1.303,2.91,2.91,2.91C265.916,370.521,267.218,369.219,267.218,367.611z M728.181,357.827l-16.667-16.667c-3.887,5.478-6.597,11.847-7.767,18.739h23.575C727.576,359.192,727.861,358.501,728.181,357.827z M769.563,377.396l16.667,16.667c3.886-5.477,6.596-11.846,7.766-18.739h-23.574C770.167,376.031,769.882,376.724,769.563,377.396z M769.561,357.829c0.319,0.673,0.608,1.363,0.861,2.07h23.573c-1.17-6.893-3.882-13.261-7.767-18.738L769.561,357.829z M756.584,389.163v23.572c6.893-1.17,13.26-3.882,18.737-7.767l-16.668-16.668C757.98,388.62,757.291,388.91,756.584,389.163z M748.871,360.746c-3.792,0-6.866,3.074-6.866,6.866s3.074,6.866,6.866,6.866s6.866-3.074,6.866-6.866S752.663,360.746,748.871,360.746z M748.871,292.661c-41.394,0-74.95,33.557-74.95,74.951s33.557,74.951,74.95,74.951c41.395,0,74.951-33.557,74.951-74.951S790.266,292.661,748.871,292.661z M748.871,421.148c-29.567,0-53.536-23.969-53.536-53.536s23.969-53.536,53.536-53.536s53.536,23.969,53.536,53.536S778.438,421.148,748.871,421.148z M937.635,346.594c1.578,1.175-15.13-18.556-25.573-26c-16.99-12.11-155.921-68.603-256.158-80.555c6.725,0.802-17.57-0.149-23.868-4.688c-4.812-3.468-8.588-8.741-13.213-12.36c-14.177-11.093-59.156-48.183-82.261-61.376c-2.465-1.407-6.54-1.828-8.95-2.558c-1.324-0.4-11.122-0.132-8.524,0c-44.285-2.256-106.493-1.794-152.587,10.656c-4.209,1.137-30.368,8.089-48.589,15.344c-5.724,2.278-12.226,4.007-19.18,6.819c-20.012,8.093-38.345,15.188-57.54,23.868c-11.419,5.165-30.696,14.476-28.13,14.065c-1.611,0.257-3.312-2.109-5.967-1.278c-5.653,1.768-11.529,6.517-16.623,8.098c-4.053,1.259-25.214,0.021-31.54-7.246c-6.711-7.708-8.796-3.008-20.033-4.688c9.422,1.408-66.962-4.819-69.474-3.41c-7.891-1.1-3.403,4.299-3.41,5.114c2.299,2.393,3.725,5.662,6.393,7.672c9.392,7.075,35.363,33.205,37.082,34.95c3.051,3.1,5.275,7.363,8.95,9.804c-0.142,0.426-0.284,0.852-0.426,1.278c-5.36,1.6-8.503,7.122-12.786,9.803c-8.165,5.111-14.437,12.33-17.049,23.016c0,6.251,0,12.504,0,18.754c-7.517,0.259-15.208,2.511-21.737,4.263c-4.043,1.084-7.959-0.34-8.098,4.688c-1.802,3.203-0.459,19.141-0.426,24.294c6.73,4.299,14.264,8.488,21.737,12.36c20.915,10.838,14.065,21.312,14.065,21.312h109.806V363c0-40.017,32.44-72.457,72.458-72.457h7.107c40.017,0,72.458,32.44,72.458,72.457v35.593h316.817V363c0-40.017,32.44-72.457,72.458-72.457h8.384c40.018,0,72.458,32.44,72.458,72.457v35.593h37.381c0,0,46.533-0.426,69.9-0.427c2.136-1.928,6.301-4.372-1.279-11.508c3.559,3.35,5.498-17.201,4.688-30.262c0.284,0,0.568,0,0.853,0C943.264,352.759,943.868,351.235,937.635,346.594z M388.168,247.711c-0.261,0-0.521,0-0.783,0c-0.896,0.57-4.825,0.413-4.552,0.416c-24.338-0.919-69.602,2.784-101.15-5.957c-0.821-1.008-1.016-3.081-0.853-3.41c1.89-7.701,14.557-10.835,21.737-14.491c8.349-4.251,54.001-22.514,68.195-24.721C377.049,215.943,387.186,245.746,388.168,247.711c0.023,0,0.047,0,0.069,0C388.261,247.852,388.235,247.846,388.168,247.711z M530.595,248.563c0,0.142,0,0.426,0,0.426H398.893c0,0-12.664-38.209-18.327-50.294c0.753-0.409,0.717-0.536,1.705-0.853c31.656-14.891,97.021-12.814,119.768-11.934c7.472,13.752,13.626,28.483,20.032,43.048c2.401,5.46,8.331,13.33,8.951,19.606C530.879,248.563,530.737,248.563,530.595,248.563z M580.463,248.776c-18.3,0-29.133-0.139-43.901-0.213c-11.222-26.264-24.004-48.287-28.13-61.376c0.658-1.125,1.651-0.93,3.409-0.853c0.641-0.288,2.163-0.012,3.836,0c8.798,0.062,10.622,6.462,16.197,10.655c6.241,4.695,11.165,10.716,16.622,16.196c9.058,9.099,16.826,16.37,25.999,26.426c2.14,2.345,3.659,5.085,5.968,7.246C580.463,247.284,580.463,248.35,580.463,248.776z M621.38,242.596c-3.147,0.942-6.108,0.679-8.951,1.705c-0.562-5.606-5.075-16.551-10.229-17.049c-1.076-0.786-14.896-1.694-16.623-0.853c-1.051,0.52-0.657,0.754-1.705,1.279c2.474,3.117-9.226-5.693-45.605-47.737c-0.716-0.827-3.147-2.229-2.131-3.409c1.079-2.12,6.87-4.115,9.803-4.263c48.404,34.093,66.753,50.191,86.097,66.917C628.61,239.973,624.676,241.609,621.38,242.596z M382.833,248.127c0.095,0.004,0.196,0.006,0.29,0.01C382.95,248.13,382.866,248.128,382.833,248.127z M727.32,375.324h-23.572c1.169,6.894,3.881,13.262,7.766,18.738l16.668-16.668C727.862,376.722,727.573,376.031,727.32,375.324z M748.871,354.992c1.607,0,2.91-1.303,2.91-2.91s-1.303-2.91-2.91-2.91s-2.91,1.303-2.91,2.91S747.264,354.992,748.871,354.992z M775.321,330.255c-5.477-3.885-11.845-6.596-18.737-7.766v23.572c0.707,0.253,1.397,0.542,2.07,0.86L775.321,330.255z M761.49,367.611c0,1.607,1.303,2.91,2.91,2.91s2.91-1.303,2.91-2.91s-1.303-2.91-2.91-2.91S761.49,366.004,761.49,367.611z M736.252,367.611c0-1.607-1.303-2.91-2.91-2.91c-1.606,0-2.91,1.303-2.91,2.91s1.304,2.91,2.91,2.91C734.949,370.521,736.252,369.219,736.252,367.611z M739.09,346.924c0.673-0.319,1.362-0.609,2.069-0.862v-23.572c-6.893,1.17-13.26,3.882-18.737,7.767L739.09,346.924z M748.871,380.23c-1.607,0-2.91,1.303-2.91,2.91s1.303,2.91,2.91,2.91s2.91-1.303,2.91-2.91S750.479,380.23,748.871,380.23z M722.42,404.97c5.478,3.885,11.846,6.596,18.739,7.766v-23.572c-0.707-0.253-1.398-0.542-2.071-0.861L722.42,404.97z" />
  </svg>
);

const PickupIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 16h18a1 1 0 001-1v-3a2 2 0 00-2-2h-3l-3-4H8a2 2 0 00-2 2v1" />
    <path d="M5 14a2 2 0 100 4 2 2 0 000-4z" />
    <path d="M19 14a2 2 0 100 4 2 2 0 000-4z" />
    <path d="M9 16h6" />
    <path d="M4 13l2-1" />
    <path d="M8 9l3 4" />
  </svg>
);

const CATEGORIES = [
  { key: 'SUV', label: 'SUV', icon: Car },
  { key: 'Sedán', label: 'Sedán', icon: CarFront },
  { key: 'Pickup', label: 'Pickup', icon: PickupIcon },
  { key: 'Deportivo', label: 'Deportivo', icon: SportCarIcon },
  { key: 'Eléctrico', label: 'Eléctrico', icon: Battery },
];

const imgUrl = (s: string) => s.match(/url\(([^)]+)\)/)?.[1] || '';

export default function InventoryPage({ vehicles }: Props) {
  const [params] = useSearchParams();
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [search, setSearch] = useState(params.get('search') || '');
  const [brand, setBrand] = useState(params.get('brand') || '');
  const [modelFilter, setModelFilter] = useState(params.get('model') || '');
  const [year, setYear] = useState(params.get('year') || '');
  const [category, setCategory] = useState(params.get('category') || '');
  const [transmission, setTransmission] = useState('');
  const [fuel, setFuel] = useState('');
  const [condition, setCondition] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') || '');
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');
  const [minYearSearch, setMinYearSearch] = useState('');
  const [maxYearSearch, setMaxYearSearch] = useState('');
  const [minYearOpen, setMinYearOpen] = useState(false);
  const [maxYearOpen, setMaxYearOpen] = useState(false);
  const [minYearHi, setMinYearHi] = useState(0);
  const [maxYearHi, setMaxYearHi] = useState(0);
  const [sort, setSort] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const brands = useMemo(() => [...new Set(vehicles.map((v) => v.brand))].sort(), [vehicles]);
  const models = useMemo(() => [...new Set(vehicles.map((v) => v.model))].sort(), [vehicles]);
  const years = useMemo(() => [...new Set(vehicles.map((v) => v.year))].sort((a, b) => b - a), [vehicles]);
  const categories = useMemo(() => [...new Set(vehicles.map((v) => v.category))], [vehicles]);
  const transmissions = useMemo(() => [...new Set(vehicles.map((v) => v.transmission))], [vehicles]);
  const fuels = useMemo(() => [...new Set(vehicles.map((v) => v.fuel))], [vehicles]);

  const filtered = useMemo(() => {
    let results = [...vehicles];

    if (search) {
      const q = search.toLowerCase();
      results = results.filter((v) =>
        v.model.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
      );
    }
    if (brand) results = results.filter((v) => v.brand === brand);
    if (modelFilter) results = results.filter((v) => v.model === modelFilter);
    if (year) results = results.filter((v) => v.year.toString() === year);
    if (category) results = results.filter((v) => v.category === category);
    if (transmission) results = results.filter((v) => v.transmission === transmission);
    if (fuel) results = results.filter((v) => v.fuel === fuel);
    if (condition) results = results.filter((v) => v.condition === condition);
    if (minPrice) { const n = parseInt(minPrice); if (n) results = results.filter((v) => v.price >= n); }
    if (maxPrice) { const n = parseInt(maxPrice); if (n) results = results.filter((v) => v.price <= n); }
    if (minYear) { const n = parseInt(minYear); if (n) results = results.filter((v) => v.year >= n); }
    if (maxYear) { const n = parseInt(maxYear); if (n) results = results.filter((v) => v.year <= n); }

    if (sort === 'price-asc') results.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') results.sort((a, b) => b.price - a.price);
    else if (sort === 'year-desc') results.sort((a, b) => b.year - a.year);
    else if (sort === 'year-asc') results.sort((a, b) => a.year - b.year);
    else if (sort === 'name-asc') results.sort((a, b) => a.model.localeCompare(b.model));
    else if (sort === 'name-desc') results.sort((a, b) => b.model.localeCompare(a.model));

    return results;
  }, [vehicles, search, brand, modelFilter, year, category, transmission, fuel, condition, minPrice, maxPrice, minYear, maxYear, sort]);

  const activeFilterCount = [search, brand, modelFilter, year, category, transmission, fuel, condition, minPrice, maxPrice, minYear, maxYear].filter(Boolean).length;
  const hasFilters = activeFilterCount > 0;

  const clearAll = () => {
    setSearch(''); setBrand(''); setModelFilter(''); setYear(''); setCategory(''); setTransmission('');
    setFuel(''); setCondition(''); setMinPrice(''); setMaxPrice(''); setMinYear(''); setMaxYear('');
    setMinYearSearch(''); setMaxYearSearch(''); setSort(''); setShowAdvanced(false);
  };

  const removeFilter = (key: string) => {
    switch (key) {
      case 'search': setSearch(''); break;
      case 'brand': setBrand(''); break;
      case 'model': setModelFilter(''); break;
      case 'year': setYear(''); break;
      case 'category': setCategory(''); break;
      case 'transmission': setTransmission(''); break;
      case 'fuel': setFuel(''); break;
      case 'condition': setCondition(''); break;
      case 'minPrice': setMinPrice(''); break;
      case 'maxPrice': setMaxPrice(''); break;
      case 'minYear': setMinYear(''); setMinYearSearch(''); break;
      case 'maxYear': setMaxYear(''); setMaxYearSearch(''); break;
    }
  };

  const activeFilters: { key: string; label: string }[] = [];
  if (search) activeFilters.push({ key: 'search', label: `"${search}"` });
  if (brand) activeFilters.push({ key: 'brand', label: brand });
  if (modelFilter) activeFilters.push({ key: 'model', label: modelFilter });
  if (year) activeFilters.push({ key: 'year', label: `Año ${year}` });
  if (category) activeFilters.push({ key: 'category', label: category });
  if (transmission) activeFilters.push({ key: 'transmission', label: transmission });
  if (fuel) activeFilters.push({ key: 'fuel', label: fuel });
  if (condition) activeFilters.push({ key: 'condition', label: condition });
  if (minPrice) activeFilters.push({ key: 'minPrice', label: `Desde $${parseInt(minPrice).toLocaleString()}` });
  if (maxPrice) activeFilters.push({ key: 'maxPrice', label: `Hasta $${parseInt(maxPrice).toLocaleString()}` });
  if (minYear) activeFilters.push({ key: 'minYear', label: `Año ≥ ${minYear}` });
  if (maxYear) activeFilters.push({ key: 'maxYear', label: `Año ≤ ${maxYear}` });

  const mostExpensive = useMemo(() => vehicles.reduce((a, b) => a.price > b.price ? a : b), [vehicles]);
  const cuotaRef = { down: 0.35, term: 60, rate: 0.10 };
  const calcCuota = (price: number) =>
    calculateMonthlyPayment(price, price * cuotaRef.down, cuotaRef.term, cuotaRef.rate);

  return (
    <main className="relative min-h-screen bg-deep/20">
      <LavaLampBg />

      <section className={`relative pt-20 pb-4 md:pt-24 md:pb-6 ${showAdvanced ? 'overflow-visible' : 'overflow-hidden'}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-sport/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-sport/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="max-w-2xl">
            <p className="text-xs text-white/40 uppercase tracking-[0.25em] font-semibold mb-3">INVENTARIO</p>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
              <span className="text-sport">Vehículos</span>
            </h1>
            <p className="text-white/50 text-base md:text-lg max-w-xl mb-6">
              Encuentra el auto perfecto para ti. Explora nuestra selección de {vehicles.length} vehículos nuevos y usados.
            </p>
            <div className="flex gap-3 items-start">
              <div className="relative flex-1 max-w-lg">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por marca, modelo o categoría..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-sport/50 focus:bg-white/[0.07] transition-all" />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <button onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center gap-1.5 px-5 py-3.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${showAdvanced
                  ? 'bg-sport/20 border-sport/50 text-sport'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/[0.08] hover:text-white hover:border-white/20'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                Filtros
                {activeFilterCount > 0 && (
                  <span className="bg-sport text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilterCount > 9 ? '9+' : activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {showAdvanced && (
            <div className="mt-4 p-5 md:p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
              <p className="text-xs text-white/30 font-medium mb-4 tracking-wider uppercase">Filtros avanzados</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                <select value={brand} onChange={(e) => setBrand(e.target.value)} className="select-premium text-sm">
                  <option value="">Todas las marcas</option>
                  {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <select value={modelFilter} onChange={(e) => setModelFilter(e.target.value)} className="select-premium text-sm">
                  <option value="">Todos los modelos</option>
                  {models.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={year} onChange={(e) => setYear(e.target.value)} className="select-premium text-sm">
                  <option value="">Todos los años</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="select-premium text-sm">
                  <option value="">Todas categorías</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className="select-premium text-sm">
                  <option value="">Transmisión</option>
                  {transmissions.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={fuel} onChange={(e) => setFuel(e.target.value)} className="select-premium text-sm">
                  <option value="">Combustible</option>
                  {fuels.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <select value={condition} onChange={(e) => setCondition(e.target.value)} className="select-premium text-sm">
                  <option value="">Nuevo / Usado</option>
                  <option value="Nuevo">Nuevo</option>
                  <option value="Usado">Usado</option>
                </select>
                <div className="flex gap-2 col-span-2">
                  <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Precio mín." className="select-premium text-sm w-full" />
                  <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Precio máx." className="select-premium text-sm w-full" />
                </div>
                <div className="flex gap-2 relative col-span-2 lg:col-span-1">
                  <input type="text" value={minYearSearch} placeholder="Año mín."
                    onChange={(e) => { setMinYearSearch(e.target.value); setMinYear(''); setMinYearOpen(true); setMinYearHi(0); }}
                    onFocus={() => { if (!minYear) { setMinYearOpen(true); setMinYearHi(0); } }}
                    onBlur={() => setMinYearOpen(false)}
                    onKeyDown={(e) => {
                      const items = minYearSearch ? years.filter((y) => y.toString().includes(minYearSearch)) : years;
                      if (!minYearOpen || items.length === 0) { if (e.key === 'Escape') setMinYearOpen(false); return; }
                      if (e.key === 'ArrowDown') { e.preventDefault(); setMinYearHi((i) => Math.min(i + 1, items.length - 1)); }
                      else if (e.key === 'ArrowUp') { e.preventDefault(); setMinYearHi((i) => Math.max(i - 1, 0)); }
                      else if (e.key === 'Tab') { e.preventDefault(); setMinYearHi((i) => (i + 1 >= items.length ? 0 : i + 1)); }
                      else if (e.key === 'Enter') { e.preventDefault(); const v = items[minYearHi]; setMinYear(v.toString()); setMinYearSearch(v.toString()); setMinYearOpen(false); }
                      else if (e.key === 'Escape') { setMinYearOpen(false); }
                    }}
                    className="input-premium text-sm w-full" />
                  <button type="button" tabIndex={-1}
                    onMouseDown={(e) => { e.preventDefault(); setMinYearOpen((p) => { if (!p) setMinYearHi(0); return !p; }); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {minYearOpen && (minYearSearch ? years.filter((y) => y.toString().includes(minYearSearch)) : years).length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-graphite border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                      {(minYearSearch ? years.filter((y) => y.toString().includes(minYearSearch)) : years).map((y, i) => (
                        <button key={y} type="button"
                          onMouseDown={() => { setMinYear(y.toString()); setMinYearSearch(y.toString()); setMinYearOpen(false); }}
                          onMouseEnter={() => setMinYearHi(i)}
                          className={`w-full text-left px-3 py-2.5 text-xs transition-colors border-b border-white/5 last:border-0 ${i === minYearHi ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}>{y}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 relative col-span-2 lg:col-span-1">
                  <input type="text" value={maxYearSearch} placeholder="Año máx."
                    onChange={(e) => { setMaxYearSearch(e.target.value); setMaxYear(''); setMaxYearOpen(true); setMaxYearHi(0); }}
                    onFocus={() => { if (!maxYear) { setMaxYearOpen(true); setMaxYearHi(0); } }}
                    onBlur={() => setMaxYearOpen(false)}
                    onKeyDown={(e) => {
                      const items = maxYearSearch ? years.filter((y) => y.toString().includes(maxYearSearch)) : years;
                      if (!maxYearOpen || items.length === 0) { if (e.key === 'Escape') setMaxYearOpen(false); return; }
                      if (e.key === 'ArrowDown') { e.preventDefault(); setMaxYearHi((i) => Math.min(i + 1, items.length - 1)); }
                      else if (e.key === 'ArrowUp') { e.preventDefault(); setMaxYearHi((i) => Math.max(i - 1, 0)); }
                      else if (e.key === 'Tab') { e.preventDefault(); setMaxYearHi((i) => (i + 1 >= items.length ? 0 : i + 1)); }
                      else if (e.key === 'Enter') { e.preventDefault(); const v = items[maxYearHi]; setMaxYear(v.toString()); setMaxYearSearch(v.toString()); setMaxYearOpen(false); }
                      else if (e.key === 'Escape') { setMaxYearOpen(false); }
                    }}
                    className="input-premium text-sm w-full" />
                  <button type="button" tabIndex={-1}
                    onMouseDown={(e) => { e.preventDefault(); setMaxYearOpen((p) => { if (!p) setMaxYearHi(0); return !p; }); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {maxYearOpen && (maxYearSearch ? years.filter((y) => y.toString().includes(maxYearSearch)) : years).length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-graphite border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                      {(maxYearSearch ? years.filter((y) => y.toString().includes(maxYearSearch)) : years).map((y, i) => (
                        <button key={y} type="button"
                          onMouseDown={() => { setMaxYear(y.toString()); setMaxYearSearch(y.toString()); setMaxYearOpen(false); }}
                          onMouseEnter={() => setMaxYearHi(i)}
                          className={`w-full text-left px-3 py-2.5 text-xs transition-colors border-b border-white/5 last:border-0 ${i === maxYearHi ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}>{y}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 mt-2 relative z-10">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button key={cat.key}
              onClick={() => {
                if (cat.key === 'Eléctrico') {
                  setFuel(fuel === 'Eléctrico' ? '' : 'Eléctrico');
                } else {
                  setCategory(category === cat.key ? '' : cat.key);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${(cat.key === 'Eléctrico' ? fuel === 'Eléctrico' : category === cat.key)
                ? 'bg-sport/20 text-sport'
                : 'bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white'}`}>
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-4 mb-8">
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {activeFilters.map((f) => (
              <span key={f.key} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sport/10 border border-sport/20 rounded-full text-xs text-sport font-medium">
                {f.label}
                <button onClick={() => removeFilter(f.key)} className="hover:text-white transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            ))}
            <button onClick={clearAll} className="text-xs text-white/40 hover:text-white transition-colors underline underline-offset-2 ml-1">
              Limpiar todo
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-white/40">
            <span className="text-white font-semibold">{filtered.length}</span>
            {filtered.length !== 1 ? ' vehículos' : ' vehículo'} encontrado{filtered.length !== 1 ? 's' : ''}
          </p>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="select-premium text-xs py-2 min-w-[150px]">
            <option value="">Ordenar por</option>
            <option value="price-asc">Precio ↓</option>
            <option value="price-desc">Precio ↑</option>
            <option value="year-desc">Año ↓</option>
            <option value="year-asc">Año ↑</option>
            <option value="name-asc">A-Z</option>
            <option value="name-desc">Z-A</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <p className="text-white/50 text-lg mb-2">No encontramos vehículos con esos criterios.</p>
            <p className="text-white/30 text-sm mb-6">Intenta ajustar o limpiar los filtros.</p>
            <button onClick={clearAll} className="btn-outline inline-block text-xs px-6 py-3">
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((v) => {
              const cuota = calcCuota(v.price);
              const isMostExpensive = v.id === mostExpensive.id;
              return (
                <div key={v.id}
                  className={`card-premium group cursor-pointer relative transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/30 ${isMostExpensive ? 'ring-1 ring-sport/40' : ''}`}
                  onClick={() => setSelected(v)}>
                  {isMostExpensive && (
                    <div className="absolute -top-2.5 left-4 z-10 bg-gradient-to-r from-sport to-sport/80 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-sport/30 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      Destacado
                    </div>
                  )}
                  <div className="relative h-44 lg:h-52 flex items-end p-4 overflow-hidden">
                    <div className="absolute inset-0 bg-center bg-cover blur scale-110" style={{ backgroundImage: `url(${imgUrl(v.image)})` }} />
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute inset-0 bg-center bg-contain bg-no-repeat" style={{ backgroundImage: `url(${imgUrl(v.image)})` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    <div className="relative z-10 flex items-end w-full">
                      <div className="flex-1">
                        <p className="text-white/50 text-xs">{v.brand}</p>
                        <p className="text-white font-bold text-lg group-hover:text-sport transition-colors">{v.model}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${v.condition === 'Nuevo' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                        {v.condition}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sport font-bold text-xl">{formatCurrency(v.price)}</p>
                        <p className="text-white/30 text-[11px]">Desde <span className="text-white/60 font-medium">${Math.round(cuota)}/mes</span></p>
                      </div>
                    </div>
                    <div className="flex gap-3 text-[11px] text-white/40 flex-wrap items-center">
                      <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded"><Calendar className="w-3 h-3" />{v.year}</span>
                      <span className="inline-flex items-center gap-1"><Cog className="w-3 h-3" />{v.transmission}</span>
                      <span className="inline-flex items-center gap-1"><Fuel className="w-3 h-3" />{v.fuel}</span>
                      <span className="inline-flex items-center gap-1"><Gauge className="w-3 h-3" />{v.mileage > 0 ? `${v.mileage.toLocaleString()} km` : '0 km'}</span>
                    </div>
                    {v.colorVariants && v.colorVariants.length > 0 && (
                      <div className="flex gap-1 items-center">
                        <span className="w-3 h-3 rounded-full border border-white/20 shrink-0" style={{ background: v.color }} />
                        {v.colorVariants.map((cv, i) => (
                          <span key={i} className="w-3 h-3 rounded-full border border-white/20" style={{ background: cv.color }} />
                        ))}
                      </div>
                    )}
                    <div className="pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="btn-outline w-full text-xs py-2">Ver disponible</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>

        {selected && (
        <VehicleDetailModal vehicle={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}
