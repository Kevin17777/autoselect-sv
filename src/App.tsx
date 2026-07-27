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
      <Routes>
        <Route path="/" element={<HomePage vehicles={vehicles} company={company} onContactSubmit={handleContactSubmit} />} />
        <Route path="/inventario" element={<InventoryPage vehicles={vehicles} />} />
        <Route path="/admin" element={<AdminPage vehicles={vehicles} requests={requests} company={company} reviews={reviews} onSaveCompany={handleSaveCompany} onSaveVehicles={handleSaveVehicles} onDeleteRequest={handleDeleteRequest} onToggleRequest={handleToggleRequest} onSaveReviews={handleSaveReviews} />} />
      </Routes>
      <Footer company={company} />
    </BrowserRouter>
  );
}
