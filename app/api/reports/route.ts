import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Report from '@/lib/models/Report';
import { requireAuth } from '@/lib/middleware/auth';

// POST /api/reports - Create a report
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { reportedUserId, reportedEventId, type, reason, description } = body;

    if (!type || !reason) {
      return NextResponse.json(
        { error: 'Type and reason are required' },
        { status: 400 }
      );
    }

    if (type === 'user' && !reportedUserId) {
      return NextResponse.json({ error: 'Reported user ID is required' }, { status: 400 });
    }

    if (type === 'event' && !reportedEventId) {
      return NextResponse.json({ error: 'Reported event ID is required' }, { status: 400 });
    }

    if (type === 'user' && reportedUserId === user.userId) {
      return NextResponse.json({ error: 'Cannot report yourself' }, { status: 400 });
    }

    // Check if user already reported this
    const existingReport = await Report.findOne({
      reporterId: user.userId,
      ...(type === 'user' ? { reportedUserId } : { reportedEventId }),
      status: 'pending',
    });

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this' },
        { status: 400 }
      );
    }

    const report = await Report.create({
      reporterId: user.userId,
      reportedUserId: type === 'user' ? reportedUserId : undefined,
      reportedEventId: type === 'event' ? reportedEventId : undefined,
      type,
      reason,
      description: description || '',
    });

    const populatedReport = await Report.findById(report._id)
      .populate('reporterId', 'fullName email')
      .populate('reportedUserId', 'fullName email')
      .populate('reportedEventId', 'eventName');

    return NextResponse.json(
      { report: populatedReport, message: 'Report submitted successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create report error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create report' },
      { status: 500 }
    );
  }
}

// GET /api/reports - Get reports (admin only)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth(['admin']);
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';

    const query: any = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const reports = await Report.find(query)
      .populate('reporterId', 'fullName email')
      .populate('reportedUserId', 'fullName email')
      .populate('reportedEventId', 'eventName')
      .populate('reviewedBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments(query);

    return NextResponse.json(
      {
        reports,
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
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get reports' },
      { status: 500 }
    );
  }
}

