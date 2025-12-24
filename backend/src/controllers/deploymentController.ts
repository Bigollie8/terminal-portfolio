/**
 * Deployment Controller
 *
 * Handles HTTP requests for deployment status endpoints.
 */

import { Request, Response, NextFunction } from 'express';
import * as deploymentModel from '../models/deploymentModel';

/**
 * GET /api/deployments
 * Get all deployment statuses
 */
export function getAllDeployments(req: Request, res: Response, next: NextFunction): void {
  try {
    const deployments = deploymentModel.getAll();

    // Transform to a more frontend-friendly format
    const result = deployments.reduce((acc, dep) => {
      acc[dep.service_key] = {
        name: dep.name,
        url: dep.url,
        description: dep.description,
        icon: dep.icon,
        version: dep.version,
        commit: dep.commit_hash,
        deployedAt: dep.deployed_at,
      };
      return acc;
    }, {} as Record<string, object>);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/deployments/:serviceKey
 * Get deployment status for a specific service
 */
export function getDeployment(req: Request, res: Response, next: NextFunction): void {
  try {
    const { serviceKey } = req.params;
    const deployment = deploymentModel.getByServiceKey(serviceKey);

    if (!deployment) {
      res.status(404).json({
        error: 'Not Found',
        message: `Deployment for service '${serviceKey}' not found`,
      });
      return;
    }

    res.json({
      name: deployment.name,
      url: deployment.url,
      description: deployment.description,
      icon: deployment.icon,
      version: deployment.version,
      commit: deployment.commit_hash,
      deployedAt: deployment.deployed_at,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/deployments/:serviceKey
 * Update deployment status (called by CI/CD pipeline)
 */
export function updateDeployment(req: Request, res: Response, next: NextFunction): void {
  try {
    const { serviceKey } = req.params;
    const { name, url, description, icon, version, commit_hash } = req.body;

    const deployment = deploymentModel.upsert({
      service_key: serviceKey,
      name: name || serviceKey,
      url: url || '',
      description,
      icon,
      version: version || '1.0.0',
      commit_hash,
    });

    res.json({
      message: 'Deployment updated successfully',
      deployment: {
        name: deployment.name,
        url: deployment.url,
        description: deployment.description,
        icon: deployment.icon,
        version: deployment.version,
        commit: deployment.commit_hash,
        deployedAt: deployment.deployed_at,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/deployments/:serviceKey
 * Remove a deployment record
 */
export function deleteDeployment(req: Request, res: Response, next: NextFunction): void {
  try {
    const { serviceKey } = req.params;
    const deleted = deploymentModel.remove(serviceKey);

    if (!deleted) {
      res.status(404).json({
        error: 'Not Found',
        message: `Deployment for service '${serviceKey}' not found`,
      });
      return;
    }

    res.json({ message: 'Deployment deleted successfully' });
  } catch (error) {
    next(error);
  }
}
