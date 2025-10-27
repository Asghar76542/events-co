'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
  Search,
  ArrowRight,
  Eye,
  User,
  MapPin,
  FileText,
  DollarSign
} from 'lucide-react'
import UnifiedEventModal from '@/components/unified-event-modal'

interface Enquiry {
  id: string
  name: string
  email: string
  phone: string
  eventDate: string
  eventType: string
  message: string
  timestamp: string
}

interface Service {
  id: string
  name: string
  category: string
  description: string
  baseCost: number
  unit: string
}

interface EventConversionData {
  title: string
  category: 'weddings' | 'corporate' | 'decor' | 'all'
  packageType: 'Essentials' | 'Complete' | 'Luxury'
  eventDate: string
  venue: string
  description: string
  services: Array<{
    id: string
    name: string
    type: string
    description: string
    supplierCost: number
    quantity: number
    totalCost: number
  }>
}

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState('all')
  const [editingEnquiry, setEditingEnquiry] = useState<Enquiry | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false)
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
  const [convertingEnquiry, setConvertingEnquiry] = useState<Enquiry | null>(null)
  const [isUnifiedModalOpen, setIsUnifiedModalOpen] = useState(false)
  const [newEnquiry, setNewEnquiry] = useState<Omit<Enquiry, 'id' | 'timestamp'>>({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    eventType: 'weddings',
    message: '',
  })
  const [conversionData, setConversionData] = useState<EventConversionData>({
    title: '',
    category: 'weddings',
    packageType: 'Essentials',
    eventDate: '',
    venue: '',
    description: '',
    services: []
  })
  const { toast } = useToast()

  const handleFetchError = (err: unknown) => {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred'
    setError(errorMessage)
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    })
  }

  const resetNewEnquiry = () =>
    setNewEnquiry({
      name: '',
      email: '',
      phone: '',
      eventDate: '',
      eventType: 'weddings',
      message: '',
    })

  const handleAddDialogChange = (open: boolean) => {
    setIsAddDialogOpen(open)
    if (!open) {
      resetNewEnquiry()
    }
  }

  const fetchEnquiries = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/enquiries')

      if (!response.ok) {
        throw new Error('Failed to fetch enquiries')
      }

      const data = await response.json()
      setEnquiries(data)
    } catch (err) {
      handleFetchError(err)
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

  const handleEdit = async (enquiry: Enquiry) => {
    try {
      const response = await fetch('/api/admin/enquiries', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enquiry),
      })

      if (!response.ok) {
        throw new Error('Failed to update enquiry')
      }

      await fetchEnquiries()
      setIsEditDialogOpen(false)
      setEditingEnquiry(null)
      toast({
        title: 'Success',
        description: 'Enquiry updated successfully',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update enquiry',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('/api/admin/enquiries', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete enquiry')
      }

      await fetchEnquiries()
      toast({
        title: 'Success',
        description: 'Enquiry deleted successfully',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete enquiry',
        variant: 'destructive',
      })
    }
  }

  const handleAdd = async () => {
    try {
      if (!newEnquiry.name || !newEnquiry.email || !newEnquiry.phone || !newEnquiry.eventType || !newEnquiry.message) {
        toast({
          title: 'Missing information',
          description: 'Name, email, phone, event type, and message are required.',
          variant: 'destructive',
        })
        return
      }

      const response = await fetch('/api/admin/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEnquiry),
      })

      if (!response.ok) {
        throw new Error('Failed to add enquiry')
      }

      await fetchEnquiries()
      setIsAddDialogOpen(false)
      toast({
        title: 'Success',
        description: 'Enquiry added successfully',
      })
      resetNewEnquiry()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add enquiry',
        variant: 'destructive',
      })
    }
  }

  const handleDetailView = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry)
    setIsDetailDialogOpen(true)
  }

  const handleConvertToEventClick = (enquiry: Enquiry) => {
    setConvertingEnquiry(enquiry)
    setIsUnifiedModalOpen(true)
  }

  const getDefaultServicesForPackage = (packageType: string, category: string): Service[] => {
    // Base services for different package types
    const packageServices: Record<string, string[]> = {
      'Essentials': ['venue-coordination', 'day-coordination'],
      'Complete': ['full-planning', 'modern-british-menu', 'decor-floral'],
      'Luxury': ['full-planning', 'modern-british-menu', 'decor-floral', 'av-lighting', 'photography']
    }

    const serviceIds = packageServices[packageType] || []
    return services.filter(service => serviceIds.includes(service.id))
  }

  const calculatePricing = (packageType: string, selectedServices: typeof conversionData.services) => {
    const packagePrices: Record<string, number> = {
      'Essentials': 5000,
      'Complete': 8500,
      'Luxury': 12000
    }

    const baseCost = packagePrices[packageType] || 0
    const servicesCost = selectedServices.reduce((total, service) => total + service.totalCost, 0)
    const subtotal = baseCost + servicesCost
    const markup = subtotal * 0.32 // 32% markup
    const total = subtotal + markup

    return {
      baseCost,
      servicesCost,
      subtotal,
      markup,
      total,
      depositAmount: total * 0.3,
      midPayment: total * 0.5,
      finalPayment: total * 0.2
    }
  }

  const handlePackageTypeChange = (packageType: string) => {
    const category = conversionData.category
    const defaultServices = getDefaultServicesForPackage(packageType, category)

    const servicesWithDetails = defaultServices.map(service => ({
      id: service.id,
      name: service.name,
      type: service.category,
      description: service.description,
      supplierCost: service.baseCost,
      quantity: 1,
      totalCost: service.baseCost
    }))

    setConversionData(prev => ({
      ...prev,
      packageType: packageType as 'Essentials' | 'Complete' | 'Luxury',
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

    setConversionData(prev => ({
      ...prev,
      services: [...prev.services, newService]
    }))
  }

  const handleRemoveService = (serviceId: string) => {
    setConversionData(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== serviceId)
    }))
  }

  const handleCreateEventFromEnquiry = async (eventData: any) => {
    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        throw new Error('Failed to create event from enquiry')
      }

      await fetchEnquiries()
      setIsUnifiedModalOpen(false)
      setConvertingEnquiry(null)
      toast({
        title: 'Success',
        description: `Event created from enquiry for ${convertingEnquiry?.name}`,
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create event',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    fetchEnquiries()
    fetchServices()
  }, [])

  const filteredEnquiries = enquiries.filter(enquiry =>
    (enquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     enquiry.eventType.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (eventTypeFilter === 'all' || enquiry.eventType === eventTypeFilter)
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enquiries</h1>
          <p className="text-muted-foreground">
            Manage customer enquiries and requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchEnquiries} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Enquiry
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
                  placeholder="Search by name, email, or event type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={eventTypeFilter} onValueChange={(value: string) => setEventTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="weddings">Weddings</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="decor">Decor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enquiries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Enquiries ({filteredEnquiries.length})</CardTitle>
          <CardDescription>
            A list of all customer enquiries and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnquiries.map((enquiry) => (
                <TableRow key={enquiry.id}>
                  <TableCell>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-medium text-left justify-start"
                      onClick={() => handleDetailView(enquiry)}
                    >
                      {enquiry.name}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="mr-1 h-3 w-3" />
                      {enquiry.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{enquiry.eventType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {enquiry.eventDate ? new Date(enquiry.eventDate).toLocaleDateString() : 'Not set'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate text-sm" title={enquiry.message}>
                      {enquiry.message.length > 50 ? `${enquiry.message.substring(0, 50)}...` : enquiry.message}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConvertToEventClick(enquiry)}
                      >
                        <ArrowRight className="h-4 w-4" />
                        Convert to Event
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingEnquiry(enquiry)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Enquiry</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this enquiry? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(enquiry.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
            <DialogDescription>
              Complete information about this enquiry
            </DialogDescription>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium">
                    <User className="mr-2 h-4 w-4" />
                    Client Information
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><strong>Name:</strong> {selectedEnquiry.name}</p>
                    <p><strong>Email:</strong> {selectedEnquiry.email}</p>
                    <p><strong>Phone:</strong> {selectedEnquiry.phone}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium">
                    <Calendar className="mr-2 h-4 w-4" />
                    Event Information
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><strong>Event Type:</strong> {selectedEnquiry.eventType}</p>
                    <p><strong>Event Date:</strong> {selectedEnquiry.eventDate ? new Date(selectedEnquiry.eventDate).toLocaleDateString() : 'Not specified'}</p>
                    <p><strong>Submitted:</strong> {formatDate(selectedEnquiry.timestamp)}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium">
                  <FileText className="mr-2 h-4 w-4" />
                  Message
                </div>
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {selectedEnquiry.message}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
            {selectedEnquiry && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailDialogOpen(false)
                    setEditingEnquiry(selectedEnquiry)
                    setIsEditDialogOpen(true)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailDialogOpen(false)
                    handleConvertToEventClick(selectedEnquiry)
                  }}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Convert to Event
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Enquiry</DialogTitle>
            <DialogDescription>
              Make changes to the enquiry details below.
            </DialogDescription>
          </DialogHeader>
          {editingEnquiry && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={editingEnquiry.name}
                  onChange={(e) => setEditingEnquiry({...editingEnquiry, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editingEnquiry.email}
                  onChange={(e) => setEditingEnquiry({...editingEnquiry, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={editingEnquiry.phone}
                  onChange={(e) => setEditingEnquiry({...editingEnquiry, phone: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="eventType" className="text-right">
                  Event Type
                </Label>
                <Select
                  value={editingEnquiry.eventType}
                  onValueChange={(value: string) => setEditingEnquiry({...editingEnquiry, eventType: value})}
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
                <Label htmlFor="message" className="text-right">
                  Message
                </Label>
                <Textarea
                  id="message"
                  value={editingEnquiry.message}
                  onChange={(e) => setEditingEnquiry({...editingEnquiry, message: e.target.value})}
                  className="col-span-3"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={() => editingEnquiry && handleEdit(editingEnquiry)}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unified Event Modal */}
      <UnifiedEventModal
        isOpen={isUnifiedModalOpen}
        onClose={() => {
          setIsUnifiedModalOpen(false)
          setConvertingEnquiry(null)
        }}
        onSave={handleCreateEventFromEnquiry}
        enquiry={convertingEnquiry}
        services={services}
      />

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={handleAddDialogChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Enquiry</DialogTitle>
            <DialogDescription>
              Create a new enquiry record.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-name" className="text-right">
                Name
              </Label>
              <Input
                id="new-name"
                className="col-span-3"
                value={newEnquiry.name}
                onChange={(e) => setNewEnquiry({ ...newEnquiry, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-email" className="text-right">
                Email
              </Label>
              <Input
                id="new-email"
                type="email"
                className="col-span-3"
                value={newEnquiry.email}
                onChange={(e) => setNewEnquiry({ ...newEnquiry, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-phone" className="text-right">
                Phone
              </Label>
              <Input
                id="new-phone"
                className="col-span-3"
                value={newEnquiry.phone}
                onChange={(e) => setNewEnquiry({ ...newEnquiry, phone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-event-date" className="text-right">
                Event Date
              </Label>
              <Input
                id="new-event-date"
                type="date"
                className="col-span-3"
                value={newEnquiry.eventDate}
                onChange={(e) => setNewEnquiry({ ...newEnquiry, eventDate: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-eventType" className="text-right">
                Event Type
              </Label>
              <Select
                value={newEnquiry.eventType}
                onValueChange={(value: string) => setNewEnquiry({ ...newEnquiry, eventType: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select event type" />
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
              <Label htmlFor="new-message" className="text-right">
                Message
              </Label>
              <Textarea
                id="new-message"
                className="col-span-3"
                rows={3}
                value={newEnquiry.message}
                onChange={(e) => setNewEnquiry({ ...newEnquiry, message: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAdd}>
              Add Enquiry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
