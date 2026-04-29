import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import { registerDto, loginDto, editDto } from './auth.dto.js';
import * as authController from './auth.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', validate(registerDto), authController.registerController);
router.post('/login', validate(loginDto), authController.loginController);
router.patch('/profile', authMiddleware, validate(editDto), authController.editController);
router.get('/profile', authMiddleware, authController.profileController);

export default router;
