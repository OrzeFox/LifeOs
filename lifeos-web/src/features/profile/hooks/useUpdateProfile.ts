import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../../api/users';
import type { UpdateProfilePayload } from '../../../ts/user';

const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) =>
      (await usersApi.updateMe(payload)).data,
    onSuccess: (data) => {
      qc.setQueryData(['profile'], data);
    },
  });
};

export default useUpdateProfile;
