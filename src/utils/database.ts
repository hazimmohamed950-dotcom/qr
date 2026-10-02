import { AttendanceRecord } from '../types/attendance';

const DB_STORAGE_KEY = 'uca_fsjes_attendance_db_v1';

export function loadStoredRecords(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AttendanceRecord[];
  } catch (err) {
    console.warn('Failed to load records from localStorage:', err);
    return [];
  }
}

export function saveRecordToDatabase(record: AttendanceRecord): boolean {
  try {
    const existing = loadStoredRecords();
    // Check if already in DB
    const alreadyExists = existing.some(
      r => r.sessionId === record.sessionId && (r.studentId === record.studentId || r.apogeeId === record.apogeeId)
    );
    if (alreadyExists) {
      return false; // duplicate
    }
    const updated = [record, ...existing];
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Failed to save record to localStorage:', err);
    return false;
  }
}

export function clearDatabase(): void {
  try {
    localStorage.removeItem(DB_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear database:', err);
  }
}
