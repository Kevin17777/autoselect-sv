import { useState } from 'react';
import type { CompanyInfo } from '../../types/automotive';

type Props = { company: CompanyInfo; onSubmit: (data: { name: string; phone: string; message: string }) => void };

export default function Contact({ company, onSubmit }: Props) {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    setSent(true);
    setForm({ name: '', phone: '', message: '' });
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <section className="py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-left mb-12">
          <p className="text-xs text-white/40 uppercase tracking-[0.25em] font-semibold mb-2">Contacto</p>
          <h2 className="text-3xl md:text-4xl font-black">Estamos aquí para ayudarte</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="glass-panel p-6 space-y-4">
              <h3 className="font-bold text-white text-lg">Sucursales</h3>
              {company.branches.map((b) => (
                <div key={b.name}>
                  <p className="text-sport font-semibold text-sm">{b.name}</p>
                  <p className="text-white/50 text-xs">{b.address}</p>
                </div>
              ))}
            </div>

            <div className="glass-panel p-6">
              <h3 className="font-bold text-white text-lg mb-3">Contacto directo</h3>
              <div className="space-y-2 text-sm text-white/70">
                <p>📞 {company.phone}</p>
                <p>💬 {company.whatsapp}</p>
                <p>✉️ {company.email}</p>
                <p>🕐 {company.schedule}</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="font-bold text-white text-lg mb-6">Escríbenos</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-white/40 block mb-1">Nombre</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                  className="input-premium" placeholder="Tu nombre" />
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Teléfono</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required
                  className="input-premium" placeholder="+503 XXXX XXXX" />
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Mensaje</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4}
                  className="input-premium resize-none" placeholder="¿Qué vehículo te interesa?" />
              </div>
              <button type="submit" className="btn-sport w-full">
                {sent ? '✓ Mensaje enviado' : 'Enviar mensaje'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
