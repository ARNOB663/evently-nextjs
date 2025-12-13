'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  Users,
  Loader2,
  QrCode,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';

interface CheckInStats {
  total: number;
  checkedIn: number;
  notCheckedIn: number;
  checkInRate: number;
}

interface Attendee {
  _id: string;
  attendee: {
    _id: string;
    fullName: string;
    email: string;
    profileImage?: string;
  };
  ticketType: string;
  quantity: number;
  checkedIn: boolean;
  checkedInAt?: string;
}

interface CheckInScannerProps {
  eventId: string;
  token: string;
}

export function CheckInScanner({ eventId, token }: CheckInScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastScanned, setLastScanned] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetchCheckInData();
    return () => {
      stopCamera();
    };
  }, [eventId]);

  const fetchCheckInData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}/checkin`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setAttendees(data.attendees || []);
      }
    } catch (error) {
      console.error('Failed to fetch check-in data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setScanning(true);
      setScanError(null);
    } catch (error) {
      console.error('Camera access error:', error);
      toast.error('Could not access camera. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const handleManualCheckIn = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Check-in successful!');
        setLastScanned(data.booking);
        fetchCheckInData();
      } else {
        toast.error(data.error || 'Check-in failed');
        if (data.checkedInAt) {
          toast.info(`Already checked in at ${new Date(data.checkedInAt).toLocaleTimeString()}`);
        }
      }
    } catch (error) {
      toast.error('Failed to check in');
    }
  };

  const handleQRScan = async (qrData: string) => {
    try {
      setScanError(null);
      const response = await fetch(`/api/events/${eventId}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ qrData }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Check-in successful!');
        setLastScanned(data.booking);
        fetchCheckInData();
        // Vibrate on success if available
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
      } else {
        setScanError(data.error);
        toast.error(data.error || 'Invalid QR code');
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      }
    } catch (error) {
      setScanError('Scan failed');
      toast.error('Failed to process QR code');
    }
  };

  const filteredAttendees = attendees.filter((a) =>
    a.attendee?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.attendee?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <Users className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </Card>
          <Card className="p-4 text-center">
            <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{stats.checkedIn}</p>
            <p className="text-sm text-gray-600">Checked In</p>
          </Card>
          <Card className="p-4 text-center">
            <XCircle className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">{stats.notCheckedIn}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-r from-teal-50 to-cyan-50">
            <div className="text-2xl font-bold text-teal-600">{stats.checkInRate}%</div>
            <p className="text-sm text-gray-600">Check-in Rate</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all"
                style={{ width: `${stats.checkInRate}%` }}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Scanner */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-teal-600" />
            QR Scanner
          </h3>
          <Button
            variant={scanning ? 'destructive' : 'default'}
            onClick={scanning ? stopCamera : startCamera}
            className={!scanning ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white' : ''}
          >
            {scanning ? (
              <>
                <CameraOff className="w-4 h-4 mr-2" />
                Stop Scanner
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                Start Scanner
              </>
            )}
          </Button>
        </div>

        {scanning && (
          <div className="relative mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full max-w-md mx-auto rounded-lg border-2 border-teal-500"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-teal-500 rounded-lg" />
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">
              Position QR code within the frame
            </p>
          </div>
        )}

        {scanError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
            {scanError}
          </div>
        )}

        {lastScanned && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <div>
                <p className="font-semibold text-green-700">Successfully Checked In!</p>
                <p className="text-sm text-green-600">
                  {lastScanned.attendee?.fullName} - {lastScanned.ticketType}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Attendee List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Attendee List</h3>
          <Button variant="outline" size="sm" onClick={fetchCheckInData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search attendees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
          </div>
        ) : filteredAttendees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No attendees found</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredAttendees.map((attendee) => (
              <div
                key={attendee._id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  attendee.checkedIn
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200 hover:border-teal-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={attendee.attendee?.profileImage} />
                    <AvatarFallback className="bg-teal-100 text-teal-600">
                      {attendee.attendee?.fullName?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{attendee.attendee?.fullName}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Badge className="text-xs">{attendee.ticketType}</Badge>
                      <span>× {attendee.quantity}</span>
                    </div>
                  </div>
                </div>

                {attendee.checkedIn ? (
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Checked In
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {attendee.checkedInAt && new Date(attendee.checkedInAt).toLocaleTimeString()}
                    </p>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleManualCheckIn(attendee._id)}
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
                  >
                    Check In
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
