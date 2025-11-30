# Backend System Setup Guide

## Overview

This backend system provides a complete REST API for the Events & Activities Platform using Next.js API Routes, MongoDB (Mongoose), JWT authentication, and Cloudinary for image uploads.

## Prerequisites

- Node.js 18+ installed
- MongoDB database (local or MongoDB Atlas)
- Cloudinary account (for image uploads)
- Stripe account (for payments - optional)

## Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/events-platform
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/events-platform

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

### Getting Your Credentials

1. **MongoDB**: 
   - Local: Install MongoDB locally or use Docker
   - Atlas: Create account at https://www.mongodb.com/cloud/atlas

2. **Cloudinary**: 
   - Sign up at https://cloudinary.com
   - Get credentials from Dashboard

3. **Stripe**: 
   - Sign up at https://stripe.com
   - Get API keys from Dashboard (use test keys for development)

## Database Models

### User Model
- Email (unique, required)
- Password (hashed, required)
- Full Name (required)
- Profile Image (optional)
- Bio (optional, max 500 chars)
- Interests (array)
- Location (optional)
- Role: 'user' | 'host' | 'admin' (default: 'user')
- Average Rating (calculated)
- Total Reviews (calculated)

### Event Model
- Host ID (reference to User)
- Event Name (required)
- Event Type (required)
- Description (required, max 2000 chars)
- Date & Time (required)
- Location (required)
- Min/Max Participants (required)
- Current Participants (auto-calculated)
- Joining Fee (default: 0)
- Image (optional)
- Status: 'open' | 'full' | 'cancelled' | 'completed' (default: 'open')
- Participants (array of User IDs)

### Review Model
- Reviewer ID (reference to User)
- Host ID (reference to User)
- Event ID (reference to Event)
- Rating (1-5, required)
- Comment (optional, max 1000 chars)
- Timestamps

## API Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "user" // optional, defaults to "user"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": { ... },
  "token": "jwt-token-here"
}
```

#### POST `/api/auth/login`
Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "jwt-token-here"
}
```

### Users

#### GET `/api/users/[id]`
Get user profile by ID.

**Headers:**
```
Authorization: Bearer <token>
```

#### PUT `/api/users/[id]`
Update user profile (own profile or admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "bio": "My bio",
  "interests": ["Music", "Sports"],
  "location": "New York",
  "profileImage": "https://cloudinary-url.com/image.jpg"
}
```

### Events

#### GET `/api/events`
Get all events with filters and pagination.

**Query Parameters:**
- `eventType` - Filter by event type
- `location` - Filter by location (case-insensitive search)
- `date` - Filter by date (YYYY-MM-DD)
- `status` - Filter by status (open, full, cancelled, completed)
- `search` - Search in event name, description, type
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example:**
```
GET /api/events?eventType=Concert&location=New York&page=1&limit=10
```

#### POST `/api/events`
Create new event (host or admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "eventName": "Summer Music Festival",
  "eventType": "Concert",
  "description": "Join us for an amazing music festival...",
  "date": "2024-07-15",
  "time": "18:00",
  "location": "Central Park, New York",
  "minParticipants": 5,
  "maxParticipants": 50,
  "joiningFee": 25.00,
  "image": "https://cloudinary-url.com/image.jpg"
}
```

#### GET `/api/events/[id]`
Get single event details.

#### PUT `/api/events/[id]`
Update event (host or admin only).

**Headers:**
```
Authorization: Bearer <token>
```

#### DELETE `/api/events/[id]`
Delete event (host or admin only).

**Headers:**
```
Authorization: Bearer <token>
```

#### POST `/api/events/[id]/join`
Join an event.

**Headers:**
```
Authorization: Bearer <token>
```

#### DELETE `/api/events/[id]/join`
Leave an event.

**Headers:**
```
Authorization: Bearer <token>
```

### Reviews

#### POST `/api/reviews`
Create a review (only for events user participated in).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "hostId": "user-id",
  "eventId": "event-id",
  "rating": 5,
  "comment": "Great event! Had a lot of fun."
}
```

#### GET `/api/reviews`
Get reviews with filters.

**Query Parameters:**
- `hostId` - Filter by host
- `eventId` - Filter by event
- `page` - Page number
- `limit` - Items per page

### Upload

#### POST `/api/upload`
Upload image to Cloudinary.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file` - Image file (max 5MB)
- `folder` - Optional folder name (default: 'events-platform')

**Response:**
```json
{
  "message": "Image uploaded successfully",
  "imageUrl": "https://res.cloudinary.com/...",
  "publicId": "events-platform/..."
}
```

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

The token is returned when registering or logging in and expires after 7 days (configurable via `JWT_EXPIRES_IN`).

## Role-Based Access Control

- **User**: Can join events, view events, manage own profile
- **Host**: Can create events, manage own events, view participants
- **Admin**: Can manage users, events, hosts, moderate content

## Error Handling

All API routes return consistent error responses:

```json
{
  "error": "Error message here"
}
```

Status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Testing the API

You can test the API using:

1. **Postman** or **Insomnia**
2. **curl** commands
3. **Frontend application** (already set up)

### Example curl commands:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Events
curl http://localhost:3000/api/events

# Create Event (replace TOKEN with actual token)
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"eventName":"Test Event","eventType":"Concert","description":"Test","date":"2024-12-31","time":"18:00","location":"Test Location","minParticipants":1,"maxParticipants":10}'
```

## Database Indexes

The following indexes are automatically created for optimal query performance:

**User:**
- email (unique)
- role
- interests
- location

**Event:**
- hostId
- eventType
- date
- location
- status
- createdAt (descending)

**Review:**
- hostId
- reviewerId
- eventId
- createdAt (descending)
- reviewerId + eventId (unique compound)

## Security Features

1. **Password Hashing**: Using bcrypt with salt rounds of 10
2. **JWT Tokens**: Secure token-based authentication
3. **Input Validation**: All inputs are validated
4. **Role-Based Access**: Proper authorization checks
5. **SQL Injection Protection**: Using Mongoose (NoSQL injection protection)
6. **File Upload Validation**: Type and size validation for images

## Next Steps

1. Set up your `.env.local` file with all required credentials
2. Start MongoDB (local or connect to Atlas)
3. Run `npm run dev` to start the development server
4. Test the API endpoints using the examples above
5. Integrate the API with your frontend components

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running (if local)
- Check MONGODB_URI format
- Verify network access (for Atlas)

### Cloudinary Upload Issues
- Verify API credentials in `.env.local`
- Check file size (max 5MB)
- Ensure file type is an image

### Authentication Issues
- Verify JWT_SECRET is set
- Check token expiration
- Ensure Authorization header format: `Bearer <token>`

## Support

For issues or questions, check the code comments in the API route files or refer to the Next.js and Mongoose documentation.

