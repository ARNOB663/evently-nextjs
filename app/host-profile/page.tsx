import { Suspense } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { EnhancedHostProfile } from '../components/EnhancedHostProfile';

export default function HostProfilePage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="min-h-screen pt-24" />}>
        <EnhancedHostProfile />
      </Suspense>
      <Footer />
    </>
  );
}

