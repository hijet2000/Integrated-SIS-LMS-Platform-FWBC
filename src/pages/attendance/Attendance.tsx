import React from 'react'
import { Link, useParams } from 'react-router-dom'

export default function Attendance() {
  const { siteId = 'site_123' } = useParams()
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Attendance</h1>
      <p className="text-gray-600 dark:text-gray-400">Manage bulk entry, view records, and analytics.</p>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link className="p-4 rounded border bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700" to={`/school/${siteId}/attendance/bulk`}>
          <div className="font-medium">Bulk Entry</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Mark today’s session in one go.</div>
        </Link>
        <Link className="p-4 rounded border bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700" to={`/school/${siteId}/attendance/records`}>
          <div className="font-medium">Records</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Browse and filter historical data.</div>
        </Link>
        <Link className="p-4 rounded border bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700" to={`/school/${siteId}/attendance/analytics`}>
          <div className="font-medium">Analytics</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Class rates, trends, comparisons.</div>
        </Link>
      </div>
    </div>
  )
}
