'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Users, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Button } from '../components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FriendsPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || user?._id;
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token && userId) {
      fetchFriends();
    } else if (!token) {
      router.push('/login');
    }
  }, [token, userId]);

  const fetchFriends = async () => {
    if (!token || !userId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/users/${userId}/friends`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load friends');
      }
    } catch (err) {
      console.error('Failed to fetch friends:', err);
      setError('Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-12 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading friends...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link href="/profile">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-teal-600" />
            Friends ({friends.length})
          </h1>
        </motion.div>

        {error ? (
          <Card className="p-8 text-center">
            <p className="text-red-600">{error}</p>
          </Card>
        ) : friends.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No friends yet</p>
            <p className="text-gray-500 text-sm mt-2">Start connecting with people to see them here!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {friends.map((friend: any) => (
              <motion.div
                key={friend._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Link href={`/profile?userId=${friend._id}`}>
                  <Card className="p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                    <div className="flex flex-col items-center text-center">
                      {friend.profileImage ? (
                        <ImageWithFallback
                          src={friend.profileImage}
                          alt={friend.fullName}
                          className="w-20 h-20 rounded-full object-cover border-2 border-teal-100 mb-3"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center border-2 border-teal-100 mb-3">
                          <Users className="w-10 h-10 text-teal-600" />
                        </div>
                      )}
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate w-full">
                        {friend.fullName}
                      </h3>
                      {friend.location && (
                        <p className="text-xs text-gray-500 truncate w-full">{friend.location}</p>
                      )}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

