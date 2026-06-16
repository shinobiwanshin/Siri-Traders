/**
 * _adminAuth.js
 * Validates that a request is from a Clerk-authenticated admin user.
 * Reads privateMetadata.isAdmin === true (set in Clerk dashboard, server-side only).
 *
 * Uses verifyToken() for reliable Node.js compatibility in all environments.
 * Returns { ok: true, userId } or { ok: false, status, error }.
 */
import { createClerkClient, verifyToken } from '@clerk/backend';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function requireAdmin(req) {
  if (!process.env.CLERK_SECRET_KEY) {
    console.error('[requireAdmin] CLERK_SECRET_KEY is not set');
    return { ok: false, status: 500, error: 'Server misconfiguration' };
  }

  // Extract token from Authorization: Bearer <token>
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (!token) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }

  try {
    // Verify the JWT directly — reliable with Node.js IncomingMessage
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY
    });

    const userId = payload.sub;
    const clerkUser = await clerk.users.getUser(userId);

    if (clerkUser.privateMetadata?.isAdmin !== true) {
      return { ok: false, status: 403, error: 'Forbidden: admin role required' };
    }

    return { ok: true, userId };
  } catch (err) {
    console.error('[requireAdmin] Token verification failed:', err?.message || err);
    return { ok: false, status: 401, error: 'Unauthorized' };
  }
}
