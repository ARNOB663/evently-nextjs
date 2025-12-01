'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Calendar,
  Users,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Upload,
  Loader2,
  TrendingUp,
  Clock,
  MapPin,
  Tag,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

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
  participants: Array<{ _id: string; fullName: string; profileImage?: string }>;
  createdAt: string;
}

interface EventFormData {
  eventName: string;
  eventType: string;
  description: string;
  date: string;
  time: string;
  location: string;
  minParticipants: string;
  maxParticipants: string;
  joiningFee: string;
  image: string;
}

export function HostDashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Redirect if not host/admin
  useEffect(() => {
    if (!authLoading) {
      if (!user || !token) {
        router.push('/host-login');
      } else if (user.role !== 'host' && user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, token, authLoading, router]);

  const [formData, setFormData] = useState<EventFormData>({
    eventName: '',
    eventType: '',
    description: '',
    date: '',
    time: '',
    location: '',
    minParticipants: '1',
    maxParticipants: '10',
    joiningFee: '0',
    image: '',
  });

  // Fetch events for the host
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events?hostId=${user?._id}`);
      const data = await response.json();

      if (response.ok) {
        setEvents(data.events || []);
      } else {
        setError(data.error || 'Failed to fetch events');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchEvents();
    }
  }, [user, token]);

  // Calculate statistics
  const stats = {
    totalEvents: events.length,
    activeEvents: events.filter((e) => e.status === 'open').length,
    totalParticipants: events.reduce((sum, e) => sum + e.currentParticipants, 0),
    totalRevenue: events.reduce((sum, e) => sum + e.currentParticipants * e.joiningFee, 0),
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      setUploadError(null);
      
      // Check if user is authenticated
      if (!token) {
        setUploadError('You must be logged in to upload images. Please log in and try again.');
        setUploading(false);
        router.push('/host-login');
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.');
        setUploading(false);
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setUploadError('File size exceeds 5MB limit. Please choose a smaller image.');
        setUploading(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - browser will set it automatically with boundary for FormData
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setFormData((prev) => ({ ...prev, image: data.imageUrl }));
        setUploadError(null); // Clear any previous errors
      } else {
        // Handle 401 specifically
        if (response.status === 401) {
          setUploadError('Authentication failed. Please log in again.');
          router.push('/host-login');
        } else {
          setUploadError(data.error || 'Failed to upload image. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Failed to upload image. Please check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle create event
  const handleCreateEvent = async () => {
    try {
      setSubmitting(true);
      setError(null);

      if (!token) {
        setError('You must be logged in to create events. Please log in and try again.');
        router.push('/host-login');
        return;
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          minParticipants: parseInt(formData.minParticipants),
          maxParticipants: parseInt(formData.maxParticipants),
          joiningFee: parseFloat(formData.joiningFee),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsCreateDialogOpen(false);
        resetForm();
        fetchEvents();
      } else {
        if (response.status === 401) {
          setError('Authentication failed. Please log in again.');
          router.push('/host-login');
        } else {
          setError(data.error || 'Failed to create event');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle update event
  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;

    try {
      setSubmitting(true);
      setError(null);

      if (!token) {
        setError('You must be logged in to update events. Please log in and try again.');
        router.push('/host-login');
        return;
      }

      const response = await fetch(`/api/events/${selectedEvent._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          minParticipants: parseInt(formData.minParticipants),
          maxParticipants: parseInt(formData.maxParticipants),
          joiningFee: parseFloat(formData.joiningFee),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsEditDialogOpen(false);
        setSelectedEvent(null);
        resetForm();
        fetchEvents();
      } else {
        if (response.status === 401) {
          setError('Authentication failed. Please log in again.');
          router.push('/host-login');
        } else {
          setError(data.error || 'Failed to update event');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update event');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        fetchEvents();
      } else {
        setError(data.error || 'Failed to delete event');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete event');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      eventName: '',
      eventType: '',
      description: '',
      date: '',
      time: '',
      location: '',
      minParticipants: '1',
      maxParticipants: '10',
      joiningFee: '0',
      image: '',
    });
    setError(null);
  };

  // Open edit dialog
  const openEditDialog = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      eventName: event.eventName,
      eventType: event.eventType,
      description: event.description,
      date: new Date(event.date).toISOString().split('T')[0],
      time: event.time,
      location: event.location,
      minParticipants: event.minParticipants.toString(),
      maxParticipants: event.maxParticipants.toString(),
      joiningFee: event.joiningFee.toString(),
      image: event.image || '',
    });
    setIsEditDialogOpen(true);
  };

  // Open view dialog
  const openViewDialog = (event: Event) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  // Get status badge color
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!user || (user.role !== 'host' && user.role !== 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-24 sm:pt-28 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Host Dashboard
              </h1>
              <p className="text-gray-600">Manage your events and track your performance</p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setIsCreateDialogOpen(true);
              }}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
          >
            {error}
          </motion.div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Events</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
              </div>
              <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-teal-600" />
            </div>
          </Card>

          <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Events</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stats.activeEvents}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
            </div>
          </Card>

          <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Participants</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stats.totalParticipants}
                </p>
              </div>
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  ${stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Events List */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Your Events</h2>
          {events.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center">
              <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                No events yet
              </h3>
              <p className="text-gray-600 mb-6">Create your first event to get started!</p>
              <Button
                onClick={() => {
                  resetForm();
                  setIsCreateDialogOpen(true);
                }}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {events.map((event) => (
                <Card key={event._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {event.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.eventName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2">
                        {event.eventName}
                      </h3>
                      <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Tag className="w-4 h-4 mr-2" />
                        {event.eventType}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {event.time}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        {event.currentParticipants}/{event.maxParticipants} participants
                      </div>
                      {event.joiningFee > 0 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2" />
                          ${event.joiningFee} fee
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openViewDialog(event)}
                        className="flex-1 sm:flex-none"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(event)}
                        className="flex-1 sm:flex-none"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteEvent(event._id)}
                        className="flex-1 sm:flex-none"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-2xl font-bold text-gray-900">Create New Event</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Fill in the details to create a new event
            </DialogDescription>
          </DialogHeader>
          <EventForm
            formData={formData}
            setFormData={setFormData}
            handleImageUpload={handleImageUpload}
            uploading={uploading}
            uploadError={uploadError}
          />
          <DialogFooter className="pt-4 border-t mt-4">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateEvent}
              disabled={submitting}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Event'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-2xl font-bold text-gray-900">Edit Event</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Update the event details
            </DialogDescription>
          </DialogHeader>
          <EventForm
            formData={formData}
            setFormData={setFormData}
            handleImageUpload={handleImageUpload}
            uploading={uploading}
            uploadError={uploadError}
          />
          <DialogFooter className="pt-4 border-t mt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateEvent}
              disabled={submitting}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Event'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          {selectedEvent && (
            <>
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {selectedEvent.eventName}
                </DialogTitle>
                <DialogDescription className="mt-2">
                  <Badge className={getStatusColor(selectedEvent.status)}>
                    {selectedEvent.status}
                  </Badge>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {selectedEvent.image && (
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.eventName}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
                <div className="space-y-2">
                  <div>
                    <Label className="text-gray-700 font-semibold">Event Type</Label>
                    <p className="text-gray-600">{selectedEvent.eventType}</p>
                  </div>
                  <div>
                    <Label className="text-gray-700 font-semibold">Description</Label>
                    <p className="text-gray-600">{selectedEvent.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-700 font-semibold">Date</Label>
                      <p className="text-gray-600">
                        {new Date(selectedEvent.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-700 font-semibold">Time</Label>
                      <p className="text-gray-600">{selectedEvent.time}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-700 font-semibold">Location</Label>
                    <p className="text-gray-600">{selectedEvent.location}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-700 font-semibold">Participants</Label>
                      <p className="text-gray-600">
                        {selectedEvent.currentParticipants}/{selectedEvent.maxParticipants}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-700 font-semibold">Joining Fee</Label>
                      <p className="text-gray-600">${selectedEvent.joiningFee}</p>
                    </div>
                  </div>
                  {selectedEvent.participants && selectedEvent.participants.length > 0 && (
                    <div>
                      <Label className="text-gray-700 font-semibold">Participants List</Label>
                      <div className="mt-2 space-y-2">
                        {selectedEvent.participants.map((participant) => (
                          <div
                            key={participant._id}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                          >
                            {participant.profileImage ? (
                              <img
                                src={participant.profileImage}
                                alt={participant.fullName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center text-white text-sm">
                                {participant.fullName.charAt(0)}
                              </div>
                            )}
                            <span className="text-gray-700">{participant.fullName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Event Form Component
function EventForm({
  formData,
  setFormData,
  handleImageUpload,
  uploading,
  uploadError,
}: {
  formData: EventFormData;
  setFormData: (data: EventFormData) => void;
  handleImageUpload: (file: File) => void;
  uploading: boolean;
  uploadError: string | null;
}) {
  return (
    <div className="space-y-5 py-4">
      <div>
        <Label htmlFor="eventName" className="text-sm font-semibold text-gray-700 mb-2 block">
          Event Name *
        </Label>
        <Input
          id="eventName"
          value={formData.eventName}
          onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
          placeholder="Enter event name"
          className="w-full text-gray-900 placeholder:text-gray-400"
          required
        />
      </div>

      <div>
        <Label htmlFor="eventType" className="text-sm font-semibold text-gray-700 mb-2 block">
          Event Type *
        </Label>
        <Input
          id="eventType"
          value={formData.eventType}
          onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
          placeholder="e.g., Conference, Workshop, Meetup"
          className="w-full text-gray-900 placeholder:text-gray-400"
          required
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-sm font-semibold text-gray-700 mb-2 block">
          Description *
        </Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter event description"
          className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date" className="text-sm font-semibold text-gray-700 mb-2 block">
            Date *
          </Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full text-gray-900 placeholder:text-gray-400"
            required
          />
        </div>
        <div>
          <Label htmlFor="time" className="text-sm font-semibold text-gray-700 mb-2 block">
            Time *
          </Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="w-full text-gray-900 placeholder:text-gray-400"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="location" className="text-sm font-semibold text-gray-700 mb-2 block">
          Location *
        </Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Enter event location"
          className="w-full text-gray-900 placeholder:text-gray-400"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="minParticipants"
            className="text-sm font-semibold text-gray-700 mb-2 block"
          >
            Min Participants *
          </Label>
          <Input
            id="minParticipants"
            type="number"
            min="1"
            value={formData.minParticipants}
            onChange={(e) => setFormData({ ...formData, minParticipants: e.target.value })}
            className="w-full text-gray-900 placeholder:text-gray-400"
            required
          />
        </div>
        <div>
          <Label
            htmlFor="maxParticipants"
            className="text-sm font-semibold text-gray-700 mb-2 block"
          >
            Max Participants *
          </Label>
          <Input
            id="maxParticipants"
            type="number"
            min="1"
            value={formData.maxParticipants}
            onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
            className="w-full text-gray-900 placeholder:text-gray-400"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="joiningFee" className="text-sm font-semibold text-gray-700 mb-2 block">
          Joining Fee ($) *
        </Label>
        <Input
          id="joiningFee"
          type="number"
          min="0"
          step="0.01"
          value={formData.joiningFee}
          onChange={(e) => setFormData({ ...formData, joiningFee: e.target.value })}
          className="w-full text-gray-900 placeholder:text-gray-400"
          required
        />
      </div>

      <div>
        <Label htmlFor="image" className="text-sm font-semibold text-gray-700 mb-2 block">
          Event Image
        </Label>
        <div className="space-y-2">
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
            disabled={uploading}
          />
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </div>
          )}
          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
              {uploadError}
            </div>
          )}
          {formData.image && (
            <div className="relative">
              <img
                src={formData.image}
                alt="Event preview"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setFormData({ ...formData, image: '' })}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

