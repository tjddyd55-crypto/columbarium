import express from 'express';
import cors from 'cors';
import { waitlistRouter } from './routes/waitlist.js';
import { contractsRouter } from './routes/contracts.js';
import { seatsRouter } from './routes/seats.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

app.use('/api/waitlist', waitlistRouter);
app.use('/api/contracts', contractsRouter);
app.use('/api/seats', seatsRouter);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'SERVER_ERROR' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
