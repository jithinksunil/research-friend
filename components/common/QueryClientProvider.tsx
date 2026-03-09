'use client';
import {
  QueryClient,
  QueryClientProvider as QueryClientProviderParent,
} from '@tanstack/react-query';
const queryClient = new QueryClient();

export const QueryClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <QueryClientProviderParent client={queryClient}>
      {children}
    </QueryClientProviderParent>
  );
};
