'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Users, MapPin, Filter, X, UserPlus, Sparkles, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { FriendRequestButton } from '../components/FriendRequestButton';
import Link from 'next/link';

interface User {
  _id: string;
  fullName: string;
  profileImage?: string;
  bio?: string;
  location?: string;
  interests?: string[];
  preferredEventTypes?: string[];
  role?: string;
}

export default function DiscoverPage() {
  const { user, token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [recommendations, setRecommendations] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'recommendations'>('recommendations');

  useEffect(() => {
    if (token && activeTab === 'recommendations') {
      fetchRecommendations();
    }
  }, [token, activeTab]);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const debounce = setTimeout(() => {
        performSearch();
      }, 500);
      return () => clearTimeout(debounce);
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  const fetchRecommendations = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch('/api/users/recommendations?limit=20', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    if (!token || searchQuery.trim().length < 2) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}&limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setActiveTab('search');
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayUsers = activeTab === 'search' ? users : recommendations;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-teal-600" />
            Discover People
          </h1>
          <p className="text-gray-600">Find and connect with people who share your interests</p>
        </motion.div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by name, location, or interests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-teal-50 border-teal-600' : ''}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Role</label>
                    <select className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm">
                      <option value="">All Roles</option>
                      <option value="user">Users</option>
                      <option value="host">Hosts</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                    <Input placeholder="City or country" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Interests</label>
                    <Input placeholder="Search interests" />
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'recommendations' ? 'default' : 'outline'}
            onClick={() => setActiveTab('recommendations')}
            className={activeTab === 'recommendations' ? 'bg-teal-600 hover:bg-teal-700' : ''}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Recommendations
          </Button>
          {searchQuery && (
            <Button
              variant={activeTab === 'search' ? 'default' : 'outline'}
              onClick={() => setActiveTab('search')}
              className={activeTab === 'search' ? 'bg-teal-600 hover:bg-teal-700' : ''}
            >
              <Search className="w-4 h-4 mr-2" />
              Search Results ({users.length})
            </Button>
          )}
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        ) : displayUsers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">
                {activeTab === 'search' ? 'No users found' : 'No recommendations'}
              </p>
              <p className="text-gray-500 text-sm">
                {activeTab === 'search'
                  ? 'Try adjusting your search query'
                  : 'Complete your profile to get better recommendations'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayUsers.map((person) => (
              <motion.div
                key={person._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
              >
                <Card className="hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <Link href={`/profile?userId=${person._id}`} className="mb-4">
                        {person.profileImage ? (
                          <ImageWithFallback
                            src={person.profileImage}
                            alt={person.fullName}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg hover:ring-4 hover:ring-teal-500 transition-all cursor-pointer"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center border-4 border-white shadow-lg hover:ring-4 hover:ring-teal-500 transition-all cursor-pointer">
                            <User className="w-12 h-12 text-white" />
                          </div>
                        )}
                      </Link>
                      <Link href={`/profile?userId=${person._id}`}>
                        <h3 className="font-semibold text-lg text-gray-900 mb-1 hover:text-teal-600 transition-colors">
                          {person.fullName}
                        </h3>
                      </Link>
                      {person.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{person.location}</span>
                        </div>
                      )}
                      {person.bio && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{person.bio}</p>
                      )}
                      {person.interests && person.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4 justify-center">
                          {person.interests.slice(0, 3).map((interest) => (
                            <Badge key={interest} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                          {person.interests.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{person.interests.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      {person.role && (
                        <Badge
                          variant="secondary"
                          className={`mb-4 ${
                            person.role === 'host' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'
                          }`}
                        >
                          {person.role === 'host' ? 'Host' : 'User'}
                        </Badge>
                      )}
                      {person._id !== user?._id && (
                        <FriendRequestButton userId={person._id} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

