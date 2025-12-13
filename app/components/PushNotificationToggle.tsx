'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner';
import {
  isPushSupported,
  requestNotificationPermission,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  isSubscribedToPush,
  savePushSubscription,
  removePushSubscription,
} from '@/lib/utils/pushNotifications';

interface PushNotificationToggleProps {
  token?: string;
  className?: string;
}

export function PushNotificationToggle({ token, className = '' }: PushNotificationToggleProps) {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setChecking(true);
      const isSupported = isPushSupported();
      setSupported(isSupported);

      if (isSupported) {
        setPermission(getNotificationPermission());
        const isSubbed = await isSubscribedToPush();
        setSubscribed(isSubbed);
      }
    } catch (error) {
      console.error('Error checking push status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleEnable = async () => {
    if (!token) {
      toast.error('Please log in to enable notifications');
      return;
    }

    try {
      setLoading(true);

      // Request permission first
      const perm = await requestNotificationPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        toast.error('Please allow notifications in your browser settings');
        return;
      }

      // Get VAPID public key from environment
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        toast.error('Push notifications not configured');
        return;
      }

      // Subscribe to push
      const subscription = await subscribeToPush(vapidKey);
      if (!subscription) {
        throw new Error('Failed to subscribe');
      }

      // Save subscription to server
      const saved = await savePushSubscription(subscription, token);
      if (!saved) {
        throw new Error('Failed to save subscription');
      }

      setSubscribed(true);
      toast.success('Push notifications enabled!');
    } catch (error: any) {
      console.error('Enable push error:', error);
      toast.error(error.message || 'Failed to enable notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    try {
      setLoading(true);

      // Unsubscribe from push
      await unsubscribeFromPush();

      // Remove subscription from server
      if (token) {
        await removePushSubscription(token);
      }

      setSubscribed(false);
      toast.success('Push notifications disabled');
    } catch (error: any) {
      console.error('Disable push error:', error);
      toast.error('Failed to disable notifications');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-500">Checking notification status...</span>
      </div>
    );
  }

  if (!supported) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">Push notifications not supported in this browser</span>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <Card className={`p-4 bg-orange-50 border-orange-200 ${className}`}>
        <div className="flex items-start gap-3">
          <BellOff className="w-5 h-5 text-orange-500 mt-0.5" />
          <div>
            <p className="font-medium text-orange-800">Notifications Blocked</p>
            <p className="text-sm text-orange-600 mt-1">
              You've blocked notifications. To enable them, click the lock icon in your browser's
              address bar and allow notifications.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        {subscribed ? (
          <Bell className="w-5 h-5 text-teal-500" />
        ) : (
          <BellOff className="w-5 h-5 text-gray-400" />
        )}
        <div>
          <p className="font-medium text-gray-900">Push Notifications</p>
          <p className="text-sm text-gray-500">
            {subscribed
              ? 'Get notified about events, updates, and reminders'
              : 'Enable to receive real-time updates'}
          </p>
        </div>
      </div>

      <Button
        variant={subscribed ? 'outline' : 'default'}
        onClick={subscribed ? handleDisable : handleEnable}
        disabled={loading}
        className={!subscribed ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white' : ''}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : subscribed ? (
          'Disable'
        ) : (
          'Enable'
        )}
      </Button>
    </div>
  );
}

// Compact inline toggle
export function PushNotificationInlineToggle({ token }: { token?: string }) {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    if (isPushSupported()) {
      const isSubbed = await isSubscribedToPush();
      setSubscribed(isSubbed);
    }
  };

  const toggle = async () => {
    if (!token) {
      toast.error('Please log in');
      return;
    }

    try {
      setLoading(true);

      if (subscribed) {
        await unsubscribeFromPush();
        if (token) await removePushSubscription(token);
        setSubscribed(false);
        toast.success('Notifications disabled');
      } else {
        const perm = await requestNotificationPermission();
        if (perm !== 'granted') {
          toast.error('Permission denied');
          return;
        }

        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) return;

        const subscription = await subscribeToPush(vapidKey);
        if (subscription && token) {
          await savePushSubscription(subscription, token);
        }
        setSubscribed(true);
        toast.success('Notifications enabled!');
      }
    } catch (error) {
      toast.error('Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  if (!isPushSupported()) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`p-2 rounded-full transition-colors ${
        subscribed
          ? 'bg-teal-100 text-teal-600 hover:bg-teal-200'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
      title={subscribed ? 'Disable notifications' : 'Enable notifications'}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : subscribed ? (
        <Bell className="w-5 h-5" />
      ) : (
        <BellOff className="w-5 h-5" />
      )}
    </button>
  );
}
