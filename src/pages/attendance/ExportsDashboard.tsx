import React, { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { listClasses, listRecords } from '@/services/attendanceApi'
import {
  exportRecordsCSV, exportRecordsPDF, exportAnalyticsCSV, exportAnalyticsPDF,
  getWeeklyEmailSettings, updateWeeklyEmailSettings
} from '@/services/exportsApi'
import type { ExportRange, WeeklyEmailSettings } from '@/types/exports'
import type { AttendanceRecord } from '@/types/attendance'
import Heatmap from '@/components/charts/Heatmap'
import Button from '@/components/ui/Button'

export default function ExportsDashboard() {
  const { siteId = 'site_123' } = useParams()
  const qc = useQueryClient();
  const { data: classes } = useQuery({ queryKey: ['att-classes', siteId], queryFn: () => listClasses(siteId) })

  const [classId, setClassId] = useState<string>('')
  const [from, setFrom] = useState<string>(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0,10)
  })
  const [to, setTo] = useState<string>(() => new Date().toISOString().slice(0,10))

  // Weekly email settings
  const { data: settings, refetch } = useQuery({
    queryKey: ['weekly-settings', siteId],
    queryFn: () => getWeeklyEmailSettings(siteId),
  })
  const updateSettings = useMutation({
    mutationFn: (s: WeeklyEmailSettings) => updateWeeklyEmailSettings(siteId, s),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weekly-settings', siteId] })
  })

  // Pull records in range (for client CSV or heatmap summarization)
  const { data: records, isLoading } = useQuery({
    queryKey: ['att-records', siteId, classId, from, to, 'exports'],
    queryFn: () => listRecords(siteId, { classId, from, to }),
  })

  // Heatmap data: percent present by day (simple demo)
  const heatmapData = useMemo(() => {
    const byDay: Record<string, { present: number; total: number }> = {}
    ;((records ?? []) as AttendanceRecord[]).forEach(r => {
      const day = (r.createdAt || new Date().toISOString()).slice(0,10)
      const bucket = (byDay[day] ||= { present: 0, total: 0 })
      bucket.total += 1
      if (r.status === 'PRESENT') bucket.present += 1
    })
    return Object.entries(byDay).map(([date, b]) => ({
      date,
      value: b.total ? Math.round((b.present / b.total) * 100) : 0
    }))
  }, [records])

  const range: ExportRange = { classId: classId || undefined, from: from || undefined, to: to || undefined }

  // Server-side link exports (if implemented on backend)
  // FIX: Add generic types to useMutation hooks to correctly infer the return type of mutateAsync.
  const recCsv = useMutation<{ url: string }, Error>({ mutationFn: () => exportRecordsCSV(siteId, range) })
  const recPdf = useMutation<{ url: string }, Error>({ mutationFn: () => exportRecordsPDF(siteId, range) })
  const anaCsv = useMutation<{ url: string }, Error>({ mutationFn: () => exportAnalyticsCSV(siteId, range) })
  const anaPdf = useMutation<{ url: string }, Error>({ mutationFn: () => exportAnalyticsPDF(siteId, range) })

  const downloadFromMutation = async (mut: typeof recCsv) => {
    const { url } = await mut.mutateAsync()
    const a = document.createElement('a')
    a.href = url
    a.download = ''
    a.click()
  }

  // Client-side CSV as fallback (records)
  const exportClientCSV = () => {
    const rows = [['id','studentId','sessionId','status','minutes','createdAt']]
    ;((records ?? []) as AttendanceRecord[]).forEach(r => {
      rows.push([r.id, r.studentId, r.sessionId, r.status, String(r.minutesAttended ?? ''), r.createdAt])
    })
    const csv = rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-records-${from}_to_${to}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Client-side PDF fallback (if jspdf installed)
  const exportClientPDF = async () => {
    try {
      const jsPDFmod = await import('jspdf')
      await import('jspdf-autotable')
      const jsPDF = jsPDFmod.default
      const doc = new jsPDF()
      doc.text('Attendance Records', 14, 16)
      // @ts-ignore
      doc.autoTable({
        startY: 22,
        head: [['ID','Student','Session','Status','Minutes','Created']],
        body: ((records ?? []) as AttendanceRecord[]).map(r => [
          r.id, r.studentId, r.sessionId, r.status, String(r.minutesAttended ?? ''), new Date(r.createdAt).toLocaleString()
        ])
      })
      doc.save(`attendance-records-${from}_to_${to}.pdf`)
    } catch (e) {
      alert('PDF dependencies not installed. Run: npm i jspdf jspdf-autotable')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Exports & Heatmap</h1>

      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-4 p-4 rounded border bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Class</label>
          <select className="w-full border rounded p-2 bg-white dark:bg-gray-900 dark:border-gray-600" value={classId} onChange={e=>setClassId(e.target.value)}>
            <option value="">All</option>
            {classes?.map(c => <option key={c.id} value={c.id}>{c.name}{c.section ? ` • ${c.section}`:''}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">From</label>
          <input type="date" className="w-full border rounded p-2 dark:bg-gray-900 dark:border-gray-600" value={from} onChange={e=>setFrom(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">To</label>
          <input type="date" className="w-full border rounded p-2 dark:bg-gray-900 dark:border-gray-600" value={to} onChange={e=>setTo(e.target.value)} />
        </div>
      </div>

      {/* Exports */}
      <div className="p-4 rounded border bg-white dark:bg-gray-800 dark:border-gray-700 space-y-3">
        <div className="font-medium">Exports</div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => downloadFromMutation(recCsv)}>Records CSV (server)</Button>
          <Button variant="secondary" onClick={() => downloadFromMutation(recPdf)}>Records PDF (server)</Button>
          <Button variant="secondary" onClick={() => downloadFromMutation(anaCsv)}>Analytics CSV (server)</Button>
          <Button variant="secondary" onClick={() => downloadFromMutation(anaPdf)}>Analytics PDF (server)</Button>

          <span className="text-gray-400 dark:text-gray-600">|</span>

          <Button variant="secondary" onClick={exportClientCSV}>Records CSV (client)</Button>
          <Button variant="secondary" onClick={exportClientPDF}>Records PDF (client)</Button>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Tip: Use server exports for signed URLs & large datasets. Client exports are handy for quick filters.
        </div>
      </div>

      {/* Weekly email settings */}
      <div className="p-4 rounded border bg-white dark:bg-gray-800 dark:border-gray-700 space-y-3">
        <div className="font-medium">Weekly Scheduled Email</div>
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!settings?.enabled}
              // FIX: Call updateSettings.mutate() instead of updateSettings().
              onChange={e => updateSettings.mutate({ ...settings!, enabled: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Enabled</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Send Hour</span>
            <input
              type="number" min={0} max={23}
              className="w-20 border rounded p-1 dark:bg-gray-900 dark:border-gray-600"
              value={settings?.sendHour ?? 7}
              onChange={e => updateSettings.mutate({
                ...settings!,
                sendHour: Math.max(0, Math.min(23, Number(e.target.value || 7)))
              })}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">UTC</span>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Backend should consolidate last week’s records per class, generate CSV/PDF, and email to teachers/parents based on tenant policy.
        </div>
      </div>

      {/* Heatmap */}
      <div className="p-4 rounded border bg-white dark:bg-gray-800 dark:border-gray-700">
        {isLoading ? (
          <div>Loading heatmap…</div>
        ) : (
          <Heatmap data={heatmapData} title="Daily Present % (last 12 weeks)" weeks={12} />
        )}
      </div>
    </div>
  )
}