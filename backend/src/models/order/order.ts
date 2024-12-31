import db from "../../config/db";

//==================================================================================
export default class Order {
  static async placeOrder(userId: number, dishId: number, quantity: number) {
    try {
      await db.execute("CALL placeOrder(?, ?, ?)", [userId, dishId, quantity]);
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

  //==================================================================================
  static async getOrdersHistory(userId: number) {
    try {
      const [rows] = await db.execute("CALL get_orders_history(?)", [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  //==================================================================================
  static async rateDish(
    userId: number,
    orderId: number,
    dishId: number,
    rating: number,
    comment: string
  ) {
    try {
      await db.execute("CALL rate_dish(?, ?, ?, ?, ?)", [
        userId,
        orderId,
        dishId,
        rating,
        comment,
      ]);
    } catch (error) {
      throw error;
    }
  }
}
