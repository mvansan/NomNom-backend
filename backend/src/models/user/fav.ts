import db from "../../config/db";

export default class Favorite {
  static async addFavorite(userId: number, dishId: number) {
    try {
      await db.execute("CALL add_favorite(?, ?)", [userId, dishId]);
    } catch (error) {
      throw error;
    }
  }

  static async getFavorites(userId: number) {
    try {
      const [rows]: [any[], any] = await db.execute("CALL get_favorites(?)", [userId]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async removeFavorite(userId: number, dishId: number) {
    try {
      await db.execute("CALL remove_favorite(?, ?)", [userId, dishId]);
    } catch (error) {
      throw error;
    }
  }
}