'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Calendar, Home, Users, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavbarProps {
  onNavigate?: (page: string) => void;
}

export function Navbar({ onNavigate }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when navigating
  const handleNavigate = (page: string) => {
    onNavigate?.(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[95%] sm:max-w-6xl px-2 sm:px-4"
    >
      <div
        className={`relative bg-white rounded-full shadow-lg transition-all duration-300 ${
          isScrolled ? 'shadow-xl' : 'shadow-lg'
        }`}
      >
        {/* Animated Border */}
        <motion.div
          className="absolute inset-0 rounded-full p-[2px]"
          style={{
            background: 'linear-gradient(90deg, #14b8a6, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #14b8a6)',
            backgroundSize: '200% 100%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '200% 0%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div className="w-full h-full bg-white rounded-full" />
        </motion.div>

        <div className="relative flex items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 py-2.5 sm:py-3 md:py-4">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => handleNavigate('home')}
          >
            <div className="relative">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-1.5 sm:p-2 rounded-lg">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <span className="text-base sm:text-lg md:text-xl text-gray-900">Events & Activities</span>
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="hidden md:flex items-center space-x-10"
          >
            <button
              onClick={() => handleNavigate('events')}
              className="text-gray-700 hover:text-teal-600 transition-colors duration-200"
            >
              Browse Events
            </button>
            <a
              href="#how-it-works"
              className="text-gray-700 hover:text-teal-600 transition-colors duration-200"
            >
              Features
            </a>
            <button
              onClick={() => handleNavigate('host')}
              className="text-gray-700 hover:text-teal-600 transition-colors duration-200"
            >
              Host Dashboard
            </button>
          </motion.div>

          {/* Auth Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="hidden md:flex items-center space-x-4"
          >
            {/* Login Button */}
            <button
              onClick={() => handleNavigate('login')}
              className="text-gray-700 hover:text-teal-600 transition-colors duration-200 font-medium"
            >
              Login
            </button>

            {/* Sign Up Button */}
            <button
              onClick={() => handleNavigate('login-choice')}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg font-semibold text-sm sm:text-base"
            >
              Join us
            </button>
          </motion.div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-teal-600 transition-colors duration-200"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed top-24 left-4 right-4 mx-auto max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden z-50"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">Menu</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white/80 hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="p-6 space-y-2">
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => handleNavigate('home')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all group"
                >
                  <Home className="w-5 h-5 text-teal-600" />
                  <span className="text-gray-700 group-hover:text-teal-600 font-medium">Home</span>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  onClick={() => handleNavigate('events')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all group"
                >
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <span className="text-gray-700 group-hover:text-teal-600 font-medium">Browse Events</span>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    window.location.hash = 'how-it-works';
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all group"
                >
                  <Users className="w-5 h-5 text-teal-600" />
                  <span className="text-gray-700 group-hover:text-teal-600 font-medium">Features</span>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  onClick={() => handleNavigate('host')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all group"
                >
                  <LayoutDashboard className="w-5 h-5 text-teal-600" />
                  <span className="text-gray-700 group-hover:text-teal-600 font-medium">Host Dashboard</span>
                </motion.button>
              </div>

              {/* Divider */}
              <div className="px-6">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              </div>

              {/* Auth Actions */}
              <div className="p-6 space-y-3">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => handleNavigate('login')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-teal-400 transition-all group"
                >
                  <LogIn className="w-5 h-5 text-gray-600 group-hover:text-teal-600" />
                  <span className="text-gray-700 group-hover:text-teal-600 font-medium">Login</span>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  onClick={() => handleNavigate('login-choice')}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  <span className="font-semibold">Join us</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

