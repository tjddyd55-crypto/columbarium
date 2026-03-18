'use client';

import { useQuery } from '@tanstack/react-query';
import { api, ApiResponse } from '@/lib/api';

interface Contract {
  id: string;
  contractNo: string;
  facilityName: string;
  unitCode: string;
  finalPrice: number;
  status: string;
}

export function useMyContracts(enabled = true) {
  return useQuery({
    queryKey: ['admin', 'contracts-my'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Contract[]>>('/contracts/my');
      if (!data.success || !data.data) return [];
      return data.data;
    },
    enabled,
  });
}
