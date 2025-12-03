import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/Event';
import Payment from '@/lib/models/Payment';
import Review from '@/lib/models/Review';
import { requireAuth } from '@/lib/middleware/auth';

// GET /api/host/analytics - Get host analytics
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth(['host', 'admin']);
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Host access required' }, { status: 403 });
    }

    // Get all events hosted by this user
    const events = await Event.find({ hostId: user.userId });

    // Event stats
    const totalEvents = events.length;
    const openEvents = events.filter((e) => e.status === 'open').length;
    const completedEvents = events.filter((e) => e.status === 'completed').length;
    const cancelledEvents = events.filter((e) => e.status === 'cancelled').length;
    const totalParticipants = events.reduce((sum, e) => sum + e.currentParticipants, 0);

    // Revenue stats
    const revenueData = await Payment.aggregate([
      {
        $match: {
          hostId: user.userId,
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;
    const totalTransactions = revenueData[0]?.totalTransactions || 0;

    // Recent revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRevenue = await Payment.aggregate([
      {
        $match: {
          hostId: user.userId,
          status: 'completed',
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$amount' },
        },
      },
    ]);

    // Review stats
    const reviews = await Review.find({ hostId: user.userId });
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    // Event performance (top events by participants)
    const topEvents = events
      .sort((a, b) => b.currentParticipants - a.currentParticipants)
      .slice(0, 5)
      .map((e) => ({
        _id: e._id,
        eventName: e.eventName,
        participants: e.currentParticipants,
        maxParticipants: e.maxParticipants,
        status: e.status,
      }));

    // Monthly revenue trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          hostId: user.userId,
          status: 'completed',
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    return NextResponse.json(
      {
        events: {
          total: totalEvents,
          open: openEvents,
          completed: completedEvents,
          cancelled: cancelledEvents,
          totalParticipants,
        },
        revenue: {
          total: totalRevenue,
          transactions: totalTransactions,
          recent: recentRevenue[0]?.revenue || 0,
          monthly: monthlyRevenue,
        },
        reviews: {
          total: reviews.length,
          averageRating: Math.round(avgRating * 10) / 10,
        },
        topEvents,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get host analytics error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get analytics' },
      { status: 500 }
    );
  }
}

