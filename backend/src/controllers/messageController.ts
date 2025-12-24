/**
 * Message Controller
 *
 * Handles mail/message endpoints.
 */

import { Request, Response, NextFunction } from 'express';
import * as messageModel from '../models/messageModel';
import { NotFoundError, AppError, asyncHandler } from '../middleware/errorHandler';
import type { MessagesResponse } from '../types';

/**
 * POST /api/messages
 *
 * Send a message to another user.
 */
export const sendMessage = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const senderId = req.user!.id;
    const { recipientUsername, content, subject } = req.body;

    // Prevent sending to self
    if (recipientUsername.toLowerCase() === req.user!.username.toLowerCase()) {
      throw new AppError('Cannot send a message to yourself', 400, 'Bad Request');
    }

    const message = messageModel.sendMessage(senderId, recipientUsername, content, subject);

    if (!message) {
      throw new NotFoundError('User', recipientUsername);
    }

    res.status(201).json({ message });
  }
);

/**
 * GET /api/messages/inbox
 *
 * Get user's inbox.
 */
export const getInbox = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user!.id;

    const messages = messageModel.getInbox(userId);
    const unreadCount = messageModel.getUnreadCount(userId);

    const response: MessagesResponse = { messages, unreadCount };
    res.json(response);
  }
);

/**
 * GET /api/messages/sent
 *
 * Get user's sent messages.
 */
export const getSentMessages = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user!.id;

    const messages = messageModel.getSentMessages(userId);

    res.json({ messages });
  }
);

/**
 * GET /api/messages/:id
 *
 * Get a specific message.
 */
export const getMessage = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user!.id;
    const messageId = parseInt(req.params.id, 10);

    if (isNaN(messageId)) {
      throw new AppError('Invalid message ID', 400, 'Bad Request');
    }

    const message = messageModel.getMessageById(messageId, userId);

    if (!message) {
      throw new NotFoundError('Message', req.params.id);
    }

    // Mark as read if recipient
    if (message.recipientId === userId) {
      messageModel.markAsRead(messageId, userId);
      message.read = true;
    }

    res.json({ message });
  }
);

/**
 * PUT /api/messages/:id/read
 *
 * Mark a message as read.
 */
export const markAsRead = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user!.id;
    const messageId = parseInt(req.params.id, 10);

    if (isNaN(messageId)) {
      throw new AppError('Invalid message ID', 400, 'Bad Request');
    }

    const success = messageModel.markAsRead(messageId, userId);

    if (!success) {
      throw new NotFoundError('Message', req.params.id);
    }

    res.status(204).send();
  }
);

/**
 * DELETE /api/messages/:id
 *
 * Delete a message.
 */
export const deleteMessage = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user!.id;
    const messageId = parseInt(req.params.id, 10);

    if (isNaN(messageId)) {
      throw new AppError('Invalid message ID', 400, 'Bad Request');
    }

    const success = messageModel.deleteMessage(messageId, userId);

    if (!success) {
      throw new NotFoundError('Message', req.params.id);
    }

    res.status(204).send();
  }
);
