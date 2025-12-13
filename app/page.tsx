import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeaturedEvents } from './components/FeaturedEvents';
import { HowItWorks } from './components/HowItWorks';
import { Features } from './components/Features';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navbar />
      <Hero />
      <FeaturedEvents />
      <HowItWorks />
      <Features />
      <Testimonials />
      <Footer />
    </div>
  );
}
