'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Save,
  X,
  Phone,
  MapPin,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Loader2,
  User,
  Heart,
  Mail,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Briefcase,
  Building2,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import Link from 'next/link';

interface SocialMediaLinks {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  website?: string;
}

interface UserProfileData {
  fullName: string;
  bio: string;
  profileImage: string;
  coverImage: string;
  phoneNumber: string;
  location: string;
  dateOfBirth: string;
  gender: string;
  occupation: string;
  company: string;
  website: string;
  interests: string[];
  preferredEventTypes: string[];
  socialMediaLinks: SocialMediaLinks;
}

const EVENT_TYPES = [
  'Music',
  'Sports',
  'Technology',
  'Business',
  'Arts',
  'Food & Drink',
  'Networking',
  'Workshop',
  'Conference',
  'Festival',
  'Comedy',
  'Theater',
  'Outdoor',
  'Gaming',
  'Fitness',
  'Education',
];

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export function EditUserProfile() {
  const { user, token, loading: authLoading } = useAuth();
  const profileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<UserProfileData>({
    fullName: '',
    bio: '',
    profileImage: '',
    coverImage: '',
    phoneNumber: '',
    location: '',
    dateOfBirth: '',
    gender: '',
    occupation: '',
    company: '',
    website: '',
    interests: [],
    preferredEventTypes: [],
    socialMediaLinks: {
      instagram: '',
      twitter: '',
      facebook: '',
      linkedin: '',
      website: '',
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && (!user || !token)) {
      router.push('/login');
    }
  }, [user, token, authLoading, router]);

  // Fetch user profile
  useEffect(() => {
    if (user && token) {
      fetchProfile();
    }
  }, [user, token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${user?._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📥 EditUserProfile - Fetched data:', data.user);
        console.log('📥 EditUserProfile - Cover image:', data.user?.coverImage);
        setProfileData({
          fullName: data.user.fullName || '',
          bio: data.user.bio || '',
          profileImage: data.user.profileImage || '',
          coverImage: data.user.coverImage || '', // Ensure this is set
          phoneNumber: data.user.phoneNumber || '',
          location: data.user.location || '',
          dateOfBirth: data.user.dateOfBirth || '',
          gender: data.user.gender || '',
          occupation: data.user.occupation || '',
          company: data.user.company || '',
          website: data.user.website || '',
          interests: data.user.interests || [],
          preferredEventTypes: data.user.preferredEventTypes || [],
          socialMediaLinks: data.user.socialMediaLinks || {
            instagram: '',
            twitter: '',
            facebook: '',
            linkedin: '',
            website: '',
          },
        });
        console.log('📥 EditUserProfile - Set coverImage to state:', data.user.coverImage || '');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'profile' | 'cover') => {
    try {
      if (type === 'profile') {
        setUploadingProfile(true);
      } else {
        setUploadingCover(true);
      }
      setError(null);

      if (!token) {
        setError('You must be logged in to upload images');
        router.push('/login');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'user-profiles');

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        if (type === 'profile') {
          setProfileData((prev) => {
            const updated = { ...prev, profileImage: data.imageUrl };
            console.log('✅ Profile image updated in state:', updated.profileImage);
            return updated;
          });
          console.log('✅ Profile image URL:', data.imageUrl);
        } else {
          setProfileData((prev) => {
            const updated = { ...prev, coverImage: data.imageUrl };
            console.log('✅ Cover image updated in state:', updated.coverImage);
            return updated;
          });
          console.log('✅ Cover image URL:', data.imageUrl);
        }
        setSuccess(`${type === 'profile' ? 'Profile' : 'Cover'} picture updated!`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || `Failed to upload ${type} picture`);
      }
    } catch (err: any) {
      setError(err.message || `Failed to upload ${type} picture`);
    } finally {
      if (type === 'profile') {
        setUploadingProfile(false);
      } else {
        setUploadingCover(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (!token) {
        setError('You must be logged in to update your profile');
        router.push('/login');
        return;
      }

      // Ensure coverImage is included even if it's an empty string
      const dataToSave = {
        ...profileData,
        coverImage: profileData.coverImage || '', // Explicitly include coverImage
      };
      
      console.log('💾 Saving profile data:', dataToSave);
      console.log('💾 Cover image URL being saved:', dataToSave.coverImage);

      const response = await fetch(`/api/users/${user?._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSave),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Profile saved successfully:', data.user);
        console.log('✅ Cover image in saved data:', data.user?.coverImage);
        setSuccess('Profile updated successfully!');
        
        // Update localStorage immediately
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // Wait a bit then navigate and refresh
        setTimeout(() => {
          router.push('/profile');
          router.refresh();
        }, 1500);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setProfileData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const toggleEventType = (eventType: string) => {
    setProfileData((prev) => ({
      ...prev,
      preferredEventTypes: prev.preferredEventTypes.includes(eventType)
        ? prev.preferredEventTypes.filter((t) => t !== eventType)
        : [...prev.preferredEventTypes, eventType],
    }));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <Link href="/profile">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Profile</h1>
          <div className="w-24" /> {/* Spacer for alignment */}
        </motion.div>

        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Images Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="p-6 border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Images</h2>
            
            {/* Cover Image */}
            <div className="mb-6">
              <Label className="text-sm font-semibold text-gray-900 mb-3 block">Cover Picture</Label>
              <div className="relative h-48 rounded-xl overflow-hidden bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 group">
                {profileData.coverImage && profileData.coverImage.trim() !== '' ? (
                  <ImageWithFallback
                    src={profileData.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                    key={profileData.coverImage}
                  />
                ) : null}
                <label className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/50 transition-all cursor-pointer group-hover:bg-black/40">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'cover');
                    }}
                    disabled={uploadingCover}
                  />
                  <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {uploadingCover ? (
                      <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-2" />
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-white mx-auto mb-2" />
                        <p className="text-white text-sm font-medium">
                          {profileData.coverImage ? 'Change Cover' : 'Upload Cover Picture'}
                        </p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Profile Picture */}
            <div>
              <Label className="text-sm font-semibold text-gray-900 mb-3 block">Profile Picture</Label>
              <div className="flex items-center gap-6">
                {/* Hidden input shared by avatar and button */}
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'profile');
                  }}
                  disabled={uploadingProfile}
                />

                {/* Clickable avatar */}
                <div
                  className="relative w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden ring-4 ring-teal-100 cursor-pointer group"
                  onClick={() => {
                    if (!uploadingProfile) {
                      profileInputRef.current?.click();
                    }
                  }}
                >
                  {profileData.profileImage ? (
                    <>
                      <ImageWithFallback
                        src={profileData.profileImage}
                        alt={profileData.fullName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        {uploadingProfile ? (
                          <Loader2 className="w-8 h-8 animate-spin text-white" />
                        ) : (
                          <Camera className="w-8 h-8 text-white" />
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                      {uploadingProfile ? (
                        <Loader2 className="w-16 h-16 animate-spin text-white" />
                      ) : (
                        <User className="w-16 h-16 text-white" />
                      )}
                    </div>
                  )}
                </div>

                {/* Change photo button */}
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadingProfile}
                    onClick={() => {
                      if (!uploadingProfile) {
                        profileInputRef.current?.click();
                      }
                    }}
                    className="flex items-center gap-2 bg-white text-gray-900 border-2 border-gray-400 hover:bg-teal-50 hover:border-teal-500 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {uploadingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                        <span className="text-teal-600">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 text-teal-600" />
                        <span className="text-teal-600">Change Photo</span>
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-600 font-medium">Click photo or button to upload</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="p-6 border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="mb-2 text-gray-900 font-semibold">Full Name *</Label>
                <Input
                  id="fullName"
                  value={profileData.fullName}
                  onChange={(e) =>
                    setProfileData((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  placeholder="Enter your full name"
                  className="border-2 focus:border-teal-500 text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>
              <div>
                <Label htmlFor="bio" className="mb-2 text-gray-900 font-semibold">Bio</Label>
                <textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Tell us about yourself..."
                  className="w-full min-h-[120px] px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-2 text-right">
                  {profileData.bio.length}/500 characters
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Personal Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card className="p-6 border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phoneNumber" className="mb-2 flex items-center gap-2 text-gray-900 font-semibold">
                  <Phone className="w-4 h-4 text-gray-600" />
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={(e) =>
                    setProfileData((prev) => ({ ...prev, phoneNumber: e.target.value }))
                  }
                  placeholder="+1 234 567 8900"
                  className="border-2 focus:border-teal-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="location" className="mb-2 flex items-center gap-2 text-gray-900 font-semibold">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) =>
                    setProfileData((prev) => ({ ...prev, location: e.target.value }))
                  }
                  placeholder="City, Country"
                  className="border-2 focus:border-teal-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth" className="mb-2 flex items-center gap-2 text-gray-900 font-semibold">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) =>
                    setProfileData((prev) => ({ ...prev, dateOfBirth: e.target.value }))
                  }
                  className="border-2 focus:border-teal-500 text-gray-900"
                />
              </div>
              <div>
                <Label htmlFor="gender" className="mb-2 text-gray-900 font-semibold">Gender</Label>
                <select
                  id="gender"
                  value={profileData.gender}
                  onChange={(e) =>
                    setProfileData((prev) => ({ ...prev, gender: e.target.value }))
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Professional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <Card className="p-6 border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Professional Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="occupation" className="mb-2 flex items-center gap-2 text-gray-900 font-semibold">
                  <Briefcase className="w-4 h-4 text-gray-600" />
                  Occupation
                </Label>
                <Input
                  id="occupation"
                  value={profileData.occupation}
                  onChange={(e) =>
                    setProfileData((prev) => ({ ...prev, occupation: e.target.value }))
                  }
                  placeholder="e.g., Software Engineer"
                  className="border-2 focus:border-teal-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="company" className="mb-2 flex items-center gap-2 text-gray-900 font-semibold">
                  <Building2 className="w-4 h-4 text-gray-600" />
                  Company
                </Label>
                <Input
                  id="company"
                  value={profileData.company}
                  onChange={(e) =>
                    setProfileData((prev) => ({ ...prev, company: e.target.value }))
                  }
                  placeholder="Company name"
                  className="border-2 focus:border-teal-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="website" className="mb-2 flex items-center gap-2 text-gray-900 font-semibold">
                  <Globe className="w-4 h-4 text-gray-600" />
                  Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={profileData.website}
                  onChange={(e) =>
                    setProfileData((prev) => ({ ...prev, website: e.target.value }))
                  }
                  placeholder="https://yourwebsite.com"
                  className="border-2 focus:border-teal-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Social Media Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <Card className="p-6 border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Social Media Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'instagram', icon: Instagram, label: 'Instagram', color: 'text-pink-600' },
                { key: 'twitter', icon: Twitter, label: 'Twitter', color: 'text-blue-400' },
                { key: 'facebook', icon: Facebook, label: 'Facebook', color: 'text-blue-600' },
                { key: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'text-blue-700' },
              ].map(({ key, icon: Icon, label, color }) => (
                <div key={key}>
                  <Label htmlFor={key} className="mb-2 flex items-center gap-2 text-gray-900 font-semibold">
                    <Icon className={`w-4 h-4 ${color}`} />
                    {label}
                  </Label>
                  <Input
                    id={key}
                    type="url"
                    value={profileData.socialMediaLinks[key as keyof SocialMediaLinks] || ''}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        socialMediaLinks: {
                          ...prev.socialMediaLinks,
                          [key]: e.target.value,
                        },
                      }))
                    }
                    placeholder={`https://${key}.com/username`}
                    className="border-2 focus:border-teal-500 text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Interests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <Card className="p-6 border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map((type) => {
                const isSelected = profileData.interests.includes(type);
                return (
                  <motion.div
                    key={type}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge
                      variant={isSelected ? 'default' : 'outline'}
                      className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        isSelected
                          ? 'bg-teal-600 text-white hover:bg-teal-700 border-teal-600'
                          : 'text-gray-900 border-gray-300 bg-white hover:bg-gray-100 hover:border-teal-300'
                      }`}
                      onClick={() => toggleInterest(type)}
                    >
                      {type}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Preferred Event Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-6"
        >
          <Card className="p-6 border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-teal-600" />
              Preferred Event Types
            </h2>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map((type) => {
                const isSelected = profileData.preferredEventTypes.includes(type);
                return (
                  <motion.div
                    key={type}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge
                      variant={isSelected ? 'default' : 'outline'}
                      className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        isSelected
                          ? 'bg-teal-600 text-white hover:bg-teal-700 border-teal-600'
                          : 'text-gray-900 border-gray-300 bg-white hover:bg-gray-100 hover:border-teal-300'
                      }`}
                      onClick={() => toggleEventType(type)}
                    >
                      {type}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex gap-4"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1"
          >
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-teal-600 hover:bg-teal-700 shadow-md hover:shadow-xl transition-all duration-300 text-white font-semibold py-6 text-base relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
              />
              <span className="relative z-10 flex items-center justify-center">
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <motion.div
                      animate={saving ? { rotate: 360 } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <Save className="w-5 h-5 mr-2" />
                    </motion.div>
                    <span>Save Changes</span>
                  </>
                )}
              </span>
            </Button>
          </motion.div>
          <Link href="/profile" className="flex-1">
            <Button
              variant="outline"
              disabled={saving}
              className="w-full border-2 hover:bg-gray-50 transition-all duration-200"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

