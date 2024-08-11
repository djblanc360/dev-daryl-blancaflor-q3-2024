import express from 'express';
import { trackUser } from '../controllers/track.js';

const router = express.Router();

router.get('/track', (req, res) => {
    trackUser(req, res);
});

export default router;