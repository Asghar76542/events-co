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
  FileText,
  X
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

// This is a combination of EnquiryRecord and EventRecord
// to represent the data in the management panel.
type ManagementItem = Partial<EventRecord> & Partial<EnquiryRecord>;

interface ManagementPanelProps {
  item: ManagementItem | null;
  onClose: () => void;
  onSave: (item: ManagementItem) => void;
  services: Service[];
}

const CONTACT_METHODS: Record<ContactMethod, string> = {
  Email: 'Email',
  Phone: 'Phone',
  WhatsApp: 'WhatsApp',
}

export function ManagementPanel({ item, onClose, onSave, services }: ManagementPanelProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [editedItem, setEditedItem] = useState<ManagementItem | null>(null);

  useEffect(() => {
    if (item) {
        if (item.status === 'enquiry') {
            setEditedItem({
                ...item,
                title: `${item.name}'s ${item.eventType}`,
                category: item.eventType as EventCategory,
                venue: 'To be determined',
                city: '',
                description: item.message,
                image: '',
                packageType: 'Essentials',
                eventDate: item.eventDate || '',
                services: [],
                clientInfo: {
                  name: item.name || '',
                  email: item.email || '',
                  phone: item.phone || '',
                  contactMethod: 'Email'
                },
                onboardingStatus: 'inquiry',
                status: 'event'
            });
        } else {
            setEditedItem(item);
        }
    } else {
        setEditedItem(null);
    }
  }, [item]);

  if (!editedItem) return null;

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(editedItem);
      toast({ title: "Success", description: "Item saved successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save item.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedItem(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleClientInfoChange = (field: string, value: any) => {
    setEditedItem(prev => {
        if (!prev) return null;
        const clientInfo = prev.clientInfo || {};
        return { ...prev, clientInfo: { ...clientInfo, [field]: value } };
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 w-1/2 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage</h2>
        <Button variant="ghost" onClick={onClose}><X className="h-6 w-6" /></Button>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input id="title" value={editedItem.title || ''} onChange={(e) => handleInputChange('title', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={editedItem.category || editedItem.eventType} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {Object.entries(EVENT_CATEGORY_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={editedItem.description || editedItem.message || ''} onChange={(e) => handleInputChange('description', e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Client Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="clientName">Client Name</Label>
                        <Input id="clientName" value={editedItem.clientInfo?.name || editedItem.name || ''} onChange={(e) => handleClientInfoChange('name', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="clientEmail">Email</Label>
                        <Input id="clientEmail" type="email" value={editedItem.clientInfo?.email || editedItem.email || ''} onChange={(e) => handleClientInfoChange('email', e.target.value)} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="clientPhone">Phone</Label>
                        <Input id="clientPhone" value={editedItem.clientInfo?.phone || editedItem.phone || ''} onChange={(e) => handleClientInfoChange('phone', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactMethod">Preferred Contact</Label>
                        <Select value={editedItem.clientInfo?.contactMethod || 'Email'} onValueChange={(value) => handleClientInfoChange('contactMethod', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {Object.entries(CONTACT_METHODS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </div>
    </div>
  )
}
