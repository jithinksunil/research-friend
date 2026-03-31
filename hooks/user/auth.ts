import { useMutation } from '@tanstack/react-query';

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(errorJson.message);
      }
      return response.json();
    },
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName?: string;
    }) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(errorJson.message);
      }
      return response.json();
    },
  });
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({ message: 'Logout failed' }));
        throw new Error(errorJson.message);
      }
    },
  });
};
