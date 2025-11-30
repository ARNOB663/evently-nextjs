'use client';

import { motion } from 'motion/react';
import { Star, Quote, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Marketing Director • San Francisco',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    rating: 5,
    text: 'This platform revolutionized how I discover events. In 6 months, I\'ve attended 15 incredible experiences and built a network of 200+ like-minded professionals. The curation quality is outstanding!',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Tech Conference Organizer • Austin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    rating: 5,
    text: 'As someone who hosts quarterly tech summits, this platform is a game-changer. Sold out 500 tickets in 48 hours. The analytics dashboard and payment integration are flawless.',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Music Blogger • Los Angeles',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    rating: 5,
    text: 'I discovered underground concerts I never knew existed! The AI-powered recommendations match my taste perfectly. This is Spotify for live events.',
  },
  {
    id: 4,
    name: 'David Park',
    role: 'Workshop Leader • Seattle',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    rating: 5,
    text: 'My pottery workshops went from 8 attendees to fully booked sessions of 30+. The platform handles everything - payments, reminders, and even waitlists. Incredible ROI!',
  },
  {
    id: 5,
    name: 'Lisa Thompson',
    role: 'Food Critic • Portland',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    rating: 5,
    text: 'From secret supper clubs to Michelin chef pop-ups, I find culinary gems weekly. The early-bird pricing feature saved me over $500 last quarter!',
  },
  {
    id: 6,
    name: 'James Wilson',
    role: 'Startup Founder • New York',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    rating: 5,
    text: 'Attended 20+ networking events and found my co-founder, two investors, and our first enterprise client. This platform paid for itself 100x over.',
  },
];

export function Testimonials() {
  return (
    <section className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-purple-50/20 to-pink-50/20 relative overflow-hidden">
      <div className="relative w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-[1920px] z-20">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4 sm:mb-6">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-indigo-950 mb-3 sm:mb-4">
            Loved by thousands
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Join our community of satisfied users who found their perfect events
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                {/* Quote icon */}
                <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Quote className="w-20 h-20 text-teal-600" />
                </div>

                <div className="relative space-y-3 sm:space-y-4">
                  {/* Rating */}
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Testimonial text */}
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    "{testimonial.text}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-100">
                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-teal-100 flex-shrink-0">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-sm sm:text-base font-semibold text-indigo-950 truncate">{testimonial.name}</div>
                      <div className="text-xs sm:text-sm text-gray-500 truncate">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 flex flex-wrap items-center justify-center gap-8 text-gray-500"
        >
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span>4.9/5 Rating</span>
          </div>
          <div className="text-2xl">•</div>
          <div>50K+ Users</div>
          <div className="text-2xl">•</div>
          <div>10K+ Events</div>
        </motion.div>
      </div>
    </section>
  );
}

