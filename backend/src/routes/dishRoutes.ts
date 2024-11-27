import express from 'express';
import { getDishes } from '../controllers/dishController';
import { Pool } from 'mysql2/promise';

export default function dishRoutes(db: Pool) {
  const router = express.Router();

  // Route lấy danh sách món ăn với bộ lọc
  router.get('/', (req, res) => getDishes(req, res, db));

  return router;
}
