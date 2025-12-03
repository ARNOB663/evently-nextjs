'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number, address: string) => void;
  height?: string;
}

function MapClickHandler({
  onLocationChange,
  setCurrentPosition,
}: {
  onLocationChange: (lat: number, lng: number, address: string) => void;
  setCurrentPosition: (pos: [number, number] | null) => void;
}) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setCurrentPosition([lat, lng]);
      
      try {
        // Reverse geocode to get address
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        onLocationChange(lat, lng, address);
      } catch (error) {
        console.error('Geocoding error:', error);
        onLocationChange(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    },
  });

  return null;
}

// Component to handle map instance
function MapController({
  latitude,
  longitude,
  currentPosition,
  setCurrentPosition,
}: {
  latitude?: number;
  longitude?: number;
  currentPosition: [number, number] | null;
  setCurrentPosition: (pos: [number, number] | null) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (latitude && longitude) {
      setCurrentPosition([latitude, longitude]);
      map.setView([latitude, longitude], 13);
    }
  }, [latitude, longitude, map, setCurrentPosition]);

  // Get user's current location on mount
  useEffect(() => {
    if (navigator.geolocation && !currentPosition) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition([latitude, longitude]);
          map.setView([latitude, longitude], 13);
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  }, [map, currentPosition, setCurrentPosition]);

  return null;
}

export function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
  height = '400px',
}: LocationPickerProps) {
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(
    latitude && longitude ? [latitude, longitude] : null
  );

  // Default to a central location (you can change this)
  const defaultCenter: [number, number] = [40.7128, -74.006]; // New York City
  const center = currentPosition || defaultCenter;

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-300" style={{ height }}>
      <MapContainer
        center={center}
        zoom={currentPosition ? 13 : 2}
        style={{ height: '100%', width: '100%' }}
      >
        <MapController
          latitude={latitude}
          longitude={longitude}
          currentPosition={currentPosition}
          setCurrentPosition={setCurrentPosition}
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationChange={onLocationChange} setCurrentPosition={setCurrentPosition} />
        {currentPosition && (
          <Marker 
            position={currentPosition} 
            draggable
            eventHandlers={{
              dragend: async (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                setCurrentPosition([position.lat, position.lng]);
                
                try {
                  const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&zoom=18&addressdetails=1`
                  );
                  const data = await response.json();
                  const address = data.display_name || `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
                  onLocationChange(position.lat, position.lng, address);
                } catch (error) {
                  console.error('Geocoding error:', error);
                  onLocationChange(position.lat, position.lng, `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`);
                }
              },
            }}
          />
        )}
      </MapContainer>
      <div className="p-2 bg-gray-50 border-t border-gray-300 text-xs text-gray-600 text-center">
        Click on the map to set event location
      </div>
    </div>
  );
}

