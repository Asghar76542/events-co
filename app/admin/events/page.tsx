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

export default function AdminEvents() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { toast } = useToast()
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: '',
    venue: '',
    city: '',
    category: 'weddings',
    image: '',
    description: '',
    onboardingStatus: 'inquiry',
  })

  const resetNewEvent = () =>
    setNewEvent({
      title: '',
      venue: '',
      city: '',
      category: 'weddings',
      image: '',
      description: '',
      onboardingStatus: 'inquiry',
    })

  const handleAddDialogChange = (open: boolean) => {
    setIsAddDialogOpen(open)
    if (!open) {
      resetNewEvent()
    }
  }

  const makeEventId = (title: string) =>
    `${title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'event'}-${Date.now()}`

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


  const handleEdit = async (event: Event) => {
    try {
      const response = await fetch('/api/admin/events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })

      if (!response.ok) {
        throw new Error('Failed to update event')
      }

      await fetchEvents()
      setIsEditDialogOpen(false)
      setEditingEvent(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event')
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

  const handleAdd = async () => {
    try {
      if (!newEvent.title || !newEvent.venue || !newEvent.city) {
        toast({
          title: 'Missing information',
          description: 'Title, venue, and city are required to create an event.',
          variant: 'destructive',
        })
        return
      }

      const payload = {
        ...newEvent,
        id: makeEventId(newEvent.title),
      }

      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to create event')
      }

      await fetchEvents()
      setIsAddDialogOpen(false)
      resetNewEvent()
      toast({
        title: 'Event created',
        description: `"${newEvent.title}" has been added to your portfolio.`,
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create event',
        variant: 'destructive',
      })
      setError(err instanceof Error ? err.message : 'Failed to create event')
    }
  }

  useEffect(() => {
    fetchEvents()
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
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
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
                      {CATEGORIES[event.category]}
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
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation()
                        setEditingEvent(event)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation()
                        router.push(`/admin/events/${event.id}`)
                      }}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      View
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
          {Object.entries(PACKAGE_TYPES).map(([packageType, config]) => {
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
          {Object.entries(ONBOARDING_STATUSES).map(([status, label]) => {
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Make changes to the event details below.
            </DialogDescription>
          </DialogHeader>
          {editingEvent && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="venue" className="text-right">
                  Venue
                </Label>
                <Input
                  id="venue"
                  value={editingEvent.venue}
                  onChange={(e) => setEditingEvent({...editingEvent, venue: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="city" className="text-right">
                  City
                </Label>
                <Input
                  id="city"
                  value={editingEvent.city}
                  onChange={(e) => setEditingEvent({...editingEvent, city: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select
                  value={editingEvent.category}
                  onValueChange={(value: Event['category']) => setEditingEvent({...editingEvent, category: value})}
                >
                  <SelectTrigger className="col-span-3">
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="image"
                  value={editingEvent.image}
                  onChange={(e) => setEditingEvent({...editingEvent, image: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                  className="col-span-3"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={() => editingEvent && handleEdit(editingEvent)}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={handleAddDialogChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Create a new event for your portfolio.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-title" className="text-right">
                Title
              </Label>
              <Input
                id="new-title"
                className="col-span-3"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-venue" className="text-right">
                Venue
              </Label>
              <Input
                id="new-venue"
                className="col-span-3"
                value={newEvent.venue}
                onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-city" className="text-right">
                City
              </Label>
              <Input
                id="new-city"
                className="col-span-3"
                value={newEvent.city}
                onChange={(e) => setNewEvent({ ...newEvent, city: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-category" className="text-right">
                Category
              </Label>
              <Select
                value={newEvent.category}
                onValueChange={(value: Event['category']) => setNewEvent({ ...newEvent, category: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weddings">Weddings</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="decor">Decor</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-image" className="text-right">
                Image URL
              </Label>
              <Input
                id="new-image"
                className="col-span-3"
                value={newEvent.image}
                onChange={(e) => setNewEvent({ ...newEvent, image: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="new-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="new-description"
                className="col-span-3"
                rows={3}
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAdd}>
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
