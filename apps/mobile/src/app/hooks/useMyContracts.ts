import { useQuery } from '@tanstack/react-query';
import { contractApi } from '../services/contract.api';

export function useMyContracts(enabled = true) {
  return useQuery({
    queryKey: ['contracts', 'my'],
    queryFn: () => contractApi.getMy(),
    enabled,
  });
}
