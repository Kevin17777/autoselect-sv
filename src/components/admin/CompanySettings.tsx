import { useState } from 'react';
import type { CompanyInfo } from '../../types/automotive';
import { resetVehicles } from '../../utils/storage';

type Props = { company: CompanyInfo; onSave: (c: CompanyInfo) => void };

export default function CompanySettings({ company, onSave }: Props) {
  const [form, setForm] = useState(company);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const validate = (): string[] => {
    const errors: string[] = [];
    if (!form.name.trim()) errors.push('El nombre del negocio es requerido');
    if (!form.phone.trim()) errors.push('El teléfono es requerido');
    if (!form.email.trim()) errors.push('El email es requerido');
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.push('Email inválido');
    if (form.facebook && !form.facebook.startsWith('http')) errors.push('Facebook debe ser una URL válida (https://...)');
    if (form.instagram && !form.instagram.startsWith('http')) errors.push('Instagram debe ser una URL válida (https://...)');
    return errors;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
    onSave(form);
    showToast('Guardado');
  };

  const addBranch = () => {
    setForm({ ...form, branches: [...form.branches, { name: '', address: '' }] });
  };

  const removeBranch = (i: number) => {
    if (!confirm('¿Eliminar esta sucursal?')) return;
    setForm({ ...form, branches: form.branches.filter((_, idx) => idx !== i) });
  };

  const updateBranch = (i: number, field: 'name' | 'address', value: string) => {
    const next = [...form.branches];
    next[i] = { ...next[i], [field]: value };
    setForm({ ...form, branches: next });
  };

  const handleReset = () => {
    if (!confirm('¿Restaurar vehículos a los valores iniciales? Se perderán los cambios personalizados.')) return;
    resetVehicles();
    showToast('Vehículos restaurados. Recargando...');
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="card-premium p-6">
      {toast && (
        <div className="fixed top-24 right-8 z-50 bg-sport text-white text-sm px-5 py-3 rounded-xl shadow-2xl animate-fade-in-down">
          {toast}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-white text-lg">Configuración de la empresa</h3>
      </div>
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-xs text-white/40 block mb-1">Nombre del negocio *</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input-premium text-xs w-full" />
        </div>
        <div>
          <label className="text-xs text-white/40 block mb-1">Teléfono *</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="input-premium text-xs w-full" placeholder="+503 XXXX XXXX" />
        </div>
        <div>
          <label className="text-xs text-white/40 block mb-1">WhatsApp</label>
          <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="input-premium text-xs w-full" placeholder="+503 XXXX XXXX" />
        </div>
        <div>
          <label className="text-xs text-white/40 block mb-1">Email *</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="input-premium text-xs w-full" placeholder="info@ejemplo.com" />
        </div>
        <div>
          <label className="text-xs text-white/40 block mb-1">Dirección</label>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-premium text-xs w-full" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-white/40 block mb-1">Horarios</label>
          <input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} className="input-premium text-xs w-full" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-white/40 block mb-1">Logo</label>
          <div className="flex gap-3 items-start">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
              {form.logo ? (
                <img src={form.logo} alt="logo" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <input value={form.logo || ''} onChange={(e) => setForm({ ...form, logo: e.target.value })} className="input-premium text-xs flex-1" placeholder="URL del logo" />
                {form.logo && <button type="button" onClick={() => setForm({ ...form, logo: '' })} className="text-sport text-xs hover:underline">Quitar</button>}
              </div>
              <label className="flex items-center justify-center gap-2 border border-dashed border-white/20 rounded-lg px-3 py-2 cursor-pointer hover:border-white/40 transition-colors text-xs text-white/40">
                Subir logo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 500 * 1024) {
                      alert('La imagen es muy grande. Máximo 500KB.');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (ev) => setForm({ ...form, logo: ev.target?.result as string });
                    reader.readAsDataURL(file);
                  }
                  e.target.value = '';
                }} />
              </label>
            </div>
          </div>
        </div>
        <div>
          <label className="text-xs text-white/40 block mb-1">Facebook (URL)</label>
          <input value={form.facebook || ''} onChange={(e) => setForm({ ...form, facebook: e.target.value })} className="input-premium text-xs w-full" placeholder="https://facebook.com/..." />
        </div>
        <div>
          <label className="text-xs text-white/40 block mb-1">Instagram (URL)</label>
          <input value={form.instagram || ''} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className="input-premium text-xs w-full" placeholder="https://instagram.com/..." />
        </div>
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-white/40 block">Sucursales</label>
            <button type="button" onClick={addBranch} className="text-sport text-xs hover:underline">+ Agregar sucursal</button>
          </div>
          <div className="space-y-2">
            {form.branches.map((b, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input value={b.name} onChange={(e) => updateBranch(i, 'name', e.target.value)}
                    className="input-premium text-xs p-3" placeholder="Nombre de sucursal" />
                  <input value={b.address} onChange={(e) => updateBranch(i, 'address', e.target.value)}
                    className="input-premium text-xs p-3" placeholder="Dirección" />
                </div>
                <button type="button" onClick={() => removeBranch(i)}
                  className="text-sport/60 hover:text-sport p-2 mt-1">&times;</button>
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-2 flex justify-between items-center pt-2 border-t border-white/5 mt-2">
          <button type="button" onClick={handleReset} className="text-xs text-white/30 hover:text-sport transition-colors">
            Restaurar vehículos iniciales
          </button>
          <button type="submit" className="btn-sport text-xs py-2.5 px-8">
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
