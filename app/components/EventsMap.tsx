'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, DollarSign, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import 'leaflet/dist/leaflet.css';

interface Event {
  _id: string;
  eventName: string;
  eventType: string;
  description: string;
  date: string;
  time: string;
  location: string;
  latitude?: number;
  longitude?: number;
  minParticipants: number;
  maxParticipants: number;
  currentParticipants: number;
  joiningFee: number;
  image?: string;
  status: 'open' | 'full' | 'cancelled' | 'completed';
}

interface EventsMapProps {
  events: Event[];
}

// Dynamic import for Leaflet to avoid SSR issues
let L: any = null;

export function EventsMap({ events }: EventsMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    // Dynamically import Leaflet
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined') {
        const leaflet = await import('leaflet');
        L = leaflet.default;
        setMapLoaded(true);
      }
    };
    loadLeaflet();
  }, []);

  useEffect(() => {
    if (!mapLoaded || !L) return;

    // Initialize map
    const mapContainer = document.getElementById('events-map');
    if (!mapContainer) return;

    // Clear existing map
    mapContainer.innerHTML = '';

    // Create map centered on first event or default location
    const eventsWithCoords = events.filter(e => e.latitude && e.longitude);
    const defaultCenter: [number, number] = eventsWithCoords.length > 0
      ? [eventsWithCoords[0].latitude!, eventsWithCoords[0].longitude!]
      : [40.7128, -74.0060]; // New York as default

    const map = L.map('events-map').setView(defaultCenter, 10);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Custom marker icon
    const markerIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background: linear-gradient(135deg, #14b8a6, #06b6d4); width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    // Add markers for events with coordinates
    const bounds: [number, number][] = [];
    
    eventsWithCoords.forEach((event) => {
      if (event.latitude && event.longitude) {
        bounds.push([event.latitude, event.longitude]);
        
        const marker = L.marker([event.latitude, event.longitude], { icon: markerIcon })
          .addTo(map);

        // Create popup content
        const popupContent = `
          <div style="min-width: 200px; max-width: 280px;">
            <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #1f2937;">${event.eventName}</h3>
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
              📅 ${new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${event.time}
            </p>
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
              📍 ${event.location}
            </p>
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
              👥 ${event.currentParticipants}/${event.maxParticipants} spots
            </p>
            <p style="font-size: 14px; font-weight: bold; color: #14b8a6;">
              ${event.joiningFee > 0 ? '$' + event.joiningFee : 'Free'}
            </p>
            <a href="/events/${event._id}" style="display: inline-block; margin-top: 8px; padding: 6px 12px; background: linear-gradient(135deg, #14b8a6, #06b6d4); color: white; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 500;">
              View Details
            </a>
          </div>
        `;

        marker.bindPopup(popupContent);
        
        marker.on('click', () => {
          setSelectedEvent(event);
        });
      }
    });

    // Fit bounds if we have events
    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 13);
    }

    return () => {
      map.remove();
    };
  }, [mapLoaded, events]);

  const eventsWithoutCoords = events.filter(e => !e.latitude || !e.longitude);

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <Card className="overflow-hidden">
        <div 
          id="events-map" 
          className="w-full h-[400px] sm:h-[500px] lg:h-[600px] bg-gray-100"
          style={{ zIndex: 0 }}
        >
          {!mapLoaded && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Loading map...</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Events without coordinates */}
      {eventsWithoutCoords.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Events without map location ({eventsWithoutCoords.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventsWithoutCoords.slice(0, 6).map((event) => (
              <Link key={event._id} href={`/events/${event._id}`}>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1">{event.eventName}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge className="bg-teal-100 text-teal-800 text-xs">
                      {event.joiningFee > 0 ? `$${event.joiningFee}` : 'Free'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {event.currentParticipants}/{event.maxParticipants} spots
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No events with coordinates message */}
      {events.filter(e => e.latitude && e.longitude).length === 0 && (
        <Card className="p-8 text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No events with map locations</h3>
          <p className="text-gray-600">Events will appear on the map once they have location coordinates.</p>
        </Card>
      )}
    </div>
  );
}
