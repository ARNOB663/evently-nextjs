'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Edit,
  Phone,
  MapPin,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Loader2,
  Building2,
  Mail,
  Calendar,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { ImageWithFallback } from './figma/ImageWithFallback';
import Link from 'next/link';

interface SocialMediaLinks {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  website?: string;
}

interface HostProfileData {
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
  socialMediaLinks: SocialMediaLinks;
}

export function HostProfile() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<HostProfileData>({
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
    socialMediaLinks: {
      instagram: '',
      twitter: '',
      facebook: '',
      linkedin: '',
      website: '',
    },
  });

  // Redirect if not authenticated or not host
  useEffect(() => {
    if (!authLoading) {
      if (!user || !token) {
        router.push('/host-login');
      } else if (user.role !== 'host' && user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, token, authLoading, router]);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${user?._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData({
          fullName: data.user.fullName || '',
          bio: data.user.bio || '',
          profileImage: data.user.profileImage || '',
          coverImage: data.user.coverImage || '',
          phoneNumber: data.user.phoneNumber || '',
          location: data.user.location || '',
          dateOfBirth: data.user.dateOfBirth || '',
          gender: data.user.gender || '',
          occupation: data.user.occupation || '',
          company: data.user.company || '',
          website: data.user.website || '',
          interests: data.user.interests || [],
          socialMediaLinks: data.user.socialMediaLinks || {
            instagram: '',
            twitter: '',
            facebook: '',
            linkedin: '',
            website: '',
          },
        });
      }
    } catch (err: any) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // Fetch user profile
  useEffect(() => {
    if (user && token) {
      fetchProfile();
    }
  }, [user, token, fetchProfile]);

  // Refetch when navigating back to profile page
  useEffect(() => {
    if (pathname === '/host-profile' && user && token) {
      fetchProfile();
    }
  }, [pathname, user, token, fetchProfile]);

  // Refetch when URL has refresh parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('refresh') && user && token) {
        fetchProfile();
        // Clean up URL
        window.history.replaceState({}, '', '/host-profile');
      }
    }
  }, [user, token, fetchProfile]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cover Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-6 rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="relative h-48 sm:h-64 md:h-80 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 overflow-hidden">
            {profileData.coverImage && profileData.coverImage.trim() !== '' ? (
              <ImageWithFallback
                src={profileData.coverImage}
                alt="Cover"
                className="w-full h-full object-cover absolute inset-0 z-0"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-rose-500/20 z-10" />
          </div>

          {/* Profile Picture */}
          <div className="relative z-20 -mt-20 sm:-mt-24 md:-mt-28 px-6 sm:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative inline-block"
            >
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full border-4 border-white bg-white shadow-2xl overflow-hidden ring-4 ring-purple-100">
                {profileData.profileImage ? (
                  <ImageWithFallback
                    src={profileData.profileImage}
                    alt={profileData.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    <Building2 className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                {profileData.fullName || user.fullName}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="secondary" className="text-sm px-3 py-1 bg-purple-100 text-purple-700">
                  <Building2 className="w-3 h-3 mr-1" />
                  Host
                </Badge>
                {profileData.location && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{profileData.location}</span>
                  </div>
                )}
                {profileData.occupation && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-sm">{profileData.occupation}</span>
                  </div>
                )}
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href="/host-profile/edit">
                <Button className="bg-purple-600 hover:bg-purple-700 transition-all duration-200 shadow-sm hover:shadow-md">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Card className="p-6 sm:p-8 border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  About
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {profileData.bio || (
                    <span className="text-gray-400 italic">No bio yet. Click Edit Profile to add one!</span>
                  )}
                </p>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Card className="p-6 sm:p-8 border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-purple-600" />
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {profileData.phoneNumber && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        Phone Number
                      </Label>
                      <p className="text-gray-700">{profileData.phoneNumber}</p>
                    </div>
                  )}
                  {profileData.location && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        Location
                      </Label>
                      <p className="text-gray-700">{profileData.location}</p>
                    </div>
                  )}
                  {profileData.occupation && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-500" />
                        Occupation
                      </Label>
                      <p className="text-gray-700">{profileData.occupation}</p>
                    </div>
                  )}
                  {profileData.company && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        Company
                      </Label>
                      <p className="text-gray-700">{profileData.company}</p>
                    </div>
                  )}
                  {profileData.website && (
                    <div className="sm:col-span-2">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        Website
                      </Label>
                      <a
                        href={profileData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 underline"
                      >
                        {profileData.website}
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Social Media Links */}
            {(profileData.socialMediaLinks.instagram ||
              profileData.socialMediaLinks.twitter ||
              profileData.socialMediaLinks.facebook ||
              profileData.socialMediaLinks.linkedin ||
              profileData.socialMediaLinks.website) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Card className="p-6 sm:p-8 border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-600" />
                    Social Media
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: 'instagram', icon: Instagram, label: 'Instagram', color: 'text-pink-600' },
                      { key: 'twitter', icon: Twitter, label: 'Twitter', color: 'text-blue-400' },
                      { key: 'facebook', icon: Facebook, label: 'Facebook', color: 'text-blue-600' },
                      { key: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'text-blue-700' },
                    ]
                      .filter(({ key }) => profileData.socialMediaLinks[key as keyof SocialMediaLinks])
                      .map(({ key, icon: Icon, label, color }) => (
                        <div key={key} className="group">
                          <Label className="text-xs font-medium text-gray-600 mb-2 block flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${color}`} />
                            {label}
                          </Label>
                          <a
                            href={profileData.socialMediaLinks[key as keyof SocialMediaLinks]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700 text-sm truncate block"
                          >
                            {profileData.socialMediaLinks[key as keyof SocialMediaLinks]}
                          </a>
                        </div>
                      ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Event Categories */}
            {profileData.interests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Card className="p-6 border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Event Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="px-3 py-1 text-xs text-gray-900 bg-purple-100 border-purple-200">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
