'use client';

import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 relative overflow-hidden py-12 px-4">
      {/* Organic Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large organic shapes */}
        <motion.div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] blur-2xl"
          animate={{
            borderRadius: [
              '40% 60% 70% 30% / 40% 50% 60% 50%',
              '60% 40% 30% 70% / 50% 60% 40% 60%',
              '40% 60% 70% 30% / 40% 50% 60% 50%',
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-indigo-200/30 to-slate-200/40 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] blur-2xl"
          animate={{
            borderRadius: [
              '60% 40% 30% 70% / 60% 30% 70% 40%',
              '30% 70% 60% 40% / 40% 70% 30% 60%',
              '60% 40% 30% 70% / 60% 30% 70% 40%',
            ],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-purple-200/25 to-blue-200/25 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Decorative organic elements */}
        <motion.div
          className="absolute top-20 right-1/4 w-32 h-40 bg-gradient-to-br from-indigo-300/20 to-blue-300/20 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] blur-sm"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-32 left-1/4 w-24 h-32 bg-gradient-to-br from-purple-300/15 to-pink-300/15 rounded-[70%_30%_50%_50%/40%_60%_40%_60%] blur-sm"
          animate={{
            y: [0, 15, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Animated Illustration - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg">
              {/* Main Character/Illustration */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative"
              >
                <svg viewBox="0 0 500 500" fill="none" className="w-full h-full">
                  {/* Background Circle */}
                  <motion.circle
                    cx="250"
                    cy="250"
                    r="180"
                    fill="url(#bgGradient)"
                    opacity="0.15"
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  
                  {/* Desk/Table */}
                  <rect x="120" y="320" width="260" height="12" rx="6" fill="#94a3b8" opacity="0.3" />
                  
                  {/* Person Body */}
                  <motion.ellipse
                    cx="250"
                    cy="280"
                    rx="45"
                    ry={50}
                    fill="url(#bodyGradient)"
                    initial={{ ry: 50 }}
                    animate={{
                      ry: [50, 52, 50],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />

                  {/* Person Head */}
                  <motion.circle
                    cx="250"
                    cy="220"
                    r="28"
                    fill="#fbbf24"
                    animate={{
                      y: [0, -2, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />

                  {/* Hair */}
                  <path
                    d="M235 205 Q250 190, 265 205"
                    fill="#92400e"
                    opacity="0.8"
                  />
                  <circle cx="235" cy="210" r="8" fill="#92400e" opacity="0.8" />
                  <circle cx="265" cy="210" r="8" fill="#92400e" opacity="0.8" />

                  {/* Eyes */}
                  <motion.circle
                    cx="242"
                    cy="220"
                    r="2"
                    fill="#1e293b"
                    animate={{
                      scaleY: [1, 0.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  />
                  <motion.circle
                    cx="258"
                    cy="220"
                    r="2"
                    fill="#1e293b"
                    animate={{
                      scaleY: [1, 0.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  />

                  {/* Smile */}
                  <path
                    d="M245 228 Q250 232, 255 228"
                    stroke="#1e293b"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Left Arm reaching to laptop */}
                  <motion.path
                    d="M210 280 Q200 290, 190 300 L180 310"
                    stroke="url(#armGradient)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ d: "M210 280 Q200 290, 190 300 L180 310" }}
                    animate={{
                      d: [
                        "M210 280 Q200 290, 190 300 L180 310",
                        "M210 280 Q198 288, 188 298 L178 308",
                        "M210 280 Q200 290, 190 300 L180 310",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />

                  {/* Right Arm reaching to laptop */}
                  <motion.path
                    d="M290 280 Q300 290, 310 300 L320 310"
                    stroke="url(#armGradient)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ d: "M290 280 Q300 290, 310 300 L320 310" }}
                    animate={{
                      d: [
                        "M290 280 Q300 290, 310 300 L320 310",
                        "M290 280 Q302 288, 312 298 L322 308",
                        "M290 280 Q300 290, 310 300 L320 310",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.1,
                    }}
                  />

                  {/* Hands on keyboard */}
                  <circle cx="180" cy="312" r="8" fill="#fcd34d" />
                  <circle cx="320" cy="312" r="8" fill="#fcd34d" />

                  {/* Laptop Base */}
                  <rect x="140" y="300" width="220" height="20" rx="4" fill="#334155" />
                  <rect x="145" y="305" width="210" height="10" rx="2" fill="#475569" />
                  
                  {/* Laptop Keyboard Details */}
                  <g opacity="0.4">
                    {[...Array(8)].map((_, i) => (
                      <rect key={`key-${i}`} x={155 + i * 25} y="308" width="18" height="4" rx="1" fill="#64748b" />
                    ))}
                  </g>

                  {/* Laptop Screen */}
                  <rect x="150" y="180" width="200" height="125" rx="6" fill="#1e293b" />
                  <rect x="158" y="188" width="184" height="105" rx="3" fill="url(#screenGradient)" />

                  {/* Screen Content - Login Form UI */}
                  <g opacity="0.9">
                    {/* Browser Bar */}
                    <rect x="158" y="188" width="184" height="12" fill="#e2e8f0" />
                    <circle cx="165" cy="194" r="2" fill="#ef4444" />
                    <circle cx="172" cy="194" r="2" fill="#fbbf24" />
                    <circle cx="179" cy="194" r="2" fill="#22c55e" />
                    
                    {/* Login Form Header */}
                    <text x="250" y="220" textAnchor="middle" fill="#1e293b" fontSize="10" fontWeight="bold">Login</text>
                    
                    {/* Email Input Field */}
                    <rect x="175" y="230" width="150" height="16" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                    <text x="185" y="241" fill="#94a3b8" fontSize="7">email@example.com</text>
                    
                    {/* Password Input Field */}
                    <rect x="175" y="252" width="150" height="16" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                    <circle cx="185" cy="260" r="1.5" fill="#94a3b8" />
                    <circle cx="192" cy="260" r="1.5" fill="#94a3b8" />
                    <circle cx="199" cy="260" r="1.5" fill="#94a3b8" />
                    <circle cx="206" cy="260" r="1.5" fill="#94a3b8" />
                    
                    {/* Login Button */}
                    <motion.rect
                      x="175"
                      y="274"
                      width="150"
                      height="16"
                      rx="8"
                      fill="url(#buttonGradient)"
                      animate={{
                        opacity: [1, 0.8, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                    <text x="250" y="285" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">Sign In</text>
                  </g>

                  {/* Typing Indicator Dots */}
                  <motion.circle
                    cx="310"
                    cy="260"
                    r="2"
                    fill="#3b82f6"
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />

                  {/* Floating UI Elements */}
                  <motion.g
                    animate={{
                      y: [0, -15, 0],
                      x: [0, 10, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    {/* Lock Icon */}
                    <rect x="90" y="150" width="24" height="28" rx="4" fill="#60a5fa" opacity="0.8" />
                    <circle cx="102" cy="156" r="4" fill="none" stroke="#ffffff" strokeWidth="2" />
                    <rect x="98" y="158" width="8" height="10" rx="1" fill="#ffffff" />
                  </motion.g>

                  <motion.g
                    animate={{
                      y: [0, 12, 0],
                      x: [0, -8, 0],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.5,
                    }}
                  >
                    {/* Mail Icon */}
                    <rect x="380" y="200" width="28" height="20" rx="3" fill="#8b5cf6" opacity="0.8" />
                    <path d="M380 200 L394 210 L408 200" stroke="#ffffff" strokeWidth="2" fill="none" />
                  </motion.g>

                  <motion.g
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 1,
                    }}
                  >
                    {/* Shield Icon */}
                    <path d="M380 280 L394 275 L408 280 L408 295 Q408 305, 394 310 Q380 305, 380 295 Z" fill="#22c55e" opacity="0.8" />
                    <path d="M388 290 L392 294 L400 284" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </motion.g>

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                    <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                    <linearGradient id="armGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#93c5fd" />
                      <stop offset="100%" stopColor="#60a5fa" />
                    </linearGradient>
                    <linearGradient id="screenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#f1f5f9" />
                      <stop offset="100%" stopColor="#e2e8f0" />
                    </linearGradient>
                    <linearGradient id="buttonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>

              {/* Title Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-center mt-8"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Secure Login</h2>
                <p className="text-gray-700">Access your account with confidence</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-full max-w-md mx-auto lg:mx-0"
          >
            {/* Main Card */}
            <div className="relative">
              {/* Subtle shadow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-[2rem] blur-xl translate-y-2" />
              
              {/* Card */}
              <div className="relative bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-xl border border-white/40 p-8 sm:p-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Login</h1>
                    <p className="text-gray-600 text-sm sm:text-base">Welcome back! Please enter your details</p>
                  </motion.div>
                </div>

                {/* Login Form */}
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

                  {/* Email Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
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
                        className="pl-12 pr-4 py-5 sm:py-6 rounded-2xl border-2 border-slate-200 bg-slate-50/50 focus:border-blue-400 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </motion.div>

                  {/* Password Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
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
                        className="pl-12 pr-12 py-5 sm:py-6 rounded-2xl border-2 border-slate-200 bg-slate-50/50 focus:border-blue-400 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
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

                  {/* Forgot Password */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="flex justify-end"
                  >
                    <a href="#" className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium">
                      Forgot Password?
                    </a>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-5 sm:py-6 rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        'Login'
                      )}
                    </Button>
                  </motion.div>
                </form>

                {/* Divider */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="relative my-8"
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-600">Or continue with</span>
                  </div>
                </motion.div>

                {/* Social Login */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
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

                {/* Sign Up Link */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="text-center text-gray-700 mt-8 text-sm sm:text-base"
                >
                  Don't have an account?{' '}
                  <Link 
                    href="/register"
                    className="text-blue-600 hover:text-blue-700 transition-colors font-semibold"
                  >
                    Sign up
                  </Link>
                </motion.p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

