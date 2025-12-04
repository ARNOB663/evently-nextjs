'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Tag,
  ArrowLeft,
  Star,
  User,
  Loader2,
  CheckCircle2,
  XCircle,
  CreditCard,
  Share2,
  Heart,
  Camera,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ReviewsList } from './ReviewsList';
import { ReviewForm } from './ReviewForm';
import { EventComments } from './EventComments';
import { EventPhotos } from './EventPhotos';
import { ReportButton } from './ReportButton';
import { toast } from 'sonner';
import Link from 'next/link';

interface EventDetailProps {
  eventId: string;
}

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
    averageRating?: number;
    totalReviews?: number;
    bio?: string;
    location?: string;
  };
  participants: Array<{ _id: string; fullName: string; profileImage?: string }>;
  createdAt: string;
}

export function EventDetail({ eventId }: EventDetailProps) {
  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshReviews, setRefreshReviews] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    fetchEvent();
    if (user && token) {
      checkFavorite();
    }
  }, [eventId, user, token]);

  // Handle payment success/cancelled query params
  useEffect(() => {
    const paymentStatus = searchParams?.get('payment');
    if (paymentStatus === 'success') {
      toast.success('Payment successful! You have been added to the event.');
      fetchEvent(); // Refresh event data
      router.replace(`/events/${eventId}`); // Remove query params
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment was cancelled.');
      router.replace(`/events/${eventId}`); // Remove query params
    }
  }, [searchParams, eventId, router]);

  const checkFavorite = async () => {
    if (!token || !user) return;

    try {
      const response = await fetch(`/api/users/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const favorites = data.user?.favoriteEvents || [];
        setIsFavorite(favorites.includes(eventId));
      }
    } catch (error) {
      console.error('Failed to check favorite:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated || !token) {
      toast.error('Please log in to save favorites');
      return;
    }

    try {
      setFavoriteLoading(true);
      const method = isFavorite ? 'DELETE' : 'POST';
      const response = await fetch(`/api/events/${eventId}/favorite`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
        toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update favorite');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update favorite');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/events/${eventId}`;
    const text = `Check out this event: ${event?.eventName}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.eventName,
          text: text,
          url: url,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/events/${eventId}`);
      const data = await response.json();

      if (response.ok) {
        setEvent(data.event);
      } else {
        setError(data.error || 'Failed to fetch event');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch event');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // If event has a joining fee, redirect to payment
    if (event && event.joiningFee > 0) {
      handlePaymentCheckout();
      return;
    }

    // Free event - join directly
    try {
      setJoining(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Successfully joined the event!');
        setEvent(data.event);
        toast.success('Successfully joined the event!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to join event');
        toast.error(data.error || 'Failed to join event');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to join event');
      toast.error(err.message || 'Failed to join event');
    } finally {
      setJoining(false);
    }
  };

  const handlePaymentCheckout = async () => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    try {
      setProcessingPayment(true);
      setError(null);

      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to create checkout session');
        toast.error(data.error || 'Failed to create checkout session');
        setProcessingPayment(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process payment');
      toast.error(err.message || 'Failed to process payment');
      setProcessingPayment(false);
    }
  };

  const handleLeaveEvent = async () => {
    if (!isAuthenticated) {
      return;
    }

    if (!confirm('Are you sure you want to leave this event?')) {
      return;
    }

    try {
      setLeaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/events/${eventId}/join`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Successfully left the event');
        setEvent(data.event);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to leave event');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to leave event');
    } finally {
      setLeaving(false);
    }
  };

  const isParticipant = () => {
    if (!user || !event) return false;
    return event.participants.some((p) => p._id === user._id);
  };

  const isHost = () => {
    if (!user || !event) return false;
    return event.hostId._id === user._id;
  };

  const canJoin = () => {
    if (!event) return false;
    return (
      event.status === 'open' &&
      event.currentParticipants < event.maxParticipants &&
      !isParticipant() &&
      !isHost()
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'full':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-4">
        <Card className="p-8 text-center max-w-md">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-24 sm:pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </motion.div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800"
          >
            <CheckCircle2 className="w-5 h-5" />
            {success}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800"
          >
            <XCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Event Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg bg-gray-100"
            >
              {event.image ? (
                <ImageWithFallback
                  src={event.image}
                  alt={event.eventName}
                  className="w-full h-[250px] sm:h-[400px] md:h-[500px] object-cover"
                />
              ) : (
                <div className="w-full h-[250px] sm:h-[400px] md:h-[500px] flex items-center justify-center bg-gradient-to-br from-teal-100 to-cyan-100">
                  <div className="text-center">
                    <Tag className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No image available</p>
                  </div>
                </div>
              )}
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center gap-2">
                <Badge className={`${getStatusColor(event.status)} text-xs sm:text-sm`}>{event.status}</Badge>
                {isAuthenticated && user && !isHost() && (
                  <ReportButton type="event" reportedEventId={eventId} />
                )}
              </div>
            </motion.div>

            {/* Event Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-4 sm:p-6 md:p-8">
                <div className="mb-4 sm:mb-6">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                    {event.eventName}
                  </h1>
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    <span className="text-base sm:text-lg text-gray-600">{event.eventType}</span>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">Date</p>
                      <p className="text-sm sm:text-base text-gray-900 font-medium break-words">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">Time</p>
                      <p className="text-sm sm:text-base text-gray-900 font-medium">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">Location</p>
                      <p className="text-sm sm:text-base text-gray-900 font-medium break-words">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Participants</p>
                      <p className="text-gray-900 font-medium">
                        {event.currentParticipants} / {event.maxParticipants}
                      </p>
                    </div>
                  </div>

                  {event.joiningFee > 0 && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Joining Fee</p>
                        <p className="text-gray-900 font-medium">${event.joiningFee}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="border-t pt-4 sm:pt-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">About this event</h2>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Participants Section */}
            {event.participants && event.participants.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="p-4 sm:p-6 md:p-8">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                      Participants ({event.participants.length})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                      {event.participants.map((participant) => (
                        <div
                          key={participant._id}
                          className="flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg"
                        >
                          <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                            <AvatarImage src={participant.profileImage} />
                            <AvatarFallback className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                              {participant.fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-sm font-medium text-gray-900 text-center">
                            {participant.fullName}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
            )}

            {/* Reviews Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                key={refreshReviews}
              >
              <Card className="p-4 sm:p-6 md:p-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 fill-yellow-400" />
                  Reviews
                </h2>

                  {/* Review Form */}
                  {isAuthenticated && user ? (
                    isParticipant() && !isHost() ? (
                      <div className="mb-8">
                        <ReviewForm
                          hostId={event.hostId._id}
                          eventId={eventId}
                          eventName={event.eventName}
                          onSuccess={() => {
                            setRefreshReviews((prev) => prev + 1);
                            fetchEvent();
                          }}
                        />
                      </div>
                    ) : !isParticipant() ? (
                      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 text-sm">
                          You need to join this event to leave a review.
                        </p>
                      </div>
                    ) : isHost() ? (
                      <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-gray-600 text-sm">
                          You cannot review your own event.
                        </p>
                      </div>
                    ) : null
                  ) : (
                    <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                      <p className="text-blue-800 text-sm mb-3">
                        Please log in to leave a review.
                      </p>
                      <Button asChild className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white">
                        <Link href="/login">Log In</Link>
                      </Button>
                    </div>
                  )}

                  {/* Reviews List */}
                  <ReviewsList eventId={eventId} showEventName={false} />
                </Card>
            </motion.div>

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-4 sm:p-6 md:p-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Discussion</h2>
                <EventComments eventId={eventId} />
              </Card>
            </motion.div>

            {/* Photos Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Camera className="w-6 h-6 text-teal-600" />
                  Event Photos
                </h2>
                <EventPhotos
                  eventId={eventId}
                  isParticipant={isParticipant()}
                  isHost={isHost()}
                />
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24 sm:top-28 space-y-4 sm:space-y-6"
            >
              {/* Action Card */}
              <Card className="p-4 sm:p-6">
                {event.joiningFee > 0 && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-1">Price</p>
                    <p className="text-3xl font-bold text-gray-900">${event.joiningFee}</p>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Available spots</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {event.maxParticipants - event.currentParticipants}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${(event.currentParticipants / event.maxParticipants) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {isHost() ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/dashboard')}
                  >
                    Manage Event
                  </Button>
                ) : isParticipant() ? (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleLeaveEvent}
                    disabled={leaving}
                  >
                    {leaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Leaving...
                      </>
                    ) : (
                      'Leave Event'
                    )}
                  </Button>
                ) : canJoin() ? (
                  event.joiningFee > 0 ? (
                    <Button
                      className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
                      onClick={handlePaymentCheckout}
                      disabled={processingPayment}
                    >
                      {processingPayment ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay ${event.joiningFee} to Join
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
                      onClick={handleJoinEvent}
                      disabled={joining}
                    >
                      {joining ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        'Join Event'
                      )}
                    </Button>
                  )
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    {event.status === 'full'
                      ? 'Event Full'
                      : event.status === 'cancelled'
                        ? 'Event Cancelled'
                        : event.status === 'completed'
                          ? 'Event Completed'
                          : 'Cannot Join'}
                  </Button>
                )}

                {!isAuthenticated && (
                  <p className="text-xs text-gray-500 text-center mt-4">
                    <button
                      onClick={() => router.push('/login')}
                      className="text-teal-600 hover:underline"
                    >
                      Sign in
                    </button>{' '}
                    to join this event
                  </p>
                )}

                {/* Share and Favorite Buttons */}
                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  {isAuthenticated && (
                    <Button
                      variant={isFavorite ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={handleToggleFavorite}
                      disabled={favoriteLoading}
                    >
                      <Heart
                        className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
                      />
                      {isFavorite ? 'Saved' : 'Save'}
                    </Button>
                  )}
                </div>
              </Card>

              {/* Host Card */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Hosted by</h3>
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={event.hostId.profileImage} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg">
                      {event.hostId.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">{event.hostId.fullName}</p>
                    {event.hostId.averageRating && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {event.hostId.averageRating.toFixed(1)}
                        </span>
                        {event.hostId.totalReviews && (
                          <span className="text-sm text-gray-500">
                            ({event.hostId.totalReviews} reviews)
                          </span>
                        )}
                      </div>
                    )}
                    {event.hostId.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        {event.hostId.location}
                      </div>
                    )}
                    {event.hostId.bio && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {event.hostId.bio}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

