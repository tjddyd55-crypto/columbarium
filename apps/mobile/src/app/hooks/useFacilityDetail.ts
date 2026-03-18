import { useQuery } from '@tanstack/react-query';
import { facilityApi } from '../services/facility.api';

export function useFacilityDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['facility', id],
    queryFn: () => facilityApi.getById(id!),
    enabled: !!id,
  });
}
