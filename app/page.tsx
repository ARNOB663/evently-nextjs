'use client';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeaturedEvents } from './components/FeaturedEvents';
import { HowItWorks } from './components/HowItWorks';
import { Features } from './components/Features';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';

export default function Home() {
  const handleNavigate = (page: string, eventId?: string) => {
    // For now, just log navigation. You can implement routing later
    console.log('Navigate to:', page, eventId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navbar />
      <Hero onNavigate={handleNavigate} />
      <FeaturedEvents onNavigate={handleNavigate} />
      <HowItWorks />
      <Features />
      <Testimonials />
      <Footer />
    </div>
  );
}
