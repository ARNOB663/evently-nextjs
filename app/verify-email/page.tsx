'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Mail, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { toast } from 'sonner';
import Link from 'next/link';

function VerifyEmailPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
    }
  }, [token]);

  const verifyEmail = async () => {
    if (!token) return;

    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);

      if (response.ok) {
        setStatus('success');
        setMessage('Email verified successfully!');
        toast.success('Email verified successfully!');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        const data = await response.json();
        setStatus('error');
        setMessage(data.error || 'Failed to verify email');
        toast.error(data.error || 'Failed to verify email');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to verify email');
      toast.error(error.message || 'Failed to verify email');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="w-16 h-16 animate-spin text-teal-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h1>
                <p className="text-gray-600">Please wait...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <p className="text-sm text-gray-500">Redirecting to login...</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex flex-col gap-2">
                  <Link href="/login">
                    <Button className="w-full">Go to Login</Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/forgot-password')}
                  >
                    Request New Verification Email
                  </Button>
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24" />}>
      <VerifyEmailPageInner />
    </Suspense>
  );
}

