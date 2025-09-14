export type ExportRange = { from?: string; to?: string; classId?: string }

export type WeeklyEmailSettings = {
  enabled: boolean
  sendHour: number // 0..23
}
