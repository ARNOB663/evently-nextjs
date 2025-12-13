'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Calendar, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface HeroProps {
  onNavigate?: (page: string) => void;
}

export function Hero({ onNavigate }: HeroProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/events');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/40 via-pink-100/30 to-blue-100/40 z-10" />
        <div className="relative w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1638742385167-96fc60e12f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwzRCUyMHBhc3RlbCUyMGdyYWRpZW50JTIwYWJzdHJhY3R8ZW58MXx8fHwxNzY0NTEzMjYyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Event Background"
            fill
            className="object-cover opacity-60"
            priority
          />
        </div>
      </div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden z-20">
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 bg-teal-300/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-30 w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-20 sm:py-24 md:py-32">
        <div className="max-w-3xl xl:max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Join Enthusiasts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-5 sm:mb-6"
            >
              <div className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-white/85 backdrop-blur-md rounded-full shadow-md border border-white/40">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                <span className="text-sm font-medium text-gray-700">✨ Join 50,000+ event enthusiasts worldwide</span>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-indigo-950 mb-5 sm:mb-6 leading-tight tracking-tight"
            >
              Discover events
              <br />
              <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                that inspire you
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-7 sm:mb-8 max-w-2xl leading-relaxed"
            >
              Connect with like-minded people, explore amazing experiences, and create unforgettable memories at events near you.
            </motion.p>

            {/* Search Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="relative w-full max-w-2xl"
            >
              <div className="flex items-center bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 p-2 sm:p-2.5 md:p-3 pr-2.5 sm:pr-3 md:pr-4">
                <div className="flex items-center pl-5 sm:pl-6 md:pl-7 pr-3 sm:pr-4 md:pr-5 text-teal-600">
                  <Calendar className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </div>
                <input
                  type="text"
                  placeholder="Search for events, activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 outline-none text-gray-700 placeholder:text-gray-400 text-sm sm:text-base md:text-lg py-1"
                />
                <motion.button
                  onClick={handleSearch}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-2.5 sm:p-3 md:p-3.5 rounded-full hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 flex-shrink-0 shadow-md"
                >
                  <ArrowRight className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </motion.button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-wrap items-center gap-5 sm:gap-6 md:gap-8 pt-5 sm:pt-6"
            >
              {[
                { value: '10K+', label: 'Events' },
                { value: '50K+', label: 'Users' },
                { value: '98%', label: 'Satisfaction' },
              ].map((stat, index) => (
                <div key={index} className="text-left">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-950 mb-0.5">
                    {stat.value}
                  </div>
                  <div className="text-sm sm:text-base text-gray-600">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

