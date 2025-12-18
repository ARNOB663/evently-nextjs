'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Calendar, Home, Users, LayoutDashboard, LogIn, UserPlus, LogOut, User, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { Notifications } from './Notifications';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when navigating
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? 'py-2 sm:py-3' : 'py-3 sm:py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className={`relative bg-white/95 backdrop-blur-md rounded-full transition-all duration-300 ${
            isScrolled 
              ? 'shadow-2xl border border-gray-200/50 scale-[0.98]' 
              : 'shadow-lg border border-white/20'
          }`}
          animate={{
            y: isScrolled ? 0 : 0,
          }}
        >
        {/* Animated Border */}
        <motion.div
          className="absolute inset-0 rounded-full p-[2px] -z-10"
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

        <div className="relative flex items-center justify-between px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 gap-2 md:gap-3">
          {/* Logo */}
          <Link href="/">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <div className="relative flex items-center gap-2">
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
                <span className="hidden sm:inline text-base sm:text-lg md:text-xl text-gray-900 whitespace-nowrap">
                  Events & Activities
                </span>
              </div>
            </motion.div>
          </Link>

          {/* Navigation Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="hidden md:flex items-center gap-4 lg:gap-6"
          >
            <Link
              href="/events"
              className="text-gray-700 hover:text-teal-600 transition-colors duration-200 whitespace-nowrap text-sm"
            >
              Browse Events
            </Link>
            <a
              href="#how-it-works"
              className="text-gray-700 hover:text-teal-600 transition-colors duration-200 whitespace-nowrap text-sm"
            >
              Features
            </a>
            {isAuthenticated && user && (user.role === 'host' || user.role === 'admin') && (
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-teal-600 transition-colors duration-200 whitespace-nowrap text-sm"
              >
                Dashboard
              </Link>
            )}
            {!isAuthenticated && (
              <Link
                href="/host-login"
                className="text-gray-700 hover:text-teal-600 transition-colors duration-200 whitespace-nowrap text-sm"
              >
                Host Login
              </Link>
            )}
          </motion.div>

          {/* Auth Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="hidden md:flex items-center gap-2"
          >
            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <Notifications />
                {/* Primary quick actions (icons only on md, labels on xl) */}
                <div className="flex items-center gap-1">
                  {/* Discover Link */}
                  <Link
                    href="/discover"
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-gray-700 hover:text-teal-600 hover:bg-teal-50 transition-colors duration-200"
                    title="Discover"
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden xl:inline text-sm">Discover</span>
                  </Link>
                  {/* Messages Link */}
                  <Link
                    href="/messages"
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-gray-700 hover:text-teal-600 hover:bg-teal-50 transition-colors duration-200 relative"
                    title="Messages"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden xl:inline text-sm">Messages</span>
                  </Link>
                  {/* Friends Link */}
                  <Link
                    href="/friends"
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-gray-700 hover:text-teal-600 hover:bg-teal-50 transition-colors duration-200 relative"
                    title="Friends"
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden xl:inline text-sm">Friends</span>
                  </Link>
                </div>
                {/* User Info */}
                <Link href={user.role === 'host' || user.role === 'admin' ? '/host-profile' : '/profile'} className="ml-1">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.fullName}
                      className="w-7 h-7 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-teal-500 transition-all"
                      title={user.fullName}
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-teal-500 transition-all" title={user.fullName}>
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </Link>
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 transition-colors duration-200 flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-red-50"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden xl:inline text-sm">Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* Login Button */}
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-teal-600 transition-colors duration-200 font-medium text-sm whitespace-nowrap"
                >
                  Login
                </Link>

                {/* Sign Up Button */}
                <Link
                  href="/login-choice"
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-2 rounded-full transition-all duration-200 shadow-md hover:shadow-lg font-semibold text-sm whitespace-nowrap"
                >
                  Join us
                </Link>
              </>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-teal-600 transition-colors duration-200"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.div>
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
                <Link href="/" onClick={handleLinkClick}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all group"
                  >
                    <Home className="w-5 h-5 text-teal-600" />
                    <span className="text-gray-700 group-hover:text-teal-600 font-medium">Home</span>
                  </motion.div>
                </Link>

                <Link href="/events" onClick={handleLinkClick}>
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all group"
                  >
                    <Calendar className="w-5 h-5 text-teal-600" />
                    <span className="text-gray-700 group-hover:text-teal-600 font-medium">Browse Events</span>
                  </motion.button>
                </Link>

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

                {isAuthenticated && user && (
                  <>
                    <Link
                      href={user.role === 'host' || user.role === 'admin' ? '/dashboard' : '/'}
                      onClick={handleLinkClick}
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all group"
                      >
                        <LayoutDashboard className="w-5 h-5 text-teal-600" />
                        <span className="text-gray-700 group-hover:text-teal-600 font-medium">
                          {user.role === 'host' || user.role === 'admin' ? 'Host Dashboard' : 'View Events'}
                        </span>
                      </motion.div>
                    </Link>
                    <Link
                      href={user.role === 'host' || user.role === 'admin' ? '/host-profile' : '/profile'}
                      onClick={handleLinkClick}
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.27 }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all group"
                      >
                        <User className="w-5 h-5 text-teal-600" />
                        <span className="text-gray-700 group-hover:text-teal-600 font-medium">Profile</span>
                      </motion.div>
                    </Link>
                    <Link
                      href="/friends"
                      onClick={handleLinkClick}
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.28 }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all group"
                      >
                        <Users className="w-5 h-5 text-teal-600" />
                        <span className="text-gray-700 group-hover:text-teal-600 font-medium">Friends</span>
                      </motion.div>
                    </Link>
                  </>
                )}
                {!isAuthenticated && (
                  <Link href="/host-login" onClick={handleLinkClick}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all group"
                    >
                      <LayoutDashboard className="w-5 h-5 text-teal-600" />
                      <span className="text-gray-700 group-hover:text-teal-600 font-medium">Host Dashboard</span>
                    </motion.div>
                  </Link>
                )}
              </div>

              {/* Divider */}
              <div className="px-6">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              </div>

              {/* Auth Actions */}
              <div className="p-6 space-y-3">
                {isAuthenticated && user ? (
                  <>
                    <Link
                      href={user.role === 'host' || user.role === 'admin' ? '/host-profile' : '/profile'}
                      onClick={handleLinkClick}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 hover:border-teal-400 transition-all cursor-pointer"
                      >
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium text-sm">{user.fullName}</p>
                          <p className="text-gray-600 text-xs">{user.email}</p>
                        </div>
                      </motion.div>
                    </Link>
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-red-200 hover:border-red-400 bg-red-50 hover:bg-red-100 transition-all group"
                    >
                      <LogOut className="w-5 h-5 text-red-600 group-hover:text-red-700" />
                      <span className="text-red-700 group-hover:text-red-800 font-medium">Logout</span>
                    </motion.button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={handleLinkClick}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-teal-400 transition-all group"
                      >
                        <LogIn className="w-5 h-5 text-gray-600 group-hover:text-teal-600" />
                        <span className="text-gray-700 group-hover:text-teal-600 font-medium">Login</span>
                      </motion.div>
                    </Link>

                    <Link href="/login-choice" onClick={handleLinkClick}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-5 h-5" />
                        <span className="font-semibold">Join us</span>
                      </motion.div>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

