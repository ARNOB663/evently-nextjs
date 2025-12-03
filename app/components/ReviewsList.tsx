'use client';

import { useState, useEffect } from 'react';
import { Star, Loader2, Filter } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';

interface Review {
  _id: string;
  reviewerId: {
    _id: string;
    fullName: string;
    profileImage?: string;
  };
  hostId: {
    _id: string;
    fullName: string;
  };
  eventId: {
    _id: string;
    eventName: string;
  };
  rating: number;
  comment?: string;
  createdAt: string;
}

interface ReviewsListProps {
  hostId?: string;
  eventId?: string;
  showEventName?: boolean;
}

export function ReviewsList({ hostId, eventId, showEventName = false }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [hostId, eventId, ratingFilter, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (hostId) params.append('hostId', hostId);
      if (eventId) params.append('eventId', eventId);
      params.append('page', page.toString());
      params.append('limit', '10');

      const response = await fetch(`/api/reviews?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        if (page === 1) {
          setReviews(data.reviews || []);
        } else {
          setReviews((prev) => [...prev, ...(data.reviews || [])]);
        }
        setHasMore(data.pagination.page < data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-200 text-gray-200'
        }`}
      />
    ));
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No reviews yet</p>
        <p className="text-sm text-gray-500 mt-2">Be the first to leave a review!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter */}
      <div className="mb-6 flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">Filter by rating:</span>
        <button
          onClick={() => setRatingFilter(null)}
          className={`px-3 py-1 rounded-full text-sm ${
            ratingFilter === null
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {[5, 4, 3, 2, 1].map((rating) => (
          <button
            key={rating}
            onClick={() => setRatingFilter(rating)}
            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
              ratingFilter === rating
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {rating}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews
          .filter((review) => ratingFilter === null || review.rating === ratingFilter)
          .map((review) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    <AvatarImage src={review.reviewerId.profileImage} />
                    <AvatarFallback className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                      {review.reviewerId.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {review.reviewerId.fullName}
                        </h4>
                        {showEventName && (
                          <p className="text-sm text-gray-500 mt-1">
                            Reviewed: {review.eventId.eventName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>

                    {review.comment && (
                      <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
                    )}

                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={loading}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 inline-block mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  );
}

