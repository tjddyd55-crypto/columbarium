'use client';

import { useQuery } from '@tanstack/react-query';
import { getOperators } from '@/lib/operator.api';

export function useOperators() {
  return useQuery({
    queryKey: ['admin', 'operators'],
    queryFn: getOperators,
  });
}
