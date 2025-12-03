'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  CreditCard,
  DollarSign,
  Calendar,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import Link from 'next/link';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Payment {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    profileImage?: string;
  };
  hostId: {
    _id: string;
    fullName: string;
    profileImage?: string;
  };
  eventId: {
    _id: string;
    eventName: string;
    image?: string;
  };
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  refundedAmount?: number;
}

export default function PaymentsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'sent' | 'received'>('all');
  const [totals, setTotals] = useState({ sent: 0, received: 0 });

  useEffect(() => {
    if (!authLoading) {
      if (!user || !token) {
        router.push('/login');
      } else {
        fetchPayments();
      }
    }
  }, [user, token, authLoading, activeTab, router]);

  const fetchPayments = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/payments/history?type=${activeTab}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
        setTotals(data.totals || { sent: 0, received: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Refunded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-teal-600" />
              Payment History
            </h1>
          </motion.div>

          {/* Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">${totals.sent.toFixed(2)}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Earned</p>
                  <p className="text-2xl font-bold text-gray-900">${totals.received.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Payments</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="received">Received</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {payments.length === 0 ? (
                <Card className="p-12 text-center">
                  <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No payments found</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {activeTab === 'sent'
                      ? "You haven't made any payments yet"
                      : activeTab === 'received'
                        ? "You haven't received any payments yet"
                        : 'Your payment history will appear here'}
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <motion.div
                      key={payment._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          {/* Event Image */}
                          <div className="flex-shrink-0">
                            {payment.eventId.image ? (
                              <ImageWithFallback
                                src={payment.eventId.image}
                                alt={payment.eventId.eventName}
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center">
                                <Calendar className="w-8 h-8 text-teal-600" />
                              </div>
                            )}
                          </div>

                          {/* Payment Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                  {payment.eventId.eventName}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {activeTab === 'sent' || activeTab === 'all'
                                    ? `Paid to ${payment.hostId.fullName}`
                                    : `Received from ${payment.userId.fullName}`}
                                </p>
                              </div>
                              <div className="text-right">
                                <p
                                  className={`text-xl font-bold ${
                                    activeTab === 'received' ? 'text-green-600' : 'text-gray-900'
                                  }`}
                                >
                                  {activeTab === 'received' ? '+' : '-'}${payment.amount.toFixed(2)}
                                </p>
                                {getStatusBadge(payment.status)}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(payment.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                              {payment.refundedAmount && (
                                <div className="flex items-center gap-1 text-red-600">
                                  <XCircle className="w-4 h-4" />
                                  Refunded: ${payment.refundedAmount.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
}

