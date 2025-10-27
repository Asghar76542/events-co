import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '@/lib/middleware';
import { logAction } from '@/lib/auth';

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  baseCost: number;
  unit: string;
}

const SERVICES_PATH = path.join(process.cwd(), 'data', 'services.json');

function getServices() {
  const data = fs.readFileSync(SERVICES_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const services: Service[] = getServices();
  logAction('view_services', auth.userId);

  return NextResponse.json(services);
}