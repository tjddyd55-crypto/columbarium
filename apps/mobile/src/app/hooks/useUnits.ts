import { useQuery } from '@tanstack/react-query';
import { facilityApi } from '../services/facility.api';

export function useUnits(facilityId: string | undefined) {
  return useQuery({
    queryKey: ['units', facilityId],
    queryFn: () => facilityApi.getUnits(facilityId!),
    enabled: !!facilityId,
  });
}
