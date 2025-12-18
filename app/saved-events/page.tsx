'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { Bookmark, Calendar, MapPin, Users, DollarSign, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

interface Event {
  _id: string;
  eventName: string;
  eventType: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  joiningFee: number;
  image?: string;
  status: string;
  hostId: {
    _id: string;
    fullName: string;
    profileImage?: string;
  };
}

export default function SavedEventsPage() {
  const { user, token, isAuthenticated } = useAuth();
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchSavedEvents();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  const fetchSavedEvents = async () => {
    try {
      const response = await fetch('/api/events/saved', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setSavedEvents(data.savedEvents || []);
      }
    } catch (error) {
      console.error('Error fetching saved events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveEvent = async (eventId: string) => {
    try {
      const response = await fetch('/api/events/saved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId }),
      });

      if (response.ok) {
        setSavedEvents(prev => prev.filter(e => e._id !== eventId));
      }
    } catch (error) {
      console.error('Error unsaving event:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'full':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 sm:pt-28 pb-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Please log in to view your saved events
            </h1>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white">
                Log In
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 sm:pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <Bookmark className="w-8 h-8 text-teal-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Saved Events
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Events you've bookmarked for later
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
          ) : savedEvents.length === 0 ? (
            <Card className="p-12 text-center bg-white dark:bg-gray-800">
              <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No saved events yet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Browse events and click the bookmark icon to save them for later!
              </p>
              <Link href="/events">
                <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white">
                  Browse Events
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedEvents.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
                    {event.image && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.eventName}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleUnsaveEvent(event._id)}
                          className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <Link href={`/events/${event._id}`}>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 line-clamp-2">
                            {event.eventName}
                          </h3>
                        </Link>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-2 text-teal-600" />
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4 mr-2 text-teal-600" />
                          {event.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Users className="w-4 h-4 mr-2 text-teal-600" />
                          {event.currentParticipants}/{event.maxParticipants} participants
                        </div>
                        {event.joiningFee > 0 && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <DollarSign className="w-4 h-4 mr-2 text-teal-600" />
                            ${event.joiningFee}
                          </div>
                        )}
                      </div>

                      <Link href={`/events/${event._id}`}>
                        <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white">
                          View Event
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
