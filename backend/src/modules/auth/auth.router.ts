import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import { registerDto, loginDto } from './auth.dto.js';
import { registerController, loginController } from './auth.controller.js';

const router = Router();

router.post('/register', validate(registerDto), registerController);
router.post('/login', validate(loginDto), loginController);

export default router;
