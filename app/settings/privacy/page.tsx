'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Eye, UserPlus, Users, EyeOff, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import Link from 'next/link';

interface PrivacySettings {
  profileVisibility: 'everyone' | 'friends' | 'only me';
  friendRequests: 'everyone' | 'friends of friends' | 'no one';
  showFriendList: boolean;
  showProfileVisits: boolean;
  showOnlineStatus: boolean;
}

export default function PrivacySettingsPage() {
  const { user, token } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'everyone',
    friendRequests: 'everyone',
    showFriendList: true,
    showProfileVisits: true,
    showOnlineStatus: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (token) {
      fetchSettings();
    }
  }, [token]);

  const fetchSettings = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch('/api/privacy', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.privacySettings) {
          setSettings(data.privacySettings);
        }
      }
    } catch (error) {
      console.error('Failed to fetch privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!token) return;
    setSaving(true);
    setSaved(false);
    try {
      const response = await fetch('/api/privacy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ privacySettings: settings }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading privacy settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link href="/profile">
              <Button variant="outline" size="sm">
                ← Back to Profile
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-teal-600" />
            Privacy Settings
          </h1>
          <p className="text-gray-600">Control who can see your information and interact with you</p>
        </motion.div>

        {/* Settings Cards */}
        <div className="space-y-6">
          {/* Profile Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-teal-600" />
                Profile Visibility
              </CardTitle>
              <CardDescription>Control who can view your profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Who can view your profile?</Label>
                <select
                  value={settings.profileVisibility}
                  onChange={(e) =>
                    setSettings({ ...settings, profileVisibility: e.target.value as any })
                  }
                  className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
                >
                  <option value="everyone">Everyone</option>
                  <option value="friends">Friends Only</option>
                  <option value="only me">Only Me</option>
                </select>
                <p className="text-xs text-gray-500">
                  {settings.profileVisibility === 'everyone' &&
                    'Your profile is visible to all users'}
                  {settings.profileVisibility === 'friends' &&
                    'Only your friends can view your profile'}
                  {settings.profileVisibility === 'only me' &&
                    'Your profile is private and not visible to others'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Friend Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-600" />
                Friend Requests
              </CardTitle>
              <CardDescription>Control who can send you friend requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Who can send you friend requests?</Label>
                <select
                  value={settings.friendRequests}
                  onChange={(e) =>
                    setSettings({ ...settings, friendRequests: e.target.value as any })
                  }
                  className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
                >
                  <option value="everyone">Everyone</option>
                  <option value="friends of friends">Friends of Friends</option>
                  <option value="no one">No One</option>
                </select>
                <p className="text-xs text-gray-500">
                  {settings.friendRequests === 'everyone' &&
                    'Anyone can send you friend requests'}
                  {settings.friendRequests === 'friends of friends' &&
                    'Only people who have mutual friends with you can send requests'}
                  {settings.friendRequests === 'no one' &&
                    'No one can send you friend requests'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Privacy Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                Additional Privacy Options
              </CardTitle>
              <CardDescription>Fine-tune your privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <Label className="text-base font-medium">Show Friend List</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Allow others to see your friends list
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSettings({ ...settings, showFriendList: !settings.showFriendList })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.showFriendList ? 'bg-teal-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showFriendList ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <Label className="text-base font-medium">Show Profile Visits</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Notify you when someone visits your profile
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSettings({ ...settings, showProfileVisits: !settings.showProfileVisits })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.showProfileVisits ? 'bg-teal-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showProfileVisits ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <Label className="text-base font-medium">Show Online Status</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Let others see when you're online
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSettings({ ...settings, showOnlineStatus: !settings.showOnlineStatus })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.showOnlineStatus ? 'bg-teal-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            {saved && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-teal-600"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Settings saved!</span>
              </motion.div>
            )}
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 min-w-[120px]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

