'use client';

import { motion } from 'motion/react';
import { Search, Ticket, PartyPopper, TrendingUp, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Discover Amazing Events',
    description: 'Explore 10,000+ hand-curated events. Filter by category, location, date, and price to find your perfect match.',
    color: 'from-teal-400 to-cyan-400',
    bgColor: 'bg-teal-50',
  },
  {
    icon: Ticket,
    title: 'Secure Your Tickets',
    description: 'Complete checkout in 30 seconds. Enjoy secure payment processing and instant confirmation via email.',
    color: 'from-blue-400 to-indigo-400',
    bgColor: 'bg-blue-50',
  },
  {
    icon: PartyPopper,
    title: 'Experience & Connect',
    description: 'Attend incredible events and meet fascinating people. Share your experience with our vibrant community.',
    color: 'from-purple-400 to-pink-400',
    bgColor: 'bg-purple-50',
  },
  {
    icon: TrendingUp,
    title: 'Create & Monetize',
    description: 'Launch your own events in minutes. Reach thousands of potential attendees and grow your audience.',
    color: 'from-pink-400 to-rose-400',
    bgColor: 'bg-pink-50',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-pink-50/20 to-blue-50/20 relative overflow-hidden">
      <div className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-[1920px] relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4 sm:mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">How It Works</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-indigo-950 mb-3 sm:mb-4">
            Get started in minutes
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Four simple steps to unlock endless possibilities
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 -translate-x-4 z-0">
                    <div className="w-1/2 h-full bg-gradient-to-r from-gray-200 to-transparent" />
                  </div>
                )}

                <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full group">
                  {/* Step Number Badge */}
                  <div className={`absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-8 h-8 sm:w-10 sm:h-10 ${step.bgColor} rounded-full flex items-center justify-center text-sm sm:text-base font-bold text-indigo-950 shadow-md`}>
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 sm:mb-6 shadow-md group-hover:shadow-lg transition-shadow`}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-lg sm:text-xl font-semibold text-indigo-950 mb-2 sm:mb-3">{step.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

