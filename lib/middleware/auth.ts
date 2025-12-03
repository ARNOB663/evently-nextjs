import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from '../utils/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export async function authenticateRequest(
  req: NextRequest
): Promise<{ user: JWTPayload | null; error: string | null }> {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    if (!token) {
      return { user: null, error: 'No token provided' };
    }

    const decoded = verifyToken(token);
    return { user: decoded, error: null };
  } catch (error) {
    return { user: null, error: 'Invalid or expired token' };
  }
}

export function requireAuth(roles?: string[]) {
  return async (req: NextRequest): Promise<{ user: JWTPayload | null; error: string | null }> => {
    const { user, error } = await authenticateRequest(req);

    if (error || !user) {
      return { user: null, error: error || 'Authentication required' };
    }

    if (roles && !roles.includes(user.role)) {
      return { user: null, error: 'Insufficient permissions' };
    }

    return { user, error: null };
  };
}

