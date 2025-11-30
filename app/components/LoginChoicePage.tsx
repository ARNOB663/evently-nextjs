'use client';

import { motion } from 'motion/react';
import { User, UserCog, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';

export function LoginChoicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="max-w-6xl w-full relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/80 backdrop-blur-md rounded-full shadow-md border border-white/40 mb-4 sm:mb-6">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
            <span className="text-xs sm:text-sm text-gray-700">Choose Your Path</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl text-indigo-950 mb-4 sm:mb-6">
            Welcome to
            <br />
            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Events & Activities
            </span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Continue as an attendee to discover amazing events, or join as a host to create and manage your own experiences.
          </p>
        </motion.div>

        {/* Choice Cards */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {/* User Login Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-white/90 backdrop-blur-lg rounded-[2.5rem] p-6 sm:p-8 lg:p-12 shadow-xl border border-white/40 h-full flex flex-col">
              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg"
              >
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>

              {/* Content */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl text-gray-900 mb-3 sm:mb-4">
                Join as Attendee
              </h2>
              <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed flex-grow">
                Discover and book amazing events. Connect with like-minded people and create unforgettable memories.
              </p>

              {/* Features */}
              <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {[
                  'Browse 10,000+ curated events',
                  'Instant booking & secure payments',
                  'Personalized recommendations',
                  'Join vibrant communities',
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-2 sm:gap-3"
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 text-teal-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Button */}
              <Link href="/login" className="block w-full">
                <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-2xl py-5 sm:py-6 text-base sm:text-lg shadow-lg group-hover:shadow-xl transition-all">
                  Continue as Attendee
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              {/* Stats Badge */}
              <div className="mt-4 sm:mt-6 flex items-center justify-center gap-4 sm:gap-6 text-center">
                <div>
                  <div className="text-xl sm:text-2xl text-gray-900">50K+</div>
                  <div className="text-xs text-gray-600">Active Users</div>
                </div>
                <div className="w-px h-8 sm:h-10 bg-gray-300" />
                <div>
                  <div className="text-xl sm:text-2xl text-gray-900">10K+</div>
                  <div className="text-xs text-gray-600">Events</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Host Login Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-white/90 backdrop-blur-lg rounded-[2.5rem] p-6 sm:p-8 lg:p-12 shadow-xl border border-white/40 h-full flex flex-col">
              {/* Badge */}
              <div className="absolute top-6 sm:top-8 right-6 sm:right-8">
                <span className="px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs">
                  For Organizers
                </span>
              </div>

              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ duration: 0.3 }}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg"
              >
                <UserCog className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>

              {/* Content */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl text-gray-900 mb-3 sm:mb-4">
                Join as Host
              </h2>
              <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed flex-grow">
                Create and manage events, grow your audience, and monetize your passion with powerful tools.
              </p>

              {/* Features */}
              <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {[
                  'Create unlimited events',
                  'Advanced analytics dashboard',
                  'Integrated payment processing',
                  'Marketing & promotion tools',
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-2 sm:gap-3"
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Button */}
              <Link href="/host-login" className="block w-full">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl py-5 sm:py-6 text-base sm:text-lg shadow-lg group-hover:shadow-xl transition-all">
                  Continue as Host
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              {/* Stats Badge */}
              <div className="mt-4 sm:mt-6 flex items-center justify-center gap-4 sm:gap-6 text-center">
                <div>
                  <div className="text-xl sm:text-2xl text-gray-900">500+</div>
                  <div className="text-xs text-gray-600">Active Hosts</div>
                </div>
                <div className="w-px h-8 sm:h-10 bg-gray-300" />
                <div>
                  <div className="text-xl sm:text-2xl text-gray-900">98%</div>
                  <div className="text-xs text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 sm:mt-12"
        >
          <Link
            href="/"
            className="text-gray-600 hover:text-teal-600 transition-colors text-sm sm:text-base"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

