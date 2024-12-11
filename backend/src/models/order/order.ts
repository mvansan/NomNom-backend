import db from "../../config/db";

//==================================================================================
export default class Order {
  static async placeOrder(userId: number, dishId: number) {
    try {
      await db.execute("CALL placeOrder(?, ?)", [userId, dishId]);
    } catch (error) {
      throw error;
    }
  }

  //==================================================================================
  static async getOrders(userId: number) {
    try {
      const [rows] = await db.execute("CALL get_pending_orders(?)", [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  //==================================================================================
  static async confirmOrder(orderId: number) {
    try {
      const [result] = await db.execute("CALL confirm_order(?)", [orderId]);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
