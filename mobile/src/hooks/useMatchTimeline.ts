import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/apiClient';

export interface MatchEvent {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
  player: {
    id: number | null;
    name: string | null;
  };
  assist: {
    id: number | null;
    name: string | null;
  };
  type: 'Goal' | 'Card' | 'subst' | 'Var' | string;
  detail: string;
  comments: string | null;
}

interface EventsApiResponse {
  response: MatchEvent[];
}

export function useMatchTimeline(matchId: number) {
  return useQuery<MatchEvent[]>({
    queryKey: ['matchEvents', matchId],
    queryFn: async () => {
      const data = await apiFetch<EventsApiResponse>(`/matches/${matchId}/events`);
      return data.response || [];
    },
    enabled: !!matchId,
  });
}
