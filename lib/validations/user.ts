import { z } from 'zod';

export const updateUserSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name cannot exceed 100 characters')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio cannot exceed 500 characters')
    .optional(),
  interests: z
    .array(z.string())
    .optional(),
  preferredEventTypes: z
    .array(z.string())
    .optional(),
  location: z
    .string()
    .max(200, 'Location cannot exceed 200 characters')
    .optional(),
  profileImage: z
    .string()
    .url()
    .optional()
    .or(z.literal('')),
  coverImage: z
    .string()
    .url()
    .optional()
    .or(z.literal('')),
  phoneNumber: z
    .string()
    .max(20, 'Phone number cannot exceed 20 characters')
    .optional(),
  dateOfBirth: z
    .string()
    .optional(),
  gender: z
    .string()
    .optional(),
  occupation: z
    .string()
    .max(100, 'Occupation cannot exceed 100 characters')
    .optional(),
  company: z
    .string()
    .max(100, 'Company cannot exceed 100 characters')
    .optional(),
  website: z
    .string()
    .url()
    .optional()
    .or(z.literal('')),
  socialMediaLinks: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    linkedin: z.string().optional(),
    website: z.string().optional(),
  }).optional(),
});

export const userSearchSchema = z.object({
  q: z.string().optional(),
  role: z.enum(['user', 'host', 'admin']).optional(),
  interests: z.string().optional(),
  location: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// Type exports
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserSearchInput = z.infer<typeof userSearchSchema>;
