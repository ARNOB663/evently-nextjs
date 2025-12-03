'use client';

import { motion } from 'motion/react';
import { Mail, Lock, User, Eye, EyeOff, Loader2, UserCog } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export function HostRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!acceptedTerms) {
      setError('Please accept the Terms of Service and Privacy Policy');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, fullName, 'host');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-lg">
                        <UserCog className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Sign Up</h1>
                    <p className="text-gray-600 text-sm sm:text-base">Sign up as a host to create and manage your events</p>
                  </motion.div>
                </div>

                {/* Register Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Full Name Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <label className="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-12 pr-4 py-5 sm:py-6 rounded-2xl border-2 border-slate-200 bg-slate-50/50 focus:border-purple-400 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </motion.div>

                  {/* Email Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <label className="block text-sm font-medium text-gray-900 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-12 pr-4 py-5 sm:py-6 rounded-2xl border-2 border-slate-200 bg-slate-50/50 focus:border-purple-400 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </motion.div>

                  {/* Password Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <label className="block text-sm font-medium text-gray-900 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-12 pr-12 py-5 sm:py-6 rounded-2xl border-2 border-slate-200 bg-slate-50/50 focus:border-purple-400 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                    <label className="block text-sm font-medium text-gray-900 mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-12 pr-12 py-5 sm:py-6 rounded-2xl border-2 border-slate-200 bg-slate-50/50 focus:border-purple-400 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={loading}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        disabled={loading}
                        className="mr-2 mt-1 rounded"
                        required
                      />
                      <span className="text-gray-700 text-xs sm:text-sm">
                        I agree to the{' '}
                        <a href="#" className="text-purple-600 hover:text-purple-700 transition-colors font-semibold">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-purple-600 hover:text-purple-700 transition-colors font-semibold">
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
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-5 sm:py-6 rounded-2xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Creating Host Account...
                        </>
                      ) : (
                        'Create Host Account'
                      )}
                    </Button>
                  </motion.div>
                </form>

                {/* Sign In Link */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="text-center text-gray-700 mt-8 text-sm sm:text-base"
                >
                  Already have a host account?{' '}
                  <Link 
                    href="/host-login"
                    className="text-purple-600 hover:text-purple-700 transition-colors font-semibold"
                  >
                    Sign in
                  </Link>
                </motion.p>

                {/* Back to Login Choice */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0, duration: 0.5 }}
                  className="text-center mt-4"
                >
                  <Link
                    href="/login-choice"
                    className="text-xs sm:text-sm text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    ← Back to login options
                  </Link>
                </motion.div>
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
                          <UserCog className="w-10 h-10 text-white" />
                        </motion.div>
                        <h3 className="text-lg text-slate-800">Events & Activities</h3>
                        <p className="text-xs text-slate-500">Host Dashboard</p>
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
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Host Management</h2>
                <p className="text-gray-700 max-w-xs mx-auto">Create and manage events with powerful host tools</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

