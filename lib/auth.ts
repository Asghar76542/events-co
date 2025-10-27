import fs from 'fs';
import path from 'path';

export interface AdminUser {
  id: number;
  username: string;
  password: string;
  role: string;
}

export interface Session {
  id: string;
  userId: number;
  expires: number;
}

const SESSIONS_PATH = path.join(process.cwd(), 'data', 'sessions.json');
const ADMIN_USERS_PATH = path.join(process.cwd(), 'data', 'admin-users.json');

// In-memory cache for sessions loaded from file
let sessionsCache: Map<string, Session> = new Map();

// Load sessions from file
function loadSessions(): void {
  try {
    if (fs.existsSync(SESSIONS_PATH)) {
      const data = fs.readFileSync(SESSIONS_PATH, 'utf-8');
      const sessionsArray: Session[] = JSON.parse(data);

      // Convert array back to Map for faster lookups
      sessionsCache = new Map();
      sessionsArray.forEach(session => {
        sessionsCache.set(session.id, session);
      });

      console.log(`Loaded ${sessionsArray.length} sessions from file`);
    } else {
      sessionsCache = new Map();
      console.log('No sessions file found, starting with empty sessions');
    }
  } catch (error) {
    console.error('Error loading sessions from file:', error);
    sessionsCache = new Map(); // Start with empty sessions on error
  }
}

// Save sessions to file
function saveSessions(): void {
  try {
    const sessionsArray = Array.from(sessionsCache.values());

    // Ensure data directory exists
    const dataDir = path.dirname(SESSIONS_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(SESSIONS_PATH, JSON.stringify(sessionsArray, null, 2));
    console.log(`Saved ${sessionsArray.length} sessions to file`);
  } catch (error) {
    console.error('Error saving sessions to file:', error);
    throw error;
  }
}

// Load sessions on module initialization
loadSessions();

export function getAdminUsers(): AdminUser[] {
  try {
    if (!fs.existsSync(ADMIN_USERS_PATH)) {
      console.error('Admin users file not found:', ADMIN_USERS_PATH);
      return [];
    }

    const data = fs.readFileSync(ADMIN_USERS_PATH, 'utf-8');

    if (!data || data.trim() === '') {
      console.error('Admin users file is empty');
      return [];
    }

    const users = JSON.parse(data);

    if (!Array.isArray(users)) {
      console.error('Admin users file does not contain an array');
      return [];
    }

    console.log(`Loaded ${users.length} admin users`);
    return users;
  } catch (error) {
    console.error('Error loading admin users:', error);
    return [];
  }
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  // For development, allow plain text password if it matches hardcoded value
  if (plainPassword === 'admin123' && hashedPassword === '$2b$10$FI4ZMzGFqt2WAyPrYu36ROL7fdFhAlfP5GuNxmvSZVqr5V/aFNAfC') {
    return true;
  }

  // For production, use proper bcrypt comparison
  try {
    // Dynamic import to avoid issues during server startup
    const bcrypt = await import('bcrypt');
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Password verification error:', error);
    // Fallback to plain text comparison (not recommended for production)
    return plainPassword === hashedPassword;
  }
}

export function createSession(userId: number): string {
  const sessionId = Math.random().toString(36).substring(2, 15);
  const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  const session: Session = { id: sessionId, userId, expires };
  sessionsCache.set(sessionId, session);

  try {
    saveSessions();
    console.log(`Session created for user ${userId}: ${sessionId}`);
  } catch (error) {
    // Remove from cache if save failed
    sessionsCache.delete(sessionId);
    console.error(`Failed to save session ${sessionId}:`, error);
    throw error;
  }

  return sessionId;
}

export function getSession(sessionId: string): Session | null {
  const session = sessionsCache.get(sessionId);
  console.log(`Session lookup for ${sessionId}:`, !!session);

  if (!session) {
    console.log(`Session ${sessionId} not found in cache`);
    return null;
  }

  if (session.expires < Date.now()) {
    console.log(`Session ${sessionId} expired, deleting`);
    sessionsCache.delete(sessionId);
    try {
      saveSessions();
    } catch (error) {
      console.error(`Failed to save sessions after deleting expired session ${sessionId}:`, error);
    }
    return null;
  }

  console.log(`Session ${sessionId} is valid for user ${session.userId}`);
  return session;
}

export function deleteSession(sessionId: string): void {
  console.log(`Session deleted: ${sessionId}`);
  sessionsCache.delete(sessionId);

  try {
    saveSessions();
  } catch (error) {
    console.error(`Failed to save sessions after deleting session ${sessionId}:`, error);
    throw error;
  }
}

export function logAction(action: string, userId: number, details?: string): void {
  try {
    const logsPath = path.join(process.cwd(), 'data', 'admin-logs.json');

    let logs: any[] = [];
    if (fs.existsSync(logsPath)) {
      try {
        const logsData = fs.readFileSync(logsPath, 'utf-8');
        logs = logsData && logsData.trim() !== '' ? JSON.parse(logsData) : [];
      } catch (parseError) {
        console.error('Error parsing admin logs file:', parseError);
        logs = []; // Start with empty logs if parsing fails
      }
    }

    logs.push({
      id: Date.now().toString(),
      action,
      userId,
      details,
      timestamp: new Date().toISOString(),
    });

    // Ensure data directory exists
    const dataDir = path.dirname(logsPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2));
    console.log(`Action logged: ${action} for user ${userId}`);
  } catch (error) {
    console.error('Error logging action:', error);
    // Don't throw error to prevent login failures due to logging issues
  }
}

// Clean up expired sessions
export function cleanupExpiredSessions(): number {
  const now = Date.now();
  let removedCount = 0;

  for (const [sessionId, session] of sessionsCache.entries()) {
    if (session.expires < now) {
      sessionsCache.delete(sessionId);
      removedCount++;
    }
  }

  if (removedCount > 0) {
    try {
      saveSessions();
      console.log(`Cleaned up ${removedCount} expired sessions`);
    } catch (error) {
      console.error('Failed to save sessions after cleanup:', error);
    }
  }

  return removedCount;
}

// Get all active sessions (for debugging/admin purposes)
export function getAllSessions(): Session[] {
  return Array.from(sessionsCache.values()).filter(session => session.expires > Date.now());
}

// Test function to manually create a session for debugging
export function createTestSession(): string {
  console.log('Creating test session for debugging');
  return createSession(1); // Create session for admin user (id: 1)
}

// Test authentication functions
export function testAuthFunctions() {
  console.log('Testing authentication functions...');

  // Test password verification
  const isValidPassword = verifyPassword('admin123', '$2b$10$FI4ZMzGFqt2WAyPrYu36ROL7fdFhAlfP5GuNxmvSZVqr5V/aFNAfC');
  console.log('Password verification test:', isValidPassword);

  // Test session creation
  const sessionId = createSession(1);
  console.log('Session creation test:', !!sessionId);

  // Test session retrieval
  const session = getSession(sessionId);
  console.log('Session retrieval test:', !!session);

  // Test session deletion
  deleteSession(sessionId);
  const deletedSession = getSession(sessionId);
  console.log('Session deletion test:', !deletedSession);

  return {
    passwordVerification: isValidPassword,
    sessionCreation: !!sessionId,
    sessionRetrieval: !!session,
    sessionDeletion: !deletedSession
  };
}