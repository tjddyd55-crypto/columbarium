import { useQuery } from '@tanstack/react-query';
import { queueApi } from '../services/queue.api';

export function useQueueDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['queue', id],
    queryFn: () => queueApi.getById(id!),
    enabled: !!id,
  });
}
