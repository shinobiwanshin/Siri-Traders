import { db, products } from '../../db/index.js';
import { eq } from 'drizzle-orm';
import { setCorsHeaders } from '../_cors.js';
import { requireAdmin } from '../_adminAuth.js';

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  res.setHeader('Access-Control-Allow-Methods', 'GET,PATCH,DELETE,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing product ID' });
  }

  const parsedId = parseInt(id, 10);
  if (Number.isNaN(parsedId) || parsedId <= 0) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  // ── GET ──────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const result = await db.select().from(products).where(eq(products.id, parsedId));
      if (!result.length) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(result[0]);
    } catch (error) {
      console.error('DB error in GET /api/products/[id]:', error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }

  // ── PATCH (update) ───────────────────────────────────────────────────
  if (req.method === 'PATCH') {
    const auth = await requireAdmin(req);
    if (!auth.ok) {
      return res.status(auth.status).json({ error: auth.error });
    }

    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      // Only allow known updatable fields — never allow id to change
      const allowed = [
        'name', 'category', 'brand', 'weight', 'unit', 'price', 'mrp',
        'discount', 'image', 'description', 'inStock', 'deliveryTime',
        'isBestseller', 'variants'
      ];
      const updates = {};
      for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
          updates[key] = body[key];
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const result = await db
        .update(products)
        .set(updates)
        .where(eq(products.id, parsedId))
        .returning();

      if (!result.length) {
        return res.status(404).json({ error: 'Product not found' });
      }
      return res.status(200).json(result[0]);
    } catch (error) {
      console.error('DB error in PATCH /api/products/[id]:', error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }

  // ── DELETE ───────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const auth = await requireAdmin(req);
    if (!auth.ok) {
      return res.status(auth.status).json({ error: auth.error });
    }

    try {
      const result = await db
        .delete(products)
        .where(eq(products.id, parsedId))
        .returning();

      if (!result.length) {
        return res.status(404).json({ error: 'Product not found' });
      }
      return res.status(200).json({ deleted: true, id: parsedId });
    } catch (error) {
      console.error('DB error in DELETE /api/products/[id]:', error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
