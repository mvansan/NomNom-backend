import { Router } from 'express';
import { searchDishes } from '../controllers/dishController';

const router = Router();

router.get('/search', searchDishes);

export default router;
