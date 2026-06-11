import { db, products, categories } from './index.js';
import { baseProducts } from '../frontend/src/data/products.js';
import { categories as baseCategories } from '../frontend/src/data/categories.js';
import { sql } from 'drizzle-orm';

async function seed() {
  console.log("Seeding categories...");
  try {
    const categoryValues = baseCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      image: cat.image || null,
      color: cat.color || null,
      itemCount: cat.itemCount || 0
    }));

    // Perform batch insert with upsert
    await db.insert(categories).values(categoryValues).onConflictDoUpdate({
      target: categories.id,
      set: {
        name: sql`excluded.name`,
        image: sql`excluded.image`,
        color: sql`excluded.color`,
        itemCount: sql`excluded.item_count`
      }
    });
    console.log("Categories seeded successfully!");
  } catch (err) {
    console.error("Error seeding categories:", err);
    throw err;
  }

  console.log("Seeding products...");
  try {
    const productValues = baseProducts.map(prod => ({
      id: prod.id,
      name: prod.name,
      category: prod.category,
      brand: prod.brand || null,
      weight: prod.weight || null,
      unit: prod.unit || null,
      price: prod.price,
      mrp: prod.mrp || null,
      discount: prod.discount || null,
      image: prod.image || null,
      description: prod.description || null,
      inStock: prod.inStock !== undefined ? prod.inStock : true,
      deliveryTime: prod.deliveryTime || '15 mins',
      isBestseller: prod.isBestseller !== undefined ? prod.isBestseller : false,
      variants: prod.variants || null
    }));

    // Perform batch insert with upsert
    await db.insert(products).values(productValues).onConflictDoUpdate({
      target: products.id,
      set: {
        name: sql`excluded.name`,
        category: sql`excluded.category`,
        brand: sql`excluded.brand`,
        weight: sql`excluded.weight`,
        unit: sql`excluded.unit`,
        price: sql`excluded.price`,
        mrp: sql`excluded.mrp`,
        discount: sql`excluded.discount`,
        image: sql`excluded.image`,
        description: sql`excluded.description`,
        inStock: sql`excluded.in_stock`,
        deliveryTime: sql`excluded.delivery_time`,
        isBestseller: sql`excluded.is_bestseller`,
        variants: sql`excluded.variants`
      }
    });
    console.log("Products seeded successfully!");
  } catch (error) {
    console.error("Error seeding products:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("Database seeded successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
