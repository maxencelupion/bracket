import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  authMiddleware,
  isBracketOwner,
} from '../../middlewares/auth.middleware.js';
import { createMatchDto } from './match.dto.js';
import * as matchController from './match.controller.js';

const router = Router();

// Prefix /match in index
router.post(
  '/:bracketId/matches',
  authMiddleware,
  isBracketOwner,
  validate(createMatchDto),
  matchController.createMatchController
);

export default router;
