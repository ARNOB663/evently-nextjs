// Export all validation schemas
export * from './auth';
export * from './event';
export * from './user';
export * from './common';

// Re-export Zod for convenience
export { z } from 'zod';

// Validation helper function
import { ZodSchema, ZodError } from 'zod';
import { NextResponse } from 'next/server';

/**
 * Validate request body against a Zod schema
 * Returns parsed data or NextResponse with validation errors
 */
export async function validateBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      const zodErrors = error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return {
        data: null,
        error: NextResponse.json(
          { 
            error: 'Validation failed', 
            details: zodErrors,
            message: zodErrors[0]?.message || 'Invalid input',
          },
          { status: 400 }
        ),
      };
    }
    return {
      data: null,
      error: NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): { data: T; error: null } | { data: null; error: NextResponse } {
  try {
    const params = Object.fromEntries(searchParams.entries());
    const data = schema.parse(params);
    return { data, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      const zodErrors = error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return {
        data: null,
        error: NextResponse.json(
          { 
            error: 'Validation failed', 
            details: zodErrors,
            message: zodErrors[0]?.message || 'Invalid query parameters',
          },
          { status: 400 }
        ),
      };
    }
    return {
      data: null,
      error: NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      ),
    };
  }
}
