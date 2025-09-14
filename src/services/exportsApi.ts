import { http } from './http'
import type { ExportRange, WeeklyEmailSettings } from '@/types/exports'

export function getWeeklyEmailSettings(siteId: string) {
  // MOCK: return a default value since the backend endpoint likely doesn't exist
  console.log(`Mock getWeeklyEmailSettings for site: ${siteId}`);
  return Promise.resolve({ enabled: false, sendHour: 7 } as WeeklyEmailSettings);
  // return http<WeeklyEmailSettings>(`/sites/${siteId}/attendance/exports/weekly-settings`)
}

export function updateWeeklyEmailSettings(siteId: string, s: WeeklyEmailSettings) {
  console.log(`Mock updateWeeklyEmailSettings for site: ${siteId}`, s);
  // MOCK: return the updated value
  return Promise.resolve(s);
  // return http<WeeklyEmailSettings>(`/sites/${siteId}/attendance/exports/weekly-settings`, {
  //   method: 'PUT',
  //   body: JSON.stringify(s),
  // })
}

/** Server-side file exports (optional). If you do streaming, return a signed URL */
export function exportRecordsCSV(siteId: string, range: ExportRange) {
  console.log(`Mock exportRecordsCSV for site: ${siteId}`, range);
  // MOCK: return a dummy URL
  return Promise.resolve({ url: 'data:text/csv;charset=utf-8,id,studentId,sessionId,status,minutesAttended,createdAt\nrec_1,std_1,ses_1,PRESENT,60,2024-09-01T09:00:00Z' });
  // return http<{ url: string }>(`/sites/${siteId}/attendance/exports/records/csv`, {
  //   method: 'POST',
  //   body: JSON.stringify(range),
  // })
}
export function exportRecordsPDF(siteId: string, range: ExportRange) {
  console.log(`Mock exportRecordsPDF for site: ${siteId}`, range);
  // MOCK: return a dummy URL. A real PDF would be generated server-side.
  alert('Server-side PDF generation is a backend task. This is a mock response.');
  return Promise.resolve({ url: '#' });
  // return http<{ url: string }>(`/sites/${siteId}/attendance/exports/records/pdf`, {
  //   method: 'POST',
  //   body: JSON.stringify(range),
  // })
}

export function exportAnalyticsCSV(siteId: string, range: ExportRange) {
  console.log(`Mock exportAnalyticsCSV for site: ${siteId}`, range);
  // MOCK: return a dummy URL
  return Promise.resolve({ url: 'data:text/csv;charset=utf-8,label,value\nPresent,150\nAbsent,10' });
  // return http<{ url: string }>(`/sites/${siteId}/attendance/exports/analytics/csv`, {
  //   method: 'POST',
  //   body: JSON.stringify(range),
  // })
}
export function exportAnalyticsPDF(siteId: string, range: ExportRange) {
  console.log(`Mock exportAnalyticsPDF for site: ${siteId}`, range);
  // MOCK: return a dummy URL.
  alert('Server-side PDF generation is a backend task. This is a mock response.');
  return Promise.resolve({ url: '#' });
  // return http<{ url: string }>(`/sites/${siteId}/attendance/exports/analytics/pdf`, {
  //   method: 'POST',
  //   body: JSON.stringify(range),
  // })
}
