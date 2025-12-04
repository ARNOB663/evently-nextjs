'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Loader2, Search, UserPlus, Inbox, Send, UserCheck, UserX, Check, X, MapPin, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FriendRequestButton } from '../components/FriendRequestButton';
import Link from 'next/link';

interface Friend {
  _id: string;
  fullName: string;
  profileImage?: string;
  location?: string;
  bio?: string;
  interests?: string[];
  role?: string;
}

interface FriendRequest {
  _id: string;
  from: {
    _id: string;
    fullName: string;
    profileImage?: string;
  };
  to: {
    _id: string;
    fullName: string;
    profileImage?: string;
  };
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
}

export default function FriendsPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'requests' | 'search'>('all');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (token && user) {
      fetchFriends();
      fetchRequests();
    }
  }, [token, user]);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const debounce = setTimeout(() => {
        performSearch();
      }, 500);
      return () => clearTimeout(debounce);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchFriends = async () => {
    if (!token || !user?._id) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${user._id}/friends`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    if (!token) return;
    try {
      const [receivedRes, sentRes] = await Promise.all([
        fetch(`/api/friends/request?type=received`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/friends/request?type=sent`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (receivedRes.ok) {
        const data = await receivedRes.json();
        setReceivedRequests(data.requests || []);
      }
      if (sentRes.ok) {
        const data = await sentRes.json();
        setSentRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  const performSearch = async () => {
    if (!token || searchQuery.trim().length < 2) return;
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}&limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const handleAccept = async (requestId: string) => {
    if (!token) return;
    setActionLoading(requestId);
    try {
      const response = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });

      if (response.ok) {
        fetchRequests();
        fetchFriends();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to accept request');
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
      alert('Failed to accept request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!token) return;
    setActionLoading(requestId);
    try {
      const response = await fetch('/api/friends/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });

      if (response.ok) {
        fetchRequests();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
      alert('Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (requestId: string) => {
    if (!token) return;
    setActionLoading(requestId);
    try {
      const response = await fetch('/api/friends/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });

      if (response.ok) {
        fetchRequests();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to cancel request');
      }
    } catch (error) {
      console.error('Failed to cancel request:', error);
      alert('Failed to cancel request');
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const totalRequests = receivedRequests.length + sentRequests.length;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2 sm:gap-3">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
            Friends
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your friends, search, and requests all in one place</p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'requests' | 'search')} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
            <TabsTrigger value="all" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">All Friends</span>
              <span className="sm:hidden">Friends</span>
              <span className="hidden sm:inline">({friends.length})</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-1 sm:gap-2 relative text-xs sm:text-sm">
              <Inbox className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Requests</span>
              {totalRequests > 0 && (
                <Badge className="ml-1 bg-teal-600 text-white text-xs">{totalRequests}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Search className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Search</span>
            </TabsTrigger>
          </TabsList>

          {/* All Friends Tab */}
          <TabsContent value="all" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : friends.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No friends yet</p>
                  <p className="text-gray-500 text-sm mb-4">Start connecting with people to see them here!</p>
                  <Button onClick={() => setActiveTab('search')} className="bg-teal-600 hover:bg-teal-700">
                    <Search className="w-4 h-4 mr-2" />
                    Search for Friends
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {friends.map((friend) => (
                  <motion.div
                    key={friend._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link href={friend.role === 'host' ? `/host-profile?userId=${friend._id}` : `/profile?userId=${friend._id}`}>
                      <Card className="p-3 sm:p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                        <div className="flex flex-col items-center text-center">
                          {friend.profileImage ? (
                            <ImageWithFallback
                              src={friend.profileImage}
                              alt={friend.fullName}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-teal-100 mb-2 sm:mb-3"
                            />
                          ) : (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-teal-100 flex items-center justify-center border-2 border-teal-100 mb-2 sm:mb-3">
                              <User className="w-8 h-8 sm:w-10 sm:h-10 text-teal-600" />
                            </div>
                          )}
                          <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 truncate w-full">
                            {friend.fullName}
                          </h3>
                          {friend.location && (
                            <p className="text-xs text-gray-500 truncate w-full flex items-center justify-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {friend.location}
                            </p>
                          )}
                          {friend.role && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {friend.role === 'host' ? 'Host' : 'User'}
                            </Badge>
                          )}
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Received Requests */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <UserPlus className="w-5 h-5 text-teal-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Received ({receivedRequests.length})</h2>
                  </div>
                  {receivedRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">No pending requests</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {receivedRequests.map((request) => (
                        <motion.div
                          key={request._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Link href={`/profile?userId=${request.from._id}`}>
                            {request.from.profileImage ? (
                              <ImageWithFallback
                                src={request.from.profileImage}
                                alt={request.from.fullName}
                                className="w-12 h-12 rounded-full object-cover cursor-pointer"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                                <User className="w-6 h-6 text-teal-600" />
                              </div>
                            )}
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link href={`/profile?userId=${request.from._id}`}>
                              <h3 className="font-medium text-gray-900 hover:text-teal-600 truncate">
                                {request.from.fullName}
                              </h3>
                            </Link>
                            <p className="text-xs text-gray-500">{formatTime(request.createdAt)}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              onClick={() => handleAccept(request._id)}
                              disabled={actionLoading === request._id}
                              size="sm"
                              className="bg-teal-600 hover:bg-teal-700 h-8 px-2"
                            >
                              {actionLoading === request._id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              onClick={() => handleReject(request._id)}
                              disabled={actionLoading === request._id}
                              size="sm"
                              variant="outline"
                              className="h-8 px-2"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sent Requests */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Send className="w-5 h-5 text-teal-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Sent ({sentRequests.length})</h2>
                  </div>
                  {sentRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <Send className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">No sent requests</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sentRequests.map((request) => (
                        <motion.div
                          key={request._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Link href={`/profile?userId=${request.to._id}`}>
                            {request.to.profileImage ? (
                              <ImageWithFallback
                                src={request.to.profileImage}
                                alt={request.to.fullName}
                                className="w-12 h-12 rounded-full object-cover cursor-pointer"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                                <User className="w-6 h-6 text-teal-600" />
                              </div>
                            )}
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link href={`/profile?userId=${request.to._id}`}>
                              <h3 className="font-medium text-gray-900 hover:text-teal-600 truncate">
                                {request.to.fullName}
                              </h3>
                            </Link>
                            <p className="text-xs text-gray-500">{formatTime(request.createdAt)}</p>
                          </div>
                          <Button
                            onClick={() => handleCancel(request._id)}
                            disabled={actionLoading === request._id}
                            size="sm"
                            variant="outline"
                            className="h-8 px-2"
                          >
                            {actionLoading === request._id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by name, location, or interests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {searchQuery.trim().length < 2 ? (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-2">Search for Friends</p>
                    <p className="text-gray-500 text-sm">Type at least 2 characters to search</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <UserX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-2">No users found</p>
                    <p className="text-gray-500 text-sm">Try adjusting your search query</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map((person) => (
                      <motion.div
                        key={person._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                      >
                        <Card className="hover:shadow-lg transition-all duration-200">
                          <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                              <Link href={person.role === 'host' ? `/host-profile?userId=${person._id}` : `/profile?userId=${person._id}`} className="mb-4">
                                {person.profileImage ? (
                                  <ImageWithFallback
                                    src={person.profileImage}
                                    alt={person.fullName}
                                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg cursor-pointer"
                                  />
                                ) : (
                                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center border-4 border-white shadow-lg cursor-pointer">
                                    <User className="w-10 h-10 text-white" />
                                  </div>
                                )}
                              </Link>
                              <Link href={person.role === 'host' ? `/host-profile?userId=${person._id}` : `/profile?userId=${person._id}`}>
                                <h3 className="font-semibold text-lg text-gray-900 mb-1 hover:text-teal-600 transition-colors">
                                  {person.fullName}
                                </h3>
                              </Link>
                              {person.location && (
                                <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                                  <MapPin className="w-4 h-4" />
                                  <span>{person.location}</span>
                                </div>
                              )}
                              {person.role && (
                                <Badge
                                  variant="secondary"
                                  className={`mb-3 ${
                                    person.role === 'host' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'
                                  }`}
                                >
                                  {person.role === 'host' ? 'Host' : 'User'}
                                </Badge>
                              )}
                              {person._id !== user?._id && (
                                <div className="mt-2">
                                  <FriendRequestButton userId={person._id} onStatusChange={() => { fetchFriends(); fetchRequests(); }} />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
