'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Package,
  Users,
  Clock,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react'
import {
  ContactMethod,
  EVENT_CATEGORY_LABELS,
  EventCategory,
  EventPhase,
  EventPricing,
  EventRecord,
  EventService,
  EnquiryRecord,
  PACKAGE_TYPE_CONFIG,
  PackageType,
  Service,
  createEventId,
} from '@/lib/domain/events'

interface EventData {
  id?: string
  title: string
  category: EventCategory
  venue: string
  city: string
  description: string
  image: string
  packageType: PackageType
  eventDate: string
  services: EventService[]
  clientInfo: {
    name: string
    email: string
    phone: string
    contactMethod: ContactMethod
  }
  pricing?: EventPricing
  onboardingStatus?: EventRecord['onboardingStatus']
  timeline?: EventRecord['timeline']
  phases?: EventPhase[]
}

interface UnifiedEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (eventData: EventData) => Promise<void>
  enquiry?: EnquiryRecord | null
  existingEvent?: EventData | null
  services: Service[]
}

const CONTACT_METHODS: Record<ContactMethod, string> = {
  Email: 'Email',
  Phone: 'Phone',
  WhatsApp: 'WhatsApp',
}

export default function UnifiedEventModal({
  isOpen,
  onClose,
  onSave,
  enquiry,
  existingEvent,
  services
}: UnifiedEventModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true) // Track initial data loading
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [eventData, setEventData] = useState<EventData>({
    title: '',
    category: 'weddings',
    venue: '',
    city: '',
    description: '',
    image: '',
    packageType: 'Essentials',
    eventDate: '',
    services: [], // Provide default empty array to prevent undefined errors
    clientInfo: {
      name: '',
      email: '',
      phone: '',
      contactMethod: 'Email'
    },
    onboardingStatus: 'inquiry',
    timeline: {
      eventDate: '',
      depositDue: '',
      midPaymentDue: '',
      finalPaymentDue: ''
    },
    phases: [
      {
        name: "Booking Secured",
        status: "pending",
        checklist: ["Contract signed", "Deposit received"]
      },
      {
        name: "Planning & Supplier Management",
        status: "pending",
        checklist: ["Venue confirmed", "Supplier quotes approved"]
      },
      {
        name: "Day-of Coordination",
        status: "pending",
        checklist: ["Timeline finalized", "Staff briefed", "Equipment ready"]
      },
      {
        name: "Event Execution",
        status: "pending",
        checklist: ["Event completed successfully", "Client feedback collected"]
      },
      {
        name: "Post-Event Follow-up",
        status: "pending",
        checklist: ["Final payment received", "Thank you notes sent"]
      }
    ]
  })

  // Pre-populate from enquiry or existing event
  useEffect(() => {
    setIsInitialLoad(true) // Set loading state while initializing data

    if (enquiry) {
      // Pre-populate from enquiry
      setEventData({
        title: `${enquiry.name}'s ${enquiry.eventType}`,
        category: enquiry.eventType,
        venue: 'To be determined',
        city: '',
        description: enquiry.message,
        image: '',
        packageType: 'Essentials',
        eventDate: enquiry.eventDate || '',
        services: [], // Explicitly set empty array
        clientInfo: {
          name: enquiry.name,
          email: enquiry.email,
          phone: enquiry.phone,
          contactMethod: 'Email'
        },
        onboardingStatus: 'inquiry',
        timeline: {
          eventDate: enquiry.eventDate || '',
          depositDue: '',
          midPaymentDue: '',
          finalPaymentDue: ''
        },
        phases: [
          {
            name: "Booking Secured",
            status: "pending",
            checklist: ["Contract signed", "Deposit received"]
          },
          {
            name: "Planning & Supplier Management",
            status: "pending",
            checklist: ["Venue confirmed", "Supplier quotes approved"]
          },
          {
            name: "Day-of Coordination",
            status: "pending",
            checklist: ["Timeline finalized", "Staff briefed", "Equipment ready"]
          },
          {
            name: "Event Execution",
            status: "pending",
            checklist: ["Event completed successfully", "Client feedback collected"]
          },
          {
            name: "Post-Event Follow-up",
            status: "pending",
            checklist: ["Final payment received", "Thank you notes sent"]
          }
        ]
      })
    } else if (existingEvent) {
      // Load existing event data
      setEventData(existingEvent)
    } else {
      // Reset for manual creation
      setEventData({
        title: '',
        category: 'weddings',
        venue: '',
        city: '',
        description: '',
        image: '',
        packageType: 'Essentials',
        eventDate: '',
        services: [], // Explicitly set empty array
        clientInfo: {
          name: '',
          email: '',
          phone: '',
          contactMethod: 'Email'
        },
        onboardingStatus: 'inquiry',
        timeline: {
          eventDate: '',
          depositDue: '',
          midPaymentDue: '',
          finalPaymentDue: ''
        },
        phases: [
          {
            name: "Booking Secured",
            status: "pending",
            checklist: ["Contract signed", "Deposit received"]
          },
          {
            name: "Planning & Supplier Management",
            status: "pending",
            checklist: ["Venue confirmed", "Supplier quotes approved"]
          },
          {
            name: "Day-of Coordination",
            status: "pending",
            checklist: ["Timeline finalized", "Staff briefed", "Equipment ready"]
          },
          {
            name: "Event Execution",
            status: "pending",
            checklist: ["Event completed successfully", "Client feedback collected"]
          },
          {
            name: "Post-Event Follow-up",
            status: "pending",
            checklist: ["Final payment received", "Thank you notes sent"]
          }
        ]
      })
    }
    setErrors({})
    // Small delay to allow state to settle before allowing calculations
    setTimeout(() => setIsInitialLoad(false), 100)
  }, [enquiry, existingEvent, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Overview validation
    if (!eventData.title.trim()) {
      newErrors.title = 'Event title is required'
    }
    if (!eventData.venue.trim()) {
      newErrors.venue = 'Venue is required'
    }
    if (!eventData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    // Client info validation
    if (!eventData.clientInfo.name.trim()) {
      newErrors.clientName = 'Client name is required'
    }
    if (!eventData.clientInfo.email.trim()) {
      newErrors.clientEmail = 'Client email is required'
    }
    if (!eventData.clientInfo.phone.trim()) {
      newErrors.clientPhone = 'Client phone is required'
    }

    // Timeline validation
    if (!eventData.eventDate) {
      newErrors.eventDate = 'Event date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getDefaultServicesForPackage = (packageType: PackageType): Service[] => {
    const packageServices: Record<PackageType, string[]> = {
      'Essentials': ['venue-coordination', 'day-coordination'],
      'Complete': ['full-planning', 'modern-british-menu', 'decor-floral'],
      'Luxury': ['full-planning', 'modern-british-menu', 'decor-floral', 'av-lighting', 'photography']
    }

    const serviceIds = packageServices[packageType] || []
    return services.filter(service => serviceIds.includes(service.id))
  }

  const handlePackageTypeChange = (packageType: PackageType) => {
    const defaultServices = getDefaultServicesForPackage(packageType)

    const servicesWithDetails: EventService[] = defaultServices.map(service => ({
      id: service.id,
      name: service.name,
      type: service.category,
      description: service.description,
      supplierCost: service.baseCost,
      quantity: 1,
      totalCost: service.baseCost
    }))

    setEventData(prev => ({
      ...prev,
      packageType,
      services: servicesWithDetails
    }))
  }

  const handleAddCustomService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (!service) return

    const newService = {
      id: service.id,
      name: service.name,
      type: service.category,
      description: service.description,
      supplierCost: service.baseCost,
      quantity: 1,
      totalCost: service.baseCost
    }

    setEventData(prev => ({
      ...prev,
      services: [...prev.services, newService]
    }))
  }

  const handleRemoveService = (serviceId: string) => {
    setEventData(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== serviceId)
    }))
  }

  const handleUpdateServiceQuantity = (serviceId: string, quantity: number) => {
    if (quantity < 1) return

    setEventData(prev => ({
      ...prev,
      services: prev.services.map(s =>
        s.id === serviceId
          ? { ...s, quantity, totalCost: s.supplierCost * quantity }
          : s
      )
    }))
  }

  const calculatePricing = () => {
    // Guard against undefined data during initial render
    if (!eventData || !eventData.packageType || !eventData.services) {
      return {
        baseCost: 0,
        servicesCost: 0,
        subtotal: 0,
        markupRate: 0,
        markupAmount: 0,
        total: 0,
        depositAmount: 0,
        midPayment: 0,
        finalPayment: 0
      }
    }

    const packagePrices: Record<string, number> = {
      'Essentials': 5000,
      'Complete': 8500,
      'Luxury': 12000
    }

    const baseCost = packagePrices[eventData.packageType] || 0
    const servicesCost = eventData.services.reduce((total, service) => total + service.totalCost, 0)
    const subtotal = baseCost + servicesCost
    const markupRate = PACKAGE_TYPE_CONFIG[eventData.packageType]?.markup || 0.3 // Default to 30% if undefined
    const markupAmount = subtotal * markupRate
    const total = subtotal + markupAmount

    return {
      baseCost,
      servicesCost,
      subtotal,
      markupRate,
      markupAmount,
      total,
      depositAmount: total * 0.3,
      midPayment: total * 0.4,
      finalPayment: total * 0.3
    }
  }

  const updateTimelineDates = () => {
    if (!eventData.eventDate) return

    const eventDate = new Date(eventData.eventDate)
    const depositDue = new Date(eventDate)
    depositDue.setDate(depositDue.getDate() - 30) // 30 days before event

    const midPaymentDue = new Date(eventDate)
    midPaymentDue.setDate(midPaymentDue.getDate() - 14) // 14 days before event

    const finalPaymentDue = new Date(eventDate)
    finalPaymentDue.setDate(finalPaymentDue.getDate() + 7) // 7 days after event

    setEventData(prev => ({
      ...prev,
      timeline: {
        eventDate: eventData.eventDate,
        depositDue: depositDue.toISOString().split('T')[0],
        midPaymentDue: midPaymentDue.toISOString().split('T')[0],
        finalPaymentDue: finalPaymentDue.toISOString().split('T')[0]
      }
    }))
  }

  useEffect(() => {
    if (eventData.eventDate) {
      updateTimelineDates()
    }
  }, [eventData.eventDate])

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before saving.',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      const pricing = calculatePricing()

      const finalEventData: EventData = {
        ...eventData,
        id: eventData.id ?? createEventId(eventData.title),
        pricing: {
          packageType: eventData.packageType,
          baseCost: pricing.baseCost,
          markup: pricing.markupRate,
          totalPrice: pricing.total,
          depositAmount: pricing.depositAmount,
          midPayment: pricing.midPayment,
          finalPayment: pricing.finalPayment
        },
        timeline: eventData.timeline
      }

      await onSave(finalEventData)
      onClose()
    } catch (error) {
      console.error('Error saving event:', error)
      toast({
        title: 'Error',
        description: 'Failed to save event. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const pricing = calculatePricing()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {existingEvent ? 'Edit Event' : enquiry ? 'Convert Enquiry to Event' : 'Create New Event'}
          </DialogTitle>
          <DialogDescription>
            {existingEvent ? 'Update event details and configuration' :
             enquiry ? `Converting enquiry from ${enquiry.name}` :
             'Create a comprehensive event with all planning details'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Overview Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Overview</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={eventData.title}
                  onChange={(e) => setEventData(prev => ({...prev, title: e.target.value}))}
                  placeholder="Enter event title"
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={eventData.category}
                  onValueChange={(value: 'weddings' | 'corporate' | 'decor' | 'all') =>
                    setEventData(prev => ({...prev, category: value}))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EVENT_CATEGORY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="packageType">Package Type</Label>
                <Select
                  value={eventData.packageType}
                  onValueChange={handlePackageTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PACKAGE_TYPE_CONFIG).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label} ({(config.markup * 100).toFixed(0)}% markup)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue *</Label>
                <Input
                  id="venue"
                  value={eventData.venue}
                  onChange={(e) => setEventData(prev => ({...prev, venue: e.target.value}))}
                  placeholder="Enter venue name"
                  className={errors.venue ? 'border-destructive' : ''}
                />
                {errors.venue && <p className="text-sm text-destructive">{errors.venue}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={eventData.city}
                  onChange={(e) => setEventData(prev => ({...prev, city: e.target.value}))}
                  placeholder="Enter city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventDate">Event Date *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventData.eventDate}
                  onChange={(e) => setEventData(prev => ({...prev, eventDate: e.target.value}))}
                  className={errors.eventDate ? 'border-destructive' : ''}
                />
                {errors.eventDate && <p className="text-sm text-destructive">{errors.eventDate}</p>}
              </div>

              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={eventData.image}
                  onChange={(e) => setEventData(prev => ({...prev, image: e.target.value}))}
                  placeholder="Enter image URL (optional)"
                />
              </div>

              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={eventData.description}
                  onChange={(e) => setEventData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Enter event description"
                  rows={3}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Client Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Client Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={eventData.clientInfo.name}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    clientInfo: {...prev.clientInfo, name: e.target.value}
                  }))}
                  placeholder="Enter client name"
                  className={errors.clientName ? 'border-destructive' : ''}
                />
                {errors.clientName && <p className="text-sm text-destructive">{errors.clientName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={eventData.clientInfo.email}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    clientInfo: {...prev.clientInfo, email: e.target.value}
                  }))}
                  placeholder="Enter email address"
                  className={errors.clientEmail ? 'border-destructive' : ''}
                />
                {errors.clientEmail && <p className="text-sm text-destructive">{errors.clientEmail}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientPhone">Phone *</Label>
                <Input
                  id="clientPhone"
                  value={eventData.clientInfo.phone}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    clientInfo: {...prev.clientInfo, phone: e.target.value}
                  }))}
                  placeholder="Enter phone number"
                  className={errors.clientPhone ? 'border-destructive' : ''}
                />
                {errors.clientPhone && <p className="text-sm text-destructive">{errors.clientPhone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactMethod">Preferred Contact</Label>
                <Select
                  value={eventData.clientInfo.contactMethod}
                  onValueChange={(value: 'Email' | 'Phone' | 'WhatsApp') =>
                    setEventData(prev => ({
                      ...prev,
                      clientInfo: {...prev.clientInfo, contactMethod: value}
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONTACT_METHODS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Services</h3>
              </div>
              <div className="flex gap-2">
                <Select onValueChange={handleAddCustomService}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Add service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services
                      .filter(service => !eventData.services.some(s => s.id === service.id))
                      .map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - £{service.baseCost.toLocaleString()}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              {eventData.services.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No services selected. Add services above or change package type.</p>
                </div>
              ) : (
                eventData.services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{service.name}</h4>
                        <Badge variant="outline" className="text-xs">{service.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Unit: {service.quantity}</span>
                        <span>Cost per unit: £{service.supplierCost.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateServiceQuantity(service.id, service.quantity - 1)}
                          disabled={service.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{service.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateServiceQuantity(service.id, service.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <div className="font-medium">£{service.totalCost.toLocaleString()}</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveService(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Pricing & Payments</h3>
            </div>

            {isInitialLoad ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center py-8">
                    <div className="text-muted-foreground">Loading pricing data...</div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Package ({eventData.packageType}):</span>
                      <span>£{pricing.baseCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Additional Services:</span>
                      <span>£{pricing.servicesCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>Subtotal:</span>
                      <span>£{pricing.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Markup ({(PACKAGE_TYPE_CONFIG[eventData.packageType]?.markup * 100 || 30).toFixed(0)}%):</span>
                      <span>£{pricing.markupAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total Price:</span>
                      <span>£{pricing.total.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Deposit (30%)</div>
                        <div className="font-medium">£{pricing.depositAmount.toLocaleString()}</div>
                        {eventData.timeline?.depositDue && (
                          <div className="text-xs text-muted-foreground">
                            Due: {new Date(eventData.timeline.depositDue).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Mid Payment (40%)</div>
                        <div className="font-medium">£{pricing.midPayment.toLocaleString()}</div>
                        {eventData.timeline?.midPaymentDue && (
                          <div className="text-xs text-muted-foreground">
                            Due: {new Date(eventData.timeline.midPaymentDue).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Final Payment (30%)</div>
                        <div className="font-medium">£{pricing.finalPayment.toLocaleString()}</div>
                        {eventData.timeline?.finalPaymentDue && (
                          <div className="text-xs text-muted-foreground">
                            Due: {new Date(eventData.timeline.finalPaymentDue).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Timeline Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Timeline & Phases</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Event Date</div>
                  <div className="text-sm text-muted-foreground">
                    {eventData.eventDate ? new Date(eventData.eventDate).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Not set'}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Event Phases</h4>
                {eventData.phases?.map((phase, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className={`mt-1 w-4 h-4 rounded-full flex items-center justify-center ${
                      phase.status === 'completed' ? 'bg-green-500' : 'bg-muted'
                    }`}>
                      {phase.status === 'completed' && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-medium">{phase.name}</h5>
                        <Badge variant={phase.status === 'completed' ? 'default' : 'secondary'}>
                          {phase.status}
                        </Badge>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {phase.checklist.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"></div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : existingEvent ? 'Update Event' : 'Create Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
