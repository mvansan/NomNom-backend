import { Router } from 'express';
import { getAllDishes, searchDishes } from '../controllers/dishController';

const router = Router();

router.get('/search', searchDishes);
router.get('/', getAllDishes);

export default router;
