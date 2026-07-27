import { useNavigate } from 'react-router-dom';

const steps = [
  { num: '01', title: 'Seleccionamos vehículos inspeccionados', desc: 'Cada auto pasa por una revisión técnica completa. Solo los mejores llegan a nuestro inventario.', color: 'border-sport' },
  { num: '02', title: 'Gestionamos financiamiento', desc: 'Te ayudamos a encontrar la mejor tasa y el plazo que se ajuste a tu presupuesto. Sin letras chiquitas.', color: 'border-blue-500' },
  { num: '03', title: 'Realizamos traspaso', desc: 'Nos encargamos de todo el papeleo con la PNC. Tú solo firmas y recibes las llaves.', color: 'border-coin-green' },
  { num: '04', title: 'Entregamos listo para circular', desc: 'Lavado, detallado, con tanque lleno y placas listas. Solo enciendes el motor y disfrutas.', color: 'border-purple-500' },
];

export default function WhyChooseUs() {
  const navigate = useNavigate();

  return (
    <section className="py-24 relative bg-transparent">
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent ml-16 hidden md:block" />
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-xs text-white/40 uppercase tracking-[0.25em] font-semibold mb-2">¿Por qué comprar con nosotros?</p>
          <h2 className="text-2xl md:text-3xl font-black">Tu nuevo auto, en 4 pasos</h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-12">
          {steps.map((s, i) => (
            <div key={s.num} className="relative flex gap-8 items-start group animate-fade-up" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className={`hidden md:flex w-14 h-14 rounded-full border-2 ${s.color} items-center justify-center bg-deep shrink-0 relative z-10 group-hover:scale-110 transition-transform`}>
                <span className="text-white font-black text-lg">{s.num}</span>
              </div>
              <div className="md:hidden w-10 h-10 rounded-full border-2 ${s.color} flex items-center justify-center bg-deep shrink-0">
                <span className="text-white font-black text-xs">{s.num}</span>
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-white font-bold text-xl mb-2">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button onClick={() => navigate('/inventario')} className="btn-sport">
            Ver inventario completo
          </button>
        </div>
      </div>
    </section>
  );
}
