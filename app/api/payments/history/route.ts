import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Payment from '@/lib/models/Payment';
import { requireAuth } from '@/lib/middleware/auth';

// GET /api/payments/history - Get payment history
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth();
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all'; // 'all', 'sent', 'received'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    let query: any = {};

    if (type === 'sent') {
      query.userId = user.userId;
    } else if (type === 'received') {
      query.hostId = user.userId;
    } else {
      query.$or = [{ userId: user.userId }, { hostId: user.userId }];
    }

    const payments = await Payment.find(query)
      .populate('userId', 'fullName profileImage')
      .populate('hostId', 'fullName profileImage')
      .populate('eventId', 'eventName image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(query);

    // Calculate totals
    const sentTotal = await Payment.aggregate([
      { $match: { userId: user.userId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const receivedTotal = await Payment.aggregate([
      { $match: { hostId: user.userId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return NextResponse.json(
      {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        totals: {
          sent: sentTotal[0]?.total || 0,
          received: receivedTotal[0]?.total || 0,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get payment history error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get payment history' },
      { status: 500 }
    );
  }
}

