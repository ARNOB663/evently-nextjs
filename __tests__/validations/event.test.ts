import { describe, it, expect } from 'vitest';
import { createEventSchema, eventQuerySchema } from '@/lib/validations/event';

describe('Event Validation Schemas', () => {
  describe('createEventSchema', () => {
    const validEventData = {
      eventName: 'Tech Meetup',
      eventType: 'technology',
      description: 'A great tech meetup for developers',
      date: '2024-12-25',
      time: '14:00',
      location: '123 Main St, City',
      minParticipants: 5,
      maxParticipants: 50,
    };

    it('should validate correct event data', () => {
      const result = createEventSchema.safeParse(validEventData);
      expect(result.success).toBe(true);
    });

    it('should reject missing event name', () => {
      const { eventName, ...invalidData } = validEventData;
      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject event name exceeding 200 characters', () => {
      const invalidData = {
        ...validEventData,
        eventName: 'A'.repeat(201),
      };
      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format', () => {
      const invalidData = {
        ...validEventData,
        date: 'not-a-date',
      };
      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject minParticipants greater than maxParticipants', () => {
      const invalidData = {
        ...validEventData,
        minParticipants: 100,
        maxParticipants: 50,
      };
      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional joiningFee', () => {
      const dataWithFee = {
        ...validEventData,
        joiningFee: 25.00,
      };
      const result = createEventSchema.safeParse(dataWithFee);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.joiningFee).toBe(25.00);
      }
    });

    it('should default joiningFee to 0', () => {
      const result = createEventSchema.safeParse(validEventData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.joiningFee).toBe(0);
      }
    });

    it('should reject negative joiningFee', () => {
      const invalidData = {
        ...validEventData,
        joiningFee: -10,
      };
      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept valid latitude and longitude', () => {
      const dataWithCoords = {
        ...validEventData,
        latitude: 40.7128,
        longitude: -74.0060,
      };
      const result = createEventSchema.safeParse(dataWithCoords);
      expect(result.success).toBe(true);
    });

    it('should reject invalid latitude', () => {
      const invalidData = {
        ...validEventData,
        latitude: 100, // Invalid: must be -90 to 90
      };
      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid longitude', () => {
      const invalidData = {
        ...validEventData,
        longitude: 200, // Invalid: must be -180 to 180
      };
      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('eventQuerySchema', () => {
    it('should validate empty query', () => {
      const result = eventQuerySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate query with filters', () => {
      const query = {
        eventType: 'technology',
        status: 'open',
        sortBy: 'date',
        sortOrder: 'asc',
        page: '1',
        limit: '10',
      };
      const result = eventQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const query = {
        status: 'invalid-status',
      };
      const result = eventQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it('should reject invalid sortBy', () => {
      const query = {
        sortBy: 'invalid-sort',
      };
      const result = eventQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });
  });
});
