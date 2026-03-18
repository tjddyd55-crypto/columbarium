'use client';

import { useQuery } from '@tanstack/react-query';
import { getOperatorResaleList } from '@/lib/resale.api';

export function useOperatorResale(status?: string) {
  return useQuery({
    queryKey: ['admin', 'resale', status],
    queryFn: () => getOperatorResaleList(status),
  });
}
