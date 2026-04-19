import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../../api/users';

const useProfile = () =>
  useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await usersApi.getMe()).data,
  });

export default useProfile;
