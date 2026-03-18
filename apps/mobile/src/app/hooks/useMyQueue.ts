import { useQuery } from '@tanstack/react-query';
import { queueApi } from '../services/queue.api';

export function useMyQueue(enabled = true) {
  return useQuery({
    queryKey: ['queue', 'my'],
    queryFn: () => queueApi.getMy(),
    enabled,
    refetchInterval: 30 * 1000, // 30초
  });
}
