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

interface PricingRequest {
  services: Array<{
    id: string;
    quantity: number;
  }>;
  packageType: "Essentials" | "Complete" | "Luxury";
  guestCount?: number;
}

const SERVICES_PATH = path.join(process.cwd(), 'data', 'services.json');

function getServices() {
  const data = fs.readFileSync(SERVICES_PATH, 'utf-8');
  return JSON.parse(data) as Service[];
}

function calculatePricing(request: PricingRequest) {
  const services = getServices();
  let baseCost = 0;

  request.services.forEach(reqService => {
    const service = services.find(s => s.id === reqService.id);
    if (service) {
      baseCost += service.baseCost * reqService.quantity;
    }
  });

  // Adjust for guest count if applicable (e.g., catering)
  if (request.guestCount && request.services.some(s => s.id.includes('menu'))) {
    baseCost *= (request.guestCount / 100); // Assuming per 100 guests for menus
  }

  const markup = request.packageType === 'Luxury' ? 0.35 : request.packageType === 'Complete' ? 0.32 : 0.30;
  const totalPrice = baseCost * (1 + markup);

  const depositAmount = totalPrice * 0.30;
  const midPayment = totalPrice * 0.40;
  const finalPayment = totalPrice * 0.30;

  return {
    baseCost,
    markup,
    totalPrice,
    depositAmount,
    midPayment,
    finalPayment,
    services: request.services.map(reqService => {
      const service = services.find(s => s.id === reqService.id);
      return service ? {
        ...service,
        quantity: reqService.quantity,
        totalCost: service.baseCost * reqService.quantity
      } : null;
    }).filter(Boolean)
  };
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
  const pricing = calculatePricing(body);
  logAction('calculate_event_pricing', auth.userId, `Calculated pricing for event ${eventId}`);

  return NextResponse.json(pricing);
}