'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  Trash2,
  Loader2,
  ArrowLeft,
  Filter,
  MoreVertical,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminUsersPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !token) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/');
      } else {
        fetchUsers();
      }
    }
  }, [user, token, authLoading, router, page, search, roleFilter]);

  const fetchUsers = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      params.append('page', page.toString());

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setStats(data.stats);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        toast.success('User updated successfully');
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update user');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              User Management
            </h1>
          </motion.div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-600">Users</p>
                <p className="text-2xl font-bold">{stats.users}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-600">Hosts</p>
                <p className="text-2xl font-bold">{stats.hosts}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold">{stats.admins}</p>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={roleFilter === '' ? 'default' : 'outline'}
                  onClick={() => {
                    setRoleFilter('');
                    setPage(1);
                  }}
                >
                  All
                </Button>
                <Button
                  variant={roleFilter === 'user' ? 'default' : 'outline'}
                  onClick={() => {
                    setRoleFilter('user');
                    setPage(1);
                  }}
                >
                  Users
                </Button>
                <Button
                  variant={roleFilter === 'host' ? 'default' : 'outline'}
                  onClick={() => {
                    setRoleFilter('host');
                    setPage(1);
                  }}
                >
                  Hosts
                </Button>
                <Button
                  variant={roleFilter === 'admin' ? 'default' : 'outline'}
                  onClick={() => {
                    setRoleFilter('admin');
                    setPage(1);
                  }}
                >
                  Admins
                </Button>
              </div>
            </div>
          </Card>

          {/* Users List */}
          <div className="space-y-4">
            {users.map((userItem) => (
              <motion.div
                key={userItem._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={userItem.profileImage} />
                        <AvatarFallback className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                          {userItem.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{userItem.fullName}</h3>
                          <Badge
                            variant={
                              userItem.role === 'admin'
                                ? 'default'
                                : userItem.role === 'host'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {userItem.role}
                          </Badge>
                          {userItem.banned && (
                            <Badge variant="destructive">Banned</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{userItem.email}</p>
                        <p className="text-xs text-gray-500">
                          Joined: {new Date(userItem.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!userItem.banned ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateUser(userItem._id, { banned: true })}
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Ban
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateUser(userItem._id, { banned: false })}
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Unban
                        </Button>
                      )}
                      {userItem.role !== 'admin' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUpdateUser(userItem._id, {
                              role: userItem.role === 'host' ? 'user' : 'host',
                            })
                          }
                        >
                          {userItem.role === 'host' ? 'Make User' : 'Make Host'}
                        </Button>
                      )}
                      {userItem._id !== user?._id && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(userItem._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

