import { EventDetail } from '../../components/EventDetail';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventPage(props: EventPageProps) {
  const params = await props.params;
  const { id } = params;

  return (
    <>
      <Navbar />
      <EventDetail eventId={id} />
      <Footer />
    </>
  );
}

