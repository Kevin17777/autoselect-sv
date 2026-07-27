import { Link } from 'react-router-dom';
import type { CompanyInfo } from '../../types/automotive';
type Props = { company: CompanyInfo };
export default function Footer({ company }: Props) {
  return (
    <footer className="bg-deep border-t border-white/10 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-sport rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-sm">AS</span>
              </div>
              <span className="font-bold text-lg">Auto<span className="text-sport">Select</span></span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              Tu concesionario de confianza en El Salvador. Vehículos nuevos, importados y seminuevos con garantía.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Sucursales</h4>
            <ul className="space-y-3 text-sm">
              {company.branches.map((b) => (
                <li key={b.name}>
                  <p className="text-sport font-medium">{b.name}</p>
                  <p className="text-white/50 text-xs">{b.address}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><span className="text-sport">📞</span> {company.phone}</li>
              <li><span className="text-sport">💬</span> {company.whatsapp}</li>
              <li><span className="text-sport">✉️</span> {company.email}</li>
              <li><span className="text-sport">🕐</span> {company.schedule}</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Enlaces</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-white/50 hover:text-sport transition-colors">Inicio</Link></li>
              <li><Link to="/admin" className="text-white/50 hover:text-sport transition-colors">Admin</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 text-center">
          <p className="text-xs text-white/30 leading-relaxed">
            © 2026 AutoSelect El Salvador. Esta es una simulación frontend de demostración técnica. 
            Los precios, vehículos y cálculos financieros son puramente ilustrativos.
          </p>
        </div>
      </div>
    </footer>
  );
}
