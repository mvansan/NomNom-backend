import { Router } from 'express';
import { getDishes } from '../../controllers/dish/dish';

const router = Router();

router.route('/') 
    .post(getDishes)

 
export default router;