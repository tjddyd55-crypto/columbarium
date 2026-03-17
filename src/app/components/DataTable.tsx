import { ReactNode } from 'react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  pageSize?: number;
  onRowClick?: (row: any) => void;
}

export default function DataTable({ columns, data, pageSize, onRowClick }: DataTableProps) {
  const displayData = pageSize ? data.slice(0, pageSize) : data;

  return (
    <div className="bg-white rounded-lg border border-[var(--color-border)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-[var(--color-border)]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
