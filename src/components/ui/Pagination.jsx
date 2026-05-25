import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({ skip, limit, total, onPageChange }) {
  const page = Math.floor(skip / limit)
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-edge text-sm text-muted">
      <span>
        {total === 0 ? '0' : skip + 1}–{Math.min(skip + limit, total)} sur {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(skip - limit)}
          disabled={page === 0}
          className="p-1.5 rounded hover:bg-edge disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="px-2">
          {page + 1} / {Math.max(totalPages, 1)}
        </span>
        <button
          onClick={() => onPageChange(skip + limit)}
          disabled={page >= totalPages - 1}
          className="p-1.5 rounded hover:bg-edge disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
