'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  DollarSign,
  Star,
  Users,
  Loader2,
  ArrowLeft,
  TrendingDown,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import Link from 'next/link';

export default function HostAnalyticsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !token) {
        router.push('/login');
      } else if (user.role !== 'host' && user.role !== 'admin') {
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
      const response = await fetch('/api/host/analytics', {
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
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              Host Analytics
            </h1>
          </motion.div>

          {analytics && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Events</p>
                      <p className="text-3xl font-bold">{analytics.events.total}</p>
                    </div>
                    <Calendar className="w-12 h-12 text-purple-500" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                      <p className="text-3xl font-bold text-green-600">
                        ${analytics.revenue.total.toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="w-12 h-12 text-green-500" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Participants</p>
                      <p className="text-3xl font-bold">{analytics.events.totalParticipants}</p>
                    </div>
                    <Users className="w-12 h-12 text-blue-500" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                      <p className="text-3xl font-bold text-yellow-600">
                        {analytics.reviews.averageRating.toFixed(1)}
                      </p>
                    </div>
                    <Star className="w-12 h-12 text-yellow-500 fill-yellow-500" />
                  </div>
                </Card>
              </div>

              {/* Event Stats */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Event Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Open Events</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.events.open}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {analytics.events.completed}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cancelled</p>
                    <p className="text-2xl font-bold text-red-600">
                      {analytics.events.cancelled}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Participants</p>
                    <p className="text-2xl font-bold">{analytics.events.totalParticipants}</p>
                  </div>
                </div>
              </Card>

              {/* Revenue Stats */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Statistics</h2>
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

              {/* Top Events */}
              {analytics.topEvents && analytics.topEvents.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Top Performing Events</h2>
                  <div className="space-y-3">
                    {analytics.topEvents.map((event: any, index: number) => (
                      <div
                        key={event._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{event.eventName}</p>
                            <p className="text-sm text-gray-600">
                              {event.participants} / {event.maxParticipants} participants
                            </p>
                          </div>
                        </div>
                        <Link href={`/events/${event._id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Review Stats */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Review Statistics</h2>
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

