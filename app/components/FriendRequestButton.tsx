'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserPlus, UserCheck, UserX, Check, X, Loader2, Ban } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface FriendRequestButtonProps {
  userId: string;
  onStatusChange?: () => void;
}

interface FriendStatus {
  status: 'none' | 'friends' | 'request_sent' | 'request_received' | 'blocked';
  requestId?: string;
}

export function FriendRequestButton({ userId, onStatusChange }: FriendRequestButtonProps) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [friendStatus, setFriendStatus] = useState<FriendStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user && token && userId && userId !== user._id) {
      fetchFriendStatus();
    } else {
      setLoading(false);
    }
  }, [user, token, userId]);

  const fetchFriendStatus = async () => {
    try {
      const response = await fetch(`/api/friends/status/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFriendStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch friend status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!token) {
      router.push('/login');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setFriendStatus({ status: 'request_sent', requestId: data.friendRequest._id });
        onStatusChange?.();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
      alert('Failed to send friend request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!friendStatus?.requestId) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId: friendStatus.requestId }),
      });

      if (response.ok) {
        setFriendStatus({ status: 'friends' });
        onStatusChange?.();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to accept friend request');
      }
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      alert('Failed to accept friend request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!friendStatus?.requestId) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/friends/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId: friendStatus.requestId }),
      });

      if (response.ok) {
        setFriendStatus({ status: 'none' });
        onStatusChange?.();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to reject friend request');
      }
    } catch (error) {
      console.error('Failed to reject friend request:', error);
      alert('Failed to reject friend request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!friendStatus?.requestId) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/friends/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId: friendStatus.requestId }),
      });

      if (response.ok) {
        setFriendStatus({ status: 'none' });
        onStatusChange?.();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to cancel friend request');
      }
    } catch (error) {
      console.error('Failed to cancel friend request:', error);
      alert('Failed to cancel friend request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfriend = async () => {
    if (!confirm('Are you sure you want to unfriend this user?')) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/friends/unfriend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setFriendStatus({ status: 'none' });
        onStatusChange?.();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to unfriend');
      }
    } catch (error) {
      console.error('Failed to unfriend:', error);
      alert('Failed to unfriend');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !user || userId === user._id) {
    return null;
  }

  if (!friendStatus) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {friendStatus.status === 'none' && (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleSendRequest}
            disabled={actionLoading}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )}
            Add Friend
          </Button>
        </motion.div>
      )}

      {friendStatus.status === 'request_sent' && (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleCancelRequest}
            disabled={actionLoading}
            variant="outline"
            className="border-teal-600 text-teal-600 hover:bg-teal-50"
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <X className="w-4 h-4 mr-2" />
            )}
            Cancel Request
          </Button>
        </motion.div>
      )}

      {friendStatus.status === 'request_received' && (
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleAcceptRequest}
              disabled={actionLoading}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Accept
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleRejectRequest}
              disabled={actionLoading}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              Reject
            </Button>
          </motion.div>
        </div>
      )}

      {friendStatus.status === 'friends' && (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleUnfriend}
            disabled={actionLoading}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <UserX className="w-4 h-4 mr-2" />
            )}
            Unfriend
          </Button>
        </motion.div>
      )}

      {friendStatus.status === 'blocked' && (
        <Button disabled variant="outline" className="border-gray-300 text-gray-500">
          <Ban className="w-4 h-4 mr-2" />
          Blocked
        </Button>
      )}
    </div>
  );
}

