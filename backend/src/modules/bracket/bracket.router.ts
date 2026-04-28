import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import { createDto } from './bracket.dto.js';
import { createBracketController, getBracketsController } from './bracket.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { paginationDto } from '../../types/pagination.js';

const router = Router();

// Prefix /bracket in index
router.post('/', authMiddleware, validate(createDto), createBracketController);
router.get('/', validate(paginationDto, 'query'), getBracketsController);

export default router;
