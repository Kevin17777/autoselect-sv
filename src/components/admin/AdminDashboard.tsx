import { useState } from 'react';
import type { Vehicle, TestDriveRequest } from '../../types/automotive';
import { formatCurrency } from '../../utils/formatCurrency';
import { loadVehicles, loadRequests, loadCompany, loadReviews, saveVehicles, saveRequests, saveCompany, saveReviews } from '../../utils/storage';
import ConfirmModal from './ConfirmModal';

type Props = {
  vehicles: Vehicle[];
  requests: TestDriveRequest[];
  onDeleteRequest: (id: string) => void;
  onToggleRequest: (id: string) => void;
};

function exportData() {
  const data = {
    vehicles: loadVehicles(),
    requests: loadRequests(),
    company: loadCompany(),
    reviews: loadReviews(),
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `autoselect-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!window.confirm('¿Restaurar respaldo? Los datos actuales serán reemplazados.')) return;
        let ok = true;
        if (data.vehicles) ok = saveVehicles(data.vehicles) && ok;
        if (data.requests) ok = saveRequests(data.requests) && ok;
        if (data.company) ok = saveCompany(data.company) && ok;
        if (data.reviews) ok = saveReviews(data.reviews) && ok;
        if (ok) {
          alert('Datos restaurados correctamente. Recargando...');
          window.location.reload();
        }
      } catch {
        alert('Archivo inválido');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function csvEscape(v: unknown): string {
  const s = String(v ?? '');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const bom = '\uFEFF';
  const csv = bom + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard({ vehicles, requests, onDeleteRequest, onToggleRequest }: Props) {
  const [selectedReq, setSelectedReq] = useState<TestDriveRequest | null>(null);
  const [requestSearch, setRequestSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const totalVehicles = vehicles.length;
  const featured = vehicles.filter((v) => v.featured).length;
  const brands = [...new Set(vehicles.map((v) => v.brand))].length;
  const avgPrice = totalVehicles ? Math.round(vehicles.reduce((s, v) => s + v.price, 0) / totalVehicles) : 0;
  const suvs = vehicles.filter((v) => v.category === 'SUV').length;
  const pickups = vehicles.filter((v) => v.category === 'Pickup').length;
  const newVehicles = vehicles.filter((v) => v.condition === 'Nuevo').length;
  const used = vehicles.filter((v) => v.condition === 'Usado').length;
  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => !r.completed).length;
  const todayRequests = requests.filter((r) => r.date === new Date().toISOString().split('T')[0]).length;

  const today = new Date().toISOString().split('T')[0];

  const filtered = requestSearch
    ? requests.filter((r) =>
        r.customerName.toLowerCase().includes(requestSearch.toLowerCase()) ||
        r.vehicleName.toLowerCase().includes(requestSearch.toLowerCase()) ||
        r.phone.includes(requestSearch)
      )
    : requests;

  const sorted = [...filtered].sort((a, b) => {
    const aIsToday = a.date === today ? 0 : 1;
    const bIsToday = b.date === today ? 0 : 1;
    if (aIsToday !== bIsToday) return aIsToday - bIsToday;
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    const tomStr = tom.toISOString().split('T')[0];
    const aIsTomorrow = a.date === tomStr;
    const bIsTomorrow = b.date === tomStr;
    if (aIsTomorrow !== bIsTomorrow) return aIsTomorrow ? -1 : 1;
    const aCreated = a.createdAt || '';
    const bCreated = b.createdAt || '';
    if (aCreated || bCreated) return bCreated.localeCompare(aCreated);
    const da = `${a.date}T${a.time || '00:00'}`;
    const db = `${b.date}T${b.time || '00:00'}`;
    return db.localeCompare(da);
  });

  const brandDist = [...new Set(vehicles.map((v) => v.brand))].slice(0, 6);
  const maxBrandCount = Math.max(...brandDist.map((b) => vehicles.filter((v) => v.brand === b).length), 1);

  const categoryDist = ['SUV', 'Sedán', 'Pickup', 'Deportivo'] as const;
  const catColors = ['text-purple-400', 'text-blue-400', 'text-orange-400', 'text-sport'];
  const catBarColors = ['bg-purple-500', 'bg-blue-500', 'bg-orange-500', 'bg-sport'];

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const doDelete = () => {
    if (!deleteId) return;
    onDeleteRequest(deleteId);
    setDeleteId(null);
    showToast('Solicitud eliminada');
  };

  const handleToggle = (id: string) => {
    onToggleRequest(id);
    showToast('Estado actualizado');
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-24 right-8 z-50 bg-sport text-white text-sm px-5 py-3 rounded-xl shadow-2xl animate-fade-in-down">
          {toast}
        </div>
      )}
      <ConfirmModal isOpen={!!deleteId} title="Eliminar solicitud" message="¿Eliminar esta solicitud?" variant="danger" confirmText="Eliminar" onConfirm={doDelete} onCancel={() => setDeleteId(null)} />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Total vehículos', value: totalVehicles.toString(), color: 'text-sport' },
          { label: 'Destacados', value: featured.toString(), color: 'text-yellow-400' },
          { label: 'Marcas', value: brands.toString(), color: 'text-blue-400' },
          { label: 'Precio prom.', value: formatCurrency(avgPrice), color: 'text-coin-green' },
          { label: 'Solicitudes', value: totalRequests.toString(), color: 'text-purple-400' },
          { label: 'Pendientes', value: pendingRequests.toString(), color: 'text-orange-400' },
          { label: 'Hoy', value: todayRequests.toString(), color: 'text-emerald-400' },
          { label: 'SUV/Pickup', value: `${suvs}/${pickups}`, color: 'text-white/60' },
        ].map((m) => (
          <div key={m.label} className="glass-panel p-3 text-center">
            <p className={`font-black text-xl md:text-2xl ${m.color}`}>{m.value}</p>
            <p className="text-white/40 text-[9px] uppercase tracking-wider mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="glass-panel p-5 space-y-4">
          <h4 className="text-white font-bold text-sm">Distribución por condición</h4>
          <div className="flex h-4 rounded-full overflow-hidden">
            <div className="bg-sport transition-all" style={{ width: `${totalVehicles ? (newVehicles / totalVehicles) * 100 : 0}%` }} />
            <div className="bg-white/20 transition-all" style={{ width: `${totalVehicles ? (used / totalVehicles) * 100 : 0}%` }} />
          </div>
          <div className="flex justify-between text-xs text-white/40">
            <span><span className="text-sport">●</span> Nuevos ({newVehicles})</span>
            <span><span className="text-white/40">●</span> Usados ({used})</span>
          </div>

          <h4 className="text-white font-bold text-sm pt-2">Distribución por categoría</h4>
          <div className="space-y-2">
            {categoryDist.map((cat, i) => {
              const count = vehicles.filter((v) => v.category === cat).length;
              const pct = totalVehicles ? (count / totalVehicles) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className={catColors[i]}>{cat}</span>
                    <span className="text-white/40">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className={`${catBarColors[i]} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <h4 className="text-white font-bold text-sm pt-2">Top marcas</h4>
          <div className="space-y-2">
            {brandDist.map((b) => {
              const count = vehicles.filter((v) => v.brand === b).length;
              return (
                <div key={b}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-white/70">{b}</span>
                    <span className="text-white/40">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="bg-sport h-full rounded-full transition-all" style={{ width: `${(count / maxBrandCount) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 glass-panel p-5">
          <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
            <h4 className="text-white font-bold text-sm">
              Solicitudes
              <span className="ml-2 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">{pendingRequests} pendientes</span>
              {todayRequests > 0 && (
                <span className="ml-1.5 text-[10px] bg-sport/20 text-sport px-2 py-0.5 rounded-full">{todayRequests} hoy</span>
              )}
            </h4>
            <input value={requestSearch} onChange={(e) => setRequestSearch(e.target.value)}
              placeholder="Buscar por nombre, vehículo o teléfono…"
              className="input-premium text-xs py-2 w-full sm:w-56" />
          </div>
          {requests.length === 0 ? (
            <p className="text-white/30 text-sm">Sin solicitudes por ahora.</p>
          ) : filtered.length === 0 ? (
            <p className="text-white/30 text-sm">Ninguna solicitud coincide con la búsqueda.</p>
          ) : (
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto scrollbar-none" style={{ overscrollBehavior: 'contain' }}>
              {sorted.map((r) => {
                const isToday = r.date === today;
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowStr = tomorrow.toISOString().split('T')[0];
                const isTomorrow = r.date === tomorrowStr;
                const isPast = r.date < today && !r.completed;
                const isSoon = (isToday || isTomorrow) && !r.completed;
                return (
                  <div key={r.id}
                    className={`text-xs border-b border-white/5 pb-2 transition-colors ${
                      r.completed ? 'opacity-40' : ''
                    } ${isToday ? 'bg-sport/[0.07] rounded-lg' : isTomorrow && !r.completed ? 'bg-amber-500/[0.07] rounded-lg' : isPast ? 'opacity-60' : ''}`}>
                    <div onClick={() => setSelectedReq(selectedReq?.id === r.id ? null : r)} className={`cursor-pointer ${isSoon ? 'px-4 py-2' : 'px-2 py-2 hover:bg-white/5 rounded-lg'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {r.completed && <span className="text-emerald-400 text-[10px]">✓</span>}
                          {isPast && <span className="text-[9px] bg-white/10 text-white/40 px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider">Vencida</span>}
                          {isSoon && <span className="w-1.5 h-1.5 rounded-full bg-sport animate-pulse" />}
                          <span className={`font-semibold ${isToday ? 'text-white' : isTomorrow ? 'text-amber-300' : 'text-white/70'} ${r.completed ? 'line-through' : ''}`}>
                            {r.customerName}
                          </span>
                          {isTomorrow && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider">Mañana</span>}
                        </div>
                        <span className={`whitespace-nowrap ${isToday ? 'text-sport font-medium' : isTomorrow ? 'text-amber-400 font-medium' : isPast ? 'text-white/40' : 'text-white/30'}`}>
                          {r.date === today ? `Hoy ${r.time || ''}` : isTomorrow ? `Mañana ${r.time || ''}` : isPast ? `${r.date} (vencida)` : `${r.date} ${r.time || ''}`}
                        </span>
                      </div>
                      <p className={isToday ? 'text-sport/70' : isTomorrow ? 'text-amber-300/60' : isPast ? 'text-white/30' : 'text-white/40'}>{r.vehicleName}</p>
                      {selectedReq?.id === r.id && (
                        <div className="mt-2 pt-2 border-t border-white/10 space-y-1 text-white/50">
                          <p><span className="text-white/30">Teléfono:</span> {r.phone}</p>
                          {r.message && <p><span className="text-white/30">Nota:</span> {r.message}</p>}
                          <div className="flex gap-2 pt-2">
                            <button onClick={(e) => { e.stopPropagation(); handleToggle(r.id); }}
                              className={`text-[10px] px-3 py-1 rounded-lg border transition-colors ${
                                r.completed ? 'border-white/20 text-white/50' : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                              }`}>
                              {r.completed ? 'Reabrir' : 'Marcar completada'}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                              className="text-[10px] px-3 py-1 rounded-lg border border-sport/30 text-sport hover:bg-sport/10 transition-colors">
                              Eliminar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-end pt-4 border-t border-white/5 items-center">
        <div className="flex gap-2 mr-auto">
          <button onClick={() => downloadCsv(`vehiculos-${new Date().toISOString().split('T')[0]}.csv`,
            ['Marca', 'Modelo', 'Año', 'Precio', 'Kilometraje', 'Transmisión', 'Combustible', 'Categoría', 'Condición', 'Status', 'Destacado'],
            vehicles.map((v) => [v.brand, v.model, String(v.year), String(v.price), String(v.mileage), v.transmission, v.fuel, v.category, v.condition, v.status || 'available', v.featured ? 'Sí' : 'No'].map(csvEscape))
          )}
            className="border border-white/10 text-white/30 hover:text-white/70 hover:bg-white/5 py-2 px-3 rounded-lg text-xs transition-colors">
            CSV Vehículos
          </button>
          <button onClick={() => downloadCsv(`solicitudes-${new Date().toISOString().split('T')[0]}.csv`,
            ['Cliente', 'Vehículo', 'Teléfono', 'Mensaje', 'Fecha', 'Hora', 'Completada'],
            requests.map((r) => [r.customerName, r.vehicleName, r.phone, r.message, r.date, r.time || '', r.completed ? 'Sí' : 'No'].map(csvEscape))
          )}
            className="border border-white/10 text-white/30 hover:text-white/70 hover:bg-white/5 py-2 px-3 rounded-lg text-xs transition-colors">
            CSV Solicitudes
          </button>
        </div>
        <button onClick={exportData} className="border border-white/20 text-white/50 hover:text-white hover:bg-white/5 py-2 px-4 rounded-lg text-xs transition-colors">
          Exportar respaldo
        </button>
        <button onClick={importData} className="border border-white/20 text-white/50 hover:text-white hover:bg-white/5 py-2 px-4 rounded-lg text-xs transition-colors">
          Importar respaldo
        </button>
      </div>
    </div>
  );
}
