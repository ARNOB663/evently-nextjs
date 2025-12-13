import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',
  
  // Performance monitoring
  tracesSampleRate: 0.1, // 10% of transactions
  
  // Set environment
  environment: process.env.NODE_ENV,
  
  // Configure which errors to ignore
  ignoreErrors: [
    // Ignore expected errors
    'Invalid or expired token',
    'Authentication required',
    'ECONNRESET',
  ],
  
  // Before sending an event
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request) {
      // Remove authorization headers
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      // Remove body data that might contain passwords
      if (event.request.data) {
        const data = typeof event.request.data === 'string' 
          ? JSON.parse(event.request.data) 
          : event.request.data;
        if (data.password) data.password = '[FILTERED]';
        if (data.otp) data.otp = '[FILTERED]';
        event.request.data = JSON.stringify(data);
      }
    }
    return event;
  },
});
