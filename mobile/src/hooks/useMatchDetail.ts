import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/apiClient';
import { Match, mapApiFootballFixture, ApiFootballFixture } from './useMatches';

interface FixturesApiResponse {
  response: ApiFootballFixture[];
}

/**
 * Fetch detailed match timing, score, venue, and referee values.
 * Sets staleTime to Infinity if match status is FINISHED.
 */
export function useMatchDetail(id: number) {
  return useQuery<Match>({
    queryKey: ['match', id],
    queryFn: async () => {
      const data = await apiFetch<FixturesApiResponse>(`/matches/${id}`);
      const fixture = data.response?.[0];
      if (!fixture) {
        throw new Error(`Match with ID ${id} not found`);
      }
      return mapApiFootballFixture(fixture);
    },
    enabled: !!id,
    staleTime: (query) => {
      const match = query.state.data as Match | undefined;
      return match?.status === 'FINISHED' ? Infinity : 1000 * 15;
    },
  });
}
