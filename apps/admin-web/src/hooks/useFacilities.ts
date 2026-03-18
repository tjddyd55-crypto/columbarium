'use client';

import { useQuery } from '@tanstack/react-query';
import { getFacilities, getOperatorFacilities } from '@/lib/facility.api';
import { getUser } from '@/lib/auth';

export function useFacilities(operatorId?: string) {
  const user = getUser();
  const isSuper = user?.role === 'SUPER_ADMIN';

  return useQuery({
    queryKey: ['admin', 'facilities', operatorId ?? (isSuper ? 'all' : 'operator')],
    queryFn: () => (isSuper ? getFacilities(operatorId) : getOperatorFacilities()),
    enabled: !!user,
  });
}
