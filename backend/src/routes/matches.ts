import { Router } from 'express';
import { fetchFootballData } from '../services/footballApi';

const router = Router();

/**
 * GET /api/matches
 * Fetch list of recent/upcoming fixtures from API-Football.
 * Supports query parameters: date (YYYY-MM-DD), league (number), season (number), live (all)
 */
router.get('/', async (req, res, next) => {
  try {
    const params: Record<string, any> = { ...req.query };
    
    // If no query parameters are provided, default to today's matches
    if (Object.keys(params).length === 0) {
      const today = new Date().toISOString().split('T')[0];
      params.date = today;
    }

    const data = await fetchFootballData('/fixtures', params);
    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/matches/:id
 * Fetch detailed information for a specific fixture by its ID.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await fetchFootballData('/fixtures', { id });
    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/matches/:id/head2head
 * Fetch Head-to-Head stats between two team IDs.
 * Query parameter format: ?h2h=team1Id-team2Id
 */
router.get('/:id/head2head', async (req, res, next) => {
  try {
    const { h2h } = req.query;
    if (!h2h) {
      return res.status(400).json({
        success: false,
        error: 'h2h query parameter (format: team1Id-team2Id) is required',
      });
    }
    const data = await fetchFootballData('/fixtures/headtohead', { h2h });
    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/matches/:id/events
 * Fetch play-by-play events (goals, cards, substitutions) for a specific fixture.
 */
router.get('/:id/events', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await fetchFootballData('/fixtures/events', { fixture: id });
    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/matches/:id/lineups
 * Fetch tactical lineups and formations for a specific fixture.
 */
router.get('/:id/lineups', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await fetchFootballData('/fixtures/lineups', { fixture: id });
    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
