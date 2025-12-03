'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Search,
  Filter,
  X,
  Loader2,
  Tag,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

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
  participants: Array<{ _id: string; fullName: string; profileImage?: string }>;
  createdAt: string;
}

export function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const eventTypes = ['Conference', 'Workshop', 'Meetup', 'Concert', 'Festival', 'Sports', 'Food', 'Music', 'Tech', 'Other'];
  const statuses = ['open', 'full', 'cancelled', 'completed'];

  useEffect(() => {
    fetchEvents();
  }, [page, searchQuery, eventTypeFilter, locationFilter, statusFilter, dateFrom, dateTo, priceMin, priceMax, selectedEventTypes]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });

      if (searchQuery) params.append('search', searchQuery);
      if (eventTypeFilter) params.append('eventType', eventTypeFilter);
      if (locationFilter) params.append('location', locationFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (priceMin) params.append('priceMin', priceMin);
      if (priceMax) params.append('priceMax', priceMax);
      if (selectedEventTypes.length > 0) {
        selectedEventTypes.forEach((type) => params.append('eventTypes', type));
      }

      const response = await fetch(`/api/events?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setEvents(data.events || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotal(data.pagination?.total || 0);
      } else {
        setError(data.error || 'Failed to fetch events');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setEventTypeFilter('');
    setLocationFilter('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setPriceMin('');
    setPriceMax('');
    setSelectedEventTypes([]);
    setPage(1);
  };

  const toggleEventType = (type: string) => {
    setSelectedEventTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const hasActiveFilters =
    searchQuery ||
    eventTypeFilter ||
    locationFilter ||
    statusFilter ||
    dateFrom ||
    dateTo ||
    priceMin ||
    priceMax ||
    selectedEventTypes.length > 0;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-24 sm:pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Browse Events</h1>
          <p className="text-gray-600">Discover amazing events happening around you</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-4 sm:p-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search events by name, type, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
                >
                  Search
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              </div>
            </form>

            {/* Filters Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t pt-4 mt-4 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Event Type
                    </label>
                    <select
                      value={eventTypeFilter}
                      onChange={(e) => setEventTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">All Types</option>
                      {eventTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Location
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter location..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">All Status</option>
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-600">Active filters:</span>
                    {searchQuery && (
                      <Badge className="flex items-center gap-1">
                        Search: {searchQuery}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => setSearchQuery('')}
                        />
                      </Badge>
                    )}
                    {eventTypeFilter && (
                      <Badge className="flex items-center gap-1">
                        Type: {eventTypeFilter}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => setEventTypeFilter('')}
                        />
                      </Badge>
                    )}
                    {locationFilter && (
                      <Badge className="flex items-center gap-1">
                        Location: {locationFilter}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => setLocationFilter('')}
                        />
                      </Badge>
                    )}
                    {statusFilter && (
                      <Badge className="flex items-center gap-1">
                        Status: {statusFilter}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => setStatusFilter('')}
                        />
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-6 text-sm text-gray-600">
            Showing {events.length} of {total} events
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="p-8 text-center">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchEvents} variant="outline" className="mt-4">
              Try Again
            </Button>
          </Card>
        )}

        {/* Events Grid */}
        {!loading && !error && (
          <>
            {events.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600 mb-6">
                  {hasActiveFilters
                    ? 'Try adjusting your filters to see more events.'
                    : 'No events are available at the moment.'}
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {events.map((event, index) => (
                  <Link key={event._id} href={`/events/${event._id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -8 }}
                      className="group cursor-pointer h-full"
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                        {/* Event Image */}
                        <div className="relative h-48 overflow-hidden bg-gray-100">
                          {event.image ? (
                            <ImageWithFallback
                              src={event.image}
                              alt={event.eventName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                              <Calendar className="w-16 h-16 text-white/50" />
                            </div>
                          )}
                          <div className="absolute top-4 right-4">
                            <Badge className={getStatusColor(event.status)}>
                              {event.status}
                            </Badge>
                          </div>
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-white/95 backdrop-blur-sm text-gray-900 border-0">
                              {event.eventType}
                            </Badge>
                          </div>
                        </div>

                        {/* Event Content */}
                        <div className="p-5 sm:p-6 flex-1 flex flex-col">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-teal-600 transition-colors">
                            {event.eventName}
                          </h3>

                          <div className="space-y-2 mb-4 flex-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span>
                                {new Date(event.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span>
                                {event.currentParticipants}/{event.maxParticipants} participants
                              </span>
                            </div>
                            {event.joiningFee > 0 && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span>${event.joiningFee} fee</span>
                              </div>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {event.description}
                          </p>

                          <div className="flex items-center justify-between pt-4 border-t">
                            {event.joiningFee > 0 ? (
                              <div className="text-xl font-bold text-gray-900">
                                ${event.joiningFee}
                              </div>
                            ) : (
                              <Badge className="bg-teal-100 text-teal-800 border-teal-200">
                                Free
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-full group/btn"
                            >
                              View Details
                              <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        onClick={() => setPage(pageNum)}
                        className={
                          page === pageNum
                            ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white'
                            : ''
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

