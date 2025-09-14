import { http } from './http'
import type {
  AttendanceRecord,
  BulkEntryPayload,
  ClassLite,
  SessionLite,
  StudentLite,
  AttendanceSettings
} from '@/types/attendance'

// Lists
export function listClasses(siteId: string) {
  return http<ClassLite[]>(`/sites/${siteId}/attendance/classes`)
}
export function listStudents(siteId: string, classId: string) {
  return http<StudentLite[]>(`/sites/${siteId}/attendance/classes/${classId}/students`)
}
export function listSessions(siteId: string, classId?: string) {
  const q = classId ? `?classId=${encodeURIComponent(classId)}` : ''
  return http<SessionLite[]>(`/sites/${siteId}/attendance/sessions${q}`)
}
export function listRecords(siteId: string, params: { classId?: string; from?: string; to?: string }) {
  const qs = new URLSearchParams()
  if (params.classId) qs.set('classId', params.classId)
  if (params.from) qs.set('from', params.from)
  if (params.to) qs.set('to', params.to)
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return http<AttendanceRecord[]>(`/sites/${siteId}/attendance/records${suffix}`)
}

// Mutations
export function createSession(siteId: string, session: Omit<SessionLite,'id'>) {
  return http<SessionLite>(`/sites/${siteId}/attendance/sessions`, {
    method: 'POST',
    body: JSON.stringify(session),
  })
}
export function submitBulk(siteId: string, payload: BulkEntryPayload) {
  return http<{ success: boolean; count: number }>(`/sites/${siteId}/attendance/bulk`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** NEW: Settings */
export function getAttendanceSettings(siteId: string) {
  return http<AttendanceSettings>(`/sites/${siteId}/attendance/settings`)
}
export function updateAttendanceSettings(siteId: string, s: AttendanceSettings) {
  return http<AttendanceSettings>(`/sites/${siteId}/attendance/settings`, {
    method: 'PUT',
    body: JSON.stringify(s)
  })
}

/** NEW: Notifications */
export function triggerAttendanceNotifications(
  siteId: string,
  sessionId: string,
  mode: AttendanceSettings['notifyMode']
) {
  return http<{ ok: boolean }>(`/sites/${siteId}/attendance/notify`, {
    method: 'POST',
    body: JSON.stringify({ sessionId, mode }),
  })
}
