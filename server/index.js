import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import trackRouter from './routes/track.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/ip', trackRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});