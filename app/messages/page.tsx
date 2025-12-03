'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Search, MoreVertical, User, Loader2, MessageSquare, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Badge } from '../components/ui/badge';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import { useSearchParams } from 'next/navigation';

interface Conversation {
  userId: string;
  fullName: string;
  profileImage?: string;
  lastMessage: {
    content: string;
    createdAt: string;
    sender: string;
  };
  unreadCount: number;
}

interface Message {
  _id: string;
  sender: {
    _id: string;
    fullName: string;
    profileImage?: string;
  };
  receiver: {
    _id: string;
    fullName: string;
    profileImage?: string;
  };
  content: string;
  isRead: boolean;
  createdAt: string;
}

function MessagesPageInner() {
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const initialUserId = searchParams?.get('userId') || undefined;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectedConversationRef = useRef<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Polling fallback for Vercel (where Socket.IO doesn't work)
  useEffect(() => {
    if (!token || !selectedConversation) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Check if we're on Vercel
    const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
    
    // Only use polling if Socket.IO is not available
    if (isVercel || !socketRef.current?.connected) {
      // Poll for new messages every 5 seconds (reduced frequency to reduce blinking)
      // Use skipUpdate=true to only add new messages, not replace entire array
      const pollMessages = () => {
        if (selectedConversation) {
          fetchMessages(selectedConversation, true); // skipUpdate=true for polling
        }
        // Only fetch conversations if needed (less frequently)
        const shouldUpdateConversations = Math.random() < 0.3; // 30% chance each poll
        if (shouldUpdateConversations) {
          fetchConversations();
        }
      };
      
      pollingIntervalRef.current = setInterval(pollMessages, 5000); // Increased to 5 seconds
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, selectedConversation]);

  // Initialize socket connection (optional - gracefully handle failures on Vercel)
  useEffect(() => {
    if (!token || socketRef.current) return;

    // Check if we're on Vercel (serverless) - Socket.IO won't work
    const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
    
    if (isVercel) {
      // On Vercel, skip Socket.IO and rely on polling/HTTP only
      console.log('Socket.IO disabled on Vercel - using HTTP polling');
      return;
    }

    try {
      const socket = io('', {
        path: '/api/socketio',
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 5000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        // console.log('Socket connected', socket.id);
      });

      socket.on('connect_error', (error) => {
        console.warn('Socket connection error (non-critical):', error.message);
        // Don't show error to user - gracefully degrade to HTTP polling
      });

      socket.on('message:new', (payload: { _id: string; senderId: string; receiverId: string; content: string; createdAt: string }) => {
        const currentSelected = selectedConversationRef.current;
        // Update messages in real-time if this conversation is open
        // Only add if message doesn't already exist (prevent duplicates)
        if (currentSelected && (payload.senderId === currentSelected || payload.receiverId === currentSelected)) {
          setMessages((prev) => {
            // Check if message already exists
            const exists = prev.some((msg) => msg._id === payload._id);
            if (exists) return prev;
            
            return [
              ...prev,
              {
                _id: payload._id,
                sender: { _id: payload.senderId, fullName: '', profileImage: undefined },
                receiver: { _id: payload.receiverId, fullName: '', profileImage: undefined },
                content: payload.content,
                isRead: payload.receiverId === user?._id,
                createdAt: payload.createdAt,
              },
            ];
          });
        }
        // Refresh conversations list for unread counts / last message
        fetchConversations();
      });

      socket.on('typing', (payload: { userId: string; isTyping: boolean }) => {
        const currentSelected = selectedConversationRef.current;
        if (!currentSelected) return;
        if (payload.userId === currentSelected) {
          setTypingUserId(payload.isTyping ? payload.userId : null);
        }
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    } catch (error) {
      console.warn('Failed to initialize Socket.IO (non-critical):', error);
    }
  }, [token, user?._id]);

  useEffect(() => {
    if (token) {
      fetchConversations();

      // If we were deep-linked with a userId, preselect that conversation
      if (initialUserId) {
        setSelectedConversation(initialUserId);
        selectedConversationRef.current = initialUserId;
      }
    }
  }, [token, initialUserId]);

  useEffect(() => {
    if (selectedConversation && token) {
      fetchMessages(selectedConversation);
      socketRef.current?.emit('conversation:join', { userId: selectedConversation });
    }
  }, [selectedConversation, token]);
  const handleSelectConversation = (id: string) => {
    selectedConversationRef.current = id;
    setSelectedConversation(id);
  };

  // Auto-scroll to bottom when new messages arrive (only if user is near bottom)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || messages.length === 0) return;
    
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
    if (isNearBottom) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [messages.length]); // Only trigger on message count change, not on every message update

  const fetchConversations = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch('/api/messages/conversations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string, skipUpdate = false) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/messages/${userId}?limit=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newMessages = data.messages || [];
        
        if (skipUpdate) {
          // Only add new messages that don't exist yet (for polling)
          // This prevents blinking by not replacing the entire array
          setMessages((prev) => {
            const existingIds = new Set(prev.map((msg) => msg._id));
            const newOnes = newMessages.filter((msg: Message) => !existingIds.has(msg._id));
            if (newOnes.length === 0) return prev; // No new messages, don't update (prevents re-render)
            
            // Check if user is near bottom (within 100px) to auto-scroll
            const container = messagesContainerRef.current;
            const isNearBottom = container 
              ? container.scrollHeight - container.scrollTop - container.clientHeight < 100
              : true;
            
            const updated = [...prev, ...newOnes].sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            
            // Auto-scroll only if user was near bottom
            if (isNearBottom && newOnes.length > 0) {
              setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }
            
            return updated;
          });
        } else {
          // Full update (initial load or manual refresh)
          setMessages(newMessages);
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !token || sending) return;

    setSending(true);
    const messageContent = messageInput.trim();
    const tempId = `temp-${Date.now()}`;
    setMessageInput('');

    try {
      // Optimistic UI update
      if (user?._id) {
        const now = new Date().toISOString();
        setMessages((prev) => [
          ...prev,
          {
            _id: tempId,
            sender: { _id: user._id, fullName: user.fullName, profileImage: user.profileImage },
            receiver: { _id: selectedConversation, fullName: '', profileImage: undefined },
            content: messageContent,
            isRead: false,
            createdAt: now,
          },
        ]);
      }

      // Send via HTTP API (primary method)
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: selectedConversation,
          content: messageContent,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const realMessage = data.data;

        // Replace temp message with real message
        setMessages((prev) => {
          const filtered = prev.filter((msg) => msg._id !== tempId);
          // Check if message already exists (from Socket.IO)
          const exists = filtered.some((msg) => msg._id === realMessage._id);
          if (exists) return filtered;
          return [...filtered, {
            _id: realMessage._id,
            sender: realMessage.sender,
            receiver: realMessage.receiver,
            content: realMessage.content,
            isRead: realMessage.isRead,
            createdAt: realMessage.createdAt,
          }];
        });

        // Also try Socket.IO (optional - for real-time to other user)
        if (socketRef.current?.connected) {
          socketRef.current.emit('message:send', {
            receiverId: selectedConversation,
            content: messageContent,
          });
        }
      } else {
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
        const errorData = await response.json();
        alert(errorData.error || 'Failed to send message');
      }

      // Refresh conversations list
      fetchConversations();
    } catch (error) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const emitTyping = (isTyping: boolean) => {
    if (!socketRef.current || !selectedConversation) return;
    socketRef.current.emit('typing', { receiverId: selectedConversation, isTyping });
  };

  const handleInputChange = (value: string) => {
    setMessageInput(value);
    if (!selectedConversation || !socketRef.current) return;

    emitTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(false);
    }, 1500);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConvData = conversations.find((c) => c.userId === selectedConversation);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
          {/* Conversations List */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <Card className="h-full flex flex-col">
              <CardContent className="p-0 flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-teal-600" />
                    Messages
                  </h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Conversations */}
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">No conversations</p>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => (
                      <button
                        key={conv.userId}
                        onClick={() => handleSelectConversation(conv.userId)}
                        className={`
                          w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left
                          ${selectedConversation === conv.userId ? 'bg-teal-50 border-l-4 border-l-teal-600' : ''}
                        `}
                      >
                        <div className="flex items-start gap-3">
                          {conv.profileImage ? (
                            <ImageWithFallback
                              src={conv.profileImage}
                              alt={conv.fullName}
                              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                              <User className="w-6 h-6 text-teal-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">{conv.fullName}</h3>
                              {conv.unreadCount > 0 && (
                                <Badge className="bg-teal-600 text-white">{conv.unreadCount}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate">{conv.lastMessage.content}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatTime(conv.lastMessage.createdAt)}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      {selectedConvData?.profileImage ? (
                        <ImageWithFallback
                          src={selectedConvData.profileImage}
                          alt={selectedConvData.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-teal-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <Link href={`/profile?userId=${selectedConversation}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-teal-600">
                            {selectedConvData?.fullName}
                          </h3>
                        </Link>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Messages */}
                <Card className="flex-1 flex flex-col min-h-0">
                  <CardContent className="flex-1 overflow-y-auto p-4" ref={messagesContainerRef}>
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isOwn = message.sender._id === user?._id;
                        return (
                          <motion.div
                            key={message._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                              {!isOwn && (
                                <div className="flex-shrink-0">
                                  {message.sender.profileImage ? (
                                    <ImageWithFallback
                                      src={message.sender.profileImage}
                                      alt={message.sender.fullName}
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                                      <User className="w-4 h-4 text-teal-600" />
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className={`rounded-2xl px-4 py-2 ${isOwn ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                <p className={`text-xs mt-1 ${isOwn ? 'text-teal-100' : 'text-gray-500'}`}>
                                  {formatTime(message.createdAt)}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </CardContent>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!messageInput.trim() || sending}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        {sending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {/* Typing indicator */}
                  {typingUserId && (
                    <div className="px-4 pb-2 text-xs text-gray-500 italic">
                      Typing...
                    </div>
                  )}
                </Card>
              </>
            ) : (
              <Card className="flex-1 flex items-center justify-center">
                <CardContent className="text-center p-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">Select a conversation</p>
                  <p className="text-gray-500 text-sm">Choose a conversation from the list to start messaging</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24" />}>
      <MessagesPageInner />
    </Suspense>
  );
}

