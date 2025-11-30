'use client';

import { motion } from 'motion/react';
import { Shield, Zap, Users, CreditCard, Bell, Award, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Bank-Level Security',
    description: 'Enterprise-grade encryption protects your data. Every transaction is secured with SSL and PCI DSS compliance.',
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    icon: Zap,
    title: 'Lightning-Fast Booking',
    description: 'Reserve your spot in under 30 seconds. Our streamlined checkout eliminates unnecessary steps.',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Users,
    title: 'Vibrant Community',
    description: 'Join 50,000+ event enthusiasts. Build meaningful connections and expand your professional network.',
    gradient: 'from-blue-500 to-purple-500',
  },
  {
    icon: CreditCard,
    title: 'Smart Payment Options',
    description: 'Pay your way with credit cards, digital wallets, or installments. Powered by Stripe for instant processing.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Bell,
    title: 'Intelligent Reminders',
    description: 'AI-powered notifications keep you updated. Get personalized alerts for events matching your interests.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Award,
    title: 'Premium Experience',
    description: 'Every event is hand-verified by our team. Quality assurance ensures you only see the best experiences.',
    gradient: 'from-rose-500 to-orange-500',
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 sm:py-24 md:py-32 bg-white relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 via-white to-purple-50/20 pointer-events-none" />
      
      <div className="relative w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-[1920px] z-20">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-full mb-4 sm:mb-6">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-medium text-teal-900">Why Choose Us</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-indigo-950 mb-3 sm:mb-4">
            Everything you need
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            All the tools and features to discover, book, and host amazing events
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-50/0 to-cyan-50/0 group-hover:from-teal-50/30 group-hover:to-cyan-50/30 transition-all duration-300 pointer-events-none" />
                  
                  <div className="relative">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 sm:mb-6 shadow-md`}
                    >
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 group-hover:text-teal-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 sm:mt-16 md:mt-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] p-8 sm:p-12 md:p-16 shadow-xl"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 text-center text-white">
            {[
              { value: '10K+', label: 'Events Created' },
              { value: '50K+', label: 'Happy Users' },
              { value: '500+', label: 'Active Hosts' },
              { value: '98%', label: 'Success Rate' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-1 sm:mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm md:text-base text-indigo-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

