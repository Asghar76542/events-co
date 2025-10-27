import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '@/lib/middleware';
import { logAction } from '@/lib/auth';

interface Enquiry {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  eventType: string;
  message: string;
  id: string;
  timestamp: string;
}

const SUBMISSIONS_PATH = path.join(process.cwd(), 'data', 'submissions', 'submissions.json');

function getEnquiries() {
  const data = fs.readFileSync(SUBMISSIONS_PATH, 'utf-8');
  return JSON.parse(data);
}

function saveEnquiries(enquiries: Enquiry[]) {
  fs.writeFileSync(SUBMISSIONS_PATH, JSON.stringify(enquiries, null, 2));
}

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const enquiries = getEnquiries();
  logAction('view_enquiries', auth.userId);

  return NextResponse.json(enquiries);
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { name, email, phone, eventDate, eventType, message } = body;

  if (!name || !email || !phone || !eventType || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const enquiries: Enquiry[] = getEnquiries();
  const newEnquiry: Enquiry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    name,
    email,
    phone,
    eventDate: eventDate || '',
    eventType,
    message,
  };

  enquiries.unshift(newEnquiry);
  saveEnquiries(enquiries);

  logAction('create_enquiry', auth.userId, `Created enquiry ${newEnquiry.id}`);

  return NextResponse.json(newEnquiry, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id, ...updateData } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const enquiries: Enquiry[] = getEnquiries();
  const index = enquiries.findIndex((e: Enquiry) => e.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
  }

  enquiries[index] = { ...enquiries[index], ...updateData };
  saveEnquiries(enquiries);

  logAction('update_enquiry', auth.userId, `Updated enquiry ${id}`);

  return NextResponse.json({ message: 'Enquiry updated' });
}

export async function DELETE(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const enquiries: Enquiry[] = getEnquiries();
  const newEnquiries = enquiries.filter((e: Enquiry) => e.id !== id);

  if (newEnquiries.length === enquiries.length) {
    return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
  }

  saveEnquiries(newEnquiries);

  logAction('delete_enquiry', auth.userId, `Deleted enquiry ${id}`);

  return NextResponse.json({ message: 'Enquiry deleted' });
}
