export type Transmission = 'Automática' | 'Manual';
export type Fuel = 'Gasolina' | 'Diésel' | 'Híbrido' | 'Eléctrico';
export type Category = 'SUV' | 'Sedán' | 'Pickup' | 'Deportivo';
export type VehicleCondition = 'Nuevo' | 'Usado';
export type VehicleStatus = 'available' | 'sold' | 'reserved';

export type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  transmission: Transmission;
  fuel: Fuel;
  category: Category;
  color: string;
  featured: boolean;
  condition: VehicleCondition;
  image: string;
  description: string;
  status?: VehicleStatus;
  isNewArrival?: boolean;
  images?: string[];
  colorVariants?: { color: string; image: string; price?: number; mileage?: number }[];
  createdAt?: string;
  updatedAt?: string;
};

export type Brand = {
  id: string;
  name: string;
  logo: string;
};

export type CompanyInfo = {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  schedule: string;
  logo?: string;
  facebook?: string;
  instagram?: string;
  branches: { name: string; address: string }[];
};

export type TestDriveRequest = {
  id: string;
  vehicleId: string;
  vehicleName: string;
  customerName: string;
  phone: string;
  message: string;
  date: string;
  time?: string;
  completed?: boolean;
  createdAt?: string;
};

export type Review = {
  id: string;
  name: string;
  text: string;
  rating: number;
  vehicle: string;
  createdAt?: string;
};
