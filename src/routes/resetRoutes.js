import { Router } from 'express';
import { resetController } from '../controllers/resetController.js';

const router = Router();

router.post('/reset', resetController);

export { router as resetRoutes };
