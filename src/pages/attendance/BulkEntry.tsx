import React, { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import {
  listClasses, listStudents, createSession, submitBulk,
  getAttendanceSettings, updateAttendanceSettings, triggerAttendanceNotifications
} from '@/services/attendanceApi'
import type { AttendanceStatus, BulkEntryPayload, AttendanceSettings, SessionLite } from '@/types/attendance'
// FIX: Add missing import for Button component.
import Button from '@/components/ui/Button'

const statuses: AttendanceStatus[] = ['PRESENT','ABSENT','LATE','EXCUSED']

function hhmmToMinutes(t?: string) {
  if (!t) return 0
  const [h,m] = t.split(':').map(Number)
  return (h||0)*60 + (m||0)
}

export default function BulkEntry() {
  const { siteId = 'site_123' } = useParams()
  const qc = useQueryClient()
  const [classId, setClassId] = useState<string>('')
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0,10))
  const [subject, setSubject] = useState<string>('General')
  const [startTime, setStart] = useState('09:00')
  const [endTime, setEnd] = useState('10:00')

  // settings
  const { data: settings, refetch: refetchSettings } = useQuery({
    queryKey: ['att-settings', siteId],
    queryFn: () => getAttendanceSettings(siteId),
    initialData: { autoPresentThresholdPct: 75, notifyMode: 'IMMEDIATE', scheduledHour: 18 } as AttendanceSettings
  })
  const updateSettingsMut = useMutation({
    mutationFn: (s: AttendanceSettings) => updateAttendanceSettings(siteId, s),
    onSuccess: () => refetchSettings()
  })

  const { data: classes } = useQuery({ queryKey: ['att-classes', siteId], queryFn: () => listClasses(siteId) })
  const { data: students } = useQuery({
    queryKey: ['att-students', siteId, classId],
    queryFn: () => listStudents(siteId, classId),
    enabled: !!classId,
  })

  const [draft, setDraft] = useState<Record<string,{status:AttendanceStatus; minutes?:number}>>({})

  const createSessionMut = useMutation<SessionLite, Error, void>({
    mutationFn: () => createSession(siteId, { classId, date, subject, startTime, endTime }),
  })
  const bulkMut = useMutation({
    mutationFn: (payload: BulkEntryPayload) => submitBulk(siteId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['att-records', siteId] })
      alert('Attendance saved.')
    }
  })

  const notifyMut = useMutation({
    mutationFn: ({ sessionId, mode }: { sessionId: string, mode: AttendanceSettings['notifyMode'] }) =>
      triggerAttendanceNotifications(siteId, sessionId, mode),
  })

  const disabled = !classId || !students?.length
  const sessionMinutes = Math.max(hhmmToMinutes(endTime) - hhmmToMinutes(startTime), 0)

  /** NEW: Auto-fill statuses based on threshold */
  const runAutoThreshold = () => {
    if (!students?.length || !sessionMinutes) return
    const pct = settings!.autoPresentThresholdPct
    const presentCutoff = Math.ceil((pct/100) * sessionMinutes)

    const updated: typeof draft = {}
    for (const s of students) {
      const v = draft[s.id] ?? { status:'PRESENT' as AttendanceStatus, minutes: sessionMinutes }
      const mins = v.minutes ?? 0
      if (mins >= presentCutoff) updated[s.id] = { ...v, status: 'PRESENT' }
      else if (mins > 0)       updated[s.id] = { ...v, status: 'LATE' } // treat partial as LATE
      else                     updated[s.id] = { ...v, status: 'ABSENT' }
    }
    setDraft(updated)
  }

  /** Export current draft as CSV */
  const exportCSV = () => {
    const rows = [['studentId','status','minutes']]
    Object.entries(draft).forEach(([id,v]) => {
      rows.push([id, v.status, String(v.minutes ?? '')])
    })
    const csv = rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-draft-${classId || 'class'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onSave = async () => {
    try {
        const session = await createSessionMut.mutateAsync()
        const payload: BulkEntryPayload = {
          sessionId: session.id,
          entries: Object.entries(draft).map(([studentId, v]) => ({
            studentId,
            status: v.status,
            minutesAttended: v.minutes,
          })),
        }
        await bulkMut.mutateAsync(payload)

        // fire notifications by mode
        await notifyMut.mutateAsync({ sessionId: session.id, mode: settings!.notifyMode })
    } catch (err: any) {
        alert(`Failed to save attendance. Please ensure your backend API is running. Error: ${err.message}`)
    }
  }

  const studentRows = useMemo(() => students ?? [], [students])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Bulk Entry</h1>

      {/* SETTINGS */}
      <div className="p-4 border rounded bg-white dark:bg-gray-800 dark:border-gray-700 space-y-3">
        <div className="font-medium">Attendance Settings</div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Auto Present Threshold (%)</label>
            <input
              type="number" min={0} max={100}
              className="w-full border rounded p-2 dark:bg-gray-900 dark:border-gray-600"
              value={settings!.autoPresentThresholdPct}
              onChange={e => updateSettingsMut.mutate({
                ...settings!,
                autoPresentThresholdPct: Math.max(0, Math.min(100, Number(e.target.value || 0)))
              })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Notification Mode</label>
            <select
              className="w-full border rounded p-2 bg-white dark:bg-gray-900 dark:border-gray-600"
              value={settings!.notifyMode}
              onChange={e => updateSettingsMut.mutate({ ...settings!, notifyMode: e.target.value as any })}
            >
              <option value="IMMEDIATE">Immediate</option>
              <option value="QUEUED">Queued</option>
              <option value="SCHEDULED">Scheduled (daily)</option>
            </select>
          </div>
          {settings!.notifyMode === 'SCHEDULED' && (
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Scheduled Hour (0-23)</label>
              <input
                type="number" min={0} max={23}
                className="w-full border rounded p-2 dark:bg-gray-900 dark:border-gray-600"
                value={settings!.scheduledHour ?? 18}
                onChange={e => updateSettingsMut.mutate({
                  ...settings!,
                  scheduledHour: Math.max(0, Math.min(23, Number(e.target.value || 18)))
                })}
              />
            </div>
          )}
        </div>
      </div>

      {/* SESSION META */}
      <div className="grid gap-3 sm:grid-cols-5">
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Class</label>
          <select className="w-full border rounded p-2 bg-white dark:bg-gray-800 dark:border-gray-600" value={classId} onChange={e=>setClassId(e.target.value)}>
            <option value="">Select…</option>
            {classes?.map(c => <option key={c.id} value={c.id}>{c.name}{c.section ? ` • ${c.section}`:''}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Date</label>
          <input type="date" className="w-full border rounded p-2 dark:bg-gray-800 dark:border-gray-600" value={date} onChange={e=>setDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Start</label>
          <input type="time" className="w-full border rounded p-2 dark:bg-gray-800 dark:border-gray-600" value={startTime} onChange={e=>setStart(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">End</label>
          <input type="time" className="w-full border rounded p-2 dark:bg-gray-800 dark:border-gray-600" value={endTime} onChange={e=>setEnd(e.target.value)} />
        </div>
        <div className="sm:col-span-5">
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Subject</label>
          <input className="w-full border rounded p-2 dark:bg-gray-800 dark:border-gray-600" value={subject} onChange={e=>setSubject(e.target.value)} />
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3">
        <Button
          disabled={!students?.length || !sessionMinutes}
          onClick={runAutoThreshold}
        >
          Auto-fill by Threshold
        </Button>
        <Button variant="secondary"
          onClick={exportCSV}
        >
          Export Draft (CSV)
        </Button>
      </div>

      {/* TABLE */}
      <div className="overflow-auto border rounded bg-white dark:bg-gray-800 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="text-left p-2 border-b dark:border-gray-600">Student</th>
              <th className="text-left p-2 border-b dark:border-gray-600">Status</th>
              <th className="text-left p-2 border-b dark:border-gray-600">Minutes (of {sessionMinutes})</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-600">
            {studentRows.map(s => {
              const v = draft[s.id] ?? { status:'PRESENT' as AttendanceStatus, minutes:sessionMinutes }
              return (
                <tr key={s.id}>
                  <td className="p-2">{s.name}{s.roll ? <span className="text-gray-500 dark:text-gray-400"> • {s.roll}</span>:null}</td>
                  <td className="p-2">
                    <select
                      className="border rounded p-1 bg-white dark:bg-gray-800 dark:border-gray-600"
                      value={v.status}
                      onChange={e=>setDraft(d => ({...d, [s.id]: { ...v, status: e.target.value as AttendanceStatus }}))}
                    >
                      {statuses.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="number" min={0} max={sessionMinutes} className="w-28 border rounded p-1 dark:bg-gray-800 dark:border-gray-600"
                      value={v.minutes ?? ''} placeholder="mins"
                      onChange={e=>setDraft(d => ({...d, [s.id]: { ...v, minutes: e.target.value ? Number(e.target.value) : undefined }}))}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* SAVE */}
      <div className="flex items-center gap-3">
        <Button
          disabled={!classId || !students?.length || createSessionMut.isPending || bulkMut.isPending || notifyMut.isPending}
          onClick={onSave}
          isLoading={createSessionMut.isPending || bulkMut.isPending || notifyMut.isPending}
        >
          Save & Notify
        </Button>
        {!students?.length && <span className="text-sm text-gray-600 dark:text-gray-400">Choose a class with students to begin.</span>}
      </div>
    </div>
  )
}
