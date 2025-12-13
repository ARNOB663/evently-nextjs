'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Skeleton } from './ui/skeleton';

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
  const [eventTypeFilter, setEventTypeFilter] = useState(searchParams?.get('eventType') || '');
  const [locationFilter, setLocationFilter] = useState(searchParams?.get('location') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams?.get('status') || '');
  const [dateFrom, setDateFrom] = useState(searchParams?.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams?.get('dateTo') || '');
  const [priceMin, setPriceMin] = useState(searchParams?.get('priceMin') || '');
  const [priceMax, setPriceMax] = useState(searchParams?.get('priceMax') || '');
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(
    searchParams?.getAll('eventTypes') || []
  );
  const [datePreset, setDatePreset] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(parseInt(searchParams?.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState(searchParams?.get('search') || '');

  const eventTypes = ['Conference', 'Workshop', 'Meetup', 'Concert', 'Festival', 'Sports', 'Food', 'Music', 'Tech', 'Other'];
  const statuses = ['open', 'full', 'cancelled', 'completed'];

  // Update URL with current filters
  const updateURL = useCallback((filters: any) => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.eventType) params.set('eventType', filters.eventType);
    if (filters.location) params.set('location', filters.location);
    if (filters.status) params.set('status', filters.status);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (filters.priceMin) params.set('priceMin', filters.priceMin);
    if (filters.priceMax) params.set('priceMax', filters.priceMax);
    filters.eventTypes?.forEach((type: string) => params.append('eventTypes', type));
    if (filters.page > 1) params.set('page', filters.page.toString());
    
    const newUrl = params.toString() ? `/events?${params.toString()}` : '/events';
    router.replace(newUrl, { scroll: false });
  }, [router]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchQuery(searchInput);
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, searchQuery]);

  useEffect(() => {
    fetchEvents();
    updateURL({
      search: searchQuery,
      eventType: eventTypeFilter,
      location: locationFilter,
      status: statusFilter,
      dateFrom,
      dateTo,
      priceMin,
      priceMax,
      eventTypes: selectedEventTypes,
      page,
    });
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
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleDatePreset = (preset: string) => {
    setDatePreset(preset);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (preset) {
      case 'today':
        setDateFrom(today.toISOString().split('T')[0]);
        setDateTo(today.toISOString().split('T')[0]);
        break;
      case 'thisWeek':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        setDateFrom(weekStart.toISOString().split('T')[0]);
        setDateTo(weekEnd.toISOString().split('T')[0]);
        break;
      case 'thisMonth':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setDateFrom(monthStart.toISOString().split('T')[0]);
        setDateTo(monthEnd.toISOString().split('T')[0]);
        break;
      case 'nextMonth':
        const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        setDateFrom(nextMonthStart.toISOString().split('T')[0]);
        setDateTo(nextMonthEnd.toISOString().split('T')[0]);
        break;
      case 'clear':
        setDateFrom('');
        setDateTo('');
        setDatePreset('');
        break;
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSearchInput('');
    setEventTypeFilter('');
    setLocationFilter('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setPriceMin('');
    setPriceMax('');
    setSelectedEventTypes([]);
    setDatePreset('');
    setPage(1);
    router.replace('/events', { scroll: false });
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Browse Events
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">Discover amazing events happening around you</p>
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
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
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
                className="border-t pt-4 mt-4 space-y-4 max-h-[70vh] overflow-y-auto"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Date Preset
                    </label>
                    <select
                      value={datePreset}
                      onChange={(e) => handleDatePreset(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Custom Range</option>
                      <option value="today">Today</option>
                      <option value="thisWeek">This Week</option>
                      <option value="thisMonth">This Month</option>
                      <option value="nextMonth">Next Month</option>
                      <option value="clear">Clear Date</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Date From
                    </label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => {
                        setDateFrom(e.target.value);
                        setDatePreset('');
                      }}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Date To
                    </label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => {
                        setDateTo(e.target.value);
                        setDatePreset('');
                      }}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Price Min ($)
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Price Max ($)
                    </label>
                    <Input
                      type="number"
                      placeholder="1000"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Price Type
                    </label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={priceMin === '' && priceMax === '' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setPriceMin('');
                          setPriceMax('');
                        }}
                        className="flex-1"
                      >
                        All
                      </Button>
                      <Button
                        type="button"
                        variant={priceMin === '0' && priceMax === '0' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setPriceMin('0');
                          setPriceMax('0');
                        }}
                        className="flex-1"
                      >
                        Free
                      </Button>
                      <Button
                        type="button"
                        variant={priceMin === '0.01' && priceMax === '' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setPriceMin('0.01');
                          setPriceMax('');
                        }}
                        className="flex-1"
                      >
                        Paid
                      </Button>
                    </div>
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
        {!loading && events.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 text-sm sm:text-base text-gray-600"
          >
            <span className="font-semibold text-gray-900">{events.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{total}</span> events
            {hasActiveFilters && ' match your filters'}
          </motion.div>
        )}

        {/* Loading State - Skeleton Loaders */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 sm:p-5 md:p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex items-center justify-between pt-3 border-t">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-9 w-24 rounded-full" />
                  </div>
                </div>
              </Card>
            ))}
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full"
              >
                <Card className="p-12 sm:p-16 text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center">
                    <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-teal-600" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">No events found</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto text-base sm:text-lg">
                    {hasActiveFilters
                      ? 'Try adjusting your filters to see more events.'
                      : 'No events are available at the moment. Check back later!'}
                  </p>
                  {hasActiveFilters && (
                    <Button 
                      onClick={clearFilters} 
                      className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
                    >
                      Clear Filters
                    </Button>
                  )}
                </Card>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
                        <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100">
                          {event.image ? (
                            <ImageWithFallback
                              src={event.image}
                              alt={event.eventName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              lazy={true}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                              <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-white/50" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                            <Badge className={`${getStatusColor(event.status)} text-xs`}>
                              {event.status}
                            </Badge>
                          </div>
                          <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                            <Badge className="bg-white/95 backdrop-blur-sm text-gray-900 border-0 text-xs">
                              {event.eventType}
                            </Badge>
                          </div>
                        </div>

                        {/* Event Content */}
                        <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 group-hover:text-teal-600 transition-colors">
                            {event.eventName}
                          </h3>

                          <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 flex-1">
                            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                              <span className="truncate">
                                {new Date(event.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                              <span className="line-clamp-1 truncate">{event.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                              <span className="truncate">
                                {event.currentParticipants}/{event.maxParticipants} participants
                              </span>
                            </div>
                            {event.joiningFee > 0 && (
                              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                <span>${event.joiningFee} fee</span>
                              </div>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                            {event.description}
                          </p>

                          <div className="flex items-center justify-between pt-3 sm:pt-4 border-t">
                            {event.joiningFee > 0 ? (
                              <div className="text-lg sm:text-xl font-bold text-gray-900">
                                ${event.joiningFee}
                              </div>
                            ) : (
                              <Badge className="bg-teal-100 text-teal-800 border-teal-200 text-xs">
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

