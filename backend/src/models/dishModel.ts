import { Pool } from 'mysql2/promise';

// Lấy danh sách món ăn theo tiêu chí lọc
export async function getFilteredDishes(
  db: Pool,
  filters: { category?: string; minPrice?: number; maxPrice?: number; minCalories?: number; maxCalories?: number }
) {
  const { category, minPrice, maxPrice, minCalories, maxCalories } = filters;

  let query = `
    SELECT d.id, d.name, d.price, d.calories, c.category
    FROM dishes d
    JOIN category c ON d.category_id = c.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (category) {
    query += ` AND LOWER(c.category) = ?`;
    params.push(category.toLowerCase());
  }
  if (minPrice) {
    query += ` AND d.price >= ?`;
    params.push(minPrice);
  }
  if (maxPrice) {
    query += ` AND d.price <= ?`;
    params.push(maxPrice);
  }
  if (minCalories) {
    query += ` AND d.calories >= ?`;
    params.push(minCalories);
  }
  if (maxCalories) {
    query += ` AND d.calories <= ?`;
    params.push(maxCalories);
  }

  const [rows] = await db.query(query, params);
  return rows;
}
