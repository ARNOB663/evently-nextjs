import { Suspense } from 'react';
import { EventsList } from '../components/EventsList';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function EventsPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <EventsList />
      </Suspense>
      <Footer />
    </>
  );
}

