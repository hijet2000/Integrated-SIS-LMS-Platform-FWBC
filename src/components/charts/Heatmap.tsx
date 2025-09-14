import React from 'react'

type HeatCell = {
  date: string // ISO
  value: number // e.g., % present (0..100) or count
}

export default function Heatmap({
  data,
  title = 'Attendance Heatmap',
  weeks = 12, // number of weeks to render (approx 3 months)
}: { data: HeatCell[]; title?: string; weeks?: number }) {
  // Normalize to a map for quick lookup
  const map = new Map(data.map(d => [d.date.slice(0,10), d.value]))

  // Build calendar grid ending today
  const today = new Date()
  const days = weeks * 7
  const cells: { date: string; value: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const iso = d.toISOString().slice(0,10)
    cells.push({ date: iso, value: map.get(iso) ?? 0 })
  }

  // color scale (simple)
  const color = (v: number) => {
    // 0 -> light gray; 100 -> dark green
    if (v <= 0) return 'bg-gray-200 dark:bg-gray-700'
    if (v < 25) return 'bg-green-200 dark:bg-green-900'
    if (v < 50) return 'bg-green-400 dark:bg-green-700'
    if (v < 75) return 'bg-green-600 dark:bg-green-500'
    return 'bg-green-800 dark:bg-green-300'
  }

  return (
    <div>
      <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">{title}</div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, idx) => (
          <div key={idx} className={`h-4 w-4 ${color(c.value)} rounded`} title={`${c.date}: ${c.value}%`} />
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
        <span>Lighter</span>
        <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm" />
        <div className="w-3 h-3 bg-green-200 dark:bg-green-900 rounded-sm" />
        <div className="w-3 h-3 bg-green-400 dark:bg-green-700 rounded-sm" />
        <div className="w-3 h-3 bg-green-600 dark:bg-green-500 rounded-sm" />
        <div className="w-3 h-3 bg-green-800 dark:bg-green-300 rounded-sm" />
        <span>Darker</span>
      </div>
    </div>
  )
}
