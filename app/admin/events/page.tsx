'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  RefreshCw,
  Search,
  Eye,
  Calendar,
  Users,
  CreditCard,
  CheckCircle,
  Clock,
  User,
  Phone,
  Mail,
  Package,
  DollarSign,
  ListChecks
} from 'lucide-react'
import Image from 'next/image'
import UnifiedEventModal from '@/components/unified-event-modal'
import {
  EVENT_CATEGORY_LABELS,
  EventRecord,
  PACKAGE_TYPE_CONFIG,
  Service,
} from '@/lib/domain/events'

type Event = EventRecord

export default function AdminEvents() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [isUnifiedModalOpen, setIsUnifiedModalOpen] = useState(false)
  const { toast } = useToast()


  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/events')

      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }

      const data = await response.json()
      setEvents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services')
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }
      const data = await response.json()
      setServices(data)
    } catch (err) {
      console.error('Failed to fetch services:', err)
    }
  }



  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('/api/admin/events', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      await fetchEvents()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event')
    }
  }

  const handleCreateEvent = async (eventData: any) => {
    try {
      const isEditing = editingEvent !== null
      const method = isEditing ? 'PUT' : 'POST'
      const body = isEditing ? { ...eventData, id: editingEvent.id } : eventData

      const response = await fetch('/api/admin/events', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} event`)
      }

      await fetchEvents()
      setIsUnifiedModalOpen(false)
      setEditingEvent(null)
      toast({
        title: `Event ${isEditing ? 'updated' : 'created'}`,
        description: `"${eventData.title}" has been ${isEditing ? 'updated' : 'added to your portfolio'}.`,
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : `Failed to ${editingEvent ? 'update' : 'create'} event`,
        variant: 'destructive',
      })
      setError(err instanceof Error ? err.message : `Failed to ${editingEvent ? 'update' : 'create'} event`)
    }
  }

  useEffect(() => {
    fetchEvents()
    fetchServices()
  }, [])

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">Error: {error}</p>
        <Button onClick={fetchEvents} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Manage your event portfolio
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchEvents} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => {
            setEditingEvent(null)
            setIsUnifiedModalOpen(true)
          }} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, venue, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="weddings">Weddings</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="decor">Decor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Interface */}
      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        {/* Events Tab - Current Grid View */}
        <TabsContent value="events" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative aspect-video">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">
                      {EVENT_CATEGORY_LABELS[event.category]}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                    <Button
                      className="opacity-0 hover:opacity-100 transition-opacity"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation()
                        // Navigate to event detail page
                        router.push(`/admin/events/${event.id}`)
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-3 w-3" />
                        {event.venue}, {event.city}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation()
                        setEditingEvent(event)
                        setIsUnifiedModalOpen(true)
                      }}
                    >
                      <Package className="mr-1 h-3 w-3" />
                      Manage Event
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Event</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{event.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(event.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Pricing Tab - Group by Package Types */}
        <TabsContent value="pricing" className="space-y-6">
          {Object.entries(PACKAGE_TYPE_CONFIG).map(([packageType, config]) => {
            const packageEvents = filteredEvents.filter(event =>
              event.pricing?.packageType === packageType
            )

            if (packageEvents.length === 0) return null

            return (
              <Card key={packageType}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {config.label} Package ({config.markup * 100}% markup)
                  </CardTitle>
                  <p className="text-muted-foreground">
                    {packageEvents.length} event{packageEvents.length !== 1 ? 's' : ''}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {packageEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/admin/events/${event.id}`)}>
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                            <Image
                              src={event.image}
                              alt={event.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {event.venue}, {event.city}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-3 w-3" />
                              {event.clientInfo?.name || 'No client'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            £{event.pricing?.totalPrice?.toLocaleString() || '0'}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Price</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            £{event.pricing?.depositAmount?.toLocaleString() || '0'} deposit
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        {/* Onboarding Tab - Group by Status */}
        <TabsContent value="onboarding" className="space-y-6">
          {Object.entries(ONBOARDING_STATUS_LABELS).map(([status, label]) => {
            const statusEvents = filteredEvents.filter(event =>
              event.onboardingStatus === status
            )

            if (statusEvents.length === 0) return null

            return (
              <Card key={status}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListChecks className="h-5 w-5" />
                    {label} Status
                  </CardTitle>
                  <p className="text-muted-foreground">
                    {statusEvents.length} event{statusEvents.length !== 1 ? 's' : ''}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statusEvents.map((event) => {
                      const completedPhases = event.phases?.filter(p => p.status === 'completed').length || 0
                      const totalPhases = event.phases?.length || 0
                      const progress = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0

                      return (
                        <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/admin/events/${event.id}`)}>
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                              <Image
                                src={event.image}
                                alt={event.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium">{event.title}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {event.venue}, {event.city}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {event.timeline?.eventDate || 'No date set'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="text-sm">
                              <div className="font-medium">{completedPhases}/{totalPhases} phases</div>
                              <div className="w-24 bg-muted rounded-full h-2 mt-1">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                            <Badge variant={status === 'completed' ? 'default' : status === 'finalized' ? 'secondary' : 'outline'}>
                              {label}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        {/* Services Tab - Show Services Overview */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Services Overview
              </CardTitle>
              <p className="text-muted-foreground">
                Events grouped by their selected services
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/admin/events/${event.id}`)}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                          <Image
                            src={event.image}
                            alt={event.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {event.venue}, {event.city}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {event.services?.length || 0} services
                      </Badge>
                    </div>

                    {event.services && event.services.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {event.services.slice(0, 4).map((service, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {service.name}
                            </Badge>
                          ))}
                          {event.services.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{event.services.length - 4} more
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Service Cost: £{event.services.reduce((sum, s) => sum + s.totalCost, 0).toLocaleString()}
                        </div>
                      </div>
                    )}

                    {(!event.services || event.services.length === 0) && (
                      <div className="text-sm text-muted-foreground italic">
                        No services selected
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>


      {/* Unified Event Modal */}
      <UnifiedEventModal
        isOpen={isUnifiedModalOpen}
        onClose={() => {
          setIsUnifiedModalOpen(false)
          setEditingEvent(null)
        }}
        onSave={handleCreateEvent}
        existingEvent={editingEvent as any}
        services={services}
      />
    </div>
  )
}
