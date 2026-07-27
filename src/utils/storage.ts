import type { Vehicle, TestDriveRequest, CompanyInfo, Review } from '../types/automotive';
import { mockVehicles as defaultVehicles } from '../data/mockVehicles';

const VEHICLES_KEY = 'autoselect_vehicles';
const REQUESTS_KEY = 'autoselect_requests';
const COMPANY_KEY = 'autoselect_company';
const REVIEWS_KEY = 'autoselect_reviews';

export const defaultCompany: CompanyInfo = {
  name: 'AutoSelect El Salvador',
  phone: '+503 2200-0000',
  whatsapp: '+503 7000-0000',
  email: 'info@autoselectsv.com',
  address: 'Paseo General Escalón #1500, San Salvador',
  schedule: 'Lun - Sáb: 8:00 AM - 6:00 PM | Dom: 9:00 AM - 1:00 PM',
  branches: [
    { name: 'Sucursal Escalón', address: 'Paseo General Escalón #1500, San Salvador' },
    { name: 'Sucursal Santa Tecla', address: 'Carretera Panamericana Km 12, Santa Tecla' },
    { name: 'Sucursal San Miguel', address: 'Av. Roosevelt Norte #250, San Miguel' },
  ],
};

const defaultReviews: Review[] = [
  { id: 'r1', name: 'Carlos Mendoza', text: 'Excelente atención. Me ayudaron con el financiamiento y en 3 días ya tenía mi Toyota Hilux.', rating: 5, vehicle: 'Toyota Hilux 2024' },
  { id: 'r2', name: 'María José Flores', text: 'Compré mi Honda CR-V con ellos. El traspaso fue rapidísimo.', rating: 5, vehicle: 'Honda CR-V 2024' },
  { id: 'r3', name: 'Roberto Gómez', text: 'Buscaba una pickup y encontré la Ford Ranger a mejor precio.', rating: 5, vehicle: 'Ford Ranger Wildtrak 2024' },
  { id: 'r4', name: 'Ana Lucía Martínez', text: 'El proceso de compra fue muy sencillo. Me explicaron cada paso.', rating: 4, vehicle: 'Hyundai Tucson 2023' },
];

function safeSet(key: string, data: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      alert('El almacenamiento local está lleno. No se pudieron guardar los datos. Intente exportar un respaldo y limpiar datos.');
    } else {
      alert('Error al guardar datos en el navegador.');
    }
    return false;
  }
}

function safeGet<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {}
  return fallback;
}

export const loadVehicles = (): Vehicle[] => safeGet(VEHICLES_KEY, [...defaultVehicles]);

export const saveVehicles = (vehicles: Vehicle[]): boolean => safeSet(VEHICLES_KEY, vehicles);

export const resetVehicles = (): Vehicle[] => {
  localStorage.removeItem(VEHICLES_KEY);
  return [...defaultVehicles];
};

export const loadRequests = (): TestDriveRequest[] => safeGet(REQUESTS_KEY, []);

export const saveRequests = (requests: TestDriveRequest[]): boolean => safeSet(REQUESTS_KEY, requests);

export const saveRequest = (request: TestDriveRequest): boolean => {
  const requests = loadRequests();
  requests.push(request);
  return saveRequests(requests);
};

export const loadCompany = (): CompanyInfo => safeGet(COMPANY_KEY, defaultCompany);

export const saveCompany = (company: CompanyInfo): boolean => safeSet(COMPANY_KEY, company);

export const loadReviews = (): Review[] => safeGet(REVIEWS_KEY, [...defaultReviews]);

export const saveReviews = (reviews: Review[]): boolean => safeSet(REVIEWS_KEY, reviews);
