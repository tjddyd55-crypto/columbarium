import { useQuery } from '@tanstack/react-query';
import { userApi } from '../services/user.api';

export function useMe(enabled = true) {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => userApi.getMe(),
    enabled,
  });
}
