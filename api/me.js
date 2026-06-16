/**
 * GET /api/me
 * Returns { isAdmin: boolean } by reading Clerk privateMetadata server-side.
 * Uses verifyToken() instead of authenticateRequest() for Node.js compatibility.
 */
import { createClerkClient, verifyToken } from '@clerk/backend';
import { setCorsHeaders } from './_cors.js';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.CLERK_SECRET_KEY) {
    console.error('[/api/me] CLERK_SECRET_KEY is not set');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  // Extract token from Authorization: Bearer <token>
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  try {
    // Verify the JWT directly — works reliably with Node.js IncomingMessage
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY
    });

    const userId = payload.sub;
    const clerkUser = await clerk.users.getUser(userId);

    return res.status(200).json({
      id: userId,
      isAdmin: clerkUser.privateMetadata?.isAdmin === true
    });
  } catch (err) {
    console.error('[/api/me] Token verification failed:', err?.message || err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
