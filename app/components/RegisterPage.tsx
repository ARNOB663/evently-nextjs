'use client';

import { motion } from 'motion/react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import Link from 'next/link';

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-slate-100 relative overflow-hidden py-12 px-4">
      {/* Organic Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large organic shapes */}
        <motion.div
          className="absolute -top-40 -right-40 w-[550px] h-[550px] bg-gradient-to-br from-purple-200/40 to-pink-200/40 rounded-[30%_70%_70%_30%/30%_50%_50%_70%] blur-2xl"
          animate={{
            borderRadius: [
              '30% 70% 70% 30% / 30% 50% 50% 70%',
              '70% 30% 30% 70% / 50% 70% 30% 50%',
              '30% 70% 70% 30% / 30% 50% 50% 70%',
            ],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-indigo-200/35 to-purple-200/35 rounded-[70%_30%_50%_50%/40%_60%_40%_60%] blur-2xl"
          animate={{
            borderRadius: [
              '70% 30% 50% 50% / 40% 60% 40% 60%',
              '40% 60% 40% 60% / 70% 30% 70% 30%',
              '70% 30% 50% 50% / 40% 60% 40% 60%',
            ],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-[450px] h-[450px] bg-gradient-to-br from-pink-200/20 to-rose-200/20 rounded-[60%_40%_60%_40%/50%_50%_50%_50%] blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Decorative organic elements */}
        <motion.div
          className="absolute top-32 left-1/4 w-28 h-36 bg-gradient-to-br from-purple-300/15 to-pink-300/15 rounded-[50%_50%_30%_70%/60%_40%_70%_30%] blur-sm"
          animate={{
            y: [0, -15, 0],
            rotate: [0, -8, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-40 right-1/4 w-24 h-28 bg-gradient-to-br from-indigo-300/20 to-purple-300/20 rounded-[40%_60%_50%_50%/50%_50%_60%_40%] blur-sm"
          animate={{
            y: [0, 18, 0],
            rotate: [0, 6, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1.5,
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Register Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-full max-w-md mx-auto lg:mx-0 order-2 lg:order-1"
          >
            {/* Main Card */}
            <div className="relative">
              {/* Subtle shadow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-[2rem] blur-xl translate-y-2" />
              
              {/* Card */}
              <div className="relative bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-xl border border-white/40 p-8 sm:p-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <h1 className="text-3xl sm:text-4xl text-slate-800 mb-3">Sign Up</h1>
                    <p className="text-slate-500 text-sm sm:text-base">Create your account to get started</p>
                  </motion.div>
                </div>

                {/* Register Form */}
                <form className="space-y-5">
                  {/* Full Name Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <label className="block text-sm text-slate-700 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Full name"
                        className="pl-12 pr-4 py-5 sm:py-6 rounded-2xl border-2 border-slate-200 bg-slate-50/50 focus:border-purple-400 focus:bg-white transition-all"
                      />
                    </div>
                  </motion.div>

                  {/* Email Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <label className="block text-sm text-slate-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="Email address"
                        className="pl-12 pr-4 py-5 sm:py-6 rounded-2xl border-2 border-slate-200 bg-slate-50/50 focus:border-purple-400 focus:bg-white transition-all"
                      />
                    </div>
                  </motion.div>

                  {/* Password Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <label className="block text-sm text-slate-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-12 pr-12 py-5 sm:py-6 rounded-2xl border-2 border-slate-200 bg-slate-50/50 focus:border-purple-400 focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </motion.div>

                  {/* Confirm Password Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <label className="block text-sm text-slate-700 mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-12 pr-12 py-5 sm:py-6 rounded-2xl border-2 border-slate-200 bg-slate-50/50 focus:border-purple-400 focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </motion.div>

                  {/* Terms Checkbox */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="text-sm"
                  >
                    <label className="flex items-start cursor-pointer">
                      <input type="checkbox" className="mr-2 mt-1 rounded" />
                      <span className="text-slate-600 text-xs sm:text-sm">
                        I agree to the{' '}
                        <a href="#" className="text-purple-600 hover:text-purple-700 transition-colors">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-purple-600 hover:text-purple-700 transition-colors">
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-5 sm:py-6 rounded-2xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all"
                    >
                      Create Account
                    </Button>
                  </motion.div>
                </form>

                {/* Divider */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="relative my-8"
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-500">Or continue with</span>
                  </div>
                </motion.div>

                {/* Social Sign Up */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.5 }}
                  className="space-y-3"
                >
                  <Button
                    variant="outline"
                    className="w-full rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all py-5 sm:py-6"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </motion.div>

                {/* Sign In Link */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.5 }}
                  className="text-center text-slate-600 mt-8 text-sm sm:text-base"
                >
                  Already have an account?{' '}
                  <Link 
                    href="/login"
                    className="text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    Sign in
                  </Link>
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Animated Illustration - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="hidden lg:flex items-center justify-center order-1 lg:order-2"
          >
            <div className="relative w-full max-w-md">
              {/* Main Phone Mockup */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative"
              >
                {/* Glow Effect Behind Phone */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 via-pink-400/30 to-rose-400/30 rounded-[3rem] blur-3xl scale-95" />
                
                {/* Phone Container */}
                <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-[3rem] p-3 shadow-2xl">
                  {/* Phone Screen */}
                  <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19] relative">
                    {/* Status Bar */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 flex items-center justify-between">
                      <span className="text-white text-xs">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-white/30" />
                        <div className="w-4 h-4 rounded-full bg-white/30" />
                        <div className="w-4 h-4 rounded-full bg-white/30" />
                      </div>
                    </div>

                    {/* App Content */}
                    <div className="p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-white h-full">
                      {/* App Logo */}
                      <div className="flex flex-col items-center mb-8 mt-4">
                        <motion.div
                          animate={{
                            scale: [1, 1.05, 1],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg mb-3"
                        >
                          <svg
                            className="w-10 h-10 text-white"
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
                        </motion.div>
                        <h3 className="text-lg text-slate-800">Events & Activities</h3>
                        <p className="text-xs text-slate-500">Create Account</p>
                      </div>

                      {/* Form Inputs */}
                      <div className="space-y-3">
                        <motion.div
                          animate={{
                            opacity: [0.7, 1, 0.7],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="bg-white rounded-xl p-3 shadow-sm border border-purple-100"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 text-purple-400">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <span className="text-xs text-slate-400">Full Name</span>
                          </div>
                        </motion.div>

                        <motion.div
                          animate={{
                            opacity: [0.7, 1, 0.7],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 0.3,
                          }}
                          className="bg-white rounded-xl p-3 shadow-sm border border-purple-100"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 text-purple-400">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-xs text-slate-400">Email Address</span>
                          </div>
                        </motion.div>

                        <motion.div
                          animate={{
                            opacity: [0.7, 1, 0.7],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 0.6,
                          }}
                          className="bg-white rounded-xl p-3 shadow-sm border border-purple-100"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 text-purple-400">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <div className="flex gap-1">
                              {[...Array(6)].map((_, i) => (
                                <div key={i} className="w-1 h-1 bg-slate-300 rounded-full" />
                              ))}
                            </div>
                          </div>
                        </motion.div>

                        {/* Sign Up Button */}
                        <motion.div
                          animate={{
                            scale: [1, 1.02, 1],
                            boxShadow: [
                              '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                              '0 10px 15px -3px rgb(0 0 0 / 0.2)',
                              '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            ],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-3 mt-6"
                        >
                          <p className="text-center text-white text-sm">Create Account</p>
                        </motion.div>
                      </div>

                      {/* Social Login */}
                      <div className="mt-6">
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-white text-slate-400">Or continue with</span>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="bg-white rounded-lg p-2 border border-slate-200 flex items-center justify-center gap-1">
                            <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded" />
                            <span className="text-xs text-slate-600">Google</span>
                          </div>
                          <div className="bg-white rounded-lg p-2 border border-slate-200 flex items-center justify-center gap-1">
                            <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-500 rounded" />
                            <span className="text-xs text-slate-600">Facebook</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phone Notch */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-10" />
                  
                  {/* Phone Buttons */}
                  <div className="absolute right-0 top-32 w-1 h-12 bg-slate-700 rounded-l" />
                  <div className="absolute right-0 top-48 w-1 h-16 bg-slate-700 rounded-l" />
                  <div className="absolute left-0 top-40 w-1 h-12 bg-slate-700 rounded-r" />
                </div>
              </motion.div>

              {/* Title Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-center mt-12"
              >
                <h2 className="text-3xl text-slate-800 mb-3">Mobile-First Experience</h2>
                <p className="text-slate-600 max-w-xs mx-auto">Sign up in seconds and start discovering amazing events on any device</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

