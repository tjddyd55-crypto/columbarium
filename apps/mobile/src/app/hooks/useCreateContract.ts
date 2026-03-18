import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contractApi } from '../services/contract.api';

export function useCreateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { unitId: string; queueEntryId: string }) => contractApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });
}
