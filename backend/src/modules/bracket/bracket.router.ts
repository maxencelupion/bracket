import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import { createDto, editDto } from './bracket.dto.js';
import * as bracketController from './bracket.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { paginationDto } from '../../types/pagination.js';

const router = Router();

// Prefix /bracket in index
router.post('/', authMiddleware, validate(createDto), bracketController.createBracketController);
router.get('/', validate(paginationDto, 'query'), bracketController.getBracketsController);
router.get('/:id', bracketController.getBracketByIdController);
router.patch(
  '/:id',
  authMiddleware,
  validate(editDto),
  bracketController.editBracketByIdController
);
router.delete('/:id', authMiddleware, bracketController.deleteBracketByIdController);

// Bracket participants
router.post('/:id/join', authMiddleware, bracketController.joinBracketByIdController);
router.get(
  '/:id/participants',
  validate(paginationDto, 'query'),
  bracketController.getParticipantsByIdController
);

export default router;
