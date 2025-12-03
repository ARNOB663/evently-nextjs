import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Event from '@/lib/models/Event';
import Payment from '@/lib/models/Payment';
import Review from '@/lib/models/Review';
import { requireAuth } from '@/lib/middleware/auth';

// GET /api/admin/analytics - Get platform analytics
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authCheck = requireAuth(['admin']);
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Admin access required' }, { status: 403 });
    }

    // User stats
    const totalUsers = await User.countDocuments({});
    const users = await User.countDocuments({ role: 'user' });
    const hosts = await User.countDocuments({ role: 'host' });
    const admins = await User.countDocuments({ role: 'admin' });

    // Event stats
    const totalEvents = await Event.countDocuments({});
    const openEvents = await Event.countDocuments({ status: 'open' });
    const completedEvents = await Event.countDocuments({ status: 'completed' });
    const cancelledEvents = await Event.countDocuments({ status: 'cancelled' });

    // Revenue stats
    const revenueData = await Payment.aggregate([
      {
        $match: { status: 'completed' },
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

    // Review stats
    const totalReviews = await Review.countDocuments({});
    const avgRating = await Review.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    // Growth stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const newEvents = await Event.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const recentRevenue = await Payment.aggregate([
      {
        $match: {
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

    return NextResponse.json(
      {
        users: {
          total: totalUsers,
          users,
          hosts,
          admins,
          newUsers,
        },
        events: {
          total: totalEvents,
          open: openEvents,
          completed: completedEvents,
          cancelled: cancelledEvents,
          newEvents,
        },
        revenue: {
          total: totalRevenue,
          transactions: totalTransactions,
          recent: recentRevenue[0]?.revenue || 0,
        },
        reviews: {
          total: totalReviews,
          averageRating: avgRating[0]?.avgRating || 0,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get analytics' },
      { status: 500 }
    );
  }
}

