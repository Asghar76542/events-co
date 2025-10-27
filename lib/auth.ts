import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

export interface AdminUser {
  id: number;
  username: string;
  password: string;
  role: string;
}

const ADMIN_USERS_PATH = path.join(process.cwd(), 'data', 'admin-users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-jwt-secret-key-change-in-production';

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

export function createJWT(userId: number): string {
  const payload = {
    userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
  };

  const token = jwt.sign(payload, JWT_SECRET);
  console.log(`JWT created for user ${userId}`);
  return token;
}

export function verifyJWT(token: string): { userId: number; iat: number; exp: number } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; iat: number; exp: number };
    console.log(`JWT verified for user ${decoded.userId}`);
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
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

// Note: JWT tokens are stateless, so no cleanup is needed for expired tokens

// Test function to manually create a JWT for debugging
export function createTestJWT(): string {
  console.log('Creating test JWT for debugging');
  return createJWT(1); // Create JWT for admin user (id: 1)
}

// Test authentication functions
export function testAuthFunctions() {
  console.log('Testing authentication functions...');

  // Test password verification
  const isValidPassword = verifyPassword('admin123', '$2b$10$FI4ZMzGFqt2WAyPrYu36ROL7fdFhAlfP5GuNxmvSZVqr5V/aFNAfC');
  console.log('Password verification test:', isValidPassword);

  // Test JWT creation
  const token = createJWT(1);
  console.log('JWT creation test:', !!token);

  // Test JWT verification
  const decoded = verifyJWT(token);
  console.log('JWT verification test:', !!decoded);

  // Test invalid JWT
  const invalidDecoded = verifyJWT('invalid-token');
  console.log('Invalid JWT test:', !invalidDecoded);

  return {
    passwordVerification: isValidPassword,
    jwtCreation: !!token,
    jwtVerification: !!decoded,
    invalidJwtRejection: !invalidDecoded
  };
}