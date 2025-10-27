import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '@/lib/middleware';
import { logAction } from '@/lib/auth';

const SUBMISSIONS_PATH = path.join(process.cwd(), 'data', 'submissions', 'submissions.json');
const EVENTS_PATH = path.join(process.cwd(), 'data', 'events.json');

function getEnquiries() {
  const data = fs.readFileSync(SUBMISSIONS_PATH, 'utf-8');
  return JSON.parse(data);
}

function getEvents() {
  const data = fs.readFileSync(EVENTS_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const enquiries = getEnquiries();
  const events = getEvents();

  const stats = {
    totalEnquiries: enquiries.length,
    totalEvents: events.length,
    enquiriesByType: enquiries.reduce((acc: any, e: any) => {
      acc[e.eventType] = (acc[e.eventType] || 0) + 1;
      return acc;
    }, {}),
    eventsByCategory: events.reduce((acc: any, e: any) => {
      acc[e.category] = (acc[e.category] || 0) + 1;
      return acc;
    }, {}),
  };

  logAction('view_stats', auth.userId);

  return NextResponse.json(stats);
}