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
  ArrowRight
} from 'lucide-react'

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

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState('all')
  const [editingEnquiry, setEditingEnquiry] = useState<Enquiry | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newEnquiry, setNewEnquiry] = useState<Omit<Enquiry, 'id' | 'timestamp'>>({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    eventType: 'weddings',
    message: '',
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

  const handleConvertToEvent = async (enquiry: Enquiry) => {
    try {
      const eventData = {
        title: `${enquiry.name}'s ${enquiry.eventType}`,
        venue: 'To be determined', // Can be set later
        city: '', // Can be set later
        category: enquiry.eventType as 'weddings' | 'corporate' | 'decor' | 'all',
        image: '', // Can be set later
        description: enquiry.message,
        onboardingStatus: 'inquiry',
        clientInfo: {
          name: enquiry.name,
          email: enquiry.email,
          phone: enquiry.phone,
          contactMethod: 'Email' as const,
        },
        timeline: {
          eventDate: enquiry.eventDate,
          depositDue: '', // Calculate based on eventDate
          midPaymentDue: '',
          finalPaymentDue: '',
        },
      }

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

      await fetchEnquiries() // Optionally update enquiries list
      toast({
        title: 'Success',
        description: `Event created from enquiry for ${enquiry.name}`,
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
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Event Details</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnquiries.map((enquiry) => (
                <TableRow key={enquiry.id}>
                  <TableCell>
                    <div className="font-medium">{enquiry.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="mr-1 h-3 w-3" />
                        {enquiry.email}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="mr-1 h-3 w-3" />
                        {enquiry.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline">{enquiry.eventType}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(enquiry.eventDate).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(enquiry.timestamp)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate text-sm" title={enquiry.message}>
                      {enquiry.message}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConvertToEvent(enquiry)}
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
