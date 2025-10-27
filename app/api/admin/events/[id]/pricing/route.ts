import { NextRequest, NextResponse } from 'next/server';
import { logAction } from '@/lib/auth';
import { PackageType, Service, calculatePricingFromServices } from '@/lib/domain/events';
import { requireAuth } from '@/lib/middleware';
import { readJsonFile, resolveDataPath } from '@/lib/server/json-store';

interface PricingRequest {
  services: Array<{
    id: string;
    quantity: number;
  }>;
  packageType: PackageType;
  guestCount?: number;
}

const SERVICES_PATH = resolveDataPath('services.json');

function getServices(): Service[] {
  return readJsonFile<Service[]>(SERVICES_PATH);
}


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body: PricingRequest = await request.json();

  if (!body.services || !body.packageType) {
    return NextResponse.json({ error: 'Services and package type are required' }, { status: 400 });
  }

  const { id: eventId } = await params;

  const services = getServices();
  const pricing = calculatePricingFromServices({
    services: body.services
      .map((item) => {
        const service = services.find((svc) => svc.id === item.id);
        return service ? { service, quantity: item.quantity } : null;
      })
      .filter((svc): svc is { service: Service; quantity: number } => Boolean(svc)),
    packageType: body.packageType,
    guestCount: body.guestCount,
  });

  logAction('calculate_event_pricing', auth.userId, `Calculated pricing for event ${eventId}`);

  return NextResponse.json(pricing);
}
