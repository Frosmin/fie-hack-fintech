import express from 'express';
import { type Request, type Response } from 'express';
import { DEFAULTS } from './config';

const app = express();

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(DEFAULTS.PORT, () => {
  console.log('Server is running on port ' + DEFAULTS.PORT);
});