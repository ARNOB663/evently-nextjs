'use client';

import { useState } from 'react';
import { 
  Share2, 
  Link as LinkIcon, 
  Check, 
  Facebook, 
  Twitter, 
  Mail,
  MessageCircle,
} from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  showLabels?: boolean;
}

export function ShareButtons({ 
  url, 
  title, 
  description = '', 
  className = '',
  showLabels = false 
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: url,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      handleCopyLink();
    }
  };

  const openShareWindow = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Copy Link */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="flex items-center gap-2"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <LinkIcon className="w-4 h-4" />
        )}
        {showLabels && (copied ? 'Copied!' : 'Copy Link')}
      </Button>

      {/* Twitter/X */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => openShareWindow(shareLinks.twitter)}
        className="flex items-center gap-2 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600"
      >
        <Twitter className="w-4 h-4" />
        {showLabels && 'Twitter'}
      </Button>

      {/* Facebook */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => openShareWindow(shareLinks.facebook)}
        className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
      >
        <Facebook className="w-4 h-4" />
        {showLabels && 'Facebook'}
      </Button>

      {/* WhatsApp */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => openShareWindow(shareLinks.whatsapp)}
        className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300 hover:text-green-600"
      >
        <MessageCircle className="w-4 h-4" />
        {showLabels && 'WhatsApp'}
      </Button>

      {/* Email */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.location.href = shareLinks.email}
        className="flex items-center gap-2 hover:bg-gray-50"
      >
        <Mail className="w-4 h-4" />
        {showLabels && 'Email'}
      </Button>

      {/* Native Share (mobile) */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleNativeShare}
          className="flex items-center gap-2 md:hidden"
        >
          <Share2 className="w-4 h-4" />
          {showLabels && 'Share'}
        </Button>
      )}
    </div>
  );
}

// Compact version for inline use
export function ShareButtonsCompact({ 
  url, 
  title, 
  description = '' 
}: Omit<ShareButtonsProps, 'className' | 'showLabels'>) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleCopyLink}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        title="Copy link"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <LinkIcon className="w-4 h-4 text-gray-500" />
        )}
      </button>
      <button
        onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank', 'width=600,height=400')}
        className="p-2 rounded-full hover:bg-sky-50 transition-colors"
        title="Share on Twitter"
      >
        <Twitter className="w-4 h-4 text-gray-500 hover:text-sky-500" />
      </button>
      <button
        onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'width=600,height=400')}
        className="p-2 rounded-full hover:bg-blue-50 transition-colors"
        title="Share on Facebook"
      >
        <Facebook className="w-4 h-4 text-gray-500 hover:text-blue-500" />
      </button>
      <button
        onClick={() => window.open(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, '_blank')}
        className="p-2 rounded-full hover:bg-green-50 transition-colors"
        title="Share on WhatsApp"
      >
        <MessageCircle className="w-4 h-4 text-gray-500 hover:text-green-500" />
      </button>
    </div>
  );
}
