'use client';

import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ChevronDown, ChevronUp, Search, MessageCircle, Mail, Phone } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import Link from 'next/link';

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click on "Join us" in the navigation bar and follow the registration process. You can sign up as a regular user or as an event host.'
      },
      {
        q: 'How do I find events near me?',
        a: 'Go to the Events page and use the location filter to find events in your area. You can also use the map view to browse events geographically.'
      },
      {
        q: 'Is it free to join events?',
        a: 'Many events on our platform are free. Some events may have a joining fee set by the host. The price is always displayed on the event details page.'
      },
    ]
  },
  {
    category: 'For Event Hosts',
    questions: [
      {
        q: 'How do I create an event?',
        a: 'Log in as a host, go to your Dashboard, and click "Create Event". Fill in the event details, set the date, location, and capacity, then publish your event.'
      },
      {
        q: 'Can I charge for my events?',
        a: 'Yes! You can set a joining fee for your events. Payments are processed securely through our platform.'
      },
      {
        q: 'How do I manage attendees?',
        a: 'Your Dashboard provides tools to view attendees, send messages, and check people in at the event using QR codes.'
      },
    ]
  },
  {
    category: 'Payments & Refunds',
    questions: [
      {
        q: 'What payment methods are accepted?',
        a: 'We accept major credit cards, debit cards, and other payment methods through our secure payment processor.'
      },
      {
        q: 'How do I get a refund?',
        a: 'Refund policies are set by individual event hosts. Contact the host through our messaging system to request a refund.'
      },
    ]
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-24 sm:pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Help Center
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Find answers to your questions
            </p>
            
            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 rounded-full border-gray-200"
              />
            </div>
          </div>

          {/* FAQs */}
          <div className="space-y-8 mb-16">
            {filteredFaqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{category.category}</h2>
                <div className="space-y-3">
                  {category.questions.map((item, itemIndex) => {
                    const id = `${categoryIndex}-${itemIndex}`;
                    const isOpen = openItems.includes(id);
                    return (
                      <div key={itemIndex} className="border border-gray-100 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleItem(id)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-900">{item.q}</span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 text-gray-600">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
            <p className="mb-6 text-teal-100">
              Our support team is here to help you
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button className="bg-white text-teal-600 hover:bg-teal-50">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Us
                </Button>
              </Link>
              <a href="mailto:support@eventsapp.com">
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </Button>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
