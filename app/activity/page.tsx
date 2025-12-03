'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Activity as ActivityIcon,
  Users,
  Calendar,
  Star,
  UserPlus,
  Filter,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import Link from 'next/link';

export default function ActivityPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !token) {
        router.push('/login');
      } else {
        fetchActivities();
      }
    }
  }, [user, token, authLoading, router, page, typeFilter]);

  const fetchActivities = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      params.append('page', page.toString());

      const response = await fetch(`/api/activity?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (page === 1) {
          setActivities(data.activities || []);
        } else {
          setActivities((prev) => [...prev, ...(data.activities || [])]);
        }
        setHasMore(data.pagination.page < data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
      case 'friend_accepted':
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'event_joined':
      case 'event_created':
      case 'event_cancelled':
        return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'review_posted':
        return <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
      case 'became_host':
        return <Users className="w-5 h-5 text-green-500" />;
      default:
        return <ActivityIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'friend_request':
      case 'friend_accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'event_joined':
      case 'event_created':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'event_cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'review_posted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'became_host':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (authLoading || (loading && activities.length === 0)) {
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ActivityIcon className="w-8 h-8 text-teal-600" />
                Activity Feed
              </h1>
              <Button variant="outline" size="sm" onClick={() => fetchActivities()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-gray-500" />
              <Button
                variant={typeFilter === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setTypeFilter('');
                  setPage(1);
                }}
              >
                All
              </Button>
              <Button
                variant={typeFilter === 'friend_accepted' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setTypeFilter('friend_accepted');
                  setPage(1);
                }}
              >
                Friends
              </Button>
              <Button
                variant={typeFilter === 'event_joined' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setTypeFilter('event_joined');
                  setPage(1);
                }}
              >
                Events
              </Button>
              <Button
                variant={typeFilter === 'review_posted' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setTypeFilter('review_posted');
                  setPage(1);
                }}
              >
                Reviews
              </Button>
            </div>
          </motion.div>

          {/* Activities */}
          {activities.length === 0 ? (
            <Card className="p-12 text-center">
              <ActivityIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No activities yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Start connecting with friends to see their activities here!
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <motion.div
                  key={activity._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-6">
                    <div className="flex gap-4">
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarImage src={activity.userId?.profileImage} />
                        <AvatarFallback className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                          {activity.userId?.fullName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getActivityIcon(activity.type)}
                            <Link
                              href={
                                activity.userId?.role === 'host'
                                  ? `/host-profile?userId=${activity.userId?._id}`
                                  : `/profile?userId=${activity.userId?._id}`
                              }
                              className="font-semibold text-gray-900 hover:text-teal-600"
                            >
                              {activity.userId?.fullName}
                            </Link>
                          </div>
                          <Badge className={getActivityColor(activity.type)}>
                            {activity.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-2">{activity.message}</p>
                        {activity.relatedEvent && (
                          <Link href={`/events/${activity.relatedEvent._id}`}>
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              {activity.relatedEvent.image && (
                                <ImageWithFallback
                                  src={activity.relatedEvent.image}
                                  alt={activity.relatedEvent.eventName}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {activity.relatedEvent.eventName}
                                </p>
                                <p className="text-xs text-gray-500">View event</p>
                              </div>
                            </div>
                          </Link>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

