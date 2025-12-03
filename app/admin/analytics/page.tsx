'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Star,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import Link from 'next/link';

export default function AdminAnalyticsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !token) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/');
      } else {
        fetchAnalytics();
      }
    }
  }, [user, token, authLoading, router]);

  const fetchAnalytics = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-green-600" />
              Platform Analytics
            </h1>
          </motion.div>

          {analytics && (
            <div className="space-y-6">
              {/* User Analytics */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  User Analytics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{analytics.users.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Regular Users</p>
                    <p className="text-2xl font-bold">{analytics.users.users}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Hosts</p>
                    <p className="text-2xl font-bold">{analytics.users.hosts}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">New (30 days)</p>
                    <p className="text-2xl font-bold text-green-600">+{analytics.users.newUsers}</p>
                  </div>
                </div>
              </Card>

              {/* Event Analytics */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Event Analytics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold">{analytics.events.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Open</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.events.open}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Full</p>
                    <p className="text-2xl font-bold text-blue-600">{analytics.events.full}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cancelled</p>
                    <p className="text-2xl font-bold text-red-600">{analytics.events.cancelled}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">New (30 days)</p>
                    <p className="text-2xl font-bold text-green-600">+{analytics.events.newEvents}</p>
                  </div>
                </div>
              </Card>

              {/* Revenue Analytics */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Revenue Analytics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-600">
                      ${analytics.revenue.total.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Transactions</p>
                    <p className="text-3xl font-bold">{analytics.revenue.transactions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Revenue (30 days)</p>
                    <p className="text-3xl font-bold text-green-600">
                      ${analytics.revenue.recent.toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Review Analytics */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                  Review Analytics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Reviews</p>
                    <p className="text-3xl font-bold">{analytics.reviews.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {analytics.reviews.averageRating.toFixed(1)} / 5.0
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

