import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import Link from 'next/link';

// Create Event Page - redirects to dashboard
export default function CreateEventPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-24 sm:pt-28 pb-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Create an Event</h1>
          <p className="text-gray-600 mb-8">
            To create events, please access the Host Dashboard.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Go to Dashboard
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
