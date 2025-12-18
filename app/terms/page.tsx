import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-24 sm:pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: December 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600">
                By accessing and using Events & Activities, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-600">
                Events & Activities is a platform that connects event hosts with attendees. We provide tools for creating, discovering, and managing events. Our service includes event listings, ticketing, messaging, and social features.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-600 mb-4">
                You must create an account to use certain features of our service. You are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and current information</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Event Hosts</h2>
              <p className="text-gray-600 mb-4">
                If you create events on our platform, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Provide accurate event information</li>
                <li>Honor all commitments made to attendees</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Handle payments and refunds fairly</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Prohibited Conduct</h2>
              <p className="text-gray-600 mb-4">
                Users may not:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Post false, misleading, or fraudulent content</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Violate intellectual property rights</li>
                <li>Use the service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to the service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payments</h2>
              <p className="text-gray-600">
                Payments for paid events are processed through our secure payment processor. We may charge service fees for transactions. Refund policies are determined by individual event hosts unless otherwise specified.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-600">
                Events & Activities is not liable for any damages arising from your use of the service, including but not limited to direct, indirect, incidental, or consequential damages. We do not guarantee the quality, safety, or legality of events listed on our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to Terms</h2>
              <p className="text-gray-600">
                We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the service. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact</h2>
              <p className="text-gray-600">
                If you have questions about these Terms of Service, please contact us at{' '}
                <a href="mailto:legal@eventsapp.com" className="text-teal-600 hover:underline">
                  legal@eventsapp.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
