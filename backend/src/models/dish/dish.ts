import db from "../../config/db";

export default class Dish {
  static async getDishes(
    category_ids: string[],
    minPrice: number,
    maxPrice: number,
    minCalo: number,
    maxCalo: number
  ) {
    try {
      const query = "CALL FilterDishes(?, ?, ?, ?, ?)";
      const categoryIdsString = category_ids.join(",");
      const values = [categoryIdsString, minPrice, maxPrice, minCalo, maxCalo];
      const [results] = await db.query(query, values);
      return results;
    } catch (error) {
      throw error;
    }
  }
}
