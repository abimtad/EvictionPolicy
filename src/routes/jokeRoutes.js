import { Router } from 'express';
import { cacheMiddleware } from '../middlewares/cacheMiddleware.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';
import { getJokeController } from '../controllers/jokeController.js';

const router = Router();

router.get('/jokes/:jokeId', cacheMiddleware, rateLimiter, getJokeController);

export { router as jokeRoutes };
