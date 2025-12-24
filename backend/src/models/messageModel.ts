/**
 * Message Model
 *
 * Handles mail/message operations between users.
 */

import db from '../config/database';
import type { Message, MessageRow } from '../types';
import { rowToMessage } from '../types';
import { getUserByUsername } from './userModel';

/**
 * Send a message to another user
 */
export function sendMessage(
  senderId: number,
  recipientUsername: string,
  content: string,
  subject?: string
): Message | null {
  const recipient = getUserByUsername(recipientUsername);

  if (!recipient) {
    return null;
  }

  const stmt = db.prepare(`
    INSERT INTO messages (sender_id, recipient_id, content, subject, created_at)
    VALUES (@senderId, @recipientId, @content, @subject, datetime('now'))
  `);

  const info = stmt.run({
    senderId,
    recipientId: recipient.id,
    content,
    subject: subject || null,
  });

  return getMessageById(info.lastInsertRowid as number, senderId);
}

/**
 * Get a message by ID (only if user is sender or recipient)
 */
export function getMessageById(messageId: number, userId: number): Message | null {
  const stmt = db.prepare(`
    SELECT m.*,
           s.username as sender_username,
           r.username as recipient_username
    FROM messages m
    JOIN users s ON m.sender_id = s.id
    JOIN users r ON m.recipient_id = r.id
    WHERE m.id = ? AND (m.sender_id = ? OR m.recipient_id = ?)
  `);

  const row = stmt.get(messageId, userId, userId) as
    | (MessageRow & { sender_username: string; recipient_username: string })
    | undefined;

  if (!row) {
    return null;
  }

  return rowToMessage(row);
}

/**
 * Get user's inbox (received messages)
 */
export function getInbox(userId: number): Message[] {
  const stmt = db.prepare(`
    SELECT m.*,
           s.username as sender_username,
           r.username as recipient_username
    FROM messages m
    JOIN users s ON m.sender_id = s.id
    JOIN users r ON m.recipient_id = r.id
    WHERE m.recipient_id = ?
    ORDER BY m.created_at DESC
  `);

  const rows = stmt.all(userId) as Array<
    MessageRow & { sender_username: string; recipient_username: string }
  >;

  return rows.map(rowToMessage);
}

/**
 * Get user's sent messages
 */
export function getSentMessages(userId: number): Message[] {
  const stmt = db.prepare(`
    SELECT m.*,
           s.username as sender_username,
           r.username as recipient_username
    FROM messages m
    JOIN users s ON m.sender_id = s.id
    JOIN users r ON m.recipient_id = r.id
    WHERE m.sender_id = ?
    ORDER BY m.created_at DESC
  `);

  const rows = stmt.all(userId) as Array<
    MessageRow & { sender_username: string; recipient_username: string }
  >;

  return rows.map(rowToMessage);
}

/**
 * Mark a message as read
 */
export function markAsRead(messageId: number, userId: number): boolean {
  const stmt = db.prepare(`
    UPDATE messages
    SET read = 1
    WHERE id = ? AND recipient_id = ?
  `);

  const info = stmt.run(messageId, userId);
  return info.changes > 0;
}

/**
 * Delete a message (only if user is sender or recipient)
 */
export function deleteMessage(messageId: number, userId: number): boolean {
  const stmt = db.prepare(`
    DELETE FROM messages
    WHERE id = ? AND (sender_id = ? OR recipient_id = ?)
  `);

  const info = stmt.run(messageId, userId, userId);
  return info.changes > 0;
}

/**
 * Get unread message count
 */
export function getUnreadCount(userId: number): number {
  const stmt = db.prepare(`
    SELECT COUNT(*) as count
    FROM messages
    WHERE recipient_id = ? AND read = 0
  `);

  const result = stmt.get(userId) as { count: number };
  return result.count;
}
