import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import type { Vehicle, TestDriveRequest, CompanyInfo, Review } from './types/automotive';
import { loadVehicles, saveVehicles, loadRequests, saveRequests, loadCompany, saveCompany, loadReviews, saveReviews } from './utils/storage';
import FloatingNavbar from './components/layout/FloatingNavbar';
import ScrollToTop from './components/layout/ScrollToTop';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import InventoryPage from './pages/InventoryPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const [showBadge, setShowBadge] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => loadVehicles());
  const [requests, setRequests] = useState<TestDriveRequest[]>(() => loadRequests());
  const [company, setCompany] = useState<CompanyInfo>(() => loadCompany());
  const [reviews, setReviews] = useState<Review[]>(() => loadReviews());

  const handleSaveCompany = (c: CompanyInfo) => {
    setCompany(c);
    saveCompany(c);
  };

  const handleSaveVehicles = (updated: Vehicle[]) => {
    setVehicles(updated);
    saveVehicles(updated);
  };

  const handleDeleteRequest = (id: string) => {
    const updated = requests.filter((r) => r.id !== id);
    setRequests(updated);
    saveRequests(updated);
  };

  const handleToggleRequest = (id: string) => {
    const updated = requests.map((r) => r.id === id ? { ...r, completed: !r.completed } : r);
    setRequests(updated);
    saveRequests(updated);
  };

  const handleSaveReviews = (updated: Review[]) => {
    setReviews(updated);
    saveReviews(updated);
  };

  const handleContactSubmit = (data: { name: string; phone: string; message: string }) => {
    const now = new Date();
    const req: TestDriveRequest = {
      id: `req${Date.now()}`,
      vehicleId: '',
      vehicleName: 'Consulta general',
      customerName: data.name,
      phone: data.phone,
      message: data.message,
      date: now.toISOString().split('T')[0],
      createdAt: now.toISOString(),
    };
    const updated = [...requests, req];
    setRequests(updated);
    saveRequests(updated);
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <FloatingNavbar />
      <div className="fixed top-20 left-4 z-50 flex items-start gap-2">
        {showBadge && (
          <a
            href="https://artifactss-9895c.web.app"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-green-700/90 px-4 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-sm hover:bg-green-700 transition-colors no-underline"
          >
            Versión demo / En venta
          </a>
        )}
        <button
          onClick={() => setShowBadge(!showBadge)}
          className="rounded-md bg-black/50 px-2 py-2 text-white shadow-lg backdrop-blur-sm hover:bg-black/70 transition-colors text-sm leading-none"
          aria-label={showBadge ? "Ocultar badge" : "Mostrar badge"}
        >
          {showBadge ? "✕" : "👁"}
        </button>
      </div>
      <Routes>
        <Route path="/" element={<HomePage vehicles={vehicles} company={company} onContactSubmit={handleContactSubmit} />} />
        <Route path="/inventario" element={<InventoryPage vehicles={vehicles} />} />
        <Route path="/admin" element={<AdminPage vehicles={vehicles} requests={requests} company={company} reviews={reviews} onSaveCompany={handleSaveCompany} onSaveVehicles={handleSaveVehicles} onDeleteRequest={handleDeleteRequest} onToggleRequest={handleToggleRequest} onSaveReviews={handleSaveReviews} />} />
      </Routes>
      <Footer company={company} />
    </BrowserRouter>
  );
}
