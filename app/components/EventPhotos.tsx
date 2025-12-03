'use client';

import { useState, useEffect } from 'react';
import { Camera, Loader2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface Photo {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    profileImage?: string;
  };
  imageUrl: string;
  caption?: string;
  createdAt: string;
}

interface EventPhotosProps {
  eventId: string;
  isParticipant: boolean;
  isHost: boolean;
}

export function EventPhotos({ eventId, isParticipant, isHost }: EventPhotosProps) {
  const { user, token } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, [eventId, page]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}/photos?page=${page}&limit=12`);

      if (response.ok) {
        const data = await response.json();
        if (page === 1) {
          setPhotos(data.photos || []);
        } else {
          setPhotos((prev) => [...prev, ...(data.photos || [])]);
        }
        setHasMore(data.pagination.page < data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'event-photos');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadData.url) {
        throw new Error(uploadData.error || 'Failed to upload image');
      }

      // Save photo to database
      const photoResponse = await fetch(`/api/events/${eventId}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageUrl: uploadData.url,
        }),
      });

      const photoData = await photoResponse.json();

      if (photoResponse.ok) {
        toast.success('Photo uploaded successfully!');
        setPage(1);
        fetchPhotos();
      } else {
        toast.error(photoData.error || 'Failed to save photo');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const response = await fetch(`/api/events/${eventId}/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Photo deleted');
        fetchPhotos();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete photo');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete photo');
    }
  };

  if (loading && photos.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Upload Button */}
      {(isParticipant || isHost) && (
        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
            id="photo-upload"
          />
          <label htmlFor="photo-upload">
            <Button
              variant="outline"
              disabled={uploading}
              className="w-full sm:w-auto cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Upload Photo
                </>
              )}
            </Button>
          </label>
        </div>
      )}

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <Card className="p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No photos yet</p>
          <p className="text-gray-500 text-sm mt-2">
            {(isParticipant || isHost) ? 'Be the first to share a photo!' : 'Photos will appear here once participants start sharing'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <motion.div
              key={photo._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <ImageWithFallback
                  src={photo.imageUrl}
                  alt={photo.caption || 'Event photo'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              {(user?._id === photo.userId._id || user?.role === 'admin') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(photo._id);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-xs line-clamp-2">{photo.caption}</p>
                </div>
              )}
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

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <ImageWithFallback
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.caption || 'Event photo'}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              {selectedPhoto.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                  <p className="text-white">{selectedPhoto.caption}</p>
                  <p className="text-white/70 text-sm mt-2">
                    By {selectedPhoto.userId.fullName}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

