import { NextRequest, NextResponse } from 'next/server';
import { logAction } from '@/lib/auth';
import {
  EventPhase,
  EventRecord,
  OnboardingStatus,
} from '@/lib/domain/events';
import { requireAuth } from '@/lib/middleware';
import { readJsonFile, resolveDataPath, writeJsonFile } from '@/lib/server/json-store';

interface OnboardingUpdate {
  phases?: EventPhase[];
  onboardingStatus?: OnboardingStatus;
}

const EVENTS_PATH = resolveDataPath('events.json');

function getEvents(): EventRecord[] {
  return readJsonFile<EventRecord[]>(EVENTS_PATH);
}

function saveEvents(events: EventRecord[]) {
  writeJsonFile(EVENTS_PATH, events);
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
  const updateData: OnboardingUpdate = await request.json();

  const events: EventRecord[] = getEvents();
  const index = events.findIndex((e: EventRecord) => e.id === eventId);

  if (index === -1) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // Update phases if provided
  if (updateData.phases) {
    events[index].phases = updateData.phases;
  }

  // Update onboarding status if provided
  if (updateData.onboardingStatus) {
    events[index].onboardingStatus = updateData.onboardingStatus;
  }

  saveEvents(events);

  logAction('update_event_onboarding', auth.userId, `Updated onboarding for event ${eventId}`);

  return NextResponse.json({ message: 'Onboarding updated' });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id: eventId } = await params;
  const updateData: { phaseIndex?: number; status?: "pending" | "completed" } = await request.json();

  const events: EventRecord[] = getEvents();
  const index = events.findIndex((e: EventRecord) => e.id === eventId);

  if (index === -1) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // Update specific phase status if provided
  if (updateData.phaseIndex !== undefined && updateData.status) {
    if (events[index].phases && events[index].phases[updateData.phaseIndex]) {
      events[index].phases![updateData.phaseIndex].status = updateData.status;

      // Auto-update onboarding status based on phase completion
      const completedPhases = events[index].phases!.filter(p => p.status === 'completed').length;
      const totalPhases = events[index].phases!.length;

      if (completedPhases === totalPhases) {
        events[index].onboardingStatus = 'completed';
      } else if (completedPhases > 0) {
        events[index].onboardingStatus = 'planning';
      }
    }
  }

  saveEvents(events);

  logAction('update_event_phase', auth.userId, `Updated phase ${updateData.phaseIndex} for event ${eventId}`);

  return NextResponse.json({ message: 'Phase updated' });
}
