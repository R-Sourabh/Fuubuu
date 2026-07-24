import { Router } from 'express';
import { fetchFootballData } from '../services/footballApi';

const router = Router();

/**
 * GET /api/competitions/countries
 * Fetch list of all available countries.
 */
router.get('/countries', async (req, res, next) => {
  try {
    const data = await fetchFootballData('/countries', req.query);
    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/competitions/seasons
 * Fetch list of all available seasons/years.
 */
router.get('/seasons', async (req, res, next) => {
  try {
    const data = await fetchFootballData('/leagues/seasons', req.query);
    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/competitions
 * Fetch list of all available leagues and cups.
 */
router.get('/', async (req, res, next) => {
  try {
    const data = await fetchFootballData('/leagues', req.query);
    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/competitions/:id/standings
 * Fetch league standings for a specific league ID and season year.
 */
router.get('/:id/standings', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { season } = req.query;
    
    // Set default season if not provided
    const seasonYear = season || '2023';
    const params = {
      league: id,
      season: seasonYear,
    };

    const data = await fetchFootballData('/standings', params);
    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/competitions/:id/topscorers
 * Fetch list of top goal scorers for a specific league ID and season year.
 */
router.get('/:id/topscorers', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { season } = req.query;

    const seasonYear = season || '2023';
    const params = {
      league: id,
      season: seasonYear,
    };

    const data = await fetchFootballData('/players/topscorers', params);
    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
