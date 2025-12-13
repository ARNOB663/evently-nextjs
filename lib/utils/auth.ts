import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Get JWT secret from environment variables - required in production
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.SECRET_KEY;
  
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET or SECRET_KEY environment variable must be set in production');
    }
    // Only allow fallback in development with a warning
    console.warn('⚠️  WARNING: Using fallback JWT secret. Set JWT_SECRET in .env.local for production.');
    return 'dev-only-fallback-secret-key-min-32-chars';
  }
  
  return secret;
}

const JWT_SECRET = getJwtSecret();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions);
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function extractTokenFromHeader(authHeader: string | null | undefined): string | null {
  if (!authHeader) return null;
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return authHeader;
}

