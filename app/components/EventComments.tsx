'use client';

import { useState, useEffect } from 'react';
import { Send, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import Link from 'next/link';

interface Comment {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    profileImage?: string;
  };
  content: string;
  createdAt: string;
}

interface EventCommentsProps {
  eventId: string;
}

export function EventComments({ eventId }: EventCommentsProps) {
  const { user, token } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [eventId, page]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments?eventId=${eventId}&page=${page}&limit=10`);

      if (response.ok) {
        const data = await response.json();
        if (page === 1) {
          setComments(data.comments || []);
        } else {
          setComments((prev) => [...prev, ...(data.comments || [])]);
        }
        setHasMore(data.pagination.page < data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !token) {
      toast.error('Please log in to comment');
      return;
    }

    if (!content.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId,
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Comment posted!');
        setContent('');
        // Reset to page 1 and clear comments before fetching
        setComments([]);
        setPage(1);
        // Fetch will be triggered by useEffect when page changes
        // But we also fetch immediately to show the new comment
        setTimeout(() => {
          fetchComments();
        }, 100);
      } else {
        toast.error(data.error || 'Failed to post comment');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Comment deleted');
        fetchComments();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete comment');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete comment');
    }
  };

  return (
    <div>
      {/* Comment Form */}
      <Card className="p-4 mb-6">
        {user && token ? (
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={user.profileImage} />
              <AvatarFallback className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                {user.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a comment..."
                rows={2}
                maxLength={1000}
                disabled={submitting}
                className="resize-none mb-2 text-gray-900"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{content.length}/1000</p>
                <Button 
                  type="submit" 
                  disabled={submitting || !content.trim()} 
                  size="sm"
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-3">Please log in to post a comment</p>
            <Button asChild className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white">
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        )}
      </Card>

      {/* Comments List */}
      {loading && comments.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
        </div>
      ) : comments.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600">No comments yet</p>
          <p className="text-sm text-gray-500 mt-2">Be the first to comment!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-4">
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={comment.userId.profileImage} />
                    <AvatarFallback className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                      {comment.userId.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="font-semibold text-gray-900">{comment.userId.fullName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {user && (comment.userId._id === user._id || user.role === 'admin') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(comment._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

