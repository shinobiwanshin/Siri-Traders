import { pgTable, serial, text, integer, timestamp, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), // Clerk user ID
  total: integer('total').notNull(),
  status: text('status').default('Pending'), // 'Pending', 'Preparing', 'In Transit', 'Delivered', 'Paid'
  deliveryAddress: text('delivery_address'),
  paymentMethod: text('payment_method'),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
  statusCheck: check('status_check', sql`${table.status} IN ('Pending', 'Preparing', 'In Transit', 'Delivered', 'Paid')`)
}));
