export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'

export type StudentLite = {
  id: string
  name: string
  roll?: string
}

export type ClassLite = {
  id: string
  name: string
  section?: string
}

export type SessionLite = {
  id: string
  classId: string
  subject?: string
  date: string // ISO
  startTime?: string // "09:00"
  endTime?: string   // "10:00"
}

export type AttendanceRecord = {
  id: string
  studentId: string
  sessionId: string
  status: AttendanceStatus
  minutesAttended?: number
  notes?: string
  createdAt: string // ISO
}

export type BulkEntryPayload = {
  sessionId: string
  entries: Array<{
    studentId: string
    status: AttendanceStatus
    minutesAttended?: number
  }>
}

/** NEW: tenant/school settings for attendance */
export type AttendanceSettings = {
  autoPresentThresholdPct: number; // e.g. 75 means >=75% => PRESENT
  notifyMode: 'IMMEDIATE' | 'QUEUED' | 'SCHEDULED';
  scheduledHour?: number; // 0..23 (when SCHEDULED)
}
