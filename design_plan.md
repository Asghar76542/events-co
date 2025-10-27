# Event Onboarding and Pricing System Design Plan

## Current System Analysis

### Data Structure (data/events.json)

Current event object:
```json
{
  "id": "string",
  "venue": "string",
  "city": "string",
  "category": "weddings | corporate | decor | all",
  "image": "string",
  "title": "string",
  "description": "string"
}
```

### Admin Interface
- React-based admin panel with sidebar navigation (Dashboard, Enquiries, Events)
- Events page supports CRUD operations via modal dialogs
- File-based API for events with authentication middleware

### Business Requirements
From documentation analysis:
- **Pricing Strategy**: 30-35% markup on supplier costs
- **Payment Schedule**: 30% deposit, 40% mid-payment (6 weeks before), 30% final payment (3 weeks before)
- **Packages**: Essentials, Complete, Luxury
- **Services**: Venue, Catering, Decor, AV, Photography, Transport, etc.
- **Onboarding Phases**: Inquiry → Booking → Planning → Finalization → Execution → Post-Event

## Proposed System Design

### Extended Data Model
```json
{
  "id": "string",
  "venue": "string",
  "city": "string",
  "category": "weddings | corporate | decor | all",
  "image": "string",
  "title": "string",
  "description": "string",
  "pricing": {
    "packageType": "Essentials | Complete | Luxury",
    "baseCost": "number",
    "markup": "number (0.30-0.35)",
    "totalPrice": "number",
    "depositAmount": "number (0.30 * totalPrice)",
    "midPayment": "number (0.40 * totalPrice)",
    "finalPayment": "number (0.30 * totalPrice)"
  },
  "services": [
    {
      "type": "Venue | Catering | Decor | AV | Photography | Transport",
      "description": "string",
      "supplierCost": "number",
      "quantity": "number",
      "totalCost": "number"
    }
  ],
  "onboardingStatus": "inquiry | deposit_paid | planning | finalized | executed | completed",
  "clientInfo": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "contactMethod": "Email | Phone | WhatsApp"
  },
  "timeline": {
    "eventDate": "ISO string",
    "depositDue": "ISO string",
    "midPaymentDue": "ISO string (6 weeks before eventDate)",
    "finalPaymentDue": "ISO string (3 weeks before eventDate)"
  },
  "phases": [
    {
      "name": "Booking Secured",
      "status": "pending | completed",
      "checklist": ["Contract signed", "Deposit received"]
    },
    {
      "name": "Planning & Supplier Management",
      "status": "pending | completed",
      "checklist": ["Venue confirmed", "Supplier quotes approved"]
    }
    // ... additional phases
  ]
}
```

### Onboarding Workflow Phases
1. **Inquiry Phase**
   - Client submits application form
   - Admin reviews and creates event record
   - Send proposal and contract

2. **Booking Confirmation Phase**
   - Client signs contract
   - Deposit payment (30%)
   - Event date secured

3. **Planning Phase**
   - Select and contract suppliers
   - Mid-payment (40%) triggers supplier deposits
   - Detailed timeline creation

4. **Finalization Phase**
   - Menu and decor approval
   - Final guest count and seating
   - Run sheet drafting

5. **Final Push Phase**
   - Final payment (30%)
   - Venue walkthrough
   - Emergency contacts distributed

6. **Execution Phase**
   - Event day management
   - Quality checks

7. **Post-Event Phase**
   - Thank you communication
   - Supplier final payments
   - Feedback and testimonial request
   - Portfolio update

### UI Enhancements for Admin Events Page
- **Tabbed Interface**: Add tabs for "Details", "Pricing", "Onboarding", "Services"
- **Pricing Tab**:
  - Service selection dropdowns with cost inputs
  - Automatic calculation of base cost, markup, and total price
  - Package type selector affecting markup percentage
- **Onboarding Tab**:
  - Phase progress tracker with checklist items
  - Status updates and milestone markers
  - Integration with timeline for payment reminders
- **Services Tab**:
  - Add/edit/remove services with supplier cost tracking
  - Quantity and total cost calculations
- **Enhanced Add/Edit Dialogs**:
  - Multi-step form for initial event creation
  - Client information capture during onboarding

### New API Endpoints
- `GET /api/admin/events/{id}/pricing` - Calculate and return pricing breakdown
- `PUT /api/admin/events/{id}/services` - Update selected services and recalculate costs
- `PUT /api/admin/events/{id}/onboarding` - Update onboarding status and phase checklists
- `POST /api/admin/events/from-enquiry` - Convert enquiry to event with initial data
- `GET /api/admin/services` - Retrieve available services and base pricing templates
- `POST /api/admin/payment-reminders` - Trigger automated payment reminders based on timeline

### Integration Points
- **Enquiries System**: Convert enquiries to events upon approval, pre-filling client info and initial requirements
- **Stats Dashboard**: Include pricing metrics (average markup, total revenue) and onboarding progress (events in each phase)
- **Admin Navigation**: Add "Services" and "Pricing Templates" sections to sidebar
- **Authentication**: Ensure all new endpoints use existing auth middleware
- **File Storage**: Update events.json schema and add new data files for services and pricing templates

### Mermaid Workflow Diagram
```mermaid
graph TD
    A[Client Inquiry] --> B[Admin Review & Proposal]
    B --> C[Contract & Deposit Payment]
    C --> D[Planning Phase: Supplier Selection]
    D --> E[Mid-Payment (40%)]
    E --> F[Finalization Phase: Approvals]
    F --> G[Final Payment (30%)]
    G --> H[Event Execution]
    H --> I[Post-Event: Feedback & Settlement]

    B -.-> J[Convert to Event Record]
    J --> K[Assign Pricing Package]
    K --> L[Select Services & Calculate Costs]
    L --> M[Track Onboarding Phases]
    M --> N[Update Status & Checklists]

    O[Payment Reminders] -.-> C
    O -.-> E
    O -.-> G
```

## Implementation Considerations
- **Data Migration**: Script to update existing events.json with new fields (set defaults)
- **UI/UX**: Use existing component library (shadcn/ui) for consistency
- **Automation**: Integrate payment reminder system with email templates
- **Validation**: Ensure pricing calculations are accurate and markup is applied correctly
- **Scalability**: Consider moving from file-based to database storage for better querying

This design extends the current system while maintaining compatibility and leveraging existing infrastructure.

## Implementation Status
✅ **Completed Features:**
- Extended data model with pricing, services, onboarding status, client info, timeline, and phases
- New API endpoints: `/api/admin/services`, `/api/admin/pricing`
- Enhanced admin events page with tabbed interface (Events, Pricing, Onboarding, Services)
- Service selection and pricing calculation with 30-35% markup
- Onboarding phase tracker with checklists
- Integration: Convert enquiries to events with pre-filled data
- File-based storage for services and extended events

✅ **Key Components Implemented:**
1. **Services Management**: `data/services.json` with base pricing for various event services
2. **Pricing Calculator**: POST to `/api/admin/pricing` with selected services and package type
3. **Onboarding Workflow**: Visual tracker with phases and status indicators
4. **Enquiry Integration**: "Convert to Event" button in enquiries table
5. **UI Enhancements**: Tabs for different management aspects, responsive design

## Usage Instructions
1. **Adding a New Event**: Use the "Add Event" button on the Events tab. New fields for client info and onboarding are available.
2. **Pricing Management**: Go to the Pricing tab, select services, adjust quantities, and click "Calculate Pricing" to see breakdown.
3. **Onboarding Tracking**: View the Onboarding tab for phase progress and checklists.
4. **Converting Enquiries**: In the Enquiries page, use the "Convert to Event" button to create an event from an enquiry.
5. **Service Management**: View available services on the Services tab.

## Technical Notes
- All new fields in events are optional to maintain backward compatibility
- Pricing calculations use 30% markup for Essentials, 32% for Complete, 35% for Luxury packages
- Onboarding phases are hard-coded but can be made dynamic in the future
- Integration relies on existing auth and logging systems
- File-based storage for simplicity; consider database migration for production

This implementation provides a solid foundation for event onboarding and pricing management within the existing admin system.