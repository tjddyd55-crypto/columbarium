import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queueApi } from '../services/queue.api';

export function useCancelQueue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => queueApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });
}
