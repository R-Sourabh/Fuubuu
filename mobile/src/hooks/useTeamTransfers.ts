import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/apiClient';

export interface TransferDetails {
  date: string;
  type: string;
  teams: {
    in: {
      id: number;
      name: string;
      logo: string;
    };
    out: {
      id: number;
      name: string;
      logo: string;
    };
  };
}

export interface PlayerTransfer {
  player: {
    id: number;
    name: string;
  };
  update: string;
  transfers: TransferDetails[];
}

interface TransfersApiResponse {
  response: PlayerTransfer[];
}

export function useTeamTransfers(teamId: number) {
  return useQuery<PlayerTransfer[]>({
    queryKey: ['teamTransfers', teamId],
    queryFn: async () => {
      const data = await apiFetch<TransfersApiResponse>(`/teams/${teamId}/transfers`);
      return data.response || [];
    },
    enabled: !!teamId,
  });
}
