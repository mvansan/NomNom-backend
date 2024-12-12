import db from "../../config/db";

//==================================================================================
export default class Cart {
  static async getCartItems(userId: string) {
    try {
      const query = "CALL GetCartItemsByUser(?)";
      const [results] = await db.query(query, [userId]);
      return results;
    } catch (error) {
      throw error;
    }
  }

  //==================================================================================
  static async addToCart(user_id: string, dish_id: number, quantity: number) {
    try {
      const query = "CALL AddOrUpdateCartItem(?, ?, ?)";
      const values = [user_id, dish_id, quantity];
      const [results] = await db.query(query, values);
      return results;
    } catch (error) {
      throw error;
    }
  }

  //==================================================================================
  static async deleteFromCart(user_id: string, dish_id: string) {
    try {
      const query = "DELETE FROM Cart_items WHERE user_id = ? AND dish_id = ?";
      await db.query(query, [user_id, dish_id]);
    } catch (error) {
      throw error;
    }
  }

  //==================================================================================
  static async clearCart(user_id: string) {
    try {
      const query = "DELETE FROM Cart_items WHERE user_id = ?";
      await db.query(query, [user_id]);
    } catch (error) {
      throw error;
    }
  }
}
