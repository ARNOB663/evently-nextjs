# Vercel Deployment Configuration

## Production URL
**Live Site:** https://evently-nextjs-virid.vercel.app/

## Required Environment Variables

Make sure these environment variables are set in your Vercel project settings:

### Base URL Configuration
```env
NEXT_PUBLIC_BASE_URL=https://evently-nextjs-virid.vercel.app
```

### Google OAuth Configuration
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://evently-nextjs-virid.vercel.app/api/auth/google/callback
```

**Important:** Update your Google OAuth credentials in the Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URIs:
   - `https://evently-nextjs-virid.vercel.app/api/auth/google/callback`
5. Add authorized JavaScript origins:
   - `https://evently-nextjs-virid.vercel.app`

### Other Required Environment Variables
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Email Configuration
MAIL_USER=your_email@example.com
MAIL_PASS=your_email_password

# Stripe (if using payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Cloudinary (if using image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Secret
JWT_SECRET=your_jwt_secret_key
```

## Features Using Base URL

The following features rely on `NEXT_PUBLIC_BASE_URL`:

1. **Email Verification Links** - Used in verification emails
2. **Password Reset Links** - Used in password reset emails  
3. **Google OAuth Callbacks** - Redirect URIs for Google login
4. **Stripe Payment Redirects** - Success/cancel URLs after payment
5. **Email Templates** - All email links use this base URL

## Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add each variable for **Production**, **Preview**, and **Development** environments
4. Redeploy your application after adding variables

## Testing the Deployment

After deployment, test these features:
- ✅ User registration and email verification
- ✅ Google OAuth login
- ✅ Password reset flow
- ✅ Stripe payment checkout
- ✅ Email notifications

## Local Development

For local development, keep `.env.local` with:
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

The code will automatically use `http://localhost:3000` as fallback if `NEXT_PUBLIC_BASE_URL` is not set.

