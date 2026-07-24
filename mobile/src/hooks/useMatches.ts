import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/apiClient';

export interface Match {
  id: number;
  utcDate: string;
  status: string;
  matchday: number;
  stage: string;
  homeTeam: { id: number; name: string; shortName: string; tla: string; crest: string };
  awayTeam: { id: number; name: string; shortName: string; tla: string; crest: string };
  score: {
    winner: string | null;
    duration: string;
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
  competition: { id: number; name: string; code: string; emblem: string };
  // API-Football specific extensions
  venueName?: string;
  venueCity?: string;
  referee?: string;
  elapsed?: number;
}

export interface ApiFootballFixture {
  fixture: {
    id: number;
    referee: string | null;
    date: string;
    venue: {
      name: string;
      city: string;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    logo: string;
    round: string;
    season: number;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
  };
}

interface FixturesApiResponse {
  response: ApiFootballFixture[];
}

export function mapApiFootballStatus(statusShort: string): string {
  switch (statusShort) {
    case 'FT':
    case 'AET':
    case 'PEN':
      return 'FINISHED';
    case '1H':
    case '2H':
    case 'HT':
    case 'ET':
    case 'P':
    case 'LIVE':
      return 'LIVE';
    case 'NS':
    case 'TBD':
      return 'TIMED';
    case 'PST':
      return 'POSTPONED';
    case 'CANC':
      return 'CANCELLED';
    case 'ABD':
      return 'ABANDONED';
    default:
      return 'TIMED';
  }
}

export function mapApiFootballFixture(item: ApiFootballFixture): Match {
  let winner: string | null = null;
  if (item.teams.home.winner === true) {
    winner = 'HOME_TEAM';
  } else if (item.teams.away.winner === true) {
    winner = 'AWAY_TEAM';
  } else if (
    item.fixture.status.short === 'FT' && 
    item.teams.home.winner === false && 
    item.teams.away.winner === false
  ) {
    winner = 'DRAW';
  }

  // Round can look like "Regular Season - 18", we extract the matchday number
  let matchday = 1;
  const roundMatch = item.league.round.match(/\d+/);
  if (roundMatch) {
    matchday = parseInt(roundMatch[0], 10);
  }

  return {
    id: item.fixture.id,
    utcDate: item.fixture.date,
    status: mapApiFootballStatus(item.fixture.status.short),
    matchday,
    stage: item.league.round,
    homeTeam: {
      id: item.teams.home.id,
      name: item.teams.home.name,
      shortName: item.teams.home.name,
      tla: item.teams.home.name.substring(0, 3).toUpperCase(),
      crest: item.teams.home.logo,
    },
    awayTeam: {
      id: item.teams.away.id,
      name: item.teams.away.name,
      shortName: item.teams.away.name,
      tla: item.teams.away.name.substring(0, 3).toUpperCase(),
      crest: item.teams.away.logo,
    },
    score: {
      winner,
      duration: 'REGULAR',
      fullTime: {
        home: item.goals.home,
        away: item.goals.away,
      },
      halfTime: {
        home: item.score.halftime.home,
        away: item.score.halftime.away,
      },
    },
    competition: {
      id: item.league.id,
      name: item.league.name,
      code: String(item.league.id),
      emblem: item.league.logo,
    },
    venueName: item.fixture.venue?.name,
    venueCity: item.fixture.venue?.city,
    referee: item.fixture.referee || undefined,
    elapsed: item.fixture.status.elapsed || undefined,
  };
}

/**
 * Fetch list of fixtures and results. Optionally filter by league ID or other params.
 */
export function useMatches(arg?: string | { league?: string; date?: string; live?: string; season?: number }) {
  let queryParams: Record<string, any> = {};
  let key = 'all';

  if (typeof arg === 'string') {
    queryParams.league = arg;
    key = arg;
  } else if (arg) {
    queryParams = { ...arg };
    key = JSON.stringify(arg);
  }

  // Construct query string for endpoint
  const queryStr = Object.keys(queryParams).length > 0
    ? '?' + new URLSearchParams(queryParams as any).toString()
    : '';

  return useQuery<Match[]>({
    queryKey: ['matches', key],
    queryFn: async () => {
      const data = await apiFetch<FixturesApiResponse>(`/matches${queryStr}`);
      return (data.response || []).map(mapApiFootballFixture);
    },
  });
}
