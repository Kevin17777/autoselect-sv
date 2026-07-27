import { useNavigate } from 'react-router-dom';

const categories = [
  { key: 'Sedán', icon: '🚗', desc: 'Compactos y ejecutivos', color: 'from-blue-500/20 to-blue-500/5' },
  { key: 'SUV', icon: '🚙', desc: 'Espacio y versatilidad', color: 'from-green-500/20 to-green-500/5' },
  { key: 'Deportivo', icon: '🏎️', desc: 'Velocidad y diseño', color: 'from-sport/20 to-sport/5' },
  { key: 'Pickup', icon: '🛻', desc: 'Trabajo y aventura', color: 'from-orange-500/20 to-orange-500/5' },
  { key: 'Eléctrico', icon: '⚡', desc: 'Innovación sostenible', color: 'from-cyan-500/20 to-cyan-500/5' },
];

export default function CategoryExplorer() {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-deep/40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-left mb-12">
          <p className="text-xs text-white/40 uppercase tracking-[0.25em] font-semibold mb-2">Explorar por tipo</p>
          <h2 className="text-3xl md:text-4xl font-black">¿Qué estás buscando?</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                const params = new URLSearchParams();
                if (cat.key === 'Eléctrico') params.set('brand', 'Tesla');
                else if (cat.key === 'Pickup') params.set('category', 'Pickup');
                else if (cat.key === 'Deportivo') params.set('category', 'Deportivo');
                else if (cat.key === 'Sedán') params.set('category', 'Sedán');
                else if (cat.key === 'SUV') params.set('category', 'SUV');
                navigate(`/inventario?${params.toString()}`);
              }}
              className={`card-premium p-6 text-center group bg-gradient-to-b ${cat.color} hover:border-white/30 transition-all`}
            >
              <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <p className="text-white font-bold text-sm">{cat.key}</p>
              <p className="text-white/40 text-[10px] mt-1">{cat.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
