import { Suspense } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { EnhancedUserProfile } from '../components/EnhancedUserProfile';

export default function ProfilePage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="min-h-screen pt-24" />}>
        <EnhancedUserProfile />
      </Suspense>
      <Footer />
    </>
  );
}

