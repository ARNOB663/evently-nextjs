'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Heart,
  Settings,
  Star,
  Ticket,
  CalendarCheck,
  CalendarX,
  Loader2,
  ArrowRight,
  Edit,
  User,
  Bell,
  Shield,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Skeleton } from './ui/skeleton';

interface Event {
  _id: string;
  eventName: string;
  eventType: string;
  description: string;
  date: string;
  time: string;
  location: string;
  minParticipants: number;
  maxParticipants: number;
  currentParticipants: number;
  joiningFee: number;
  image?: string;
  status: 'open' | 'full' | 'cancelled' | 'completed';
  hostId: {
    _id: string;
    fullName: string;
    profileImage?: string;
  };
}

interface UserData {
  _id: string;
  fullName: string;
  email: string;
  profileImage?: string;
  favoriteEvents?: string[];
}

export function UserDashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch user's events
  useEffect(() => {
    if (user && token) {
      fetchUserEvents();
    }
  }, [user, token]);

  const fetchUserEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch events the user has joined
      const response = await fetch(`/api/users/${user?._id}/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      const events: Event[] = data.events || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Separate into upcoming and past
      const upcoming = events.filter((e) => new Date(e.date) >= today);
      const past = events.filter((e) => new Date(e.date) < today);

      setUpcomingEvents(upcoming);
      setPastEvents(past);

      // Fetch saved/favorite events
      const userResponse = await fetch(`/api/users/${user?._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const favoriteIds = userData.user?.favoriteEvents || [];

        if (favoriteIds.length > 0) {
          // Fetch details for each favorite event
          const savedEventsData: Event[] = [];
          for (const eventId of favoriteIds.slice(0, 10)) {
            try {
              const eventRes = await fetch(`/api/events/${eventId}`);
              if (eventRes.ok) {
                const eventData = await eventRes.json();
                if (eventData.event) {
                  savedEventsData.push(eventData.event);
                }
              }
            } catch {
              // Skip failed fetches
            }
          }
          setSavedEvents(savedEventsData);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'full':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const EventCard = ({ event, showReviewButton = false }: { event: Event; showReviewButton?: boolean }) => (
    <Link href={`/events/${event._id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        <div className="flex flex-col sm:flex-row">
          {/* Event Image */}
          <div className="relative w-full sm:w-48 h-32 sm:h-auto flex-shrink-0">
            {event.image ? (
              <ImageWithFallback
                src={event.image}
                alt={event.eventName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white/50" />
              </div>
            )}
            <Badge className={`absolute top-2 right-2 ${getStatusColor(event.status)} text-xs`}>
              {event.status}
            </Badge>
          </div>

          {/* Event Details */}
          <div className="flex-1 p-4">
            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-1">
              {event.eventName}
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={event.hostId?.profileImage} />
                  <AvatarFallback className="bg-teal-100 text-teal-600 text-xs">
                    {event.hostId?.fullName?.charAt(0) || 'H'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-500">{event.hostId?.fullName}</span>
              </div>
              {showReviewButton && (
                <Button size="sm" variant="outline" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Leave Review
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );

  const EmptyState = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Button asChild className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
        <Link href="/events">Browse Events</Link>
      </Button>
    </div>
  );

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-32 w-full mb-6" />
          <Skeleton className="h-12 w-64 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-white">
                <AvatarImage src={user.profileImage} />
                <AvatarFallback className="bg-white text-teal-600 text-xl font-bold">
                  {user.fullName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">Welcome back, {user.fullName?.split(' ')[0]}!</h1>
                <p className="text-teal-100">Manage your events and account settings</p>
              </div>
              <Button asChild variant="secondary" className="bg-white text-teal-600 hover:bg-teal-50">
                <Link href="/profile/edit">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="p-4 text-center">
            <CalendarCheck className="w-8 h-8 text-teal-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{upcomingEvents.length}</p>
            <p className="text-sm text-gray-600">Upcoming</p>
          </Card>
          <Card className="p-4 text-center">
            <CalendarX className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{pastEvents.length}</p>
            <p className="text-sm text-gray-600">Attended</p>
          </Card>
          <Card className="p-4 text-center">
            <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{savedEvents.length}</p>
            <p className="text-sm text-gray-600">Saved</p>
          </Card>
          <Card className="p-4 text-center">
            <Ticket className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{upcomingEvents.length + pastEvents.length}</p>
            <p className="text-sm text-gray-600">Total Bookings</p>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full sm:w-auto flex flex-wrap gap-1 mb-6">
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Upcoming</span>
                <Badge className="bg-teal-100 text-teal-800 text-xs">{upcomingEvents.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-2">
                <CalendarX className="w-4 h-4" />
                <span className="hidden sm:inline">Past</span>
                <Badge className="bg-gray-100 text-gray-800 text-xs">{pastEvents.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Saved</span>
                <Badge className="bg-red-100 text-red-800 text-xs">{savedEvents.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Upcoming Events */}
            <TabsContent value="upcoming">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : upcomingEvents.length === 0 ? (
                <EmptyState
                  icon={CalendarCheck}
                  title="No upcoming events"
                  description="You haven't joined any upcoming events yet. Browse events to find something exciting!"
                />
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Past Events */}
            <TabsContent value="past">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : pastEvents.length === 0 ? (
                <EmptyState
                  icon={CalendarX}
                  title="No past events"
                  description="Events you've attended will appear here."
                />
              ) : (
                <div className="space-y-4">
                  {pastEvents.map((event) => (
                    <EventCard key={event._id} event={event} showReviewButton />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Saved Events */}
            <TabsContent value="saved">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : savedEvents.length === 0 ? (
                <EmptyState
                  icon={Heart}
                  title="No saved events"
                  description="Save events you're interested in to view them here later."
                />
              ) : (
                <div className="space-y-4">
                  {savedEvents.map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Account Settings */}
            <TabsContent value="settings">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/profile/edit">
                  <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                          Edit Profile
                        </h3>
                        <p className="text-sm text-gray-600">Update your personal information</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
                    </div>
                  </Card>
                </Link>

                <Link href="/settings/privacy">
                  <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                          Privacy Settings
                        </h3>
                        <p className="text-sm text-gray-600">Control your privacy preferences</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                  </Card>
                </Link>

                <Link href="/payments">
                  <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                          Payment History
                        </h3>
                        <p className="text-sm text-gray-600">View your payment transactions</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                    </div>
                  </Card>
                </Link>

                <Link href="/notifications">
                  <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                        <Bell className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                          Notifications
                        </h3>
                        <p className="text-sm text-gray-600">Manage notification preferences</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                    </div>
                  </Card>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
