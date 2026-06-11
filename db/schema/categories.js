import { pgTable, text, integer } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: text('id').primaryKey(), // e.g., 'pulses', 'rice'
  name: text('name').notNull(),
  image: text('image'),
  color: text('color'),
  // itemCount is a denormalized field representing the count of products in this category.
  // Reconciliation Strategy:
  // - Product lifecycle triggers: Increment/decrement on database INSERT/DELETE/UPDATE.
  // - Background Cron Job: Run regular sync querying "SELECT category, COUNT(*) FROM products GROUP BY category" and updating this field to resolve any drifts.
  itemCount: integer('item_count').default(0)
});
