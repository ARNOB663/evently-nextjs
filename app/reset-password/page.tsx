'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Loader2, CheckCircle2, Mail, Shield, ArrowLeft, Clock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Prefill email from localStorage (if coming from /forgot-password)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedEmail = window.localStorage.getItem('resetEmail');
        if (storedEmail) {
          setEmail(storedEmail);
          setStep('otp');
        }
      }
    } catch (e) {
      console.error('Failed to read reset email from localStorage', e);
    }
  }, []);

  // OTP Timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (otpTimer === 0 && step === 'otp') {
      setCanResend(true);
    }
  }, [otpTimer, step]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('OTP sent to your email!');
        setStep('otp');
        setOtpTimer(600); // 10 minutes
        setCanResend(false);
      } else {
        toast.error(data.error || 'Failed to send OTP');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    await handleRequestOTP(new Event('submit') as any);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, '');
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    setOtp(newOtp);
    if (pastedData.length === 6) {
      document.getElementById('otp-5')?.focus();
    }
  };

  const otpValue = otp.join('');

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otpValue.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    // OTP is verified when resetting password, so just move to password step
    setStep('password');
    toast.success('OTP verified! Now set your new password');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: otpValue, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password reset successfully!');
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        toast.error(data.error || 'Failed to reset password');
        // If OTP is invalid, go back to OTP step
        if (data.error?.includes('OTP') || data.error?.includes('expired')) {
          setStep('otp');
          setOtp(['', '', '', '', '', '']);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const steps = [
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'otp', label: 'Verify OTP', icon: Shield },
    { id: 'password', label: 'New Password', icon: Lock },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 pt-24 pb-12 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <Card className="p-8 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
                <p className="text-gray-600 mb-6">Your password has been successfully reset.</p>
                <p className="text-sm text-gray-500 mb-6">Redirecting to login...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: 'linear' }}
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 h-2 rounded-full"
                  />
                </div>
              </motion.div>
            ) : (
              <>
                {/* Progress Steps */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    {steps.map((stepItem, index) => {
                      const StepIcon = stepItem.icon;
                      const isActive = index === currentStepIndex;
                      const isCompleted = index < currentStepIndex;
                      
                      return (
                        <div key={stepItem.id} className="flex items-center flex-1">
                          <div className="flex flex-col items-center flex-1">
                            <motion.div
                              initial={false}
                              animate={{
                                scale: isActive ? 1.1 : 1,
                                backgroundColor: isCompleted
                                  ? 'rgb(20, 184, 166)'
                                  : isActive
                                  ? 'rgb(20, 184, 166)'
                                  : 'rgb(229, 231, 235)',
                                // Use explicit RGB value instead of "white" to avoid Motion warning
                                color: isActive || isCompleted ? 'rgb(255, 255, 255)' : 'rgb(156, 163, 175)',
                              }}
                              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all"
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-6 h-6" />
                              ) : (
                                <StepIcon className="w-6 h-6" />
                              )}
                            </motion.div>
                            <p
                              className={`text-xs mt-2 font-medium ${
                                isActive ? 'text-teal-600' : 'text-gray-500'
                              }`}
                            >
                              {stepItem.label}
                            </p>
                          </div>
                          {index < steps.length - 1 && (
                            <div
                              className={`h-1 flex-1 mx-2 rounded ${
                                isCompleted ? 'bg-teal-600' : 'bg-gray-200'
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {/* Step 1: Email */}
                  {step === 'email' && (
                    <motion.div
                      key="email"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mb-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Mail className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">Enter Your Email</h2>
                            <p className="text-sm text-gray-500">We'll send you a 6-digit OTP</p>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleRequestOTP}>
                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="your.email@example.com"
                              required
                              disabled={loading}
                              className="pl-10 h-12 text-base border-2 focus:border-teal-500 transition-colors"
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg h-12 text-base font-semibold"
                          disabled={loading}
                          size="lg"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Sending OTP...
                            </>
                          ) : (
                            <>
                              <Mail className="w-5 h-5 mr-2" />
                              Send OTP
                            </>
                          )}
                        </Button>
                      </form>
                    </motion.div>
                  )}

                  {/* Step 2: OTP */}
                  {step === 'otp' && (
                    <motion.div
                      key="otp"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mb-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Shield className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">Enter OTP</h2>
                            <p className="text-sm text-gray-500">Check your email for the code</p>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleVerifyOTP}>
                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                            Enter the 6-digit code sent to <span className="text-teal-600 font-bold">{email}</span>
                          </label>
                          
                          <div className="flex gap-3 justify-center mb-4" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                              <motion.input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                className="w-14 h-16 text-center text-3xl font-bold border-2 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                                disabled={loading}
                                autoFocus={index === 0}
                              />
                            ))}
                          </div>

                          <div className="flex items-center justify-center gap-4 mb-4">
                            {otpTimer > 0 && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span className="font-mono font-semibold">{formatTime(otpTimer)}</span>
                              </div>
                            )}
                            {canResend && (
                              <button
                                type="button"
                                onClick={handleResendOTP}
                                className="text-sm text-teal-600 hover:text-teal-700 font-semibold"
                              >
                                Resend OTP
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setStep('email');
                              setOtp(['', '', '', '', '', '']);
                              setOtpTimer(0);
                            }}
                            className="text-sm text-teal-600 hover:text-teal-700 text-center w-full"
                          >
                            Change email address
                          </button>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg h-12 text-base font-semibold"
                          disabled={loading || otpValue.length !== 6}
                          size="lg"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <Shield className="w-5 h-5 mr-2" />
                              Verify OTP
                            </>
                          )}
                        </Button>
                      </form>
                    </motion.div>
                  )}

                  {/* Step 3: New Password */}
                  {step === 'password' && (
                    <motion.div
                      key="password"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mb-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Lock className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
                            <p className="text-sm text-gray-500">Choose a strong password</p>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleResetPassword}>
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            New Password
                          </label>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter new password (min. 6 characters)"
                              required
                              disabled={loading}
                              minLength={6}
                              className="pr-10 h-12 text-base border-2 focus:border-teal-500 transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          {password && (
                            <div className="mt-2">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4].map((level) => (
                                  <div
                                    key={level}
                                    className={`h-1 flex-1 rounded ${
                                      password.length >= level * 1.5
                                        ? password.length >= 8
                                          ? 'bg-green-500'
                                          : password.length >= 6
                                          ? 'bg-yellow-500'
                                          : 'bg-red-500'
                                        : 'bg-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {password.length < 6
                                  ? 'Too short'
                                  : password.length < 8
                                  ? 'Weak'
                                  : 'Strong'}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Confirm new password"
                              required
                              disabled={loading}
                              minLength={6}
                              className={`pr-10 h-12 text-base border-2 transition-colors ${
                                confirmPassword && password !== confirmPassword
                                  ? 'border-red-500 focus:border-red-500'
                                  : 'focus:border-teal-500'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          {confirmPassword && password !== confirmPassword && (
                            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                          )}
                          {confirmPassword && password === confirmPassword && (
                            <p className="text-xs text-green-500 mt-1">✓ Passwords match</p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg h-12 text-base font-semibold"
                          disabled={loading || password !== confirmPassword || password.length < 6}
                          size="lg"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Resetting...
                            </>
                          ) : (
                            <>
                              <Lock className="w-5 h-5 mr-2" />
                              Reset Password
                            </>
                          )}
                        </Button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link href="/login">
                    <Button variant="ghost" className="w-full" size="sm">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </Card>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
