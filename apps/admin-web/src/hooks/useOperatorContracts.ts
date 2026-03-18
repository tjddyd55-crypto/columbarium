'use client';

import { useQuery } from '@tanstack/react-query';
import { getOperatorContracts } from '@/lib/contract.api';

export function useOperatorContracts(filters?: { facilityId?: string; status?: string }) {
  return useQuery({
    queryKey: ['admin', 'contracts', filters],
    queryFn: () => getOperatorContracts(filters),
  });
}
