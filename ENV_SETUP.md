# Environment Variables Setup

## MongoDB Connection

Your MongoDB Atlas connection string should be set in `.env.local` file:

### Option 1: Using MONGO_URI (Your Current Variable Name)
```env
MONGO_URI=mongodb+srv://mongodb:a01881792704@cluster0.axaw2bo.mongodb.net/events-platform?retryWrites=true&w=majority
```

### Option 2: Using MONGODB_URI (Standard Name)
```env
MONGODB_URI=mongodb+srv://mongodb:a01881792704@cluster0.axaw2bo.mongodb.net/events-platform?retryWrites=true&w=majority
```

## Complete .env.local File

Create or update your `.env.local` file in the root directory with:

```env
# Database - Use your MongoDB Atlas connection string
MONGO_URI=mongodb+srv://mongodb:a01881792704@cluster0.axaw2bo.mongodb.net/events-platform?retryWrites=true&w=majority

# JWT Secret (use a strong random string, minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# NextAuth (optional, for future use)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Stripe (for payments - optional)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# App Configuration
NODE_ENV=development
APP_URL=http://localhost:3000
```

## Important Notes

1. **Database Name**: The connection string now automatically includes `/events-platform` as the database name
2. **Connection Options**: Added `?retryWrites=true&w=majority` for better reliability
3. **Variable Name**: The code now supports both `MONGO_URI` and `MONGODB_URI`
4. **Security**: Never commit `.env.local` to git (it should be in `.gitignore`)

## After Updating .env.local

1. Restart your development server:
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

2. The connection should now work with your MongoDB Atlas cluster.

## Troubleshooting

If you still see connection errors:
- Verify your MongoDB Atlas cluster is running
- Check that your IP address is whitelisted in MongoDB Atlas
- Ensure the username and password are correct
- Check that the cluster URL is correct

