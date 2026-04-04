'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationProps {
  total: number
  perPage: number
  basePath: string
}

export default function Pagination({ total, perPage, basePath }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1', 10)
  const totalPages = Math.ceil(total / perPage)

  if (totalPages <= 1) return null

  const offset = (page - 1) * perPage

  const goTo = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`${basePath}?${params.toString()}`)
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
    .reduce<(number | '...')[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...')
      acc.push(p)
      return acc
    }, [])

  return (
    <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
      <div className="text-sm text-gray-700">
        총 {total.toLocaleString()}건 중 {(offset + 1).toLocaleString()}-
        {Math.min(offset + perPage, total).toLocaleString()}건 표시
      </div>
      <div className="flex gap-1 items-center">
        <button
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          className="min-h-[44px] px-3 border border-gray-300 rounded-lg hover:bg-gray-50 inline-flex items-center disabled:opacity-30 disabled:cursor-not-allowed"
        >
          이전
        </button>
        {pageNumbers.map((p, idx) =>
          p === '...' ? (
            <span key={`dot-${idx}`} className="px-2 text-gray-400">...</span>
          ) : (
            <button
              key={p}
              onClick={() => goTo(p)}
              className={`min-h-[44px] min-w-[44px] border rounded-lg inline-flex items-center justify-center ${
                p === page
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages}
          className="min-h-[44px] px-3 border border-gray-300 rounded-lg hover:bg-gray-50 inline-flex items-center disabled:opacity-30 disabled:cursor-not-allowed"
        >
          다음
        </button>
      </div>
    </div>
  )
}
