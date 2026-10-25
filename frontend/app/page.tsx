import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import StatsCounter from '@/components/landing/StatsCounter';
import StepsSection from '@/components/landing/StepsSection';
import KatalogSection from '@/components/landing/KatalogSection';
import RulesSection from '@/components/landing/RulesSection';
import FaqSection from '@/components/landing/FaqSection';
import CalloutSection from '@/components/landing/CalloutSection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#090807] text-stone-100 selection:bg-amber-500/30 selection:text-amber-200">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StatsCounter />
        <StepsSection />
        <KatalogSection />
        <RulesSection />
        <FaqSection />
        <CalloutSection />
      </main>
      <Footer />
    </div>
  );
}
