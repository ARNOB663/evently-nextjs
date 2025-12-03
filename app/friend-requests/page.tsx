'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserPlus, UserCheck, UserX, X, Check, Loader2, Inbox, Send, Users, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import Link from 'next/link';

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

export default function FriendRequestsPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchRequests();
    }
  }, [token, activeTab]);

  const fetchRequests = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/friends/request?type=${activeTab}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (activeTab === 'received') {
          setReceivedRequests(data.requests || []);
        } else {
          setSentRequests(data.requests || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
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
      } else {
        const error = await response.json();
        console.error('Accept request error:', error);
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

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Inbox className="w-8 h-8 text-teal-600" />
            Friend Requests
          </h1>
          <p className="text-gray-600">Manage your friend requests</p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'received' | 'sent')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="received" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Received ({receivedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Sent ({sentRequests.length})
            </TabsTrigger>
          </TabsList>

          {/* Received Requests */}
          <TabsContent value="received" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : receivedRequests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No friend requests</p>
                  <p className="text-gray-500 text-sm">You don't have any pending friend requests</p>
                </CardContent>
              </Card>
            ) : (
              receivedRequests.map((request) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Link href={`/profile?userId=${request.from._id}`}>
                          {request.from.profileImage ? (
                            <ImageWithFallback
                              src={request.from.profileImage}
                              alt={request.from.fullName}
                              className="w-16 h-16 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-teal-500 transition-all"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-teal-500 transition-all">
                              <User className="w-8 h-8 text-teal-600" />
                            </div>
                          )}
                        </Link>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <Link href={`/profile?userId=${request.from._id}`}>
                                <h3 className="font-semibold text-gray-900 hover:text-teal-600 transition-colors">
                                  {request.from.fullName}
                                </h3>
                              </Link>
                              <p className="text-sm text-gray-500 mt-1">{formatTime(request.createdAt)}</p>
                              {request.message && (
                                <p className="text-sm text-gray-700 mt-2 italic">"{request.message}"</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              onClick={() => handleAccept(request._id)}
                              disabled={actionLoading === request._id}
                              className="bg-teal-600 hover:bg-teal-700"
                              size="sm"
                            >
                              {actionLoading === request._id ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <Check className="w-4 h-4 mr-2" />
                              )}
                              Accept
                            </Button>
                            <Button
                              onClick={() => handleReject(request._id)}
                              disabled={actionLoading === request._id}
                              variant="outline"
                              size="sm"
                            >
                              {actionLoading === request._id ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <X className="w-4 h-4 mr-2" />
                              )}
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>

          {/* Sent Requests */}
          <TabsContent value="sent" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : sentRequests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No sent requests</p>
                  <p className="text-gray-500 text-sm">You haven't sent any friend requests</p>
                </CardContent>
              </Card>
            ) : (
              sentRequests.map((request) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Link href={`/profile?userId=${request.to._id}`}>
                          {request.to.profileImage ? (
                            <ImageWithFallback
                              src={request.to.profileImage}
                              alt={request.to.fullName}
                              className="w-16 h-16 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-teal-500 transition-all"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-teal-500 transition-all">
                              <User className="w-8 h-8 text-teal-600" />
                            </div>
                          )}
                        </Link>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <Link href={`/profile?userId=${request.to._id}`}>
                                <h3 className="font-semibold text-gray-900 hover:text-teal-600 transition-colors">
                                  {request.to.fullName}
                                </h3>
                              </Link>
                              <p className="text-sm text-gray-500 mt-1">{formatTime(request.createdAt)}</p>
                              {request.message && (
                                <p className="text-sm text-gray-700 mt-2 italic">"{request.message}"</p>
                              )}
                              <Badge variant="secondary" className="mt-2">
                                Pending
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              onClick={() => handleCancel(request._id)}
                              disabled={actionLoading === request._id}
                              variant="outline"
                              size="sm"
                            >
                              {actionLoading === request._id ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <X className="w-4 h-4 mr-2" />
                              )}
                              Cancel Request
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

