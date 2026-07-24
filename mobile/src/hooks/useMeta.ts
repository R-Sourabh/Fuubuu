import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/apiClient';

export interface Country {
  name: string;
  code: string | null;
  flag: string | null;
}

interface CountriesResponse {
  response: Country[];
}

interface SeasonsResponse {
  response: number[];
}

export function useCountries() {
  return useQuery<Country[]>({
    queryKey: ['countries'],
    queryFn: async () => {
      const data = await apiFetch<CountriesResponse>('/competitions/countries');
      return data.response;
    },
  });
}

export function useSeasons() {
  return useQuery<number[]>({
    queryKey: ['seasons'],
    queryFn: async () => {
      const data = await apiFetch<SeasonsResponse>('/competitions/seasons');
      return data.response;
    },
  });
}
