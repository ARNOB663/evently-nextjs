import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import FriendRequest from '@/lib/models/FriendRequest';
import { authenticateRequest } from '@/lib/middleware/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const userId = id;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Convert to plain object to ensure all fields are included
    const userObject = user.toObject();
    // Ensure coverImage field exists (default to empty string if undefined)
    if (userObject.coverImage === undefined) {
      userObject.coverImage = '';
    }
    console.log('📥 GET user coverImage:', userObject.coverImage);
    console.log('📥 GET user profileImage:', userObject.profileImage);

    // Get friend status if authenticated user is viewing another user's profile
    let friendStatus = null;
    try {
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : authHeader;
      
      if (token) {
        const { user: authUser } = await authenticateRequest(req);
        if (authUser && authUser.userId !== userId) {
          const currentUser = await User.findById(authUser.userId);
          if (currentUser) {
            const isFriend = currentUser.friends.some(
              (friendId) => friendId.toString() === userId
            );
            const isBlocked =
              currentUser.blockedUsers.some(
                (blockedId) => blockedId.toString() === userId
              ) ||
              user.blockedUsers.some(
                (blockedId) => blockedId.toString() === authUser.userId
              );
            
            if (isBlocked) {
              friendStatus = { status: 'blocked' };
            } else if (isFriend) {
              friendStatus = { status: 'friends' };
            } else {
              const sentRequest = await FriendRequest.findOne({
                from: authUser.userId,
                to: userId,
                status: 'pending',
              });
              const receivedRequest = await FriendRequest.findOne({
                from: userId,
                to: authUser.userId,
                status: 'pending',
              });
              
              if (sentRequest) {
                friendStatus = { status: 'request_sent', requestId: sentRequest._id };
              } else if (receivedRequest) {
                friendStatus = { status: 'request_received', requestId: receivedRequest._id };
              } else {
                friendStatus = { status: 'none' };
              }
            }
          }
        }
      }
    } catch (err) {
      // Ignore auth errors for public profile viewing
    }

    return NextResponse.json({ user: userObject, friendStatus }, { status: 200 });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Authenticate user
    const { user, error } = await authenticateRequest(req);
    if (error || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is updating their own profile or is admin
    if (user.userId !== id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to update this profile' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { 
      fullName, 
      bio, 
      interests, 
      location, 
      profileImage, 
      coverImage,
      phoneNumber,
      dateOfBirth,
      gender,
      occupation,
      company,
      website,
      preferredEventTypes,
      socialMediaLinks 
    } = body;

    console.log('📝 Received update data:', { coverImage, profileImage });
    console.log('📝 Full body:', body);

    // Build update object
    const updateData: any = {};
    if (fullName) updateData.fullName = fullName;
    if (bio !== undefined) updateData.bio = bio;
    if (interests) updateData.interests = interests;
    if (location !== undefined) updateData.location = location;
    // Always update images if they're provided (even if empty string)
    if (profileImage !== undefined) updateData.profileImage = profileImage || '';
    // Explicitly handle coverImage - always save it if it's in the request
    if (coverImage !== undefined) {
      updateData.coverImage = coverImage || '';
      console.log('✅ Setting coverImage to:', updateData.coverImage);
    } else {
      console.log('⚠️ coverImage is undefined in request body');
    }
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updateData.gender = gender;
    if (occupation !== undefined) updateData.occupation = occupation;
    if (company !== undefined) updateData.company = company;
    if (website !== undefined) updateData.website = website;
    if (preferredEventTypes) updateData.preferredEventTypes = preferredEventTypes;
    if (socialMediaLinks) updateData.socialMediaLinks = socialMediaLinks;

    console.log('💾 Update data being saved:', updateData);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ Updated user coverImage:', updatedUser.coverImage);
    console.log('✅ Updated user profileImage:', updatedUser.profileImage);

    // Convert to plain object to ensure all fields are included
    const userObject = updatedUser.toObject();
    // Ensure coverImage field exists (default to empty string if undefined)
    if (userObject.coverImage === undefined) {
      userObject.coverImage = '';
    }
    console.log('✅ User object coverImage:', userObject.coverImage);

    return NextResponse.json(
      { message: 'Profile updated successfully', user: userObject },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

