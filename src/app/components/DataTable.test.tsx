import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataTable from './DataTable';

const columns = [
  { key: 'name', label: '이름' },
  { key: 'age', label: '나이' },
];
const data = [
  { name: '홍길동', age: 30 },
  { name: '김철수', age: 25 },
];

describe('DataTable', () => {
  it('컬럼 헤더와 데이터를 렌더링한다', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('이름')).toBeInTheDocument();
    expect(screen.getByText('나이')).toBeInTheDocument();
    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('김철수')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('pageSize가 있으면 해당 개수만큼만 표시한다', () => {
    render(<DataTable columns={columns} data={data} pageSize={1} />);
    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.queryByText('김철수')).not.toBeInTheDocument();
  });

  it('onRowClick이 있으면 행 클릭 시 콜백이 호출된다', async () => {
    const onRowClick = vi.fn();
    render(<DataTable columns={columns} data={data} onRowClick={onRowClick} />);
    await userEvent.click(screen.getByText('홍길동'));
    expect(onRowClick).toHaveBeenCalledWith({ name: '홍길동', age: 30 });
  });
});
