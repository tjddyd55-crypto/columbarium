import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

describe('App', () => {
  it('로그인 페이지에 낙골당 타이틀이 표시된다', () => {
    const router = createMemoryRouter(
      [
        { path: '/login', Component: Login },
        { path: '/', Component: Layout, children: [{ index: true, Component: Dashboard }] },
      ],
      { initialEntries: ['/login'] }
    );
    render(<RouterProvider router={router} />);
    expect(screen.getByText('낙골당')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /로그인/ })).toBeInTheDocument();
  });

  it('대시보드 페이지에 대시보드 제목이 표시된다', () => {
    const router = createMemoryRouter(
      [
        { path: '/', Component: Layout, children: [{ index: true, Component: Dashboard }] },
      ],
      { initialEntries: ['/'] }
    );
    render(<RouterProvider router={router} />);
    expect(screen.getByRole('heading', { name: '대시보드' })).toBeInTheDocument();
  });
});
