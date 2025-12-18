import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/Event';
import { authenticateRequest, requireAuth } from '@/lib/middleware/auth';
import mongoose from 'mongoose';

// GET /api/events - Get all events with filters
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const eventType = searchParams.get('eventType');
    const eventTypes = searchParams.getAll('eventTypes');
    const location = searchParams.get('location');
    const date = searchParams.get('date');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const hostId = searchParams.get('hostId');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const category = searchParams.get('category');
    const tags = searchParams.getAll('tags');
    const includeDrafts = searchParams.get('includeDrafts') === 'true';

    // Build query
    const query: any = {};

    // Exclude drafts unless specifically requested (usually only for host's own events)
    if (!includeDrafts) {
      query.isDraft = { $ne: true };
      query.status = { $ne: 'draft' };
    }

    if (eventTypes.length > 0) {
      query.eventType = { $in: eventTypes };
    } else if (eventType) {
      query.eventType = eventType;
    }
    
    if (location) query.location = { $regex: location, $options: 'i' };
    if (status && status !== 'draft') query.status = status;
    if (hostId && mongoose.Types.ObjectId.isValid(hostId)) {
      query.hostId = new mongoose.Types.ObjectId(hostId);
      // Allow hosts to see their own drafts
      if (includeDrafts) {
        delete query.isDraft;
        delete query.status;
      }
    }
    if (category) query.category = category;
    if (tags.length > 0) {
      query.tags = { $in: tags };
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) {
        query.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const dateToObj = new Date(dateTo);
        dateToObj.setHours(23, 59, 59, 999);
        query.date.$lte = dateToObj;
      }
    } else if (date) {
      const dateObj = new Date(date);
      const nextDay = new Date(dateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = {
        $gte: dateObj,
        $lt: nextDay,
      };
    }

    // Price range filter
    if (priceMin || priceMax) {
      query.joiningFee = {};
      if (priceMin) {
        query.joiningFee.$gte = parseFloat(priceMin);
      }
      if (priceMax) {
        query.joiningFee.$lte = parseFloat(priceMax);
      }
    }

    if (search) {
      query.$or = [
        { eventName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { eventType: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort object
    const sortOptions: any = {};
    const order = sortOrder === 'desc' ? -1 : 1;
    
    switch (sortBy) {
      case 'date':
        sortOptions.date = order;
        break;
      case 'price':
        sortOptions.joiningFee = order;
        break;
      case 'popularity':
        sortOptions.currentParticipants = -1; // Always desc for popularity
        break;
      case 'created':
        sortOptions.createdAt = order;
        break;
      default:
        sortOptions.date = 1; // Default: soonest first
    }

    // Get events - limit participants to first 5 for preview (optimization)
    const includeParticipants = searchParams.get('includeParticipants') === 'true';
    const participantLimit = parseInt(searchParams.get('participantLimit') || '5');
    
    let eventsQuery = Event.find(query)
      .populate('hostId', 'fullName profileImage averageRating')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    // Only populate limited participants if needed (performance optimization)
    if (includeParticipants) {
      eventsQuery = eventsQuery.populate({
        path: 'participants',
        select: 'fullName profileImage',
        options: { limit: participantLimit },
      });
    }
    
    const events = await eventsQuery;
    const total = await Event.countDocuments(query);

    return NextResponse.json(
      {
        events,
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
    console.error('Get events error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create new event
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Authenticate and require host role
    const authCheck = requireAuth(['host', 'admin']);
    const { user, error } = await authCheck(req);
    
    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      eventName,
      eventType,
      description,
      date,
      time,
      location,
      latitude,
      longitude,
      minParticipants,
      maxParticipants,
      joiningFee = 0,
      image,
      tags,
      category,
      isDraft,
      status: eventStatus,
      recurrence,
    } = body;

    // Validation
    if (!eventName || !eventType || !description || !date || !time || !location) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    if (minParticipants < 1 || maxParticipants < 1) {
      return NextResponse.json(
        { error: 'Participants count must be at least 1' },
        { status: 400 }
      );
    }

    if (minParticipants > maxParticipants) {
      return NextResponse.json(
        { error: 'Minimum participants cannot exceed maximum participants' },
        { status: 400 }
      );
    }

    // Determine status
    const finalStatus = isDraft ? 'draft' : (eventStatus || 'open');

    // Create event
    const event = await Event.create({
      hostId: user.userId,
      eventName,
      eventType,
      description,
      date: new Date(date),
      time,
      location,
      latitude: latitude !== undefined ? Number(latitude) : undefined,
      longitude: longitude !== undefined ? Number(longitude) : undefined,
      minParticipants,
      maxParticipants,
      joiningFee,
      image: image || '',
      status: finalStatus,
      currentParticipants: 0,
      participants: [],
      tags: tags || [],
      category: category || '',
      isDraft: isDraft || false,
      recurrence: recurrence || { enabled: false },
    });

    const populatedEvent = await Event.findById(event._id)
      .populate('hostId', 'fullName profileImage averageRating');

    return NextResponse.json(
      { message: 'Event created successfully', event: populatedEvent },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}

