import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CompanyComment } from '@/interfaces';

export const dashboardQueryKeys = {
  votes: (symbol: string) => ['dashboard', symbol, 'votes'] as const,
  comments: (symbol: string) => ['dashboard', symbol, 'comments'] as const,
};

export const useVotes = (symbol: string) => {
  return useQuery({
    queryKey: dashboardQueryKeys.votes(symbol),
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/${encodeURIComponent(symbol)}/votes`, {
        cache: 'no-store',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({ message: 'Failed to fetch votes' }));
        throw new Error(errorJson.message);
      }
      return response.json() as Promise<{ upVotes: number; downVotes: number }>;
    },
  });
};

export const useComments = (symbol: string) => {
  return useQuery({
    queryKey: dashboardQueryKeys.comments(symbol),
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/${encodeURIComponent(symbol)}/comments`, {
        cache: 'no-store',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorJson = await response
          .json()
          .catch(() => ({ message: 'Failed to fetch comments' }));
        throw new Error(errorJson.message);
      }
      return response.json() as Promise<CompanyComment[]>;
    },
  });
};

export const useVoteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ symbol, vote }: { symbol: string; vote: boolean }) => {
      const response = await fetch(`/api/dashboard/${encodeURIComponent(symbol)}/votes`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote }),
      });
      if (!response.ok) {
        const errorJson = await response
          .json()
          .catch(() => ({ message: 'Failed to register vote' }));
        throw new Error(errorJson.message);
      }
    },
    onSuccess: (_, { symbol }) => {
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.votes(symbol) });
    },
  });
};

export const useCommentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ symbol, text }: { symbol: string; text: string }) => {
      const response = await fetch(`/api/dashboard/${encodeURIComponent(symbol)}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        const errorJson = await response
          .json()
          .catch(() => ({ message: 'Failed to create comment' }));
        throw new Error(errorJson.message);
      }
      return response.json() as Promise<CompanyComment>;
    },
    onSuccess: (newComment, { symbol }) => {
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.comments(symbol) });
      // Optimistically add the comment
      queryClient.setQueryData(
        dashboardQueryKeys.comments(symbol),
        (old: CompanyComment[] | undefined) => {
          return old ? [newComment, ...old] : [newComment];
        },
      );
    },
  });
};
