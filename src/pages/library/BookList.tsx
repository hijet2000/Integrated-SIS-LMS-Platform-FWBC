import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listBooks } from '@/services/libraryApi'
import type { Book } from '@/types/library'

export default function BookList() {
  const { siteId = 'site_123' } = useParams()

  const { data, error, isLoading } = useQuery({
    queryKey: ['books', siteId],
    queryFn: () => listBooks(siteId),
  })

  if (isLoading) return <div className="p-6">Loading books…</div>
  if (error) return <div className="p-6 text-red-600">{String(error)}</div>

  const books = (data ?? []) as Book[]

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Library — Books</h1>
      {books.length === 0 ? (
        <div className="text-gray-600 dark:text-gray-400">No books found.</div>
      ) : (
        <ul className="divide-y border rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:divide-gray-700">
          {books.map(b => (
            <li key={b.id} className="p-4 flex justify-between gap-4">
              <div>
                <div className="font-medium">{b.title}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{b.author ?? 'Unknown author'}</div>
                {b.isbn && <div className="text-xs text-gray-500 dark:text-gray-500">ISBN: {b.isbn}</div>}
              </div>
              <div className="text-right text-sm">
                <div>Copies: {b.quantity ?? 0}</div>
                <div>Available: {b.available ?? 0}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}