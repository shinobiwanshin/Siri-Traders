/**
 * /api/admin/orders
 * Admin-only endpoint to read and manage all customer orders.
 *
 * GET  /api/admin/orders          — returns all orders (newest first) with their items
 * PATCH /api/admin/orders?id=<n>  — updates a single order's status field
 *
 * Both methods require requireAdmin() — Clerk JWT with privateMetadata.isAdmin === true.
 */
import { db, orders, orderItems } from '../../db/index.js';
import { eq, desc } from 'drizzle-orm';
import { setCorsHeaders } from '../_cors.js';
import { requireAdmin } from '../_adminAuth.js';

const ALLOWED_STATUSES = ['Pending', 'Preparing', 'In Transit', 'Delivered', 'Paid'];

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  res.setHeader('Access-Control-Allow-Methods', 'GET,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // All methods require admin
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return res.status(auth.status).json({ error: auth.error });
  }

  // ── GET — return all orders with their items ─────────────────────────────
  if (req.method === 'GET') {
    try {
      const allOrders = await db
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt));

      // Attach items to each order
      const allItems = await db.select().from(orderItems);
      const itemsByOrder = {};
      for (const item of allItems) {
        if (!itemsByOrder[item.orderId]) itemsByOrder[item.orderId] = [];
        itemsByOrder[item.orderId].push(item);
      }

      const result = allOrders.map((order) => ({
        ...order,
        items: itemsByOrder[order.id] || []
      }));

      return res.status(200).json(result);
    } catch (error) {
      console.error('DB error in GET /api/admin/orders:', error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }

  // ── PATCH — update order status ──────────────────────────────────────────
  if (req.method === 'PATCH') {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Missing order id query param' });
    }

    const parsedId = parseInt(id, 10);
    if (Number.isNaN(parsedId) || parsedId <= 0) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { status } = body || {};

      if (!status || !ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`
        });
      }

      const result = await db
        .update(orders)
        .set({ status })
        .where(eq(orders.id, parsedId))
        .returning();

      if (!result.length) {
        return res.status(404).json({ error: 'Order not found' });
      }

      return res.status(200).json(result[0]);
    } catch (error) {
      console.error('DB error in PATCH /api/admin/orders:', error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
