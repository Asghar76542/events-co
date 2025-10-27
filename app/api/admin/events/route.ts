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

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const events: EventRecord[] = getEvents();
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

  const events: EventRecord[] = getEvents();
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

  const events: EventRecord[] = getEvents();
  const index = events.findIndex((e: EventRecord) => e.id === id);

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

  const events: EventRecord[] = getEvents();
  const newEvents = events.filter((e: EventRecord) => e.id !== id);

  if (newEvents.length === events.length) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  saveEvents(newEvents);

  logAction('delete_event', auth.userId, `Deleted event ${id}`);

  return NextResponse.json({ message: 'Event deleted' });
}
