import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type { Socket } from 'socket.io';
import connectDB from '@/lib/db';
import Message from '@/lib/models/Message';
import { verifyToken, JWTPayload } from '@/lib/utils/auth';

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

interface ServerToClientEvents {
  'message:new': (payload: {
    _id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
  }) => void;
  'typing': (payload: { userId: string; isTyping: boolean }) => void;
}

interface ClientToServerEvents {
  'message:send': (payload: { receiverId: string; content: string }) => void;
  'conversation:join': (payload: { userId: string }) => void;
  'typing': (payload: { receiverId: string; isTyping: boolean }) => void;
}

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents> | undefined;

export default async function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    await connectDB();

    io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(res.socket.server as any, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    io.use((socket, next) => {
      try {
        const token = socket.handshake.auth?.token as string | undefined;
        if (!token) {
          return next(new Error('Authentication required'));
        }
        const payload = verifyToken(token) as JWTPayload;
        (socket as any).user = { userId: payload.userId, role: payload.role, email: payload.email };
        socket.join(payload.userId);
        next();
      } catch (error) {
        next(new Error('Invalid or expired token'));
      }
    });

    io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
      const user = (socket as any).user as JWTPayload | undefined;

      socket.on('conversation:join', ({ userId }) => {
        if (!user) return;
        socket.join(`conversation:${user.userId}:${userId}`);
      });

      socket.on('message:send', async ({ receiverId, content }) => {
        try {
          if (!user || !receiverId || !content.trim()) return;

          const message = await Message.create({
            sender: user.userId,
            receiver: receiverId,
            content: content.trim(),
            isRead: false,
          });

          const payload = {
            _id: message._id.toString(),
            senderId: user.userId,
            receiverId,
            content: message.content,
            createdAt: message.createdAt.toISOString(),
          };

          io?.to(user.userId).emit('message:new', payload);
          io?.to(receiverId).emit('message:new', payload);
        } catch (error) {
          console.error('Socket message error:', error);
        }
      });

      socket.on('typing', ({ receiverId, isTyping }) => {
        if (!user || !receiverId) return;
        io?.to(receiverId).emit('typing', { userId: user.userId, isTyping });
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}


