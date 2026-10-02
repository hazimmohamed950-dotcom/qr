export interface Student {
  id: string;
  apogeeId: string;
  cne: string;
  nom: string;
  prenom: string;
  email: string;
  group: 'S5-A' | 'S5-B';
  filiere: string;
  avatarUrl?: string;
  attendanceStats: {
    totalSessions: number;
    attended: number;
    rate: number;
    status: 'REGULAR' | 'AT_RISK' | 'CRITICAL';
  };
}

export interface Course {
  id: string;
  code: string;
  title: string;
  professor: string;
  semester: string;
  groups: Array<'S5-A' | 'S5-B'>;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  sessionCode?: string;
  studentId: string;
  studentNom: string;
  studentPrenom: string;
  apogeeId: string;
  cne: string;
  group: 'S5-A' | 'S5-B';
  timestamp: string;
  scanEpoch: number;
  verificationMethod: 'DYNAMIC_QR_E2EE' | 'BLE_PROXIMITY' | 'MANUAL_OVERRIDE' | 'QR_URL_FORM';
  receiptHash: string;
  deviceFingerprint: string;
  ipSubnet: string;
  status: 'PRESENT' | 'LATE' | 'EXCUSED';
}

export interface AttendanceSession {
  id: string;
  sessionCode: string; // e.g. "MD-7842"
  courseId: string;
  courseTitle: string;
  courseCode: string;
  professor: string;
  targetGroup: 'S5-A' | 'S5-B' | 'ALL';
  startTime: string;
  durationMinutes: number;
  expiresAt: string;
  isActive: boolean;
  isPaused: boolean;
  currentRotatingEpoch: number;
  tokenRefreshIntervalSec: number;
  sessionSecretKey: string;
  attendeesCount: number;
  totalExpectedStudents: number;
  records: AttendanceRecord[];
}

export interface QRPayload {
  v: number; // protocol version
  sid: string; // session ID
  ep: number; // epoch timestamp (updates every 8s)
  exp: number; // epoch expiration timestamp
  grp: 'S5-A' | 'S5-B' | 'ALL';
  sig: string; // HMAC-SHA256 signature
  nonce: string; // Anti-replay nonce
}

export interface ScanResult {
  success: boolean;
  message: string;
  errorReason?: 'EXPIRED_TOKEN' | 'GROUP_MISMATCH' | 'ALREADY_RECORDED' | 'INVALID_SIGNATURE' | 'NOT_ENROLLED' | 'SESSION_CLOSED';
  record?: AttendanceRecord;
  student?: Student;
}

export interface AuditSecurityEvent {
  id: string;
  timestamp: string;
  type: 'TOKEN_ROTATION' | 'SCAN_SUCCESS' | 'ATTACK_PREVENTED' | 'BURST_TRAFFIC' | 'SESSION_START' | 'SESSION_CLOSE';
  details: string;
  severity: 'INFO' | 'WARN' | 'DANGER' | 'SUCCESS';
  metadata?: Record<string, any>;
}
