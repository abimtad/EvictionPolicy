import express from 'express';
import { jokeRoutes } from './routes/jokeRoutes.js';
import { resetRoutes } from './routes/resetRoutes.js';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Dad joke cache service' });
});

app.use('/', jokeRoutes);
app.use('/', resetRoutes);

export { app };
