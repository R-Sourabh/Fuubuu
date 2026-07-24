import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/apiClient';
import { Match, mapApiFootballFixture, ApiFootballFixture } from './useMatches';

interface H2HApiResponse {
  response: ApiFootballFixture[];
}

export function useMatchH2H(matchId: number, team1Id?: number, team2Id?: number) {
  const h2hQuery = team1Id && team2Id ? `?h2h=${team1Id}-${team2Id}` : '';
  
  return useQuery<Match[]>({
    queryKey: ['matchH2H', matchId, team1Id, team2Id],
    queryFn: async () => {
      if (!team1Id || !team2Id) return [];
      const data = await apiFetch<H2HApiResponse>(`/matches/${matchId}/head2head${h2hQuery}`);
      return (data.response || []).map(mapApiFootballFixture);
    },
    enabled: !!matchId && !!team1Id && !!team2Id,
  });
}
