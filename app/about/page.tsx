import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Users, Calendar, Globe, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">Events & Activities</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're on a mission to connect people through shared experiences and unforgettable events.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { value: '10K+', label: 'Events Hosted', icon: Calendar },
              { value: '50K+', label: 'Active Users', icon: Users },
              { value: '100+', label: 'Cities', icon: Globe },
              { value: '98%', label: 'Satisfaction', icon: Heart },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm text-center">
                  <Icon className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Story Section */}
          <div className="bg-white rounded-2xl p-8 shadow-sm mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-4">
                Events & Activities was founded with a simple idea: make it easier for people to discover and attend events that match their interests. Whether you're looking for tech conferences, music festivals, food tastings, or community meetups, we've got you covered.
              </p>
              <p className="text-gray-600 mb-4">
                Our platform connects event hosts with attendees, making it simple to create, discover, and join events. We believe that shared experiences bring people together and create lasting memories.
              </p>
              <p className="text-gray-600">
                Today, we're proud to serve thousands of users across hundreds of cities, helping them discover new experiences and build meaningful connections.
              </p>
            </div>
          </div>

          {/* Values Section */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: 'Community First', description: 'We put our users at the center of everything we do.' },
                { title: 'Inclusivity', description: 'Everyone deserves access to great experiences.' },
                { title: 'Trust & Safety', description: 'We maintain high standards for all events on our platform.' },
                { title: 'Innovation', description: 'We continuously improve to serve you better.' },
              ].map((value, index) => (
                <div key={index} className="border-l-4 border-teal-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
