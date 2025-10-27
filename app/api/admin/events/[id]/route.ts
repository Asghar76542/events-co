import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '@/lib/middleware';
import { logAction } from '@/lib/auth';

interface Event {
  id: string;
  venue: string;
  city: string;
  category: "weddings" | "corporate" | "decor" | "all";
  image: string;
  title: string;
  description: string;
  pricing?: {
    packageType: "Essentials" | "Complete" | "Luxury";
    baseCost: number;
    markup: number;
    totalPrice: number;
    depositAmount: number;
    midPayment: number;
    finalPayment: number;
  };
  services?: Array<{
    id: string;
    name: string;
    type: string;
    description: string;
    supplierCost: number;
    quantity: number;
    totalCost: number;
  }>;
  onboardingStatus?: "inquiry" | "deposit_paid" | "planning" | "finalized" | "executed" | "completed";
  clientInfo?: {
    name: string;
    email: string;
    phone: string;
    contactMethod: "Email" | "Phone" | "WhatsApp";
  };
  timeline?: {
    eventDate: string;
    depositDue: string;
    midPaymentDue: string;
    finalPaymentDue: string;
  };
  phases?: Array<{
    name: string;
    status: "pending" | "completed";
    checklist: string[];
  }>;
}

const EVENTS_PATH = path.join(process.cwd(), 'data', 'events.json');

function getEvents() {
  const data = fs.readFileSync(EVENTS_PATH, 'utf-8');
  return JSON.parse(data);
}

function saveEvents(events: Event[]) {
  fs.writeFileSync(EVENTS_PATH, JSON.stringify(events, null, 2));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id: eventId } = await params;
  const events: Event[] = getEvents();
  const event = events.find((e: Event) => e.id === eventId);

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  logAction('view_event', auth.userId, `Viewed event ${eventId}`);
  return NextResponse.json(event);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id: eventId } = await params;
  const updateData = await request.json();

  const events: Event[] = getEvents();
  const index = events.findIndex((e: Event) => e.id === eventId);

  if (index === -1) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  events[index] = { ...events[index], ...updateData };
  saveEvents(events);

  logAction('update_event', auth.userId, `Updated event ${eventId}`);

  return NextResponse.json({ message: 'Event updated' });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id: eventId } = await params;
  const events: Event[] = getEvents();
  const newEvents = events.filter((e: Event) => e.id !== eventId);

  if (newEvents.length === events.length) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  saveEvents(newEvents);

  logAction('delete_event', auth.userId, `Deleted event ${eventId}`);

  return NextResponse.json({ message: 'Event deleted' });
}