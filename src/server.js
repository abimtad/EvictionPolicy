import { env } from './config/env.js';
import { connectMongo } from './config/database.js';
import { connectRedis } from './config/redisClient.js';
import { app } from './app.js';

async function start() {
  try {
    await connectMongo();
    try {
      await connectRedis();
    } catch (err) {
      console.error('Redis connect failed, continuing in degraded mode', err.message);
    }
    app.listen(env.port, () => {
      console.log(`Server listening on port ${env.port}`);
    });
  } catch (err) {
    console.error('Startup failed', err.message);
    process.exit(1);
  }
}

start();
