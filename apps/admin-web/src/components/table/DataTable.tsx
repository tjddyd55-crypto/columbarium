'use client';

import React from 'react';

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, data, keyExtractor, emptyMessage = '데이터가 없습니다.' }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            {columns.map((col) => (
              <th key={col.key} className="text-left p-3 font-medium text-gray-700">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={keyExtractor(row)} className="border-b hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="p-3">
                  {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <p className="p-6 text-center text-gray-500">{emptyMessage}</p>
      )}
    </div>
  );
}
