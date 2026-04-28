import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import { registerDto, loginDto, editDto } from './auth.dto.js';
import {
  registerController,
  loginController,
  editController,
  profileController,
} from './auth.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', validate(registerDto), registerController);
router.post('/login', validate(loginDto), loginController);
router.patch('/profile', authMiddleware, validate(editDto), editController);
router.get('/profile', authMiddleware, profileController);

export default router;
