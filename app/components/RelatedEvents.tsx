'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Event {
  _id: string;
  eventName: string;
  eventType: string;
  date: string;
  time: string;
  location: string;
  currentParticipants: number;
  maxParticipants: number;
  joiningFee: number;
  image?: string;
  status: string;
}

interface RelatedEventsProps {
  currentEventId: string;
  eventType: string;
  location?: string;
}

export function RelatedEvents({ currentEventId, eventType, location }: RelatedEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedEvents();
  }, [currentEventId, eventType]);

  const fetchRelatedEvents = async () => {
    try {
      setLoading(true);
      // Fetch events with same event type, excluding current event
      const response = await fetch(`/api/events?eventType=${encodeURIComponent(eventType)}&limit=4&status=open`);
      
      if (response.ok) {
        const data = await response.json();
        // Filter out current event and limit to 3
        const filtered = (data.events || [])
          .filter((e: Event) => e._id !== currentEventId)
          .slice(0, 3);
        setEvents(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch related events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">You Might Also Like</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">You Might Also Like</h3>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/events?eventType=${encodeURIComponent(eventType)}`}>
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {events.map((event) => (
          <Link key={event._id} href={`/events/${event._id}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group h-full">
              {/* Event Image */}
              <div className="relative h-36 overflow-hidden">
                {event.image ? (
                  <ImageWithFallback
                    src={event.image}
                    alt={event.eventName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                    <Calendar className="w-10 h-10 text-white/50" />
                  </div>
                )}
                <Badge className="absolute top-2 left-2 bg-white/90 text-gray-900 text-xs">
                  {event.eventType}
                </Badge>
              </div>

              {/* Event Details */}
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-teal-600 transition-colors">
                  {event.eventName}
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span>{event.currentParticipants}/{event.maxParticipants} spots</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  {event.joiningFee > 0 ? (
                    <span className="font-bold text-gray-900">${event.joiningFee}</span>
                  ) : (
                    <Badge className="bg-teal-100 text-teal-800 text-xs">Free</Badge>
                  )}
                  <span className="text-xs text-teal-600 font-medium group-hover:underline">
                    View Details →
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
