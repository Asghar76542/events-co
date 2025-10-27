'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
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
  SelectValue
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  ArrowLeft,
  Save,
  CreditCard,
  CheckCircle,
  Clock,
  MapPin,
  DollarSign
} from 'lucide-react'
import Image from 'next/image'

interface Event {
  id: string
  venue: string
  city: string
  category: 'weddings' | 'corporate' | 'decor' | 'all'
  image: string
  title: string
  description: string
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
    email?: string;
    phone?: string;
    contactMethod?: "Email" | "Phone" | "WhatsApp";
  };
  timeline?: {
    eventDate?: string;
    depositDue?: string;
    midPaymentDue?: string;
    finalPaymentDue?: string;
  };
  phases?: Array<{
    name: string;
    status: "pending" | "completed";
    checklist: string[];
  }>;
}

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  baseCost: number;
  unit: string;
}

const CATEGORIES = {
  weddings: 'Weddings',
  corporate: 'Corporate',
  decor: 'Decor',
  all: 'All'
} as const

const PACKAGE_TYPES = {
  'Essentials': { label: 'Essentials', markup: 0.30 },
  'Complete': { label: 'Complete', markup: 0.32 },
  'Luxury': { label: 'Luxury', markup: 0.35 }
} as const

const ONBOARDING_STATUSES = {
  inquiry: 'Inquiry',
  deposit_paid: 'Deposit Paid',
  planning: 'Planning',
  finalized: 'Finalized',
  executed: 'Executed',
  completed: 'Completed'
} as const

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [activeTab, setActiveTab] = useState('events')

  // Form state for editing
  const [editEvent, setEditEvent] = useState<Event | null>(null)

  const eventId = params.id as string

  useEffect(() => {
    fetchEvent()
    fetchServices()
  }, [eventId])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/events/${eventId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch event')
      }

      const data = await response.json()
      setEvent(data)
      setEditEvent(data)
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to fetch event',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (err) {
      console.error('Failed to fetch services:', err)
    }
  }

  const handleSave = async () => {
    if (!editEvent) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editEvent),
      })

      if (!response.ok) {
        throw new Error('Failed to update event')
      }

      setEvent(editEvent)
      toast({
        title: 'Success',
        description: 'Event updated successfully',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update event',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const updatePricing = async () => {
    if (!editEvent?.services) return

    try {
      const pricingRequest = {
        services: editEvent.services.map(s => ({ id: s.id, quantity: s.quantity })),
        packageType: editEvent.pricing?.packageType || 'Complete',
        guestCount: 100 // Default guest count
      }

      const response = await fetch(`/api/admin/events/${eventId}/pricing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pricingRequest),
      })

      if (response.ok) {
        const pricing = await response.json()
        setEditEvent(prev => prev ? {
          ...prev,
          pricing: {
            ...pricing,
            packageType: pricingRequest.packageType
          }
        } : null)
      }
    } catch (err) {
      console.error('Failed to update pricing:', err)
    }
  }

  const updateOnboarding = async (updates: any) => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/onboarding`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await fetchEvent() // Refresh data
        toast({
          title: 'Success',
          description: 'Onboarding updated successfully',
        })
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update onboarding',
        variant: 'destructive',
      })
    }
  }

  const updatePhase = async (phaseIndex: number, status: 'pending' | 'completed') => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/onboarding`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phaseIndex, status }),
      })

      if (response.ok) {
        await fetchEvent() // Refresh data
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update phase',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!event || !editEvent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">Event not found</p>
        <Button onClick={() => router.push('/admin/events')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/events')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{event.venue}, {event.city}</span>
              <Badge variant="secondary">{CATEGORIES[event.category]}</Badge>
            </div>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Event Image */}
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editEvent.title}
                    onChange={(e) => setEditEvent({...editEvent, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={editEvent.category}
                    onValueChange={(value: string) => setEditEvent({...editEvent, category: value as Event['category']})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weddings">Weddings</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="decor">Decor</SelectItem>
                      <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    value={editEvent.venue}
                    onChange={(e) => setEditEvent({...editEvent, venue: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={editEvent.city}
                    onChange={(e) => setEditEvent({...editEvent, city: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editEvent.description}
                  onChange={(e) => setEditEvent({...editEvent, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={editEvent.image}
                  onChange={(e) => setEditEvent({...editEvent, image: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={editEvent.clientInfo?.name || ''}
                    onChange={(e) => setEditEvent({
                      ...editEvent,
                      clientInfo: {
                        ...editEvent.clientInfo,
                        name: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={editEvent.clientInfo?.email || ''}
                    onChange={(e) => setEditEvent({
                      ...editEvent,
                      clientInfo: {
                        ...editEvent.clientInfo,
                        name: editEvent.clientInfo?.name || '',
                        email: e.target.value,
                        contactMethod: editEvent.clientInfo?.contactMethod || 'Email'
                      }
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Phone</Label>
                  <Input
                    id="clientPhone"
                    value={editEvent.clientInfo?.phone || ''}
                    onChange={(e) => setEditEvent({
                      ...editEvent,
                      clientInfo: {
                        ...editEvent.clientInfo,
                        name: editEvent.clientInfo?.name || '',
                        phone: e.target.value,
                        contactMethod: editEvent.clientInfo?.contactMethod || 'Email'
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactMethod">Preferred Contact Method</Label>
                  <Select
                    value={editEvent.clientInfo?.contactMethod || 'Email'}
                    onValueChange={(value: string) => setEditEvent({
                      ...editEvent,
                      clientInfo: {
                        ...editEvent.clientInfo,
                        name: editEvent.clientInfo?.name || '',
                        email: editEvent.clientInfo?.email || '',
                        phone: editEvent.clientInfo?.phone || '',
                        contactMethod: value as 'Email' | 'Phone' | 'WhatsApp'
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Phone">Phone</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Event Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Event Date</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={editEvent.timeline?.eventDate || ''}
                    onChange={(e) => setEditEvent({
                      ...editEvent,
                      timeline: {
                        ...editEvent.timeline,
                        eventDate: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onboardingStatus">Onboarding Status</Label>
                  <Select
                    value={editEvent.onboardingStatus || 'inquiry'}
                    onValueChange={(value: string) => setEditEvent({
                      ...editEvent,
                      onboardingStatus: value as Event['onboardingStatus']
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ONBOARDING_STATUSES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="depositDue">Deposit Due</Label>
                  <Input
                    id="depositDue"
                    type="date"
                    value={editEvent.timeline?.depositDue || ''}
                    onChange={(e) => setEditEvent({
                      ...editEvent,
                      timeline: {
                        ...editEvent.timeline,
                        depositDue: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="midPaymentDue">Mid Payment Due</Label>
                  <Input
                    id="midPaymentDue"
                    type="date"
                    value={editEvent.timeline?.midPaymentDue || ''}
                    onChange={(e) => setEditEvent({
                      ...editEvent,
                      timeline: {
                        ...editEvent.timeline,
                        midPaymentDue: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="finalPaymentDue">Final Payment Due</Label>
                  <Input
                    id="finalPaymentDue"
                    type="date"
                    value={editEvent.timeline?.finalPaymentDue || ''}
                    onChange={(e) => setEditEvent({
                      ...editEvent,
                      timeline: {
                        ...editEvent.timeline,
                        finalPaymentDue: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Package</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="packageType">Package Type</Label>
                  <Select
                    value={editEvent.pricing?.packageType || 'Complete'}
                    onValueChange={(value: string) => {
                        const packageType = value as 'Essentials' | 'Complete' | 'Luxury'
                        setEditEvent({
                          ...editEvent,
                          pricing: {
                            ...editEvent.pricing,
                            packageType,
                            baseCost: editEvent.pricing?.baseCost || 0,
                            markup: editEvent.pricing?.markup || 0.32,
                            totalPrice: editEvent.pricing?.totalPrice || 0,
                            depositAmount: editEvent.pricing?.depositAmount || 0,
                            midPayment: editEvent.pricing?.midPayment || 0,
                            finalPayment: editEvent.pricing?.finalPayment || 0
                          }
                        })
                        // Update pricing calculation after a brief delay
                        setTimeout(updatePricing, 100)
                      }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PACKAGE_TYPES).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label} ({(config.markup * 100).toFixed(0)}% markup)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Current Package Markup</Label>
                  <div className="p-3 bg-muted rounded-md">
                    {((editEvent.pricing?.markup || 0.32) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {editEvent.pricing && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Base Cost</Label>
                    <div className="p-3 bg-muted rounded-md font-mono">
                      £{editEvent.pricing.baseCost.toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Total Price</Label>
                    <div className="p-3 bg-primary/10 rounded-md font-mono text-lg font-bold">
                      £{editEvent.pricing.totalPrice.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {editEvent.pricing && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Deposit (30%)</Label>
                    <div className="p-3 bg-green-50 rounded-md font-mono">
                      £{editEvent.pricing.depositAmount.toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Mid Payment (40%)</Label>
                    <div className="p-3 bg-blue-50 rounded-md font-mono">
                      £{editEvent.pricing.midPayment.toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Final Payment (30%)</Label>
                    <div className="p-3 bg-red-50 rounded-md font-mono">
                      £{editEvent.pricing.finalPayment.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={updatePricing} variant="outline">
                <CreditCard className="mr-2 h-4 w-4" />
                Recalculate Pricing
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onboarding Tab */}
        <TabsContent value="onboarding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {event.phases?.map((phase, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {phase.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <h4 className="font-medium">{phase.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {phase.checklist.length} items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={phase.status === 'completed' ? 'default' : 'secondary'}>
                        {phase.status === 'completed' ? 'Complete' : 'Pending'}
                      </Badge>
                      <Select
                        value={phase.status}
                        onValueChange={(value: string) => updatePhase(index, value as 'pending' | 'completed')}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Complete</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Progress Summary</h4>
                {event.phases && (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {event.phases.filter(p => p.status === 'completed').length}
                      </div>
                      <div className="text-muted-foreground">Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {event.phases.filter(p => p.status === 'pending').length}
                      </div>
                      <div className="text-muted-foreground">Pending</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {event.phases.length}
                      </div>
                      <div className="text-muted-foreground">Total</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Phase Details */}
          {event.phases?.map((phase, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {phase.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-400" />
                  )}
                  {phase.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h5 className="font-medium">Checklist:</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {phase.checklist.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selected Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {editEvent.services?.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="outline">{service.type}</Badge>
                        <span className="text-sm">Unit Cost: £{service.supplierCost}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`quantity-${index}`} className="text-sm">Qty:</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          min="1"
                          value={service.quantity}
                          onChange={(e) => {
                            const newServices = [...editEvent.services!]
                            newServices[index] = {
                              ...newServices[index],
                              quantity: parseInt(e.target.value) || 1,
                              totalCost: (parseInt(e.target.value) || 1) * service.supplierCost
                            }
                            setEditEvent({
                              ...editEvent,
                              services: newServices
                            })
                          }}
                          className="w-20"
                        />
                      </div>
                      <div className="text-right">
                        <div className="font-medium">£{service.totalCost.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Total</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Service */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Label>Add Service</Label>
                </div>
                <Select
                  onValueChange={(serviceId: string) => {
                    const service = services.find(s => s.id === serviceId)
                    if (service && editEvent.services) {
                      const newService = {
                        id: service.id,
                        name: service.name,
                        type: service.category,
                        description: service.description,
                        supplierCost: service.baseCost,
                        quantity: 1,
                        totalCost: service.baseCost
                      }
                      setEditEvent({
                        ...editEvent,
                        services: [...editEvent.services, newService]
                      })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {services
                      .filter(service => !editEvent.services?.some(s => s.id === service.id))
                      .map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - £{service.baseCost} ({service.unit})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Services Summary */}
              {editEvent.services && editEvent.services.length > 0 && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Services Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-lg font-bold">
                        £{editEvent.services.reduce((sum, s) => sum + s.totalCost, 0).toLocaleString()}
                      </div>
                      <div className="text-muted-foreground">Total Service Cost</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">
                        {editEvent.services.length}
                      </div>
                      <div className="text-muted-foreground">Services Selected</div>
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={updatePricing} variant="outline">
                <DollarSign className="mr-2 h-4 w-4" />
                Update Pricing Based on Services
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}