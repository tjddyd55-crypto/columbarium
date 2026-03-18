import { useQuery } from '@tanstack/react-query';
import { facilityApi } from '../services/facility.api';

export function useFacilities(operatorId?: string) {
  return useQuery({
    queryKey: ['facilities', operatorId],
    queryFn: () => facilityApi.getList(operatorId),
  });
}
