import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',
  
  // Adjust sample rates as needed
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  
  // Set environment
  environment: process.env.NODE_ENV,
  
  // Configure which errors to ignore
  ignoreErrors: [
    // Ignore common browser errors
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    // Ignore network errors that users cause
    'Failed to fetch',
    'NetworkError',
    'Load failed',
  ],
  
  // Before sending an event
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry event (dev mode):', event);
      return null;
    }
    return event;
  },
});
