import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Vehicle } from '../../types/automotive';
import { formatCurrency } from '../../utils/formatCurrency';
import ConfirmModal from './ConfirmModal';
import AlertModal from './AlertModal';

type Props = { vehicles: Vehicle[]; onSave: (v: Vehicle[]) => void };

const defaultImage = 'linear-gradient(135deg, #2D2D2D, #1a1a1a)';
const currentYear = new Date().getFullYear();

export default function VehicleAdmin({ vehicles: allVehicles, onSave }: Props) {
  const [searchParams] = useSearchParams();
  const initialBrand = searchParams.get('brand') || '';
  const initialCategory = searchParams.get('category') || '';

  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [brandFilter, setBrandFilter] = useState(initialBrand);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [searchText, setSearchText] = useState('');
  const [showVariantWarning, setShowVariantWarning] = useState(false);
  const [dontShowVariantWarning, setDontShowVariantWarning] = useState(() => localStorage.getItem('admin_hide_variant_warning') === 'true');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const perPage = 12;
  const formRef = useRef<HTMLFormElement>(null);

  const [toast, setToast] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ show: boolean; title: string; message: string; variant?: 'danger' | 'default'; onConfirm: () => void }>({ show: false, title: '', message: '', onConfirm: () => {} });
  const [alert, setAlert] = useState<{ show: boolean; title: string; message: string }>({ show: false, title: '', message: '' });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirm.show || alert.show) return;
        if (showForm) setShowForm(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [confirm.show, alert.show, showForm]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const brands = [...new Set(allVehicles.map((v) => v.brand))].sort();
  const categories = [...new Set(allVehicles.map((v) => v.category))];

  const knownBrands = [...new Set([...brands, 'Toyota', 'Honda', 'Nissan', 'Mazda', 'Kia', 'Hyundai', 'BMW', 'Mercedes-Benz', 'Audi', 'Tesla', 'Ford', 'Chevrolet', 'Mitsubishi', 'Suzuki', 'Volkswagen', 'Jeep', 'Subaru', 'Lexus', 'Volvo'])];

  const filtered = allVehicles.filter((v) => {
    if (brandFilter && v.brand !== brandFilter) return false;
    if (categoryFilter && v.category !== categoryFilter) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      if (!v.brand.toLowerCase().includes(q) && !v.model.toLowerCase().includes(q) && !v.year.toString().includes(q)) return false;
    }
    return true;
  });

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, pages - 1);
  const paged = filtered.slice(safePage * perPage, (safePage + 1) * perPage);

  useEffect(() => { setPage(0); }, [brandFilter, categoryFilter, searchText]);

  const getModelsByBrand = (brand: string) => {
    const existing = [...new Set(allVehicles.filter((v) => v.brand === brand).map((v) => v.model))];
    return existing.length ? existing : undefined;
  };

  const [form, setForm] = useState<{
    brand: string; model: string; year: number | ''; price: number | ''; mileage: number | '';
    transmission: string; fuel: string; category: string; color: string; condition: string;
    description: string; featured: boolean; isNewArrival: boolean; image: string; status: string;
    colorVariants: { color: string; image: string; price?: number; mileage?: number }[];
  }>({
    brand: '', model: '', year: '', price: '', mileage: '',
    transmission: 'Automática', fuel: 'Gasolina',
    category: 'SUV', color: '#0A0A0A', condition: 'Usado',
    description: '', featured: false, isNewArrival: false, image: '', status: 'available',
    colorVariants: [],
  });

  const resetForm = () => {
    setForm({ brand: '', model: '', year: '', price: '', mileage: '', transmission: 'Automática', fuel: 'Gasolina', category: 'SUV', color: '#0A0A0A', condition: 'Usado', description: '', featured: false, isNewArrival: false, image: '', status: 'available', colorVariants: [] });
  };

  const openNew = () => {
    setEditing(null);
    resetForm();
    setShowForm(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({ brand: v.brand, model: v.model, year: v.year, price: v.price, mileage: v.mileage, transmission: v.transmission, fuel: v.fuel, category: v.category, color: v.color, condition: v.condition, description: v.description, featured: v.featured, isNewArrival: v.isNewArrival || false, image: v.image, status: v.status || 'available', colorVariants: v.colorVariants || [] });
    setShowForm(true);
  };

  const openDuplicate = (v: Vehicle) => {
    setEditing(null);
    setForm({ brand: v.brand, model: v.model, year: v.year, price: v.price, mileage: v.mileage, transmission: v.transmission, fuel: v.fuel, category: v.category, color: v.color, condition: v.condition, description: v.description, featured: false, isNewArrival: false, image: v.image, status: 'available', colorVariants: v.colorVariants || [] });
    setShowForm(true);
  };

  const validate = (): string[] => {
    const errors: string[] = [];
    if (!form.brand.trim()) errors.push('La marca es requerida');
    if (!form.model.trim()) errors.push('El modelo es requerido');
    if (form.year === '' || form.year < 1900 || form.year > currentYear + 1) errors.push(`El año debe estar entre 1900 y ${currentYear + 1}`);
    if (form.price === '' || form.price < 0) errors.push('El precio debe ser un número positivo');
    if (form.mileage === '' || form.mileage < 0) errors.push('El kilometraje no puede ser negativo');
    return errors;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (errors.length > 0) {
      setAlert({ show: true, title: 'Errores de validación', message: errors.join('\n') });
      return;
    }
    const img = form.image || editing?.image || defaultImage;
    const now = new Date().toISOString();
    const vehicle = {
      id: editing?.id || `v${Date.now()}`,
      brand: form.brand.trim(), model: form.model.trim(), year: form.year === '' ? currentYear : form.year,
      price: form.price === '' ? 0 : form.price, mileage: form.mileage === '' ? 0 : form.mileage,
      transmission: form.transmission as Vehicle['transmission'],
      fuel: form.fuel as Vehicle['fuel'], category: form.category as Vehicle['category'],
      color: form.color, condition: form.condition as Vehicle['condition'],
      description: form.description, featured: form.featured,
      isNewArrival: form.isNewArrival, image: img, status: form.status,
      createdAt: editing?.createdAt || now, updatedAt: now,
      colorVariants: form.colorVariants.filter((cv) => cv.color && cv.image),
    } as Vehicle;
    const updated = editing
      ? allVehicles.map((v) => (v.id === editing.id ? vehicle : v))
      : [...allVehicles, vehicle];
    onSave(updated);
    setShowForm(false);
    showToast(editing ? 'Vehículo actualizado' : 'Vehículo creado');
  };

  const handleDelete = (id: string) => {
    setConfirm({ show: true, title: 'Eliminar vehículo', message: '¿Estás seguro de eliminar este vehículo? Esta acción no se puede deshacer.', variant: 'danger', onConfirm: () => {
      onSave(allVehicles.filter((v) => v.id !== id));
      setConfirm({ show: false, title: '', message: '', onConfirm: () => {} });
      showToast('Auto eliminado');
    }});
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paged.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paged.map((v) => v.id)));
    }
  };

  const bulkDelete = () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    setConfirm({ show: true, title: 'Eliminar vehículos', message: `¿Estás seguro de eliminar ${count} vehículo${count !== 1 ? 's' : ''}? Esta acción no se puede deshacer.`, variant: 'danger', onConfirm: () => {
      onSave(allVehicles.filter((v) => !selectedIds.has(v.id)));
      showToast(count === 1 ? 'Auto eliminado' : `${count} autos eliminados`);
      setSelectedIds(new Set());
      setConfirm({ show: false, title: '', message: '', onConfirm: () => {} });
    }});
  };

  const bulkFeature = () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    const allSelectedFeatured = paged.filter((v) => selectedIds.has(v.id)).every((v) => v.featured);
    const action = allSelectedFeatured ? 'quitar destacados' : 'destacar';

    if (count > 3) {
      setConfirm({ show: true, title: allSelectedFeatured ? 'Quitar destacados' : 'Destacar vehículos', message: `¿Estás seguro de ${action} ${count} vehículos?`, variant: 'default', onConfirm: () => {
        doBulkFeature(allSelectedFeatured, count);
      }});
    } else {
      doBulkFeature(allSelectedFeatured, count);
    }
  };

  const doBulkFeature = (allSelectedFeatured: boolean, count: number) => {
    onSave(allVehicles.map((v) => selectedIds.has(v.id) ? { ...v, featured: !allSelectedFeatured } : v));
    setSelectedIds(new Set());
    setConfirm({ show: false, title: '', message: '', onConfirm: () => {} });
    if (allSelectedFeatured) {
      showToast(count === 1 ? 'Destacado quitado' : `${count} destacados quitados`);
    } else {
      showToast(count === 1 ? 'Auto destacado' : `${count} autos destacados`);
    }
  };

  const handleToggleFeatured = (id: string) => {
    onSave(allVehicles.map((v) => v.id === id ? { ...v, featured: !v.featured } : v));
    showToast('Actualizado');
  };

  const addVariant = () => {
    if (!dontShowVariantWarning) {
      setShowVariantWarning(true);
      return;
    }
    doAddVariant();
  };

  const doAddVariant = () => {
    setForm({ ...form, colorVariants: [...form.colorVariants, { color: '#0A0A0A', image: '', price: undefined, mileage: undefined }] });
  };

  const removeVariant = (i: number) => {
    setForm({ ...form, colorVariants: form.colorVariants.filter((_, idx) => idx !== i) });
  };

  const updateVariant = (i: number, field: 'color' | 'image' | 'price' | 'mileage', value: string | number | undefined) => {
    const next = [...form.colorVariants];
    const item = { ...next[i] };
    if (field === 'price') item.price = value === '' ? undefined : (value as number);
    else if (field === 'mileage') item.mileage = value === '' ? undefined : (value as number);
    else (item as any)[field] = value;
    next[i] = item;
    setForm({ ...form, colorVariants: next });
  };

  const allSelectedFeatured = selectedIds.size > 0 && paged.filter((v) => selectedIds.has(v.id)).every((v) => v.featured);

  const confirmCancelForm = () => {
    setConfirm({ show: true, title: 'Descartar cambios', message: '¿Estás seguro de descartar los cambios? Los datos no guardados se perderán.', variant: 'default', onConfirm: () => {
      setShowForm(false);
      setConfirm({ show: false, title: '', message: '', onConfirm: () => {} });
    }});
  };

  return (
    <div className="space-y-8">
      <ConfirmModal isOpen={confirm.show} title={confirm.title} message={confirm.message}
        variant={confirm.variant} onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm({ ...confirm, show: false })} />

      <AlertModal isOpen={alert.show} title={alert.title} message={alert.message}
        onClose={() => setAlert({ show: false, title: '', message: '' })} />

      {toast && (
        <div className="fixed top-24 right-8 z-50 bg-sport text-white text-sm px-5 py-3 rounded-xl shadow-2xl animate-fade-in-down">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="space-y-3 w-full sm:w-auto">
          <div className="w-full sm:w-96">
            <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Buscar por marca, modelo o año…" className="input-premium text-sm py-3 w-full" />
          </div>
          <div className="flex gap-3">
            <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="select-premium text-sm py-3 w-auto">
              <option value="">Todas las marcas</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="select-premium text-sm py-3 w-auto">
              <option value="">Todas categorías</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {selectedIds.size > 0 && (
            <>
              <span className="text-xs text-white/40">{selectedIds.size} seleccionados</span>
              <button onClick={bulkFeature} className="border border-white/20 text-white/70 hover:bg-white/10 py-2 px-3 rounded-lg text-xs transition-colors">
                {allSelectedFeatured ? 'Quitar destacados' : 'Destacar'}
              </button>
              <button onClick={bulkDelete} className="border border-sport/30 text-sport hover:bg-sport/10 py-2 px-3 rounded-lg text-xs transition-colors">
                Eliminar
              </button>
            </>
          )}
          <button onClick={openNew} className="btn-sport text-sm py-3 px-6">
            + Agregar vehículo
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm p-4 py-8" onClick={confirmCancelForm}>
          <div className="min-h-full flex items-start md:items-center justify-center">
            <div className="card-premium w-full max-w-3xl my-auto" onClick={(e) => e.stopPropagation()}>
              <div className="relative h-40" style={{ background: form.image || defaultImage }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-4 left-5 z-10">
                  <p className="text-white/50 text-xs uppercase tracking-wider">{editing ? 'Editando' : 'Nuevo vehículo'}</p>
                  <p className="text-white font-bold text-xl">{form.brand} {form.model || '(sin modelo)'}</p>
                </div>
                <button onClick={confirmCancelForm} className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form ref={formRef} onSubmit={handleSave} className="p-6 space-y-6">
                <div className="space-y-3">
                  <p className="text-xs text-white/40 uppercase tracking-[0.2em] font-medium">Información básica</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-white/40 block mb-1">Marca *</label>
                      <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value, model: '' })}
                        list="brand-suggestions" required className="input-premium text-sm p-3.5" placeholder="Ej: Toyota" />
                      <datalist id="brand-suggestions">
                        {knownBrands.map((b) => <option key={b} value={b} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="text-[11px] text-white/40 block mb-1">Modelo *</label>
                      <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })}
                        list={form.brand ? `model-suggestions-${form.brand}` : undefined}
                        required className="input-premium text-sm p-3.5" placeholder="Ej: Hilux SRV" />
                      {form.brand && (
                        <datalist id={`model-suggestions-${form.brand}`}>
                          {(getModelsByBrand(form.brand) || []).map((m) => <option key={m} value={m} />)}
                        </datalist>
                      )}
                    </div>
                    <div>
                      <label className="text-[11px] text-white/40 block mb-1">Año *</label>
                      <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value === '' ? '' : +e.target.value })}
                        min={1900} max={currentYear + 1} list="year-suggestions" className="input-premium text-sm p-3.5" />
                      <datalist id="year-suggestions">
                        {Array.from({ length: 16 }, (_, i) => currentYear + 1 - i).map((y) => <option key={y} value={y} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="text-[11px] text-white/40 block mb-1">Precio (USD) *</label>
                      <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value === '' ? '' : +e.target.value })}
                        min={0} required className="input-premium text-sm p-3.5" placeholder="0" />
                    </div>
                    <div>
                      <label className="text-[11px] text-white/40 block mb-1">Kilometraje</label>
                      <input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value === '' ? '' : +e.target.value })}
                        min={0} className="input-premium text-sm p-3.5" placeholder="0 = nuevo" />
                    </div>
                    <div>
                      <label className="text-[11px] text-white/40 block mb-1">Condición</label>
                      <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="select-premium text-sm py-3.5">
                        <option>Nuevo</option><option>Usado</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-white/40 uppercase tracking-[0.2em] font-medium">Especificaciones</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] text-white/40 block mb-1">Transmisión</label>
                      <select value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })} className="select-premium text-sm py-3.5">
                        <option>Automática</option><option>Manual</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-white/40 block mb-1">Combustible</label>
                      <select value={form.fuel} onChange={(e) => setForm({ ...form, fuel: e.target.value })} className="select-premium text-sm py-3.5">
                        <option>Gasolina</option><option>Diésel</option><option>Híbrido</option><option>Eléctrico</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-white/40 block mb-1">Categoría</label>
                      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="select-premium text-sm py-3.5">
                        <option>SUV</option><option>Sedán</option><option>Pickup</option><option>Deportivo</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-white/40 block mb-1">Color principal</label>
                      <div className="flex gap-2">
                        <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-11 h-[46px] rounded-lg cursor-pointer bg-transparent border-0 [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0" />
                        <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="input-premium text-sm p-3.5 flex-1 font-mono uppercase" placeholder="#HEX" />
                      </div>
                    </div>
                  </div>
                </div>

                {showVariantWarning && (
                  <div className="glass-panel border border-amber-500/30 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-amber-400 text-lg shrink-0 mt-0.5">⚠️</span>
                      <div className="space-y-2">
                        <p className="text-white font-bold text-sm">Variantes de color</p>
                        <p className="text-white/60 text-xs leading-relaxed">Las variantes de color solo pueden ser del mismo modelo, mismo año y mismo estado.</p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-white/50">
                      <input type="checkbox" checked={dontShowVariantWarning} onChange={(e) => setDontShowVariantWarning(e.target.checked)} className="accent-sport w-4 h-4" />
                      No mostrar más
                    </label>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setShowVariantWarning(false)} className="border border-white/20 text-white/60 px-4 py-1.5 rounded-lg text-xs hover:bg-white/5 transition-colors">
                        Cancelar
                      </button>
                      <button type="button" onClick={() => {
                        if (dontShowVariantWarning) localStorage.setItem('admin_hide_variant_warning', 'true');
                        setShowVariantWarning(false);
                        doAddVariant();
                      }} className="btn-sport text-xs py-1.5 px-4">
                        Entendido, agregar
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <p className="text-xs text-white/40 uppercase tracking-[0.2em] font-medium">Imagen</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-[11px] text-white/40 block mb-1">URL de imagen principal</label>
                      <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input-premium text-sm p-3.5" placeholder="linear-gradient(...) o url(/images/...)" />
                      <label className="flex items-center justify-center gap-2 border border-dashed border-white/20 rounded-lg px-3 py-2.5 cursor-pointer hover:border-white/40 transition-colors text-xs text-white/40">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Subir foto
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const dataUrl = ev.target?.result as string;
                              setForm({ ...form, image: `${form.color} url(${dataUrl}) center / cover no-repeat` });
                            };
                            reader.readAsDataURL(file);
                          }
                          e.target.value = '';
                        }} />
                      </label>
                    </div>
                    <div className="h-[72px] rounded-xl overflow-hidden" style={{ background: form.image || defaultImage }}>
                      <div className="w-full h-full bg-black/20 flex items-end p-3">
                        <span className="text-[10px] text-white/40 bg-black/40 px-2 py-0.5 rounded">Preview</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/40 uppercase tracking-[0.2em] font-medium">Variantes de color</p>
                    <button type="button" onClick={addVariant} className="text-sport text-xs hover:underline">+ Agregar variante</button>
                  </div>
                  {form.colorVariants.length === 0 && (
                    <p className="text-white/20 text-xs">Sin variantes adicionales.</p>
                  )}
                  <div className="space-y-2">
                    {form.colorVariants.map((cv, i) => (
                      <div key={i} className="flex gap-2 items-start glass-panel p-3">
                        <input type="color" value={cv.color} onChange={(e) => updateVariant(i, 'color', e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 shrink-0 [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0" />
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <input value={cv.color} onChange={(e) => updateVariant(i, 'color', e.target.value)}
                            className="input-premium text-sm p-3 font-mono uppercase" placeholder="#HEX" />
                          <input type="number" value={cv.price ?? ''} onChange={(e) => updateVariant(i, 'price', e.target.value === '' ? undefined : +e.target.value)}
                            min={0} className="input-premium text-sm p-3" placeholder="Precio (opcional)" />
                          <input type="number" value={cv.mileage ?? ''} onChange={(e) => updateVariant(i, 'mileage', e.target.value === '' ? undefined : +e.target.value)}
                            min={0} className="input-premium text-sm p-3" placeholder="Km (opcional)" />
                          <input value={cv.image} onChange={(e) => updateVariant(i, 'image', e.target.value)}
                            className="input-premium text-sm p-3 col-span-2 sm:col-span-1" placeholder="URL de foto" />
                          <label className="flex items-center justify-center gap-2 border border-dashed border-white/20 rounded-lg px-2 py-2 cursor-pointer hover:border-white/40 transition-colors text-xs text-white/40 col-span-2 sm:col-span-1">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="truncate">Subir foto</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  const dataUrl = ev.target?.result as string;
                                  updateVariant(i, 'image', `${cv.color} url(${dataUrl}) center / cover no-repeat`);
                                };
                                reader.readAsDataURL(file);
                              }
                              e.target.value = '';
                            }} />
                          </label>
                        </div>
                        <button type="button" onClick={() => removeVariant(i)}
                          className="text-sport/60 hover:text-sport shrink-0 p-2">&times;</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-white/40 uppercase tracking-[0.2em] font-medium">Descripción</p>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input-premium text-sm p-3.5 resize-none w-full" placeholder="Descripción del vehículo..." />
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-white/40 uppercase tracking-[0.2em] font-medium">Estado</p>
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <label className="text-[11px] text-white/40 block mb-1">Disponibilidad</label>
                      <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="select-premium text-sm py-3.5">
                        <option value="available">Disponible</option>
                        <option value="reserved">Reservado</option>
                        <option value="sold">Vendido</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="sr-only peer" />
                        <div className="w-10 h-5 bg-white/10 rounded-full peer-checked:bg-sport transition-colors" />
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                      </div>
                      <span className="text-sm text-white/70">Destacado</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" checked={form.isNewArrival} onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })} className="sr-only peer" />
                        <div className="w-10 h-5 bg-white/10 rounded-full peer-checked:bg-sport transition-colors" />
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                      </div>
                      <span className="text-sm text-white/70">Recién llegado</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  {editing && (
                    <button type="button" onClick={() => openDuplicate(editing)}
                      className="text-xs text-white/40 hover:text-sport transition-colors">
                      + Duplicar este vehículo
                    </button>
                  )}
                  <div className="flex gap-3 ml-auto">
                    <button type="button" onClick={confirmCancelForm}
                      className="border border-white/20 text-white/60 hover:bg-white/5 px-6 py-2.5 rounded-xl text-sm transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" className="btn-sport text-sm py-2.5 px-8">
                      {editing ? 'Guardar cambios' : 'Crear vehículo'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {paged.length > 0 && (
        <div className="flex items-center gap-2 pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={selectedIds.size === paged.length && paged.length > 0}
              onChange={toggleSelectAll}
              className="accent-sport w-5 h-5 rounded" />
            <span className="text-xs text-white/40">{selectedIds.size} de {paged.length} seleccionados</span>
          </label>
          <span className="text-xs text-white/20 ml-2">{filtered.length} en total · Página {safePage + 1} de {pages}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {paged.map((v) => (
          <div key={v.id} className={`card-premium group transition-all ${selectedIds.has(v.id) ? 'ring-2 ring-sport/60' : ''} ${v.status === 'sold' ? 'opacity-60' : ''}`}>
            <div className="relative h-44 flex items-end p-4 cursor-pointer" style={{ background: v.image }} onClick={() => openEdit(v)}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              <div className="absolute top-3 left-3 z-10">
                <input type="checkbox" checked={selectedIds.has(v.id)} onChange={() => toggleSelect(v.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="accent-sport w-5 h-5 rounded" />
              </div>
              <div className="absolute top-3 right-3 z-10 flex gap-1">
                {v.status === 'sold' && <span className="text-[10px] bg-sport/30 text-sport font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">Vendido</span>}
                {v.status === 'reserved' && <span className="text-[10px] bg-amber-500/30 text-amber-400 font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">Reservado</span>}
                {v.featured && <span className="text-[10px] bg-yellow-500/30 text-yellow-400 font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">★</span>}
              </div>
              <div className="relative z-10">
                <p className="text-white/50 text-xs">{v.brand}</p>
                <p className="text-white font-bold text-lg">{v.model}</p>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sport font-bold text-xl">{formatCurrency(v.price)}</p>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full border border-white/20" style={{ background: v.color }} />
                  <span className="text-[10px] text-white/40">{v.condition} · {v.year}</span>
                </div>
              </div>
              <div className="flex gap-2 text-xs text-white/40">
                <span>{v.transmission}</span><span>·</span><span>{v.fuel}</span><span>·</span><span>{v.mileage > 0 ? `${v.mileage.toLocaleString()} km` : '0 km'}</span>
              </div>
              {v.colorVariants && v.colorVariants.length > 0 && (
                <div className="flex gap-1.5">
                  {v.colorVariants.map((cv, i) => (
                    <span key={i} className="w-4 h-4 rounded-full border border-white/20" style={{ background: cv.color }} title={cv.color} />
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button onClick={() => openEdit(v)}
                  className="flex-1 border border-white/20 text-white/70 hover:bg-white/10 py-2 rounded-lg text-xs transition-colors">
                  Editar
                </button>
                <button onClick={() => openDuplicate(v)}
                  className="border border-white/10 text-white/30 hover:text-white/70 hover:bg-white/5 py-2 rounded-lg text-xs transition-colors px-2">
                  📋
                </button>
                <button onClick={() => handleToggleFeatured(v.id)}
                  className={`flex-1 border py-2 rounded-lg text-xs transition-colors ${v.featured ? 'border-sport/30 text-sport' : 'border-white/20 text-white/70 hover:bg-white/10'}`}>
                  {v.featured ? '★ Quitar' : '☆ Destacar'}
                </button>
                <button onClick={() => handleDelete(v.id)}
                  className="border border-sport/30 text-sport hover:bg-sport/10 py-2 rounded-lg text-xs transition-colors px-3">
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-white/30 text-sm text-center py-12">No se encontraron vehículos.</p>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button onClick={() => setPage(safePage - 1)} disabled={safePage === 0}
            className="px-3 py-2 rounded-lg text-xs border border-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            Anterior
          </button>
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                i === safePage ? 'bg-sport text-white' : 'text-white/40 hover:text-white border border-white/10'
              }`}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage(safePage + 1)} disabled={safePage >= pages - 1}
            className="px-3 py-2 rounded-lg text-xs border border-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
