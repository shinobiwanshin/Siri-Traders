/**
 * /api/admin/stats
 * Returns real counts for the admin dashboard stat cards.
 *
 * GET /api/admin/stats
 *   → { retailProducts, orders, customers }
 *
 * Requires: Clerk JWT with privateMetadata.isAdmin === true
 */
import { db, products, orders, users } from '../../db/index.js';
import { count } from 'drizzle-orm';
import { setCorsHeaders } from '../_cors.js';
import { requireAdmin } from '../_adminAuth.js';

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return res.status(auth.status).json({ error: auth.error });
  }

  try {
    const [productCount, orderCount, customerCount] = await Promise.all([
      db.select({ count: count() }).from(products),
      db.select({ count: count() }).from(orders),
      db.select({ count: count() }).from(users)
    ]);

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      retailProducts: productCount[0]?.count ?? 0,
      orders: orderCount[0]?.count ?? 0,
      customers: customerCount[0]?.count ?? 0
    });
  } catch (error) {
    console.error('DB error in GET /api/admin/stats:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
