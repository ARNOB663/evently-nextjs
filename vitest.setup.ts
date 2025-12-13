import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock environment variables for tests
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-purposes-only';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db';
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
