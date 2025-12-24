/**
 * Deployment Routes
 *
 * API endpoints for service deployment status tracking.
 */

import { Router } from 'express';
import {
  getAllDeployments,
  getDeployment,
  updateDeployment,
  deleteDeployment,
} from '../controllers/deploymentController';

const router = Router();

// GET /api/deployments - Get all deployment statuses
router.get('/', getAllDeployments);

// GET /api/deployments/:serviceKey - Get specific deployment status
router.get('/:serviceKey', getDeployment);

// POST /api/deployments/:serviceKey - Update deployment status (for CI/CD)
router.post('/:serviceKey', updateDeployment);

// DELETE /api/deployments/:serviceKey - Remove deployment record
router.delete('/:serviceKey', deleteDeployment);

export default router;
