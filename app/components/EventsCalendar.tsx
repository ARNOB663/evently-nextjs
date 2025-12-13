'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface Event {
  _id: string;
  eventName: string;
  eventType: string;
  date: string;
  time: string;
  location: string;
  joiningFee: number;
  status: string;
}

interface EventsCalendarProps {
  events: Event[];
  onDateSelect?: (date: Date) => void;
}

export function EventsCalendar({ events, onDateSelect }: EventsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get events grouped by date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    events.forEach((event) => {
      const dateKey = new Date(event.date).toISOString().split('T')[0];
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(event);
    });
    return map;
  }, [events]);

  // Calendar calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
    setSelectedDate(null);
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    setSelectedDate(clickedDate);
    onDateSelect?.(clickedDate);
  };

  const getEventsForDay = (day: number): Event[] => {
    const dateKey = new Date(year, month, day).toISOString().split('T')[0];
    return eventsByDate.get(dateKey) || [];
  };

  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const isPast = (day: number) => {
    const date = new Date(year, month, day);
    return date < today;
  };

  // Build calendar grid
  const calendarDays = [];
  
  // Empty cells for days before the first day
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Get selected day events
  const selectedDayEvents = selectedDate
    ? getEventsForDay(selectedDate.getDate())
    : [];

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {monthNames[month]} {year}
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs sm:text-sm font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dayEvents = getEventsForDay(day);
            const hasEvents = dayEvents.length > 0;
            const past = isPast(day);

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`
                  aspect-square p-1 rounded-lg transition-all relative
                  ${isToday(day) ? 'bg-teal-100 font-bold' : ''}
                  ${isSelected(day) ? 'bg-teal-500 text-white' : ''}
                  ${past && !isToday(day) ? 'text-gray-400' : 'text-gray-900'}
                  ${hasEvents && !isSelected(day) ? 'hover:bg-teal-50' : 'hover:bg-gray-100'}
                  ${!isSelected(day) && isToday(day) ? 'text-teal-700' : ''}
                `}
              >
                <span className="text-sm">{day}</span>
                {hasEvents && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected(day) ? 'bg-white' : 'bg-teal-500'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-teal-500" />
            <span>Has events</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-teal-100" />
            <span>Today</span>
          </div>
        </div>
      </Card>

      {/* Selected Day Events */}
      {selectedDate && (
        <Card className="p-4 sm:p-6">
          <h3 className="font-bold text-gray-900 mb-4">
            Events on {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </h3>

          {selectedDayEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No events on this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayEvents.map((event) => (
                <Link key={event._id} href={`/events/${event._id}`}>
                  <div className="p-3 rounded-lg border hover:border-teal-300 hover:bg-teal-50/50 transition-all cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {event.eventName}
                        </h4>
                        <p className="text-sm text-gray-600">{event.time}</p>
                        <p className="text-sm text-gray-500 truncate">{event.location}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Badge className="bg-teal-100 text-teal-800 text-xs mb-1">
                          {event.eventType}
                        </Badge>
                        <p className="text-sm font-semibold text-gray-900">
                          {event.joiningFee > 0 ? `$${event.joiningFee}` : 'Free'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
