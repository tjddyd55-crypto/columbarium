'use client';

import { useQuery } from '@tanstack/react-query';
import { api, ApiResponse } from '@/lib/api';

interface QueueEntry {
  id: string;
  unitCode: string;
  facilityName: string;
  queuePosition: number;
  status: string;
}

export function useMyQueue(enabled = true) {
  return useQuery({
    queryKey: ['admin', 'queue-my'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<QueueEntry[]>>('/queue/my');
      if (!data.success || !data.data) return [];
      return data.data;
    },
    enabled,
  });
}
