import { useState } from 'react';
import type { Vehicle, CompanyInfo } from '../types/automotive';
import LavaLampBg from '../components/shared/LavaLampBg';
import VideoSplash from '../components/home/VideoSplash';
import ImmersiveHero from '../components/home/ImmersiveHero';
import CategoryExplorer from '../components/home/CategoryExplorer';
import FeaturedVehicle from '../components/home/FeaturedVehicle';
import RecentlyAdded from '../components/home/RecentlyAdded';
import FinanceCalculator from '../components/home/FinanceCalculator';
import VehicleComparator from '../components/home/VehicleComparator';
import VehicleDetailModal from '../components/home/VehicleDetailModal';
import WhyChooseUs from '../components/home/WhyChooseUs';
import Reviews from '../components/home/Reviews';
import Contact from '../components/home/Contact';
import RevealSection from '../components/shared/RevealSection';

type Props = {
  vehicles: Vehicle[];
  company: CompanyInfo;
  onContactSubmit: (data: { name: string; phone: string; message: string }) => void;
};

export default function HomePage({ vehicles, company, onContactSubmit }: Props) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showBounce, setShowBounce] = useState(false);

  const premium = vehicles.reduce((a, b) => a.price > b.price ? a : b);

  return (
    <main className="relative">

      <div className="fixed inset-0 z-0 min-h-screen">
        <VideoSplash onArrowShow={setShowBounce} />
      </div>

      <div className="relative z-10 mt-[100vh] bg-deep min-h-screen">
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white/[0.15] to-transparent pointer-events-none" />
        <LavaLampBg />
        <div className="flex flex-col">
          <ImmersiveHero vehicles={vehicles} onSelectVehicle={setSelectedVehicle} showBounce={showBounce} />
          <RevealSection><CategoryExplorer /></RevealSection>
          <FeaturedVehicle vehicle={premium} onSelect={setSelectedVehicle} />
          <RevealSection><RecentlyAdded vehicles={vehicles} onSelect={setSelectedVehicle} modalOpen={selectedVehicle !== null} /></RevealSection>
          <RevealSection><FinanceCalculator vehicles={vehicles} company={company} /></RevealSection>
          <RevealSection><WhyChooseUs /></RevealSection>
          <RevealSection><VehicleComparator vehicles={vehicles} /></RevealSection>
          <Reviews />
          <RevealSection><Contact company={company} onSubmit={onContactSubmit} /></RevealSection>
        </div>
      </div>

      {selectedVehicle && (
        <VehicleDetailModal vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} company={company} />
      )}
    </main>
  );
}
