'use client';

import { useState } from 'react';
import { Flag, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface ReportButtonProps {
  type: 'user' | 'event';
  reportedUserId?: string;
  reportedEventId?: string;
}

export function ReportButton({ type, reportedUserId, reportedEventId }: ReportButtonProps) {
  const { user, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !token) {
      toast.error('Please log in to report');
      return;
    }

    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reportedUserId,
          reportedEventId,
          type,
          reason,
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Report submitted successfully. Thank you for helping keep our community safe.');
        setOpen(false);
        setReason('');
        setDescription('');
      } else {
        toast.error(data.error || 'Failed to submit report');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
          <Flag className="w-4 h-4 mr-2" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report {type === 'user' ? 'User' : 'Event'}</DialogTitle>
          <DialogDescription>
            Help us keep the community safe by reporting inappropriate content.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label>Reason *</Label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                required
              >
                <option value="">Select a reason</option>
                <option value="spam">Spam</option>
                <option value="harassment">Harassment</option>
                <option value="inappropriate_content">Inappropriate Content</option>
                {type === 'user' && <option value="fake_profile">Fake Profile</option>}
                {type === 'event' && <option value="scam">Scam</option>}
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <Label>Additional Details (optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide more information..."
                rows={4}
                maxLength={1000}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">{description.length}/1000 characters</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !reason}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

