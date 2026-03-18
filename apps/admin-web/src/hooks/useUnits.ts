'use client';

import { useQuery } from '@tanstack/react-query';
import { getUnits } from '@/lib/unit.api';

export function useUnits(facilityId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'units', facilityId],
    queryFn: () => getUnits(facilityId!),
    enabled: !!facilityId,
  });
}
