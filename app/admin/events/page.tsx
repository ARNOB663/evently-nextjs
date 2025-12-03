'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Calendar,
  Search,
  Trash2,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminEventsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !token) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/');
      } else {
        fetchEvents();
      }
    }
  }, [user, token, authLoading, router, page, search, statusFilter]);

  const fetchEvents = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page.toString());

      const response = await fetch(`/api/admin/events?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
        setStats(data.stats);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (eventId: string, status: string) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success('Event updated successfully');
        fetchEvents();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update event');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Event deleted successfully');
        fetchEvents();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete event');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete event');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      open: 'bg-green-100 text-green-800 border-green-200',
      full: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return <Badge className={colors[status] || ''}>{status}</Badge>;
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
            className="mb-6"
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
              <Calendar className="w-8 h-8 text-purple-600" />
              Event Moderation
            </h1>
          </motion.div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card className="p-4">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold">{stats.open}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-600">Full</p>
                <p className="text-2xl font-bold">{stats.full}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold">{stats.cancelled}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === '' ? 'default' : 'outline'}
                  onClick={() => {
                    setStatusFilter('');
                    setPage(1);
                  }}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'open' ? 'default' : 'outline'}
                  onClick={() => {
                    setStatusFilter('open');
                    setPage(1);
                  }}
                >
                  Open
                </Button>
                <Button
                  variant={statusFilter === 'full' ? 'default' : 'outline'}
                  onClick={() => {
                    setStatusFilter('full');
                    setPage(1);
                  }}
                >
                  Full
                </Button>
                <Button
                  variant={statusFilter === 'cancelled' ? 'default' : 'outline'}
                  onClick={() => {
                    setStatusFilter('cancelled');
                    setPage(1);
                  }}
                >
                  Cancelled
                </Button>
              </div>
            </div>
          </Card>

          {/* Events List */}
          <div className="space-y-4">
            {events.map((event) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {event.image && (
                      <div className="w-full md:w-32 h-32 flex-shrink-0">
                        <ImageWithFallback
                          src={event.image}
                          alt={event.eventName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {event.eventName}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{event.eventType}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                            <span>{event.location}</span>
                            <span>
                              {event.currentParticipants}/{event.maxParticipants} participants
                            </span>
                          </div>
                        </div>
                        {getStatusBadge(event.status)}
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">{event.description}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">Host:</span>
                        <span className="font-medium">{event.hostId?.fullName}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {event.status !== 'cancelled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateEvent(event._id, 'cancelled')}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                      {event.status === 'cancelled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateEvent(event._id, 'open')}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Reopen
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteEvent(event._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                      <Link href={`/events/${event._id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

