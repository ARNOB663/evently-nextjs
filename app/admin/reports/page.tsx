'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Flag,
  Search,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminReportsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !token) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/');
      } else {
        fetchReports();
      }
    }
  }, [user, token, authLoading, router, page, statusFilter, typeFilter]);

  const fetchReports = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      params.append('page', page.toString());

      const response = await fetch(`/api/reports?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReport = async (reportId: string, status: string, action?: string) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, action }),
      });

      if (response.ok) {
        toast.success('Report updated successfully');
        fetchReports();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update report');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update report');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      dismissed: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return <Badge className={colors[status] || ''}>{status}</Badge>;
  };

  const getReasonLabel = (reason: string) => {
    const labels: any = {
      spam: 'Spam',
      harassment: 'Harassment',
      inappropriate_content: 'Inappropriate Content',
      fake_profile: 'Fake Profile',
      scam: 'Scam',
      other: 'Other',
    };
    return labels[reason] || reason;
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
              <Flag className="w-8 h-8 text-red-600" />
              Reports Management
            </h1>
          </motion.div>

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search reports..."
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
                  variant={statusFilter === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatusFilter('');
                    setPage(1);
                  }}
                >
                  All Status
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatusFilter('pending');
                    setPage(1);
                  }}
                >
                  Pending
                </Button>
                <Button
                  variant={typeFilter === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setTypeFilter('');
                    setPage(1);
                  }}
                >
                  All Types
                </Button>
                <Button
                  variant={typeFilter === 'user' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setTypeFilter('user');
                    setPage(1);
                  }}
                >
                  Users
                </Button>
                <Button
                  variant={typeFilter === 'event' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setTypeFilter('event');
                    setPage(1);
                  }}
                >
                  Events
                </Button>
              </div>
            </div>
          </Card>

          {/* Reports List */}
          <div className="space-y-4">
            {reports
              .filter((report) => {
                if (search) {
                  const searchLower = search.toLowerCase();
                  return (
                    report.reporterId?.fullName?.toLowerCase().includes(searchLower) ||
                    report.reportedUserId?.fullName?.toLowerCase().includes(searchLower) ||
                    report.reportedEventId?.eventName?.toLowerCase().includes(searchLower) ||
                    report.reason?.toLowerCase().includes(searchLower)
                  );
                }
                return true;
              })
              .map((report) => (
                <motion.div
                  key={report._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {report.type === 'user' ? (
                            <User className="w-5 h-5 text-blue-500" />
                          ) : (
                            <Calendar className="w-5 h-5 text-purple-500" />
                          )}
                          <h3 className="font-semibold text-gray-900">
                            {report.type === 'user' ? 'User Report' : 'Event Report'}
                          </h3>
                          {getStatusBadge(report.status)}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <strong>Reporter:</strong> {report.reporterId?.fullName || 'Unknown'}
                          </p>
                          {report.type === 'user' && report.reportedUserId && (
                            <p>
                              <strong>Reported User:</strong>{' '}
                              {report.reportedUserId?.fullName || 'Unknown'}
                            </p>
                          )}
                          {report.type === 'event' && report.reportedEventId && (
                            <p>
                              <strong>Reported Event:</strong>{' '}
                              {report.reportedEventId?.eventName || 'Unknown'}
                            </p>
                          )}
                          <p>
                            <strong>Reason:</strong> {getReasonLabel(report.reason)}
                          </p>
                          {report.description && (
                            <p>
                              <strong>Description:</strong> {report.description}
                            </p>
                          )}
                          <p>
                            <strong>Reported:</strong>{' '}
                            {new Date(report.createdAt).toLocaleString()}
                          </p>
                          {report.reviewedBy && (
                            <p>
                              <strong>Reviewed by:</strong> {report.reviewedBy?.fullName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {report.status === 'pending' && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateReport(report._id, 'dismissed')}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Dismiss
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateReport(report._id, 'reviewed')}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Mark Reviewed
                        </Button>
                        {report.type === 'user' && report.reportedUserId && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleUpdateReport(report._id, 'resolved', 'ban_user')
                            }
                          >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Ban User
                          </Button>
                        )}
                        {report.type === 'event' && report.reportedEventId && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleUpdateReport(report._id, 'resolved', 'delete_event')
                            }
                          >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Delete Event
                          </Button>
                        )}
                      </div>
                    )}
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

