'use client';

import { motion } from 'motion/react';
import { Calendar, MapPin, ArrowRight, Users, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  price: number | 'free';
  image: string;
  category: string;
  attendees: number;
}

interface FeaturedEventsProps {
  onNavigate?: (page: string, eventId?: string) => void;
}

const featuredEvents: Event[] = [
  {
    id: 1,
    title: 'Summer Music Festival 2025',
    date: 'Jul 15, 2025',
    location: 'Central Park, NY',
    price: 89,
    image: 'https://images.unsplash.com/photo-1689793354800-de168c0a4c9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGZlc3RpdmFsJTIwc3RhZ2V8ZW58MXx8fHwxNzY0NDEzNDYyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Music',
    attendees: 1250,
  },
  {
    id: 2,
    title: 'Tech Innovation Summit',
    date: 'Aug 22, 2025',
    location: 'San Francisco, CA',
    price: 'free',
    image: 'https://images.unsplash.com/photo-1571645163064-77faa9676a46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGNvbmZlcmVuY2UlMjBuZXR3b3JraW5nfGVufDF8fHx8MTc2NDQzNjU5OXww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Conference',
    attendees: 850,
  },
  {
    id: 3,
    title: 'Food & Wine Experience',
    date: 'Sep 10, 2025',
    location: 'Portland, OR',
    price: 125,
    image: 'https://images.unsplash.com/photo-1760026759916-16e48b34cee5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdXRkb29yJTIwZm9vZCUyMGZlc3RpdmFsfGVufDF8fHx8MTc2NDUxMjAxMnww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Food',
    attendees: 620,
  },
  {
    id: 4,
    title: 'Indie Concert Night',
    date: 'Oct 5, 2025',
    location: 'Austin, TX',
    price: 45,
    image: 'https://images.unsplash.com/photo-1723376104818-ccf2e7c5dd5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwY3Jvd2QlMjBjZWxlYnJhdGlvbnxlbnwxfHx8fDE3NjQ0MzA4NDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Music',
    attendees: 420,
  },
];

export function FeaturedEvents({ onNavigate }: FeaturedEventsProps) {
  return (
    <section id="events" className="py-16 sm:py-24 md:py-32 bg-white relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-50/30 via-white to-pink-50/20 pointer-events-none" />
      
      <div className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-[1920px] relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4 sm:mb-6">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Featured Events</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-indigo-950 mb-3 sm:mb-4">
            Trending experiences
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Discover handpicked events curated by our community. From intimate workshops to grand festivals, find experiences that match your passion.
          </p>
        </motion.div>

        {/* Events Grid */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 max-w-fit mx-auto">
            {featuredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100">
                {/* Image */}
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full"
                  >
                    <ImageWithFallback
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/95 backdrop-blur-sm text-gray-900 border-0 shadow-sm">
                      {event.category}
                    </Badge>
                  </div>
                  {event.price === 'free' && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-teal-500 text-white border-0 shadow-sm">
                        Free
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl text-gray-900 line-clamp-2 group-hover:text-teal-600 transition-colors font-semibold">
                    {event.title}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{event.attendees.toLocaleString()} interested</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
                    {event.price !== 'free' && (
                      <div className="text-xl sm:text-2xl font-bold text-indigo-950">
                        ${event.price}
                      </div>
                    )}
                    <Button
                      size="sm"
                      className="ml-auto bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-full group/btn shadow-md text-xs sm:text-sm"
                      onClick={() => onNavigate?.('event-details', event.id.toString())}
                    >
                      Book now
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12 sm:mt-16"
        >
          <Button
            size="lg"
            className="px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 rounded-full border-2 border-indigo-200 bg-white text-indigo-950 hover:bg-indigo-50 shadow-md hover:shadow-lg transition-all duration-300 group text-sm sm:text-base"
            onClick={() => onNavigate?.('events')}
          >
            Explore all events
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

