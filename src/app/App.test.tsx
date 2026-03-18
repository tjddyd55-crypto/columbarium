import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

describe('App', () => {
  it('로그인 페이지에 봉안당 타이틀이 표시된다', () => {
    const router = createMemoryRouter(
      [
        { path: '/admin/login', Component: Login },
        { path: '/admin', Component: AdminLayout, children: [{ index: true, Component: Dashboard }] },
      ],
      { initialEntries: ['/admin/login'] }
    );
    render(<RouterProvider router={router} />);
    expect(screen.getByText('봉안당')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /로그인/ })).toBeInTheDocument();
  });

  it('대시보드 페이지에 대시보드 제목이 표시된다', () => {
    localStorage.setItem('admin_token', 'ok');
    const router = createMemoryRouter(
      [
        { path: '/admin', Component: AdminLayout, children: [{ index: true, Component: Dashboard }] },
      ],
      { initialEntries: ['/admin'] }
    );
    render(<RouterProvider router={router} />);
    expect(screen.getByRole('heading', { name: '대시보드' })).toBeInTheDocument();
    localStorage.removeItem('admin_token');
  });
});
