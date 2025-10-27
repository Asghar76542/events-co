export type EventCategory = 'weddings' | 'corporate' | 'decor' | 'all'

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  weddings: 'Weddings',
  corporate: 'Corporate',
  decor: 'Decor',
  all: 'All',
}

export type PackageType = 'Essentials' | 'Complete' | 'Luxury'

export type ContactMethod = 'Email' | 'Phone' | 'WhatsApp'

export interface PackageConfig {
  label: string
  markup: number
}

export const PACKAGE_TYPE_CONFIG: Record<PackageType, PackageConfig> = {
  Essentials: { label: 'Essentials', markup: 0.3 },
  Complete: { label: 'Complete', markup: 0.32 },
  Luxury: { label: 'Luxury', markup: 0.35 },
}

export type OnboardingStatus =
  | 'inquiry'
  | 'deposit_paid'
  | 'planning'
  | 'finalized'
  | 'executed'
  | 'completed'

export const ONBOARDING_STATUS_LABELS: Record<OnboardingStatus, string> = {
  inquiry: 'Inquiry',
  deposit_paid: 'Deposit Paid',
  planning: 'Planning',
  finalized: 'Finalized',
  executed: 'Executed',
  completed: 'Completed',
}

export interface TimelineMilestones {
  eventDate?: string
  depositDue?: string
  midPaymentDue?: string
  finalPaymentDue?: string
}

export interface ClientInfo {
  name: string
  email?: string
  phone?: string
  contactMethod?: ContactMethod
}

export interface EventPhase {
  name: string
  status: 'pending' | 'in_progress' | 'completed'
  checklist: string[]
}

export interface Service {
  id: string
  name: string
  category: string
  description: string
  baseCost: number
  unit: string
}

export interface EventService {
  id: string
  name: string
  type: string
  description: string
  supplierCost: number
  quantity: number
  totalCost: number
}

export interface EventPricing {
  packageType: PackageType
  baseCost: number
  markup: number
  totalPrice: number
  depositAmount: number
  midPayment: number
  finalPayment: number
}

export interface EventRecord {
  id: string
  venue: string
  city: string
  category: EventCategory
  image: string
  title: string
  description: string
  pricing?: EventPricing
  services?: EventService[]
  onboardingStatus?: OnboardingStatus
  clientInfo?: ClientInfo
  timeline?: TimelineMilestones
  phases?: EventPhase[]
}

export interface EnquiryRecord {
  id: string
  name: string
  email: string
  phone: string
  eventDate: string
  eventType: EventCategory
  message: string
  timestamp: string
}

export const DEFAULT_EVENT_PHASES: EventPhase[] = [
  {
    name: 'Initial Consultation',
    status: 'pending',
    checklist: ['Schedule meeting', 'Confirm requirements', 'Outline budget'],
  },
  {
    name: 'Planning',
    status: 'pending',
    checklist: ['Assign coordinator', 'Draft project plan', 'Confirm vendors'],
  },
  {
    name: 'Execution',
    status: 'pending',
    checklist: ['On-site management', 'Vendor coordination', 'Issue resolution'],
  },
]

export function createEventId(title: string): string {
  return `${title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'event'}-${Date.now()}`
}

export function getCategoryLabel(category: EventCategory): string {
  return EVENT_CATEGORY_LABELS[category] ?? category
}

export function getOnboardingStatusLabel(status: OnboardingStatus): string {
  return ONBOARDING_STATUS_LABELS[status] ?? status
}

export function getPackageConfig(type: PackageType): PackageConfig {
  return PACKAGE_TYPE_CONFIG[type]
}

export function getPackageMarkup(type: PackageType): number {
  return getPackageConfig(type).markup
}

export interface PricingCalculationInput {
  services: Array<{ service: Service; quantity: number }>
  packageType: PackageType
  guestCount?: number
}

export interface PricingCalculationResult extends EventPricing {
  services: EventService[]
  servicesCost: number
}

export function calculatePricingFromServices({
  services,
  packageType,
  guestCount,
}: PricingCalculationInput): PricingCalculationResult {
  let servicesCost = 0

  const normalizedServices: EventService[] = services.map(({ service, quantity }) => {
    const qty = Math.max(1, quantity || 1)
    const totalCost = service.baseCost * qty
    servicesCost += totalCost

    return {
      id: service.id,
      name: service.name,
      type: service.category,
      description: service.description,
      supplierCost: service.baseCost,
      quantity: qty,
      totalCost,
    }
  })

  if (guestCount && normalizedServices.some((svc) => svc.id.includes('menu'))) {
    servicesCost *= guestCount / 100
  }

  const markupRate = getPackageMarkup(packageType)
  const totalPrice = servicesCost * (1 + markupRate)

  return {
    packageType,
    baseCost: servicesCost,
    markup: markupRate,
    totalPrice,
    depositAmount: totalPrice * 0.3,
    midPayment: totalPrice * 0.4,
    finalPayment: totalPrice * 0.3,
    services: normalizedServices,
    servicesCost,
  }
}
