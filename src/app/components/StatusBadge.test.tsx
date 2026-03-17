import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('status 문자열을 표시한다', () => {
    render(<StatusBadge status="ACTIVE" />);
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('한글 상태를 표시한다', () => {
    render(<StatusBadge status="활성" />);
    expect(screen.getByText('활성')).toBeInTheDocument();
  });
});
