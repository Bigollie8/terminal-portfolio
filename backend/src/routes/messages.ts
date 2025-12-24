/**
 * Message Routes
 *
 * Defines all routes for the /api/messages endpoint.
 */

import { Router } from 'express';
import * as messageController from '../controllers/messageController';
import { validateBody } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { SendMessageSchema } from '../validation/schemas';

const router = Router();

/**
 * POST /api/messages
 * Send a message to another user
 */
router.post(
  '/',
  requireAuth,
  validateBody(SendMessageSchema),
  messageController.sendMessage
);

/**
 * GET /api/messages/inbox
 * Get user's inbox
 */
router.get('/inbox', requireAuth, messageController.getInbox);

/**
 * GET /api/messages/sent
 * Get user's sent messages
 */
router.get('/sent', requireAuth, messageController.getSentMessages);

/**
 * GET /api/messages/:id
 * Get a specific message
 */
router.get('/:id', requireAuth, messageController.getMessage);

/**
 * PUT /api/messages/:id/read
 * Mark a message as read
 */
router.put('/:id/read', requireAuth, messageController.markAsRead);

/**
 * DELETE /api/messages/:id
 * Delete a message
 */
router.delete('/:id', requireAuth, messageController.deleteMessage);

export default router;
