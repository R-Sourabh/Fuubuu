import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/apiClient';

export interface TopScorer {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    nationality: string;
    height: string;
    weight: string;
    photo: string;
  };
  statistics: Array<{
    team: {
      id: number;
      name: string;
      logo: string;
    };
    games: {
      appearences: number;
      lineups: number;
      minutes: number;
      position: string;
      rating: string | null;
    };
    goals: {
      total: number;
      assists: number | null;
    };
    shots: {
      total: number | null;
      on: number | null;
    };
    cards: {
      yellow: number;
      yellowred: number;
      red: number;
    };
  }>;
}

interface TopScorersResponse {
  response: TopScorer[];
}

export function useTopScorers(leagueId: string, season?: number) {
  const seasonStr = season ? `?season=${season}` : '';
  return useQuery<TopScorer[]>({
    queryKey: ['topscorers', leagueId, season],
    queryFn: async () => {
      const data = await apiFetch<TopScorersResponse>(`/competitions/${leagueId}/topscorers${seasonStr}`);
      return data.response || [];
    },
    enabled: !!leagueId,
  });
}
