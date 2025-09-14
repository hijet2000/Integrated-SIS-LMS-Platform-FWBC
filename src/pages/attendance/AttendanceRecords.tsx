import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { listClasses, listRecords } from '@/services/attendanceApi'
import type { AttendanceRecord } from '@/types/attendance'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import Button from '@/components/ui/Button'

export default function AttendanceRecords() {
  const { siteId = 'site_123' } = useParams()
  const { data: classes } = useQuery({ queryKey: ['att-classes', siteId], queryFn: () => listClasses(siteId) })
  const [classId, setClassId] = useState<string>('')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['att-records', siteId, classId, from, to],
    queryFn: () => listRecords(siteId, { classId, from, to }),
  })

  const rows = (data ?? []) as AttendanceRecord[]

  const exportCSV = () => {
    const csvRows = [
      ['id','studentId','sessionId','status','minutesAttended','createdAt']
    ];
    rows.forEach(r => {
      csvRows.push([
        r.id, r.studentId, r.sessionId, r.status, String(r.minutesAttended ?? ''), r.createdAt
      ]);
    });
    const csvContent = csvRows.map(e => `"${e.join('","')}"`).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "attendance-records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.text('Attendance Records', 14, 16);
    (doc as any).autoTable({
      startY: 22,
      head: [['ID','Student','Session','Status','Minutes','Created']],
      body: rows.map(r => [r.id, r.studentId, r.sessionId, r.status, String(r.minutesAttended ?? ''), new Date(r.createdAt).toLocaleString()])
    })
    doc.save('attendance-records.pdf')
  }

  if (isLoading) return <div className="p-6">Loading records…</div>
  if (error) return <div className="p-6 text-red-600">{String(error)}</div>

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Attendance Records</h1>
      
      <div className="flex items-center justify-between">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Class</label>
            <select className="w-full border rounded p-2 bg-white dark:bg-gray-800 dark:border-gray-600" value={classId} onChange={e=>setClassId(e.target.value)}>
              <option value="">All</option>
              {classes?.map(c => <option key={c.id} value={c.id}>{c.name}{c.section ? ` • ${c.section}`:''}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">From</label>
            <input className="w-full border rounded p-2 dark:bg-gray-800 dark:border-gray-600" type="date" value={from} onChange={e=>setFrom(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">To</label>
            <input className="w-full border rounded p-2 dark:bg-gray-800 dark:border-gray-600" type="date" value={to} onChange={e=>setTo(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2 self-end">
            <Button variant="secondary" onClick={exportCSV} disabled={rows.length === 0}>Export CSV</Button>
            <Button variant="secondary" onClick={exportPDF} disabled={rows.length === 0}>Export PDF</Button>
        </div>
      </div>

      <div className="overflow-auto border rounded bg-white dark:bg-gray-800 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="text-left p-2 border-b dark:border-gray-600">Record ID</th>
              <th className="text-left p-2 border-b dark:border-gray-600">Student</th>
              <th className="text-left p-2 border-b dark:border-gray-600">Session</th>
              <th className="text-left p-2 border-b dark:border-gray-600">Status</th>
              <th className="text-left p-2 border-b dark:border-gray-600">Minutes</th>
              <th className="text-left p-2 border-b dark:border-gray-600">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-600">
            {rows.map(r => (
              <tr key={r.id}>
                <td className="p-2">{r.id}</td>
                <td className="p-2">{r.studentId}</td>
                <td className="p-2">{r.sessionId}</td>
                <td className="p-2">{r.status}</td>
                <td className="p-2">{r.minutesAttended ?? '-'}</td>
                <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="p-4 text-gray-600 dark:text-gray-400" colSpan={6}>No records.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
