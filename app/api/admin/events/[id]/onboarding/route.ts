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

interface OnboardingUpdate {
  phases?: Array<{
    name: string;
    status: "pending" | "completed";
    checklist: string[];
  }>;
  onboardingStatus?: "inquiry" | "deposit_paid" | "planning" | "finalized" | "executed" | "completed";
}

const EVENTS_PATH = path.join(process.cwd(), 'data', 'events.json');

function getEvents() {
  const data = fs.readFileSync(EVENTS_PATH, 'utf-8');
  return JSON.parse(data);
}

function saveEvents(events: Event[]) {
  fs.writeFileSync(EVENTS_PATH, JSON.stringify(events, null, 2));
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

  const events: Event[] = getEvents();
  const index = events.findIndex((e: Event) => e.id === eventId);

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

  const events: Event[] = getEvents();
  const index = events.findIndex((e: Event) => e.id === eventId);

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