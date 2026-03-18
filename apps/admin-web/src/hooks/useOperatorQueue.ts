'use client';

import { useQuery } from '@tanstack/react-query';
import { getOperatorQueue } from '@/lib/queue.api';

export function useOperatorQueue(facilityId?: string) {
  return useQuery({
    queryKey: ['admin', 'queue', facilityId],
    queryFn: () => getOperatorQueue(facilityId),
  });
}
