'use client';

import { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface FollowButtonProps {
  hostId: string;
  token?: string;
  isAuthenticated: boolean;
  className?: string;
  showCount?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export function FollowButton({
  hostId,
  token,
  isAuthenticated,
  className = '',
  showCount = true,
  size = 'default',
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isAuthenticated && token) {
      checkFollowStatus();
    } else {
      setChecking(false);
    }
  }, [hostId, token, isAuthenticated]);

  const checkFollowStatus = async () => {
    try {
      setChecking(true);
      const response = await fetch(`/api/users/${hostId}/follow`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
        setFollowerCount(data.followerCount);
      }
    } catch (error) {
      console.error('Failed to check follow status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to follow organizers');
      return;
    }

    try {
      setLoading(true);
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/users/${hostId}/follow`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(!isFollowing);
        setFollowerCount(data.followerCount);
        toast.success(isFollowing ? 'Unfollowed' : 'Now following! You\'ll be notified of new events.');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update follow status');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <Button variant="outline" size={size} disabled className={className}>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant={isFollowing ? 'outline' : 'default'}
        size={size}
        onClick={handleFollow}
        disabled={loading}
        className={isFollowing ? '' : 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700'}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isFollowing ? (
          <>
            <UserMinus className="w-4 h-4 mr-2" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            Follow
          </>
        )}
      </Button>
      
      {showCount && followerCount > 0 && (
        <span className="text-sm text-gray-500">
          {followerCount.toLocaleString()} follower{followerCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}

// Compact version with just icon
export function FollowButtonCompact({
  hostId,
  token,
  isAuthenticated,
}: Omit<FollowButtonProps, 'showCount' | 'size' | 'className'>) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      checkFollowStatus();
    }
  }, [hostId, token, isAuthenticated]);

  const checkFollowStatus = async () => {
    try {
      const response = await fetch(`/api/users/${hostId}/follow`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
      }
    } catch (error) {
      console.error('Failed to check follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to follow organizers');
      return;
    }

    try {
      setLoading(true);
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/users/${hostId}/follow`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        toast.success(isFollowing ? 'Unfollowed' : 'Following!');
      }
    } catch (error) {
      toast.error('Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`p-2 rounded-full transition-colors ${
        isFollowing
          ? 'bg-teal-100 text-teal-600 hover:bg-teal-200'
          : 'bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-600'
      }`}
      title={isFollowing ? 'Unfollow' : 'Follow'}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isFollowing ? (
        <Bell className="w-4 h-4 fill-current" />
      ) : (
        <BellOff className="w-4 h-4" />
      )}
    </button>
  );
}
