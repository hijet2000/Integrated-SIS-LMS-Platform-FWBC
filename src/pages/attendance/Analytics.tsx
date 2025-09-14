import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { listRecords } from '@/services/attendanceApi'
import type { AttendanceRecord, AttendanceStatus } from '@/types/attendance'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import Button from '@/components/ui/Button'

function summarize(records: AttendanceRecord[]) {
  const counts: Record<AttendanceStatus, number> = { PRESENT:0, ABSENT:0, LATE:0, EXCUSED:0 }
  for (const r of records) counts[r.status] = (counts[r.status] ?? 0) + 1
  return [
    { label: 'Present', value: counts.PRESENT, fill: '#10B981' },
    { label: 'Absent',  value: counts.ABSENT, fill: '#EF4444'  },
    { label: 'Late',    value: counts.LATE, fill: '#F59E0B'    },
    { label: 'Excused', value: counts.EXCUSED, fill: '#3B82F6' },
  ]
}

export default function Analytics() {
  const { siteId = 'site_123' } = useParams()
  const { data, isLoading, error } = useQuery({
    queryKey: ['att-records', siteId, 'analytics'],
    queryFn: () => listRecords(siteId, {}),
  })

  const rows = (data ?? []) as AttendanceRecord[]
  const chartData = useMemo(() => summarize(rows), [rows])
  
  const exportCSV = () => {
    const csvRows = [['label','value']];
    chartData.forEach(d => csvRows.push([d.label, String(d.value)]));
    const csvContent = csvRows.map(e => `"${e.join('","')}"`).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "attendance-analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Attendance Analytics', 14, 16);
    (doc as any).autoTable({
      startY: 22,
      head: [['Status', 'Count']],
      body: chartData.map(d => [d.label, d.value])
    });
    doc.save('attendance-analytics.pdf');
  };

  if (isLoading) return <div className="p-6">Loading analytics…</div>
  if (error) return <div className="p-6 text-red-600">{String(error)}</div>

  const total = rows.length || 1
  const presentRate = Math.round(((chartData.find(d => d.label === 'Present')?.value ?? 0) / total) * 100)

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Attendance Analytics</h1>
        <div className="flex gap-2">
            <Button variant="secondary" onClick={exportCSV} disabled={rows.length === 0}>Export CSV</Button>
            <Button variant="secondary" onClick={exportPDF} disabled={rows.length === 0}>Export PDF</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-4 rounded border bg-white dark:bg-gray-800 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Records</div>
          <div className="text-2xl font-semibold">{rows.length}</div>
        </div>
        <div className="p-4 rounded border bg-white dark:bg-gray-800 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Present Rate</div>
          <div className="text-2xl font-semibold">{presentRate}%</div>
        </div>
        <div className="p-4 rounded border bg-white dark:bg-gray-800 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Classes Tracked</div>
          <div className="text-2xl font-semibold">—</div>
        </div>
      </div>

      <div className="p-4 rounded border bg-white dark:bg-gray-800 dark:border-gray-700 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.9)',
                borderColor: 'rgba(107, 114, 128, 0.5)',
                borderRadius: '0.5rem',
              }}
              labelStyle={{ color: '#F9FAFB' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
            <Bar dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
