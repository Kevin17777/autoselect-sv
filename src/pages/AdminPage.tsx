import { useState, useEffect } from 'react';
import type { Vehicle, TestDriveRequest, CompanyInfo, Review } from '../types/automotive';
import AdminDashboard from '../components/admin/AdminDashboard';
import VehicleAdmin from '../components/admin/VehicleAdmin';
import CompanySettings from '../components/admin/CompanySettings';
import ReviewAdmin from '../components/admin/ReviewAdmin';
import AdminLogin, { isAuthenticated, logout, changePassword } from '../components/admin/AdminLogin';

type Props = {
  vehicles: Vehicle[];
  requests: TestDriveRequest[];
  company: CompanyInfo;
  reviews: Review[];
  onSaveCompany: (c: CompanyInfo) => void;
  onSaveVehicles: (v: Vehicle[]) => void;
  onDeleteRequest: (id: string) => void;
  onToggleRequest: (id: string) => void;
  onSaveReviews: (reviews: Review[]) => void;
};

export default function AdminPage(props: Props) {
  const [authenticated, setAuthenticated] = useState(isAuthenticated);
  const [tab, setTab] = useState<'dashboard' | 'vehicles' | 'reviews' | 'company'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!authenticated) {
    return <AdminLogin onSuccess={() => setAuthenticated(true)} />;
  }

  const { vehicles, requests, company, reviews, onSaveCompany, onSaveVehicles, onDeleteRequest, onToggleRequest, onSaveReviews } = props;

  const tabs = [
    { key: 'dashboard' as const, label: 'Dashboard', icon: '📊' },
    { key: 'vehicles' as const, label: 'Vehículos', icon: '🚗' },
    { key: 'reviews' as const, label: 'Reseñas', icon: '⭐' },
    { key: 'company' as const, label: 'Empresa', icon: '⚙️' },
  ];

  return (
    <main className="pt-24 pb-16 min-h-screen flex">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed top-28 left-4 z-50 w-10 h-10 rounded-xl bg-graphite border border-white/10 flex items-center justify-center text-white">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>

      <aside className={`fixed lg:sticky top-24 lg:top-24 left-0 z-40 w-56 shrink-0 space-y-1 pl-4 pr-6 pt-8 border-r border-white/10 min-h-[calc(100vh-6rem)] bg-deep lg:bg-transparent transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <p className="text-xs text-white/40 uppercase tracking-[0.25em] font-semibold">AutoSelect Admin</p>
          <button onClick={() => setSidebarOpen(false)} className="text-white/40 hover:text-white">&times;</button>
        </div>
        <p className="text-xs text-white/40 uppercase tracking-[0.25em] font-semibold mb-6 hidden lg:block">AutoSelect Admin</p>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
              tab === t.key ? 'bg-sport text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}>
            <span className="text-lg">{t.icon}</span>
            {t.label}
          </button>
        ))}
        <div className="pt-6 mt-6 border-t border-white/10 space-y-2">
          <button onClick={() => {
            const pwd = prompt('Nueva contraseña:');
            if (pwd && pwd.trim().length >= 4) {
              changePassword(pwd.trim());
              alert('Contraseña actualizada');
            } else if (pwd) {
              alert('Debe tener al menos 4 caracteres');
            }
          }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left text-white/40 hover:text-white hover:bg-white/5">
            <span className="text-lg">🔑</span>
            Cambiar contraseña
          </button>
          <button onClick={() => { logout(); setAuthenticated(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left text-white/40 hover:text-white hover:bg-white/5">
            <span className="text-lg">🚪</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 min-w-0 max-w-7xl px-4 lg:px-8 pt-8">
        {tab === 'dashboard' && <AdminDashboard vehicles={vehicles} requests={requests} onDeleteRequest={onDeleteRequest} onToggleRequest={onToggleRequest} />}
        {tab === 'vehicles' && <VehicleAdmin vehicles={vehicles} onSave={onSaveVehicles} />}
        {tab === 'reviews' && <ReviewAdmin reviews={reviews} onSave={onSaveReviews} vehicles={vehicles} />}

        {tab === 'company' && <CompanySettings company={company} onSave={onSaveCompany} />}
      </div>
    </main>
  );
}
