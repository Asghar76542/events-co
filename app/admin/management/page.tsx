
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, RefreshCw, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ManagementPanel } from '@/components/admin/management-panel';
import { Service } from '@/lib/domain/events';

// Basic types for now
type Enquiry = {
  id: string;
  name: string;
  email: string;
  eventType: string;
  timestamp: string;
  status: 'enquiry';
};

type Event = {
  id: string;
  title: string;
  clientInfo: { name: string };
  category: string;
  timeline: { eventDate: string };
  status: 'event';
};

type ManagementItem = (Enquiry | Event) & {
    guestCount?: number;
    discount?: number;
    pricing?: {
        subtotal: number;
        markup: number;
        rrp: number;
        total: number;
    };
};

export default function AdminManagement() {
  const [items, setItems] = useState<ManagementItem[]>([])
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<ManagementItem | null>(null);

  const handleManageClick = (item: ManagementItem) => {
    setSelectedItem(item);
  };

  const handleClosePanel = () => {
    setSelectedItem(null);
  };

  const handleAddNew = () => {
    setSelectedItem({
      id: '', // Will be generated on save
      name: 'New Enquiry',
      email: '',
      eventType: 'weddings',
      timestamp: new Date().toISOString(),
      status: 'enquiry',
    });
  };

  const fetchItems = async () => {
    try {
      setLoading(true)
      const [enquiriesRes, eventsRes] = await Promise.all([
        fetch('/api/admin/enquiries'),
        fetch('/api/admin/events'),
      ])

      if (!enquiriesRes.ok || !eventsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const enquiries = await enquiriesRes.json()
      const events = await eventsRes.json()

      const combinedItems: ManagementItem[] = [
        ...enquiries.map((e: any) => ({ ...e, status: 'enquiry' })),
        ...events.map((e: any) => ({ ...e, status: 'event' })),
      ]

      // Sort by date, newest first
      combinedItems.sort((a, b) => {
        const dateA = new Date(a.status === 'enquiry' ? a.timestamp : a.timeline.eventDate).getTime();
        const dateB = new Date(b.status === 'enquiry' ? b.timestamp : b.timeline.eventDate).getTime();
        return dateB - dateA;
      });


      setItems(combinedItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services');
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      const data = await response.json();
      setServices(data);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    }
  };

  const handleSave = async (item: ManagementItem) => {
    const isEvent = 'clientInfo' in item; // A simple check to differentiate

    // Recalculate pricing before saving
    const guestCount = item.guestCount || 1;
    const subtotal = (item.services || []).reduce((acc, service) => {
        if (service.type === 'per_person') {
            return acc + (service.supplierCost * guestCount);
        }
        return acc + service.totalCost;
    }, 0);
    const markup = subtotal * 0.35; // 35% markup
    const rrp = subtotal + markup;
    const total = rrp - (item.discount || 0);

    const itemToSave = {
        ...item,
        guestCount,
        pricing: {
            subtotal,
            markup,
            rrp,
            total,
        }
    };

    const url = isEvent && item.id ? `/api/admin/events/${item.id}` : '/api/admin/enquiries';
    const method = item.id ? 'PUT' : 'POST';

    const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemToSave),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save item');
    }

    await fetchItems(); // Refresh the list
    handleClosePanel();
  };

  useEffect(() => {
    fetchItems()
    fetchServices();
  }, [])

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
        <Button onClick={fetchItems} variant="outline">
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
          <h1 className="text-3xl font-bold tracking-tight">Management</h1>
          <p className="text-muted-foreground">
            A unified view of all enquiries and events.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchItems} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Items ({items.length})</CardTitle>
           <CardDescription>
            Browse and manage all enquiries and booked events from one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client / Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.status === 'enquiry' ? item.name : item.title}
                    <div className="text-sm text-muted-foreground">
                      {item.status === 'enquiry' ? item.email : item.clientInfo.name}
                    </div>
                  </TableCell>
                  <TableCell>{item.status === 'enquiry' ? item.eventType : item.category}</TableCell>
                  <TableCell>
                    {new Date(item.status === 'enquiry' ? item.timestamp : item.timeline.eventDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleManageClick(item)}>
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedItem && (
            <ManagementPanel
                item={selectedItem}
                onClose={handleClosePanel}
                onSave={handleSave}
                services={services}
            />
        )}
    </div>
  )
}
