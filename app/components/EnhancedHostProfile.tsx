'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Edit,
  Phone,
  MapPin,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Loader2,
  User,
  Heart,
  Mail,
  Calendar,
  Briefcase,
  Building2,
  Sparkles,
  X,
  Users,
  MessageSquare,
  Share2,
  MoreVertical,
  Camera,
  CheckCircle2,
  Star,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { FriendRequestButton } from './FriendRequestButton';
import { ReviewsList } from './ReviewsList';
import { ReportButton } from './ReportButton';
import Link from 'next/link';

interface ProfileStats {
  friendsCount: number;
  eventsHosted: number;
  eventsJoined: number;
  reviewsCount: number;
  averageRating: number;
}

export function EnhancedHostProfile() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileUserId = searchParams.get('userId') || user?._id;
  const isOwnProfile = profileUserId === user?._id;

  const [activeTab, setActiveTab] = useState<'about' | 'events' | 'friends' | 'reviews'>('about');
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [stats, setStats] = useState<ProfileStats>({
    friendsCount: 0,
    eventsHosted: 0,
    eventsJoined: 0,
    reviewsCount: 0,
    averageRating: 0,
  });
  const [friends, setFriends] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [imageModal, setImageModal] = useState<{ isOpen: boolean; imageUrl: string; alt: string }>({
    isOpen: false,
    imageUrl: '',
    alt: '',
  });

  useEffect(() => {
    if (user && token && profileUserId) {
      fetchProfile();
      fetchStats();
    }
  }, [user, token, profileUserId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${profileUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [friendsRes, eventsRes, reviewsRes] = await Promise.all([
        fetch(`/api/users/${profileUserId}/friends`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/users/${profileUserId}/events?type=all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/reviews?hostId=${profileUserId}&limit=1`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (friendsRes.ok) {
        const friendsData = await friendsRes.json();
        setStats((prev) => ({ ...prev, friendsCount: friendsData.totalCount || 0 }));
        setFriends(friendsData.friends?.slice(0, 12) || []);
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        const eventsList = eventsData.events || [];
        setEvents(eventsList);
        setStats((prev) => ({
          ...prev,
          eventsHosted: eventsList.filter((e: any) => e.hostId._id === profileUserId).length,
          eventsJoined: eventsList.filter((e: any) => e.hostId._id !== profileUserId).length,
        }));
      }

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setStats((prev) => ({
          ...prev,
          reviewsCount: reviewsData.pagination?.total || 0,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const openImageModal = (imageUrl: string, alt: string) => {
    if (imageUrl && imageUrl.trim() !== '') {
      setImageModal({ isOpen: true, imageUrl, alt });
    }
  };

  const closeImageModal = () => {
    setImageModal({ isOpen: false, imageUrl: '', alt: '' });
  };

  // Redirect if not authenticated (only for own profile)
  useEffect(() => {
    if (!authLoading && isOwnProfile) {
      if (!user || !token) {
        router.push('/host-login');
      } else if (user.role !== 'host' && user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [authLoading, user, token, isOwnProfile, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </motion.div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Profile not found</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'about', label: 'About', icon: Building2 },
    { id: 'events', label: 'Events', icon: Calendar, count: events.length },
    { id: 'friends', label: 'Friends', icon: Users, count: stats.friendsCount },
    { id: 'reviews', label: 'Reviews', icon: Star, count: stats.reviewsCount },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Section */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500">
        {profileData.coverImage && profileData.coverImage.trim() !== '' ? (
          <div
            className="absolute inset-0 cursor-pointer group"
            onClick={() => openImageModal(profileData.coverImage, 'Cover image')}
          >
            <ImageWithFallback
              src={profileData.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1 }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                  <Camera className="w-6 h-6 text-purple-600" />
                </div>
              </motion.div>
            </div>
          </div>
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-rose-500/20" />
      </div>

      {/* Profile Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <div
                className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden cursor-pointer group"
                onClick={() => openImageModal(profileData.profileImage || '', `${profileData.fullName}'s profile picture`)}
              >
                {profileData.profileImage ? (
                  <>
                    <ImageWithFallback
                      src={profileData.profileImage}
                      alt={profileData.fullName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                          <Camera className="w-5 h-5 text-purple-600" />
                        </div>
                      </motion.div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    <Building2 className="w-16 h-16 md:w-20 md:h-20 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                      {profileData.fullName}
                    </h1>
                    {profileData.role === 'host' && profileData.averageRating > 4 && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified Host
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    {profileData.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profileData.location}</span>
                      </div>
                    )}
                    {profileData.occupation && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{profileData.occupation}</span>
                      </div>
                    )}
                    {profileData.role && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        <Building2 className="w-3 h-3 mr-1" />
                        Host
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {!isOwnProfile && (
                    <>
                      <FriendRequestButton userId={profileUserId} onStatusChange={fetchStats} />
                      <Link href={`/messages?userId=${profileUserId}`}>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </Link>
                    </>
                  )}
                  {isOwnProfile && (
                    <Link href="/host-profile/edit">
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  )}
                  {!isOwnProfile && (
                    <ReportButton type="user" reportedUserId={profileUserId} />
                  )}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.friendsCount}</div>
                  <div className="text-sm text-gray-600">Friends</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.eventsHosted}</div>
                  <div className="text-sm text-gray-600">Hosted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.eventsJoined}</div>
                  <div className="text-sm text-gray-600">Joined</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
                    {profileData.averageRating?.toFixed(1) || '0.0'}
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors
                    border-b-2 min-w-fit
                    ${
                      activeTab === tab.id
                        ? 'border-purple-600 text-purple-600 bg-purple-50/50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {tab.count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'about' && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <AboutTab profileData={profileData} />
                </motion.div>
              )}
              {activeTab === 'events' && (
                <motion.div
                  key="events"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <EventsTab events={events} profileUserId={profileUserId} />
                </motion.div>
              )}
              {activeTab === 'friends' && (
                <motion.div
                  key="friends"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <FriendsTab friends={friends} friendsCount={stats.friendsCount} profileUserId={profileUserId} />
                </motion.div>
              )}
              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <ReviewsTab profileUserId={profileUserId} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {imageModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={closeImageModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeImageModal}
                className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-200 group"
                aria-label="Close image"
              >
                <X className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </button>
              <div className="relative w-full h-full flex items-center justify-center">
                <ImageWithFallback
                  src={imageModal.imageUrl}
                  alt={imageModal.alt}
                  className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// About Tab Component
function AboutTab({ profileData }: { profileData: any }) {
  return (
    <div className="space-y-6">
      {profileData.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{profileData.bio}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        {(profileData.phoneNumber || profileData.location || profileData.occupation || profileData.company) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileData.phoneNumber && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </div>
                  <p className="text-gray-900">{profileData.phoneNumber}</p>
                </div>
              )}
              {profileData.location && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </div>
                  <p className="text-gray-900">{profileData.location}</p>
                </div>
              )}
              {profileData.occupation && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Occupation
                  </div>
                  <p className="text-gray-900">{profileData.occupation}</p>
                </div>
              )}
              {profileData.company && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Company
                  </div>
                  <p className="text-gray-900">{profileData.company}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Event Categories */}
        {profileData.interests?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Event Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profileData.interests.map((interest: string) => (
                  <Badge key={interest} variant="secondary" className="bg-purple-100 text-purple-900 border-purple-200">
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Social Media Links */}
      {profileData.socialMediaLinks && (
        Object.values(profileData.socialMediaLinks).some((link: any) => link) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                Social Media
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {profileData.socialMediaLinks.instagram && (
                  <a
                    href={profileData.socialMediaLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <Instagram className="w-5 h-5 text-pink-600" />
                    <span className="text-sm text-gray-700 group-hover:text-purple-600">Instagram</span>
                  </a>
                )}
                {profileData.socialMediaLinks.twitter && (
                  <a
                    href={profileData.socialMediaLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <Twitter className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-gray-700 group-hover:text-purple-600">Twitter</span>
                  </a>
                )}
                {profileData.socialMediaLinks.facebook && (
                  <a
                    href={profileData.socialMediaLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <Facebook className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-700 group-hover:text-purple-600">Facebook</span>
                  </a>
                )}
                {profileData.socialMediaLinks.linkedin && (
                  <a
                    href={profileData.socialMediaLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <Linkedin className="w-5 h-5 text-blue-700" />
                    <span className="text-sm text-gray-700 group-hover:text-purple-600">LinkedIn</span>
                  </a>
                )}
                {profileData.socialMediaLinks.website && (
                  <a
                    href={profileData.socialMediaLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <Globe className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700 group-hover:text-purple-600">Website</span>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}

// Events Tab Component (reuse from EnhancedUserProfile)
function EventsTab({ events, profileUserId }: { events: any[]; profileUserId: string }) {
  const upcomingEvents = events.filter((e: any) => new Date(e.date) >= new Date());
  const pastEvents = events.filter((e: any) => new Date(e.date) < new Date());

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No events yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {upcomingEvents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Upcoming Events ({upcomingEvents.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event: any) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </div>
      )}

      {pastEvents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Past Events ({pastEvents.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastEvents.map((event: any) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EventCard({ event }: { event: any }) {
  return (
    <Link href={`/events/${event._id}`}>
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
        <CardContent className="p-0">
          {event.image ? (
            <div className="relative h-48 overflow-hidden rounded-t-xl">
              <ImageWithFallback
                src={event.image}
                alt={event.eventName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center rounded-t-xl">
              <Calendar className="w-12 h-12 text-purple-600" />
            </div>
          )}
          <div className="p-4">
            <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
              {event.eventName}
            </h4>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Friends Tab Component (reuse from EnhancedUserProfile)
function FriendsTab({ friends, friendsCount, profileUserId }: { friends: any[]; friendsCount: number; profileUserId: string }) {
  if (friends.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No friends yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          All Friends ({friendsCount})
        </h3>
        <Link href={`/friends?userId=${profileUserId}`}>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {friends.map((friend: any) => {
          const profileUrl = friend.role === 'host' || friend.role === 'admin' 
            ? `/host-profile?userId=${friend._id}` 
            : `/profile?userId=${friend._id}`;
          return (
            <Link key={friend._id} href={profileUrl}>
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group text-center p-4">
                {friend.profileImage ? (
                  <ImageWithFallback
                    src={friend.profileImage}
                    alt={friend.fullName}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-white group-hover:border-purple-500 transition-all"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3 border-2 border-white group-hover:border-purple-500 transition-all">
                    <User className="w-10 h-10 text-purple-600" />
                  </div>
                )}
                <h4 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors truncate">
                  {friend.fullName}
                </h4>
                {friend.location && (
                  <p className="text-xs text-gray-500 mt-1 truncate">{friend.location}</p>
                )}
                {friend.role && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {friend.role === 'host' ? 'Host' : 'User'}
                  </Badge>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Reviews Tab Component
function ReviewsTab({ profileUserId }: { profileUserId: string }) {
  return <ReviewsList hostId={profileUserId} showEventName={true} />;
}

