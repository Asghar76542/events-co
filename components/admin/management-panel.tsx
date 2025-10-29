'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  Users,
  X,
} from 'lucide-react'
import {
  ContactMethod,
  EVENT_CATEGORY_LABELS,
  EventCategory,
  EventRecord,
  EnquiryRecord,
  Service as EventService,
  EventPhase
} from '@/lib/domain/events'
import { Checkbox } from '@/components/ui/checkbox'

interface Service {
    id: string;
    name: string;
    description: string;
    baseCost: number;
    rrp: number;
    unit: 'per_person' | 'event' | 'per_item';
}

interface ServiceCategory {
    category: string;
    services: Service[];
}

type ManagementItem = Partial<EventRecord> & Partial<EnquiryRecord> & { 
    guestCount?: number;
    discount?: number;
 };

interface ManagementPanelProps {
  item: ManagementItem | null;
  onClose: () => void;
  onSave: (item: ManagementItem) => void;
  services: ServiceCategory[];
}

const CONTACT_METHODS: Record<ContactMethod, string> = {
  Email: 'Email',
  Phone: 'Phone',
  WhatsApp: 'WhatsApp',
}

export function ManagementPanel({ item, onClose, onSave, services: serviceCategories }: ManagementPanelProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [editedItem, setEditedItem] = useState<ManagementItem | null>(null);
  const [discount, setDiscount] = useState(0);

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
                guestCount: 100, // Default guest count
                discount: 0,
                clientInfo: {
                  name: item.name || '',
                  email: item.email || '',
                  phone: item.phone || '',
                  contactMethod: 'Email'
                },
                onboardingStatus: 'inquiry',
                status: 'event',
                phases: [
                    { name: "Booking Secured", status: "pending", checklist: [{ name: "Contract signed", completed: false }, { name: "Deposit received", completed: false }] },
                    { name: "Planning & Supplier Management", status: "pending", checklist: [{ name: "Venue confirmed", completed: false }, { name: "Supplier quotes approved", completed: false }] },
                    { name: "Day-of Coordination", status: "pending", checklist: [{ name: "Timeline finalized", completed: false }, { name: "Staff briefed", completed: false }, { name: "Equipment ready", completed: false }] },
                    { name: "Event Execution", status: "pending", checklist: [{ name: "Event completed successfully", completed: false }, { name: "Client feedback collected", completed: false }] },
                    { name: "Post-Event Follow-up", status: "pending", checklist: [{ name: "Final payment received", completed: false }, { name: "Thank you notes sent", completed: false }] }
                ]
            });
        } else {
            setEditedItem(item);
            setDiscount(item.discount || 0);
        }
    } else {
        setEditedItem(null);
    }
  }, [item]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if(editedItem) {
        const itemToSave = {
            ...editedItem,
            discount,
        };
        await onSave(itemToSave);
        toast({ title: "Success", description: "Item saved successfully." });
      }
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

  const handleServiceToggle = (service: Service) => {
    setEditedItem(prev => {
        if (!prev) return null;
        const existingServices = prev.services || [];
        const isSelected = existingServices.some(s => s.id === service.id);
        let newServices: EventService[];
        if (isSelected) {
            newServices = existingServices.filter(s => s.id !== service.id);
        } else {
            newServices = [...existingServices, { ...service, quantity: 1, totalCost: service.baseCost, type: service.unit, supplierCost: service.baseCost }];
        }
        return { ...prev, services: newServices };
    });
  };

  const handlePhaseStatusChange = (phaseIndex: number, newStatus: 'pending' | 'completed') => {
    setEditedItem(prev => {
        if (!prev || !prev.phases) return prev;
        const newPhases = [...prev.phases];
        newPhases[phaseIndex].status = newStatus;
        return { ...prev, phases: newPhases };
    });
  };

  const handleChecklistItemToggle = (phaseIndex: number, itemIndex: number, completed: boolean) => {
    setEditedItem(prev => {
        if (!prev || !prev.phases) return prev;
        const newPhases = [...prev.phases] as EventPhase[];
        const newChecklist = [...newPhases[phaseIndex].checklist];
        newChecklist[itemIndex] = { ...newChecklist[itemIndex], completed };
        newPhases[phaseIndex] = { ...newPhases[phaseIndex], checklist: newChecklist };
        return { ...prev, phases: newPhases };
    });
  };

  const calculateTotal = () => {
      if (!editedItem || !editedItem.services) return { subtotal: 0, markup: 0, rrp: 0, total: 0 };

      const guestCount = editedItem.guestCount || 1;

      const subtotal = editedItem.services.reduce((acc, service) => {
          if (service.type === 'per_person') {
              return acc + (service.supplierCost * guestCount);
          }
          return acc + service.totalCost;
      }, 0);

      const markup = subtotal * 0.35; // 35% markup
      const rrp = subtotal + markup;
      const total = rrp - discount;

      return { subtotal, markup, rrp, total };
  }

  if (!editedItem) return null;

  const { subtotal, markup, rrp, total } = calculateTotal();

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
            <div className="grid grid-cols-3 gap-4">
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
                 <div className="space-y-2">
                    <Label htmlFor="guestCount">Guest Count</Label>
                    <Input id="guestCount" type="number" value={editedItem.guestCount || ''} onChange={(e) => handleInputChange('guestCount', parseInt(e.target.value, 10))} />
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

        <Card>
            <CardHeader><CardTitle>Services</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {serviceCategories.map(category => (
                    <div key={category.category}>
                        <h4 className="font-semibold mb-2">{category.category}</h4>
                        <div className="space-y-2">
                            {category.services.map(service => (
                                <div key={service.id} className="flex items-center justify-between p-2 border rounded-md">
                                    <div className="flex items-center">
                                        <Checkbox
                                            id={`service-${service.id}`}
                                            checked={editedItem.services?.some(s => s.id === service.id)}
                                            onCheckedChange={() => handleServiceToggle(service)}
                                            className="mr-4"
                                        />
                                        <label htmlFor={`service-${service.id}`} className="font-medium">{service.name}</label>
                                    </div>
                                    <div className="text-muted-foreground text-right">
                                        {service.unit === 'per_person' ? (
                                            <div>
                                                <span>£{service.rrp.toFixed(2)} / person</span>
                                                <span className="text-xs block">
                                                    Total: £{(service.rrp * (editedItem.guestCount || 0)).toFixed(2)}
                                                </span>
                                            </div>
                                        ) : (
                                            <span>£{service.rrp.toFixed(2)}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
            <CardContent className="space-y-2">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Markup (35%)</span>
                    <span>£{markup.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between">
                    <span>RRP</span>
                    <span>£{rrp.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span>Discount</span>
                    <Input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                        className="w-24"
                    />
                </div>
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>£{total.toFixed(2)}</span>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Event Progress</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {editedItem.phases?.map((phase, phaseIndex) => (
                    <div key={phaseIndex} className="border p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold">{phase.name}</h4>
                            <Select
                                value={phase.status}
                                onValueChange={(newStatus) => handlePhaseStatusChange(phaseIndex, newStatus as 'pending' | 'completed')}
                            >
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="mt-4 space-y-2">
                            {phase.checklist.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-center">
                                    <Checkbox
                                        id={`checklist-${phaseIndex}-${itemIndex}`}
                                        checked={item.completed}
                                        onCheckedChange={(checked) => handleChecklistItemToggle(phaseIndex, itemIndex, !!checked)}
                                        className="mr-2"
                                    />
                                    <label htmlFor={`checklist-${phaseIndex}-${itemIndex}`} className="text-sm">{item.name}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
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