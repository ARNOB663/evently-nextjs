import { EventsList } from '../components/EventsList';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function EventsPage() {
  return (
    <>
      <Navbar />
      <EventsList />
      <Footer />
    </>
  );
}

