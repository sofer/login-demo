import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth, AuthProvider } from '../use-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '../../setupTests';
import { http, HttpResponse } from 'msw';

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

describe('useAuth', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/auth/me', () => {
        return HttpResponse.json({ id: 1, email: 'test@example.com', isVerified: true });
      })
    );
  });

  it('provides user data when authenticated', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for the query to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toEqual({
      id: 1,
      email: 'test@example.com',
      isVerified: true,
    });
  });

  it('returns null when not authenticated', async () => {
    server.use(
      http.get('/api/auth/me', () => {
        return new HttpResponse(null, { status: 401 });
      })
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.user).toBe(null);
  });
});