import { Router } from 'express';
import { cacheMiddleware } from '../middlewares/cacheMiddleware.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';
import { getJokeController } from '../controllers/jokeController.js';
import { createRequire } from 'module';

var require = createRequire(import.meta.url);
var module = { exports: {} };

const router = Router();

router.get('/jokes/:jokeId', cacheMiddleware, rateLimiter, getJokeController);

export { router as jokeRoutes };
