import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Report from '@/lib/models/Report';
import User from '@/lib/models/User';
import Event from '@/lib/models/Event';
import { requireAuth } from '@/lib/middleware/auth';

// PUT /api/reports/[id] - Update report status (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const authCheck = requireAuth(['admin']);
    const { user, error } = await authCheck(req);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, action } = body;

    const report = await Report.findById(id);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (status && ['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
      updateData.status = status;
      updateData.reviewedBy = user.userId;
      updateData.reviewedAt = new Date();
    }

    // Handle actions
    if (action === 'ban_user' && report.reportedUserId) {
      await User.findByIdAndUpdate(report.reportedUserId, {
        banned: true,
        bannedAt: new Date(),
      });
      updateData.status = 'resolved';
    }

    if (action === 'delete_event' && report.reportedEventId) {
      await Event.findByIdAndDelete(report.reportedEventId);
      updateData.status = 'resolved';
    }

    const updatedReport = await Report.findByIdAndUpdate(id, updateData, { new: true })
      .populate('reporterId', 'fullName email')
      .populate('reportedUserId', 'fullName email')
      .populate('reportedEventId', 'eventName')
      .populate('reviewedBy', 'fullName');

    return NextResponse.json(
      { report: updatedReport, message: 'Report updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update report error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update report' },
      { status: 500 }
    );
  }
}

