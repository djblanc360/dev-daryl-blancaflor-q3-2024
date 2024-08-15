import express from 'express';
import { trackUser } from '../controllers/track.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).send('it works');
});

router.get('/track', (req, res) => {
    trackUser(req, res);
});

export default router;