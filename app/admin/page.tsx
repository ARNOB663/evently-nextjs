'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Users,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Shield,
  Loader2,
  BarChart3,
  UserCheck,
  UserX,
  AlertCircle,
  Flag,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import Link from 'next/link';

export default function AdminDashboard() {
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

  if (!user || user.role !== 'admin') {
    return null;
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Shield className="w-8 h-8 text-purple-600" />
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-2">Manage your platform</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900">{analytics.users.total}</p>
                      <p className="text-xs text-green-600 mt-1">+{analytics.users.newUsers} new (30d)</p>
                    </div>
                    <Users className="w-12 h-12 text-blue-500" />
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Events</p>
                      <p className="text-3xl font-bold text-gray-900">{analytics.events.total}</p>
                      <p className="text-xs text-green-600 mt-1">+{analytics.events.newEvents} new (30d)</p>
                    </div>
                    <Calendar className="w-12 h-12 text-purple-500" />
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                      <p className="text-3xl font-bold text-gray-900">
                        ${analytics.revenue.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        ${analytics.revenue.recent.toFixed(2)} (30d)
                      </p>
                    </div>
                    <DollarSign className="w-12 h-12 text-green-500" />
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Avg Rating</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {analytics.reviews.averageRating.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {analytics.reviews.total} reviews
                      </p>
                    </div>
                    <Star className="w-12 h-12 text-yellow-500 fill-yellow-500" />
                  </div>
                </Card>
              </motion.div>
            </div>
          )}

          {/* Management Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/admin/users">
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                      <p className="text-sm text-gray-600">Manage users, roles, and permissions</p>
                    </div>
                  </div>
                  {analytics && (
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Users:</span>{' '}
                        <span className="font-semibold">{analytics.users.users}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Hosts:</span>{' '}
                        <span className="font-semibold">{analytics.users.hosts}</span>
                      </div>
                    </div>
                  )}
                </Card>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link href="/admin/events">
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Event Moderation</h3>
                      <p className="text-sm text-gray-600">Approve, reject, or delete events</p>
                    </div>
                  </div>
                  {analytics && (
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Open:</span>{' '}
                        <span className="font-semibold">{analytics.events.open}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Completed:</span>{' '}
                        <span className="font-semibold">{analytics.events.completed}</span>
                      </div>
                    </div>
                  )}
                </Card>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link href="/admin/analytics">
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                      <p className="text-sm text-gray-600">View detailed platform analytics</p>
                    </div>
                  </div>
                  {analytics && (
                    <div className="text-sm">
                      <span className="text-gray-600">Transactions:</span>{' '}
                      <span className="font-semibold">{analytics.revenue.transactions}</span>
                    </div>
                  )}
                </Card>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Link href="/admin/reports">
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
                      <p className="text-sm text-gray-600">Review and manage user reports</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

