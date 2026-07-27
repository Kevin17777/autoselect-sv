import { useState } from 'react';
import { Fuel, Calendar, Car, ShieldCheck, Navigation, Cog } from 'lucide-react';
import type { Vehicle, CompanyInfo } from '../../types/automotive';
import { formatCurrency, calculateMonthlyPayment, generateContactMessage, createWhatsAppLink } from '../../utils/formatCurrency';
import { saveRequest } from '../../utils/storage';

const imgUrl = (s: string) => s.match(/url\(([^)]+)\)/)?.[1] || '';

type Props = {
  vehicle: Vehicle;
  onClose: () => void;
  company?: CompanyInfo;
};

export default function VehicleDetailModal({ vehicle: v, onClose, company }: Props) {
  const [downPct, setDownPct] = useState(20);
  const [term, setTerm] = useState(60);
  const [selColor, setSelColor] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [schedForm, setSchedForm] = useState({ name: '', phone: '', date: '', time: '' });
  const [schedDone, setSchedDone] = useState(false);
  const [schedError, setSchedError] = useState('');

  const minDate = new Date().toISOString().split('T')[0];

  const getTimeRange = (dateStr: string) => {
    if (!dateStr) return { min: '09:00', max: '17:00' };
    const day = new Date(dateStr + 'T12:00:00').getDay();
    if (day === 0) return { min: '10:00', max: '12:00' };
    return { min: '09:00', max: '17:00' };
  };
  const timeRange = getTimeRange(schedForm.date);

  const fmtTime12 = (t: string) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hh = parseInt(h);
    const ap = hh >= 12 ? 'PM' : 'AM';
    const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
    return `${h12}:${m} ${ap}`;
  };

  const fmtRange = (r: { min: string; max: string }) =>
    `${fmtTime12(r.min)} - ${fmtTime12(r.max)}`;

  const variants = v.colorVariants || [];
  const activeColor = selColor || v.color;
  const activeVariant = selColor ? variants.find((cv) => cv.color === selColor) : null;
  const activeImage = activeVariant?.image || v.image;
  const activePrice = activeVariant?.price ?? v.price;
  const activeMileage = activeVariant?.mileage ?? v.mileage;
  const allColors = [{ color: v.color, image: v.image, price: v.price }, ...variants];
  const cuota = calculateMonthlyPayment(activePrice, activePrice * (downPct / 100), term);

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setSchedError('');
    if (!schedForm.date || !schedForm.time || !schedForm.name || !schedForm.phone) {
      setSchedError('Completa todos los campos');
      return;
    }
    const selected = new Date(`${schedForm.date}T${schedForm.time}`);
    if (selected <= new Date()) {
      setSchedError('La fecha debe ser posterior a hoy');
      return;
    }
    if (schedForm.time < timeRange.min || schedForm.time > timeRange.max) {
      setSchedError(`El horario de atención es de ${timeRange.min} a ${timeRange.max}${schedForm.date ? ` (${new Date(schedForm.date + 'T12:00:00').toLocaleDateString('es', { weekday: 'long' })})` : ''}`);
      return;
    }
    const hour = parseInt(schedForm.time.split(':')[0]);
    if (hour === 12 && timeRange.max > '12:00') {
      setSchedError('Horario de almuerzo (12:00 - 13:00). Elige otra hora.');
      return;
    }
    saveRequest({
      id: `req-${Date.now()}`,
      vehicleId: v.id,
      vehicleName: `${v.brand} ${v.model}`,
      customerName: schedForm.name,
      phone: schedForm.phone,
      message: `Prueba de manejo agendada: ${schedForm.date} a las ${fmtTime12(schedForm.time)}${selColor ? ` (Color: ${selColor})` : ''}`,
      date: schedForm.date,
      time: schedForm.time,
    });
    setSchedDone(true);
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/80 backdrop-blur-sm p-4 pt-8 md:pt-4" onClick={onClose}>
      <div className="min-h-full flex items-start md:items-center justify-center">
        <div className="card-premium max-w-4xl w-full my-auto animate-modal-in" onClick={(e) => e.stopPropagation()}>
        <div className="relative h-64 md:h-96 flex items-end p-5 md:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-center bg-cover blur scale-110" style={{ backgroundImage: `url(${imgUrl(activeImage)})` }} />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 bg-center bg-contain bg-no-repeat" style={{ backgroundImage: `url(${imgUrl(activeImage)})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
          <button onClick={onClose} className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors backdrop-blur-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="relative z-10 flex items-end justify-between w-full">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider font-medium">{v.brand}</p>
              <p className="text-white font-bold text-2xl md:text-4xl leading-tight">{v.model}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-white/50 text-sm">{v.year}</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${v.condition === 'Nuevo' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                  {v.condition}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {allColors.map((c, i) => (
                <button key={i} type="button" onClick={() => setSelColor(c.color === v.color && i === 0 ? null : c.color)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${activeColor === c.color ? 'border-white scale-110 shadow-lg' : 'border-white/30 hover:border-white/60'}`}
                  style={{ background: c.color }} title={c.color} />
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 md:p-6 space-y-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sport font-black text-3xl md:text-4xl">{formatCurrency(activePrice)}</p>
                {activeMileage > 0 ? (
                  <span className="text-white/40 text-sm">{activeMileage.toLocaleString()} km</span>
                ) : (
                  <span className="badge-green text-xs">0 km</span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Financiamiento
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Garantía
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Entrega inmediata
                </span>
              </div>

              <p className="text-white/50 leading-relaxed text-sm line-clamp-2">{v.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { label: 'Combustible', value: v.fuel, icon: Fuel },
                  { label: 'Transmisión', value: v.transmission, icon: Cog },
                  { label: 'Categoría', value: v.category, icon: Car },
                  { label: 'Año', value: v.year.toString(), icon: Calendar },
                  { label: 'Condición', value: v.condition, icon: ShieldCheck },
                  { label: 'Tracción', value: v.category === 'SUV' ? 'AWD / 4x4' : v.category === 'Sedán' ? 'Delantera (FWD)' : v.category === 'Pickup' ? '4x4' : 'Trasera (RWD)', icon: Navigation },
                ].map((s) => (
                  <div key={s.label} className="glass-panel p-5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <s.icon className="w-4 h-4 text-sport" />
                      <p className="text-white/30 text-xs uppercase tracking-wider">{s.label}</p>
                    </div>
                    <p className="text-white font-semibold text-base">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:w-80 space-y-4">
              <div className="glass-panel p-4 space-y-3">
                <p className="text-white font-bold text-xs">Calculadora de cuotas</p>
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/40">Enganche</span>
                      <span className="text-white font-medium">{downPct}%</span>
                    </div>
                    <input type="range" min={10} max={50} step={5} value={downPct}
                      onChange={(e) => setDownPct(parseInt(e.target.value))}
                      className="w-full accent-sport h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sport [&::-webkit-slider-thumb]:shadow-lg" />
                    <div className="flex justify-between text-[10px] text-white/20 mt-0.5">
                      <span>10%</span>
                      <span>50%</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/40">Plazo</span>
                      <span className="text-white font-medium">{term} meses</span>
                    </div>
                    <input type="range" min={12} max={84} step={6} value={term}
                      onChange={(e) => setTerm(parseInt(e.target.value))}
                      className="w-full accent-sport h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sport [&::-webkit-slider-thumb]:shadow-lg" />
                    <div className="flex justify-between text-[10px] text-white/20 mt-0.5">
                      <span>12m</span>
                      <span>84m</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-white/40 text-xs">Cuota mensual</span>
                      <span className="text-sport font-bold text-xl">{formatCurrency(Math.round(cuota))}/mes</span>
                    </div>
                    <p className="text-white/20 text-[10px] mt-1">Tasa fija anual 10%</p>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-3 space-y-2">
                <p className="text-white font-bold text-xs">Agendar o consultar</p>
                <div className="flex gap-2">
                  <a href={createWhatsAppLink(generateContactMessage(`${v.brand} ${v.model}`, activePrice), company?.whatsapp)}
                    target="_blank" rel="noopener noreferrer"
                    className="btn-sport flex-1 text-center text-[11px] py-2 flex items-center justify-center gap-1.5">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    WhatsApp
                  </a>
                  <button onClick={() => {
                    const defDate = minDate;
                    const defRange = getTimeRange(defDate);
                    setShowSchedule(true); setSchedDone(false); setSchedError('');
                    setSchedForm({ name: '', phone: '', date: defDate, time: `${defRange.min}:00` });
                  }}
                    className="btn-outline flex-1 text-[11px] py-2 flex items-center justify-center gap-1.5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Prueba de manejo
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
        </div>
      </div>

      {showSchedule && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowSchedule(false)}>
          <div className="card-premium w-full max-w-md my-auto p-5 animate-modal-in" onClick={(e) => e.stopPropagation()}>
            {schedDone ? (
              <div className="text-center space-y-3 py-6">
                <svg className="w-12 h-12 text-emerald-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-white font-bold text-lg">Prueba agendada</p>
                <p className="text-white/50 text-sm">Te esperamos el {schedForm.date} a las {fmtTime12(schedForm.time)}</p>
                <p className="text-white/30 text-xs">{v.brand} {v.model}{selColor ? ` (${selColor})` : ''}</p>
                <button onClick={() => setShowSchedule(false)} className="btn-sport text-sm py-2 px-6 mt-2">Listo</button>
              </div>
            ) : (
              <form onSubmit={handleSchedule} noValidate className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-white font-bold text-sm">Agendar prueba de manejo</p>
                  <button type="button" onClick={() => setShowSchedule(false)} className="text-white/30 hover:text-white text-xl leading-none">&times;</button>
                </div>
                <p className="text-white/40 text-xs">{v.brand} {v.model} · {v.year}</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-white/30 block mb-1">Nombre</label>
                    <input value={schedForm.name} onChange={(e) => setSchedForm({ ...schedForm, name: e.target.value })} required
                      className="input-premium text-sm p-3 w-full" placeholder="Tu nombre completo" />
                  </div>
                  <div>
                    <label className="text-[11px] text-white/30 block mb-1">Teléfono</label>
                    <input value={schedForm.phone} onChange={(e) => setSchedForm({ ...schedForm, phone: e.target.value })} required
                      className="input-premium text-sm p-3 w-full" placeholder="+503 7000-0000" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-white/30 block mb-1">Fecha</label>
                      <input type="date" value={schedForm.date} onChange={(e) => setSchedForm({ ...schedForm, date: e.target.value })}
                        min={minDate} required className="input-premium text-sm p-3 w-full" />
                    </div>
                    <div>
                      <label className="text-[11px] text-white/30 block mb-1">Hora</label>
                      <select value={schedForm.time} onChange={(e) => setSchedForm({ ...schedForm, time: e.target.value })}
                        required className="select-premium text-sm py-3 w-full">
                        <option value="">Seleccionar horario</option>
                        {(() => {
                          const slots: string[] = [];
                          const [minH, minM] = timeRange.min.split(':').map(Number);
                          const [maxH, maxM] = timeRange.max.split(':').map(Number);
                          const minTotal = minH * 60 + minM;
                          const maxTotal = maxH * 60 + maxM;
                          for (let t = minTotal; t <= maxTotal; t += 30) {
                            const h = Math.floor(t / 60);
                            const m = t % 60;
                            if (h === 12 && maxTotal > 720) continue;
                            const val = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                            slots.push(val);
                          }
                          return slots.map((v) => (
                            <option key={v} value={v}>{fmtTime12(v)}</option>
                          ));
                        })()}
                      </select>
                      <p className="text-[10px] text-white/20 mt-1">Horario: {fmtRange(timeRange)}</p>
                    </div>
                  </div>
                </div>
                {schedError && <p className="text-sport text-xs">{schedError}</p>}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowSchedule(false)}
                    className="flex-1 border border-white/20 text-white/50 text-sm py-2.5 rounded-xl hover:bg-white/5 transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 btn-sport text-sm py-2.5">Confirmar cita</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-in { animation: modal-in 0.25s ease-out; }
      `}</style>
    </div>
  );
}
