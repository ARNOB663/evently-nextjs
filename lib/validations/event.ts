import { z } from 'zod';

export const createEventSchema = z.object({
  eventName: z
    .string()
    .min(1, 'Event name is required')
    .max(200, 'Event name cannot exceed 200 characters'),
  eventType: z
    .string()
    .min(1, 'Event type is required'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description cannot exceed 5000 characters'),
  date: z
    .string()
    .min(1, 'Date is required')
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  time: z
    .string()
    .min(1, 'Time is required'),
  endTime: z
    .string()
    .optional(),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(500, 'Location cannot exceed 500 characters'),
  latitude: z
    .number()
    .min(-90)
    .max(90)
    .optional(),
  longitude: z
    .number()
    .min(-180)
    .max(180)
    .optional(),
  minParticipants: z
    .number()
    .int()
    .min(1, 'Minimum participants must be at least 1'),
  maxParticipants: z
    .number()
    .int()
    .min(1, 'Maximum participants must be at least 1'),
  joiningFee: z
    .number()
    .min(0, 'Joining fee cannot be negative')
    .optional()
    .default(0),
  image: z
    .string()
    .url()
    .optional()
    .or(z.literal('')),
}).refine((data) => data.minParticipants <= data.maxParticipants, {
  message: 'Minimum participants cannot exceed maximum participants',
  path: ['minParticipants'],
});

export const updateEventSchema = createEventSchema.partial();

export const eventQuerySchema = z.object({
  eventType: z.string().optional(),
  eventTypes: z.array(z.string()).optional(),
  location: z.string().optional(),
  date: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.enum(['open', 'full', 'cancelled', 'completed']).optional(),
  search: z.string().optional(),
  hostId: z.string().optional(),
  priceMin: z.string().optional(),
  priceMax: z.string().optional(),
  sortBy: z.enum(['date', 'price', 'popularity', 'created']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  includeParticipants: z.string().optional(),
  participantLimit: z.string().optional(),
});

// Type exports
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventQueryInput = z.infer<typeof eventQuerySchema>;
