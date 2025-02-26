import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/use-auth';
import Login from '../login';
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

describe('Login Page', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/auth/me', () => {
        return new HttpResponse(null, { status: 401 });
      })
    );
  });

  it('renders login form', () => {
    render(<Login />, { wrapper });
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Magic Link/i })).toBeInTheDocument();
  });

  it('handles successful login submission', async () => {
    server.use(
      http.post('/api/auth/login', () => {
        return new HttpResponse(null, { status: 200 });
      })
    );

    render(<Login />, { wrapper });

    const emailInput = screen.getByLabelText('Email');
    await userEvent.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /Send Magic Link/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Check your email/i)).toBeInTheDocument();
    });
  });

  it('handles login errors', async () => {
    server.use(
      http.post('/api/auth/login', () => {
        return new HttpResponse(
          JSON.stringify({ message: 'Invalid email' }), 
          { status: 400 }
        );
      })
    );

    render(<Login />, { wrapper });

    const emailInput = screen.getByLabelText('Email');
    await userEvent.type(emailInput, 'invalid');

    const submitButton = screen.getByRole('button', { name: /Send Magic Link/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });
});