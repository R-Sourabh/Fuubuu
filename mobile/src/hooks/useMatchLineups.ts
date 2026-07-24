import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/apiClient';

export interface LineupPlayer {
  player: {
    id: number;
    name: string;
    number: number;
    pos: 'G' | 'D' | 'M' | 'F' | string;
    grid: string | null;
  };
}

export interface MatchLineup {
  team: {
    id: number;
    name: string;
    logo: string;
    colors: any;
  };
  formation: string;
  coach: {
    id: number | null;
    name: string;
    photo: string | null;
  };
  startXI: LineupPlayer[];
  substitutes: LineupPlayer[];
}

interface LineupsApiResponse {
  response: MatchLineup[];
}

export function useMatchLineups(matchId: number) {
  return useQuery<MatchLineup[]>({
    queryKey: ['matchLineups', matchId],
    queryFn: async () => {
      const data = await apiFetch<LineupsApiResponse>(`/matches/${matchId}/lineups`);
      return data.response || [];
    },
    enabled: !!matchId,
  });
}
