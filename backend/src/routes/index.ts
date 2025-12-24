/**
 * Route Aggregator
 *
 * Combines all route modules under the /api prefix.
 */

import { Router } from 'express';
import projectRoutes from './projects';
import aboutRoutes from './about';
import deploymentRoutes from './deployments';
import authRoutes from './auth';
import userRoutes from './users';
import messageRoutes from './messages';
import wallRoutes from './wall';

const router = Router();

// Mount route modules
router.use('/projects', projectRoutes);
router.use('/about', aboutRoutes);
router.use('/deployments', deploymentRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/messages', messageRoutes);
router.use('/wall', wallRoutes);

export default router;
