import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { requireAuth } from '@/lib/middleware/auth';

// PUT /api/admin/users/[id] - Update user (ban/unban, change role)
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
    const { role, banned } = body;

    const updateData: any = {};
    if (role && ['user', 'host', 'admin'].includes(role)) {
      updateData.role = role;
    }
    if (typeof banned === 'boolean') {
      updateData.banned = banned;
      updateData.bannedAt = banned ? new Date() : null;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select(
      '-password'
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUser, message: 'User updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
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

    // Prevent deleting yourself
    if (id === user.userId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}

