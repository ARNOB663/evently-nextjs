'use client';

import { useState } from 'react';
import { Star, Loader2, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { motion } from 'motion/react';

interface ReviewFormProps {
  hostId: string;
  eventId: string;
  eventName: string;
  onSuccess?: () => void;
}

export function ReviewForm({ hostId, eventId, eventName, onSuccess }: ReviewFormProps) {
  const { user, token } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !token) {
      toast.error('Please log in to leave a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hostId,
          eventId,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Review submitted successfully!');
        setRating(0);
        setComment('');
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count: number, interactive = false) => {
    return Array.from({ length: 5 }).map((_, i) => {
      const starValue = i + 1;
      const isFilled = starValue <= (hoveredRating || rating);

      return (
        <button
          key={i}
          type="button"
          onClick={() => interactive && setRating(starValue)}
          onMouseEnter={() => interactive && setHoveredRating(starValue)}
          onMouseLeave={() => interactive && setHoveredRating(0)}
          disabled={!interactive || submitting}
          className={`transition-all ${
            interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
          } ${submitting ? 'opacity-50' : ''}`}
        >
          <Star
            className={`w-6 h-6 ${
              isFilled
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        </button>
      );
    });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex items-center gap-2">
            {renderStars(5, true)}
            {rating > 0 && (
              <span className="text-sm text-gray-600 ml-2">
                {rating} out of 5
              </span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comment (optional)
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={4}
            maxLength={1000}
            disabled={submitting}
            className="resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/1000 characters
          </p>
        </div>

        <Button
          type="submit"
          disabled={submitting || rating === 0}
          className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Review
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}

