import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Activity } from 'lucide-react';
import KPICard from './KPICard';

describe('KPICard', () => {
  it('title과 value를 렌더링한다', () => {
    render(<KPICard title="총 회원 수" value="1,234" icon={Activity} />);
    expect(screen.getByText('총 회원 수')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('change가 있으면 변경 문구를 표시한다', () => {
    render(<KPICard title="KPI" value="42" icon={Activity} change="전월 대비 +5%" />);
    expect(screen.getByText('전월 대비 +5%')).toBeInTheDocument();
  });
});
