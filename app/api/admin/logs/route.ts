import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '@/lib/middleware';

const LOGS_PATH = path.join(process.cwd(), 'data', 'admin-logs.json');
const DEFAULT_LIMIT = 10;

function getLogs() {
  const raw = fs.readFileSync(LOGS_PATH, 'utf-8');
  return JSON.parse(raw);
}

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = request.nextUrl;
  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;

  const logs = getLogs()
    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, Math.max(1, limit));

  return NextResponse.json(logs);
}
