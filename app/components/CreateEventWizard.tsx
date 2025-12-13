'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  Loader2,
  Tag,
  Users,
  FileText,
  Eye,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

// Dynamically import LocationPicker to avoid SSR issues
const LocationPicker = dynamic(
  () => import('./LocationPicker').then((mod) => ({ default: mod.LocationPicker })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[350px] bg-gray-100 rounded-lg flex items-center justify-center">
        Loading map...
      </div>
    ),
  }
);

interface TicketType {
  name: string;
  price: number;
  quantity: number;
  description: string;
}

interface EventFormData {
  eventName: string;
  eventType: string;
  description: string;
  image: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  latitude?: number;
  longitude?: number;
  ticketTypes: TicketType[];
  minParticipants: number;
  maxParticipants: number;
}

interface CreateEventWizardProps {
  onSubmit: (data: EventFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<EventFormData>;
}

const STEPS = [
  { id: 1, title: 'Basic Info', icon: FileText },
  { id: 2, title: 'Date & Time', icon: Calendar },
  { id: 3, title: 'Venue', icon: MapPin },
  { id: 4, title: 'Tickets', icon: DollarSign },
  { id: 5, title: 'Review', icon: Eye },
];

const EVENT_TYPES = [
  'Conference',
  'Workshop',
  'Meetup',
  'Concert',
  'Festival',
  'Sports',
  'Food',
  'Music',
  'Tech',
  'Networking',
  'Art',
  'Education',
  'Other',
];

export function CreateEventWizard({ onSubmit, onCancel, initialData }: CreateEventWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<EventFormData>({
    eventName: initialData?.eventName || '',
    eventType: initialData?.eventType || '',
    description: initialData?.description || '',
    image: initialData?.image || '',
    date: initialData?.date || '',
    time: initialData?.time || '',
    endTime: initialData?.endTime || '',
    location: initialData?.location || '',
    latitude: initialData?.latitude,
    longitude: initialData?.longitude,
    ticketTypes: initialData?.ticketTypes || [
      { name: 'General Admission', price: 0, quantity: 100, description: 'Standard entry' },
    ],
    minParticipants: initialData?.minParticipants || 1,
    maxParticipants: initialData?.maxParticipants || 100,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        updateFormData('image', data.url);
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleLocationChange = (lat: number, lng: number, address: string) => {
    updateFormData('location', address);
    updateFormData('latitude', lat);
    updateFormData('longitude', lng);
  };

  const addTicketType = () => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: [
        ...prev.ticketTypes,
        { name: '', price: 0, quantity: 50, description: '' },
      ],
    }));
  };

  const removeTicketType = (index: number) => {
    if (formData.ticketTypes.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, i) => i !== index),
    }));
  };

  const updateTicketType = (index: number, field: keyof TicketType, value: any) => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map((ticket, i) =>
        i === index ? { ...ticket, [field]: value } : ticket
      ),
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.eventName.trim()) newErrors.eventName = 'Event name is required';
        if (!formData.eventType) newErrors.eventType = 'Event type is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        break;
      case 2:
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.time) newErrors.time = 'Start time is required';
        break;
      case 3:
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        break;
      case 4:
        if (formData.ticketTypes.length === 0) newErrors.tickets = 'At least one ticket type is required';
        formData.ticketTypes.forEach((ticket, i) => {
          if (!ticket.name.trim()) newErrors[`ticket_${i}_name`] = 'Ticket name is required';
          if (ticket.quantity < 1) newErrors[`ticket_${i}_quantity`] = 'Quantity must be at least 1';
        });
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setSubmitting(true);
      await onSubmit(formData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate total capacity from ticket types
  const totalCapacity = formData.ticketTypes.reduce((sum, t) => sum + t.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted
                        ? 'bg-teal-500 text-white'
                        : isCurrent
                        ? 'bg-teal-100 text-teal-600 border-2 border-teal-500'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium hidden sm:block ${
                      isCurrent ? 'text-teal-600' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-12 sm:w-24 h-1 mx-2 rounded ${
                      isCompleted ? 'bg-teal-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="p-6 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
                  <p className="text-gray-600">Tell us about your event</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="eventName">Event Name *</Label>
                    <Input
                      id="eventName"
                      value={formData.eventName}
                      onChange={(e) => updateFormData('eventName', e.target.value)}
                      placeholder="Enter event name"
                      className={errors.eventName ? 'border-red-500' : ''}
                    />
                    {errors.eventName && <p className="text-red-500 text-sm mt-1">{errors.eventName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="eventType">Event Type *</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                      {EVENT_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => updateFormData('eventType', type)}
                          className={`p-2 text-sm rounded-lg border transition-all ${
                            formData.eventType === type
                              ? 'bg-teal-50 border-teal-500 text-teal-700'
                              : 'border-gray-200 hover:border-teal-300'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    {errors.eventType && <p className="text-red-500 text-sm mt-1">{errors.eventType}</p>}
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      placeholder="Describe your event..."
                      rows={4}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>

                  <div>
                    <Label>Event Image</Label>
                    <div className="mt-2">
                      {formData.image ? (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden">
                          <img src={formData.image} alt="Event" className="w-full h-full object-cover" />
                          <button
                            onClick={() => updateFormData('image', '')}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 transition-colors">
                          <div className="flex flex-col items-center">
                            {uploading ? (
                              <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-gray-400" />
                                <span className="mt-2 text-sm text-gray-500">Upload image</span>
                              </>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={uploading}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Date & Time</h2>
                  <p className="text-gray-600">When is your event happening?</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => updateFormData('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className={errors.date ? 'border-red-500' : ''}
                    />
                    {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                  </div>

                  <div>
                    <Label htmlFor="time">Start Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => updateFormData('time', e.target.value)}
                      className={errors.time ? 'border-red-500' : ''}
                    />
                    {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
                  </div>

                  <div>
                    <Label htmlFor="endTime">End Time (optional)</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => updateFormData('endTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Venue */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Venue</h2>
                  <p className="text-gray-600">Where will your event take place?</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => updateFormData('location', e.target.value)}
                      placeholder="Enter venue address"
                      className={errors.location ? 'border-red-500' : ''}
                    />
                    {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                  </div>

                  <div>
                    <Label>Pick on Map</Label>
                    <div className="mt-2 rounded-lg overflow-hidden border">
                      <LocationPicker
                        onLocationChange={handleLocationChange}
                        latitude={formData.latitude}
                        longitude={formData.longitude}
                        height="350px"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Tickets & Pricing */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Tickets & Pricing</h2>
                  <p className="text-gray-600">Set up your ticket types and pricing</p>
                </div>

                <div className="space-y-4">
                  {formData.ticketTypes.map((ticket, index) => (
                    <Card key={index} className="p-4 border-2">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Ticket Type {index + 1}</h4>
                        {formData.ticketTypes.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTicketType(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Name *</Label>
                          <Input
                            value={ticket.name}
                            onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                            placeholder="e.g., General Admission, VIP"
                            className={errors[`ticket_${index}_name`] ? 'border-red-500' : ''}
                          />
                        </div>
                        <div>
                          <Label>Price ($)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={ticket.price}
                            onChange={(e) => updateTicketType(index, 'price', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label>Quantity *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={ticket.quantity}
                            onChange={(e) => updateTicketType(index, 'quantity', parseInt(e.target.value) || 1)}
                            className={errors[`ticket_${index}_quantity`] ? 'border-red-500' : ''}
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={ticket.description}
                            onChange={(e) => updateTicketType(index, 'description', e.target.value)}
                            placeholder="What's included?"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}

                  <Button variant="outline" onClick={addTicketType} className="w-full">
                    + Add Another Ticket Type
                  </Button>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Capacity</span>
                      <span className="font-bold text-gray-900">{totalCapacity} attendees</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Publish</h2>
                  <p className="text-gray-600">Review your event details before publishing</p>
                </div>

                <div className="space-y-4">
                  {/* Preview Card */}
                  <Card className="overflow-hidden">
                    {formData.image && (
                      <div className="h-48 overflow-hidden">
                        <img src={formData.image} alt="Event" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-teal-100 text-teal-800">{formData.eventType}</Badge>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{formData.eventName}</h3>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formData.date &&
                              new Date(formData.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {formData.time}
                            {formData.endTime && ` - ${formData.endTime}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{formData.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{totalCapacity} spots available</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-semibold text-gray-900 mb-2">Ticket Types</h4>
                        <div className="space-y-2">
                          {formData.ticketTypes.map((ticket, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-gray-600">{ticket.name}</span>
                              <span className="font-semibold">
                                {ticket.price === 0 ? 'Free' : `$${ticket.price}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                        <p className="text-gray-600 text-sm whitespace-pre-line">{formData.description}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <Button variant="outline" onClick={currentStep === 1 ? onCancel : handleBack} disabled={submitting}>
            {currentStep === 1 ? (
              'Cancel'
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </>
            )}
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={handleNext} className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Publish Event
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
