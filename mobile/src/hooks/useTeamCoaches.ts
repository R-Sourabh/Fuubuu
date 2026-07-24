import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/apiClient';

export interface CoachCareer {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  start: string;
  end: string | null;
}

export interface CoachProfile {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  age: number;
  nationality: string;
  photo: string;
  career: CoachCareer[];
}

interface CoachesApiResponse {
  response: CoachProfile[];
}

export function useTeamCoaches(teamId: number) {
  return useQuery<CoachProfile[]>({
    queryKey: ['teamCoaches', teamId],
    queryFn: async () => {
      const data = await apiFetch<CoachesApiResponse>(`/teams/${teamId}/coachs`);
      return data.response || [];
    },
    enabled: !!teamId,
  });
}
