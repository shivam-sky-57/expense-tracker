import express from 'express';
import { loginRequest, signupRequest } from '../controller/auth.controllers.js';
const router = express.Router();

router.post('/signin',signupRequest);
router.post('/login',loginRequest);

export default router;