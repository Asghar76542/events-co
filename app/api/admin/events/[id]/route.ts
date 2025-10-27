import { NextRequest, NextResponse } from 'next/server';
import { logAction } from '@/lib/auth';
import { EventRecord } from '@/lib/domain/events';
import { requireAuth } from '@/lib/middleware';
import { readJsonFile, resolveDataPath, writeJsonFile } from '@/lib/server/json-store';

const EVENTS_PATH = resolveDataPath('events.json');

function getEvents(): EventRecord[] {
  return readJsonFile<EventRecord[]>(EVENTS_PATH);
}

function saveEvents(events: EventRecord[]) {
  writeJsonFile(EVENTS_PATH, events);
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
  const events: EventRecord[] = getEvents();
  const event = events.find((e: EventRecord) => e.id === eventId);

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

  const events: EventRecord[] = getEvents();
  const index = events.findIndex((e: EventRecord) => e.id === eventId);

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
  const events: EventRecord[] = getEvents();
  const newEvents = events.filter((e: EventRecord) => e.id !== eventId);

  if (newEvents.length === events.length) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  saveEvents(newEvents);

  logAction('delete_event', auth.userId, `Deleted event ${eventId}`);

  return NextResponse.json({ message: 'Event deleted' });
}
