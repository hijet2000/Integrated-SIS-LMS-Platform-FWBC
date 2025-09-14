import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx client errors
        if (error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2; // Retry twice on other errors
      },
    },
  },
});