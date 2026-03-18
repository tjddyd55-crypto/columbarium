import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queueApi } from '../services/queue.api';

export function useJoinQueue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (unitId: string) => queueApi.join(unitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });
}
