import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { registerDto, loginDto } from './auth.dto';
import { registerController, loginController } from './auth.controller';

const router = Router();

router.post('/register', validate(registerDto), registerController);
router.post('/login', validate(loginDto), loginController);

export default router;
