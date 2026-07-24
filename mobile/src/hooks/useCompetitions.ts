import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/apiClient';

export interface Competition {
  id: number;
  name: string;
  code: string;
  emblem?: string;
  type?: string;
  area?: {
    id: number;
    name: string;
    code: string;
    flag?: string | null;
  };
  // API-Football specific fields
  logo?: string;
  countryFlag?: string | null;
}

interface ApiFootballLeague {
  league: {
    id: number;
    name: string;
    type: string;
    logo: string;
  };
  country: {
    name: string;
    code: string | null;
    flag: string | null;
  };
}

interface LeaguesApiResponse {
  response: ApiFootballLeague[];
}

/**
 * Fetch and cache list of all active competitions/leagues.
 */
export function useCompetitions() {
  return useQuery<Competition[]>({
    queryKey: ['competitions'],
    queryFn: async () => {
      const data = await apiFetch<LeaguesApiResponse>('/competitions');
      
      // Map API-Football response structures to the application interface
      return (data.response || []).map((item) => ({
        id: item.league.id,
        name: item.league.name,
        code: String(item.league.id),
        emblem: item.league.logo,
        type: item.league.type,
        area: {
          id: 0,
          name: item.country.name,
          code: item.country.code || '',
          flag: item.country.flag || undefined,
        },
        logo: item.league.logo,
        countryFlag: item.country.flag,
      }));
    },
  });
}
