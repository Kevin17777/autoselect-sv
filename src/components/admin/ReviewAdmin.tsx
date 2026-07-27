import { useState, useEffect } from 'react';
import type { Review, Vehicle } from '../../types/automotive';
import ConfirmModal from './ConfirmModal';
import AlertModal from './AlertModal';

type Props = {
  reviews: Review[];
  onSave: (reviews: Review[]) => void;
  vehicles?: Vehicle[];
};

export default function ReviewAdmin({ reviews, onSave, vehicles }: Props) {
  const [editing, setEditing] = useState<Review | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [form, setForm] = useState({ name: '', text: '', rating: 5, vehicle: '' });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showForm) setShowForm(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showForm]);

  const sorted = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest': return (b.createdAt || '').localeCompare(a.createdAt || '');
      case 'oldest': return (a.createdAt || '').localeCompare(b.createdAt || '');
      case 'highest': return b.rating - a.rating;
      case 'lowest': return a.rating - b.rating;
      default: return 0;
    }
  });

  const vehicleList = vehicles || [];

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', text: '', rating: 5, vehicle: '' });
    setShowForm(true);
  };

  const openEdit = (r: Review) => {
    setEditing(r);
    setForm({ name: r.name, text: r.text, rating: r.rating, vehicle: r.vehicle });
    setShowForm(true);
  };

  const validate = (): string[] => {
    const errors: string[] = [];
    if (!form.name.trim()) errors.push('El nombre del cliente es requerido');
    if (!form.vehicle.trim()) errors.push('El vehículo es requerido');
    if (form.rating < 1 || form.rating > 5) errors.push('La calificación debe estar entre 1 y 5');
    if (!form.text.trim()) errors.push('El texto de la reseña es requerido');
    if (form.text.length > 1000) errors.push('La reseña no puede exceder 1000 caracteres');
    return errors;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (errors.length > 0) {
      setAlertMsg(errors.join('\n'));
      return;
    }
    const now = new Date().toISOString();
    const updated: Review[] = editing
      ? reviews.map((r) => r.id === editing.id ? { ...form, id: r.id, createdAt: r.createdAt } : r)
      : [...reviews, { ...form, id: `r${Date.now()}`, createdAt: now }];
    onSave(updated);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setConfirmDelete(id);
  };

  const doDelete = () => {
    if (!confirmDelete) return;
    onSave(reviews.filter((r) => r.id !== confirmDelete));
    setConfirmDelete(null);
  };

  const handleDiscard = () => {
    setConfirmDiscard(false);
    setShowForm(false);
  };

  return (
    <>
    <ConfirmModal isOpen={!!confirmDelete} title="Eliminar reseña" message="¿Eliminar esta reseña?" variant="danger" confirmText="Eliminar" onConfirm={doDelete} onCancel={() => setConfirmDelete(null)} />
    <ConfirmModal isOpen={confirmDiscard} title="Descartar cambios" message="¿Descartar cambios?" onConfirm={handleDiscard} onCancel={() => setConfirmDiscard(false)} />
    <AlertModal isOpen={!!alertMsg} title="Error de validación" message={alertMsg || ''} onClose={() => setAlertMsg(null)} />
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h3 className="font-bold text-white text-lg">Reseñas de clientes</h3>
        <div className="flex gap-3 items-center">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="select-premium text-xs py-2.5 w-auto">
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguas</option>
            <option value="highest">Mejor calificadas</option>
            <option value="lowest">Peor calificadas</option>
          </select>
          <button onClick={openNew} className="btn-sport text-sm py-3 px-6">+ Agregar reseña</button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm p-4 py-8" onClick={() => { setConfirmDiscard(true); }}>
          <div className="min-h-full flex items-start md:items-center justify-center">
            <div className="card-premium w-full max-w-lg my-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-white font-bold text-lg">{editing ? 'Editar reseña' : 'Nueva reseña'}</p>
                  <button onClick={() => { setConfirmDiscard(true); }} className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="text-xs text-white/40 block mb-1">Nombre del cliente *</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input-premium text-sm p-3.5 w-full" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 block mb-1">Vehículo *</label>
                    {vehicleList.length > 0 ? (
                      <select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                        required className="select-premium text-sm py-3.5 w-full">
                        <option value="">Seleccionar vehículo...</option>
                        {vehicleList.map((v) => (
                          <option key={v.id} value={`${v.brand} ${v.model} ${v.year}`}>{v.brand} {v.model} {v.year}</option>
                        ))}
                      </select>
                    ) : (
                      <input value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} required className="input-premium text-sm p-3.5 w-full" placeholder="Ej: Toyota Hilux 2024" />
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-white/40 block mb-1">Calificación *</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all text-lg ${
                            n <= form.rating ? 'text-sport' : 'text-white/20'
                          }`}>
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/40 block mb-1">Texto de la reseña *</label>
                    <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} required rows={3} maxLength={1000}
                      className="input-premium text-sm p-3.5 resize-none w-full" />
                    <p className="text-[10px] text-white/20 text-right mt-1">{form.text.length}/1000</p>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => { setConfirmDiscard(true); }}
                      className="border border-white/20 text-white/60 hover:bg-white/5 px-6 py-2.5 rounded-xl text-sm transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" className="btn-sport text-sm py-2.5 px-8">
                      {editing ? 'Guardar cambios' : 'Agregar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">⭐</p>
          <p className="text-white/30 text-sm">No hay reseñas todavía.</p>
          <button onClick={openNew} className="btn-sport text-sm py-2.5 px-6 mt-4 inline-block">
            + Agregar primera reseña
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sorted.map((r) => (
            <div key={r.id} className="glass-panel p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-semibold text-sm">{r.name}</p>
                  <p className="text-white/30 text-xs">{r.vehicle}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <svg key={j} className="w-3 h-3 text-sport" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">"{r.text}"</p>
              <div className="flex gap-2 pt-1">
                <button onClick={() => openEdit(r)}
                  className="flex-1 border border-white/20 text-white/70 hover:bg-white/10 py-2 rounded-lg text-xs transition-colors">
                  Editar
                </button>
                <button onClick={() => handleDelete(r.id)}
                  className="border border-sport/30 text-sport hover:bg-sport/10 py-2 rounded-lg text-xs transition-colors px-4">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
