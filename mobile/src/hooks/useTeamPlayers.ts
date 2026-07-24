import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/apiClient';

export interface SquadPlayer {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  age: number;
  nationality: string;
  photo: string;
  position: string;
}

interface ApiFootballPlayerItem {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    nationality: string;
    photo: string;
  };
  statistics: Array<{
    games: {
      position: string;
    };
  }>;
}

interface PlayersApiResponse {
  response: ApiFootballPlayerItem[];
}

export function useTeamPlayers(teamId: number, season?: number) {
  const seasonStr = season ? `?season=${season}` : '';
  return useQuery<SquadPlayer[]>({
    queryKey: ['teamPlayers', teamId, season],
    queryFn: async () => {
      const data = await apiFetch<PlayersApiResponse>(`/teams/${teamId}/players${seasonStr}`);
      return (data.response || []).map((item) => ({
        id: item.player.id,
        name: item.player.name,
        firstname: item.player.firstname,
        lastname: item.player.lastname,
        age: item.player.age,
        nationality: item.player.nationality,
        photo: item.player.photo,
        position: item.statistics?.[0]?.games?.position || 'Unknown',
      }));
    },
    enabled: !!teamId,
  });
}
