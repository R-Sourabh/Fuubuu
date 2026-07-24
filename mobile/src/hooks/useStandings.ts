import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/apiClient';

export interface StandingTableItem {
  position: number;
  team: {
    id: number;
    name: string;
    shortName?: string;
    tla?: string;
    crest?: string;
  };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface Standing {
  stage: string;
  type: string;
  group: string | null;
  table: StandingTableItem[];
}

interface ApiFootballStandingItem {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  group: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
}

interface ApiFootballStandingsResponse {
  response: Array<{
    league: {
      id: number;
      name: string;
      standings: ApiFootballStandingItem[][];
    };
  }>;
}

/**
 * Fetch league standings table for a specific competition ID (e.g. '39' for Premier League).
 */
export function useStandings(id: string, season?: number) {
  const seasonStr = season ? `?season=${season}` : '';
  return useQuery<Standing[]>({
    queryKey: ['standings', id, season],
    queryFn: async () => {
      const data = await apiFetch<ApiFootballStandingsResponse>(`/competitions/${id}/standings${seasonStr}`);
      const leagueResponse = data.response?.[0];
      if (!leagueResponse || !leagueResponse.league || !leagueResponse.league.standings) {
        return [];
      }

      // Map API-Football standings arrays to our internal Standing structure
      return leagueResponse.league.standings.map((groupStandings, idx) => {
        const firstItem = groupStandings[0];
        return {
          stage: 'REGULAR_SEASON',
          type: 'TOTAL',
          group: firstItem ? firstItem.group : `Group ${idx + 1}`,
          table: groupStandings.map((item) => ({
            position: item.rank,
            team: {
              id: item.team.id,
              name: item.team.name,
              shortName: item.team.name,
              crest: item.team.logo,
            },
            playedGames: item.all.played,
            won: item.all.win,
            draw: item.all.draw,
            lost: item.all.lose,
            points: item.points,
            goalsFor: item.all.goals.for,
            goalsAgainst: item.all.goals.against,
            goalDifference: item.goalsDiff,
          })),
        };
      });
    },
    enabled: !!id,
  });
}
