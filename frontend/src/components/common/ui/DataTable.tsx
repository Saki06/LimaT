import React from 'react';
import { EmptyState } from '@/components/admin/EmptyState';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  columns: DataTableColumn<T>[];
  rows: T[];
  loading?: boolean;
  error?: string;
  emptyTitle: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id: string }>({ columns, rows, loading = false, error, emptyTitle, emptyDescription, onRowClick }: DataTableProps<T>) {
  if (loading) return <div className="rounded-2xl border border-[#e6ece8] bg-white p-8 text-center text-sm text-slate-500">Loading...</div>;
  if (error) return <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-700">{error}</div>;
  if (!rows.length) return <EmptyState title={emptyTitle} description={emptyDescription} />;
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#e6ece8] bg-white shadow-sm">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="sticky top-0 z-10 border-b border-[#e6ece8] bg-white text-xs uppercase tracking-wide text-slate-500">
          <tr>{columns.map((column) => <th key={column.key} className="px-5 py-4 font-bold">{column.header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-[#eef2ef]">
          {rows.map((row) => <tr key={row.id} onClick={() => onRowClick?.(row)} className={cnRow(Boolean(onRowClick))}>{columns.map((column) => <td key={column.key} className="px-5 py-4">{column.render(row)}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

function cnRow(clickable: boolean) {
  return clickable ? 'cursor-pointer transition-colors hover:bg-[#f7fbf9] focus-within:bg-[#f7fbf9]' : 'transition-colors hover:bg-[#f7fbf9]';
}
