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

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const events = getEvents();
  logAction('view_events', auth.userId);

  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const newEvent = await request.json();

  if (!newEvent.id || !newEvent.venue) {
    return NextResponse.json({ error: 'ID and venue are required' }, { status: 400 });
  }

  const events: Event[] = getEvents();
  events.push(newEvent);
  saveEvents(events);

  logAction('create_event', auth.userId, `Created event ${newEvent.id}`);

  return NextResponse.json({ message: 'Event created' });
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

  const events: Event[] = getEvents();
  const index = events.findIndex((e: Event) => e.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  events[index] = { ...events[index], ...updateData };
  saveEvents(events);

  logAction('update_event', auth.userId, `Updated event ${id}`);

  return NextResponse.json({ message: 'Event updated' });
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

  const events: Event[] = getEvents();
  const newEvents = events.filter((e: Event) => e.id !== id);

  if (newEvents.length === events.length) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  saveEvents(newEvents);

  logAction('delete_event', auth.userId, `Deleted event ${id}`);

  return NextResponse.json({ message: 'Event deleted' });
}