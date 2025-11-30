import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/lib/models/Review';
import User from '@/lib/models/User';
import Event from '@/lib/models/Event';
import { authenticateRequest } from '@/lib/middleware/auth';

// POST /api/reviews - Create a review
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Authenticate
    const { user, error } = await authenticateRequest(req);
    if (error || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { hostId, eventId, rating, comment } = body;

    // Validation
    if (!hostId || !eventId || !rating) {
      return NextResponse.json(
        { error: 'Host ID, Event ID, and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user is reviewing themselves
    if (hostId === user.userId) {
      return NextResponse.json(
        { error: 'Cannot review yourself' },
        { status: 400 }
      );
    }

    // Check if event exists and user participated
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user participated in the event
    if (!event.participants.includes(user.userId as any)) {
      return NextResponse.json(
        { error: 'You must have participated in this event to review' },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      reviewerId: user.userId,
      eventId,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this event' },
        { status: 400 }
      );
    }

    // Create review
    const review = await Review.create({
      reviewerId: user.userId,
      hostId,
      eventId,
      rating,
      comment: comment || '',
    });

    // Update host's average rating
    const reviews = await Review.find({ hostId });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    await User.findByIdAndUpdate(hostId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length,
    });

    const populatedReview = await Review.findById(review._id)
      .populate('reviewerId', 'fullName profileImage')
      .populate('hostId', 'fullName profileImage')
      .populate('eventId', 'eventName');

    return NextResponse.json(
      {
        message: 'Review created successfully',
        review: populatedReview,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create review error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create review' },
      { status: 500 }
    );
  }
}

// GET /api/reviews - Get reviews with filters
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const hostId = searchParams.get('hostId');
    const eventId = searchParams.get('eventId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (hostId) query.hostId = hostId;
    if (eventId) query.eventId = eventId;

    // Get reviews
    const reviews = await Review.find(query)
      .populate('reviewerId', 'fullName profileImage')
      .populate('hostId', 'fullName profileImage')
      .populate('eventId', 'eventName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(query);

    return NextResponse.json(
      {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get reviews' },
      { status: 500 }
    );
  }
}

