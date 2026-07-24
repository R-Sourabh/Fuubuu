import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/apiClient';

export interface Player {
  id: number;
  name: string;
  position: string;
  dateOfBirth?: string;
  nationality?: string;
  age?: number;
  photo?: string;
}

export interface TeamDetail {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  address?: string;
  venue?: string;
  website?: string;
  founded?: number;
  clubColors?: string;
  squad: Player[];
  // API-Football specific extensions
  venueCity?: string;
  venueCapacity?: number;
  venueImage?: string;
  country?: string;
}

interface ApiFootballTeamResponse {
  response: Array<{
    team: {
      id: number;
      name: string;
      code: string | null;
      country: string;
      founded: number | null;
      logo: string;
    };
    venue: {
      id: number | null;
      name: string | null;
      address: string | null;
      city: string | null;
      capacity: number | null;
      image: string | null;
    };
  }>;
}

/**
 * Fetch detailed info for a specific team ID.
 */
export function useTeamDetail(id: number) {
  return useQuery<TeamDetail>({
    queryKey: ['team', id],
    queryFn: async () => {
      const data = await apiFetch<ApiFootballTeamResponse>(`/teams/${id}`);
      const item = data.response?.[0];
      if (!item) {
        throw new Error(`Team with ID ${id} not found`);
      }
      
      return {
        id: item.team.id,
        name: item.team.name,
        shortName: item.team.name,
        tla: item.team.code || item.team.name.substring(0, 3).toUpperCase(),
        crest: item.team.logo,
        address: [item.venue?.address, item.venue?.city].filter(Boolean).join(', ') || undefined,
        venue: item.venue?.name || undefined,
        founded: item.team.founded || undefined,
        clubColors: undefined,
        squad: [], // Squad is now loaded dynamically via useTeamPlayers
        venueCity: item.venue?.city || undefined,
        venueCapacity: item.venue?.capacity || undefined,
        venueImage: item.venue?.image || undefined,
        country: item.team.country,
      };
    },
    enabled: !!id,
  });
}
