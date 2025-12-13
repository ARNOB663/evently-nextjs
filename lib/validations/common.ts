import { z } from 'zod';

// Common ID validation (MongoDB ObjectId format)
export const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, 'Invalid ID format');

// Comment validation
export const createCommentSchema = z.object({
  eventId: objectIdSchema,
  content: z
    .string()
    .min(1, 'Comment content is required')
    .max(1000, 'Comment cannot exceed 1000 characters'),
});

// Message validation
export const sendMessageSchema = z.object({
  receiverId: objectIdSchema,
  content: z
    .string()
    .min(1, 'Message content is required')
    .max(2000, 'Message cannot exceed 2000 characters'),
});

// Review validation
export const createReviewSchema = z.object({
  eventId: objectIdSchema,
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  comment: z
    .string()
    .max(1000, 'Review cannot exceed 1000 characters')
    .optional(),
});

// Report validation
export const createReportSchema = z.object({
  reportedType: z.enum(['user', 'event', 'comment', 'message']),
  reportedId: objectIdSchema,
  reason: z.enum([
    'spam',
    'harassment',
    'inappropriate_content',
    'fake_event',
    'scam',
    'other',
  ]),
  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),
});

// Pagination validation
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().min(1).max(100)),
});

// Type exports
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
