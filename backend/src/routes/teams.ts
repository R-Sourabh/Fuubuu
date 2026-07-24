import { Router } from 'express';
import { fetchFootballData } from '../services/footballApi';

const router = Router();

/**
 * GET /api/teams/:id
 * Fetch detailed team information from API-Football.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await fetchFootballData('/teams', { id });
    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/teams/:id/players
 * Fetch player squad list for a team and season year.
 */
router.get('/:id/players', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { season } = req.query;
    
    const seasonYear = season || '2023';
    const data = await fetchFootballData('/players', {
      team: id,
      season: seasonYear,
    });
    
    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/teams/:id/coachs
 * Fetch coach history and active coach for a team.
 */
router.get('/:id/coachs', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await fetchFootballData('/coaches', { team: id });
    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/teams/:id/transfers
 * Fetch player transfers history for a specific team.
 */
router.get('/:id/transfers', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await fetchFootballData('/transfers', { team: id });
    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
