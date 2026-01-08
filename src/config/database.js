import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectMongo() {
  if (mongoose.connection.readyState === 1) return;

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 5000
  });

  return mongoose.connection;
}
