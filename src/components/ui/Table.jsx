'use client';
import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import Pagination from './Pagination';

function SortIcon({ sortKey, columnKey, sortDir }) {
  if (sortKey !== columnKey) return <ChevronsUpDown size={14} className="text-gray-300" />;
  return sortDir === 'asc' ? (
    <ChevronUp size={14} className="text-[var(--primary-color)]" />
  ) : (
    <ChevronDown size={14} className="text-[var(--primary-color)]" />
  );
}

export default function Table({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data found.',
  onSort,
  sortKey,
  sortDir,
  pageSize = 15,
  className = '',
}) {
  const [page, setPage] = useState(1);

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'string') {
        const cmp = aVal.localeCompare(bVal);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = sortedData.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-[var(--text-secondary)]">
        <div className="w-6 h-6 border-2 border-[var(--border-color)] border-t-[var(--primary-color)] rounded-full animate-spin mr-3" />
        Loading...
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="overflow-x-auto rounded-lg border border-[var(--border-color)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => {
                    if (col.sortable && onSort) {
                      const isAsc = sortKey === col.key && sortDir === 'asc';
                      onSort(col.key, isAsc ? 'desc' : 'asc');
                    }
                  }}
                  className={`px-4 py-3 text-left text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider ${
                    col.sortable ? 'cursor-pointer select-none hover:bg-gray-100/80' : ''
                  }`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  <div className="inline-flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && (
                      <SortIcon sortKey={sortKey} columnKey={col.key} sortDir={sortDir} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-[var(--text-secondary)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, i) => (
                <tr
                  key={row.id || i}
                  className="border-t border-[var(--border-color)] hover:bg-gray-50/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-[var(--text-primary)]">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
