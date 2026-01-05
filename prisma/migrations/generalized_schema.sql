-- ============================================
-- GENERALIZED SIGNUP PLATFORM SCHEMA
-- ============================================
-- This migration transforms the donation-specific schema 
-- into a flexible signup platform supporting multiple event types

-- ============================================
-- NEW ENUMS
-- ============================================

enum EventType {
  POTLUCK
  SPORTS_TEAM
  VOLUNTEER
  PARTY
  SCHOOL_EVENT
  DONATION_DRIVE  // Keep existing functionality
  MEETING
  FUNDRAISER
  CUSTOM
}

enum ItemType {
  QUANTITY_BASED    // Like current gifts - multiple people can claim
  SINGLE_SLOT       // One person only
  TIME_SLOT         // Volunteer shifts with start/end times
  ROLE_BASED        // Positions or roles
  BINARY_OPTION     // Yes/No signups
}

enum SignupStatus {
  CONFIRMED
  PENDING
  CANCELLED
}

-- ============================================
-- UPDATED CAMPAIGN MODEL (now Event)
-- ============================================

model Event {
  id               String       @id @default(cuid())
  name             String
  description      String?
  eventType        EventType    @default(CUSTOM)
  status           CampaignStatus @default(DRAFT)
  organizationType OrganizationType @default(NONPROFIT)
  
  // Event timing
  startsAt         DateTime?
  endsAt           DateTime?
  eventDate        DateTime?    // Specific date for the event
  
  // Location
  location         String?      // Event location
  isVirtual        Boolean      @default(false)
  meetingUrl       String?      // For virtual events
  
  // Legacy donation-specific fields (kept for backward compatibility)
  dropOffDeadline  DateTime?
  dropOffAddress   String?
  
  // Event configuration
  allowPublicSignup Boolean     @default(true)
  requireApproval    Boolean     @default(false)
  maxParticipants    Int?
  
  // Template data for different event types
  templateConfig    Json?        // Store event-type specific configuration
  
  categories        Category[]
  signups           Signup[]

  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
}

-- ============================================
-- NEW CATEGORY MODEL (replaces Family)
-- ============================================

model Category {
  id         String   @id @default(cuid())
  name       String
  description String?
  sortOrder  Int      @default(0)
  
  eventId    String
  event      Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  items      Item[]
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@index([eventId])
}

-- ============================================
-- NEW ITEM MODEL (replaces Gift)
-- ============================================

model Item {
  id          String   @id @default(cuid())
  name        String
  description String?
  itemType    ItemType @default(QUANTITY_BASED)
  
  // Quantity-based items
  quantity    Int      @default(1)
  minQuantity Int?     // Minimum quantity per signup
  
  // Time slot items
  startTime   DateTime?
  endTime     DateTime?
  duration    Int?     // Duration in minutes
  
  // Configuration
  required    Boolean  @default(false)
  maxPerPerson Int?    // Max quantity one person can claim
  
  // External links
  productUrl  String?
  detailsUrl  String?
  
  // Sorting and display
  sortOrder   Int      @default(0)
  isHidden    Boolean  @default(false)
  
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  signups     Signup[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([categoryId])
}

-- ============================================
-- NEW SIGNUP MODEL (replaces Claim)
-- ============================================

model Signup {
  id           String        @id @default(cuid())
  
  itemId       String
  item         Item          @relation(fields: [itemId], references: [id], onDelete: Cascade)
  
  // Participant information
  participantName  String
  participantEmail String
  participantPhone String?
  
  // Signup details
  quantity     Int           @default(1)
  status       SignupStatus  @default(CONFIRMED)
  notes        String?
  
  // For time slots
  actualStartTime DateTime?
  actualEndTime   DateTime?
  
  // Admin fields
  approvedBy   String?
  approvedAt   DateTime?
  cancelledAt  DateTime?
  cancelReason String?
  
  // Metadata
  ipAddress    String?
  userAgent    String?
  
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  
  @@index([itemId])
  @@index([participantEmail])
  @@index([status])
}

-- ============================================
-- LEGACY MODELS (kept for backward compatibility)
-- ============================================

-- Keep existing Family, Person, Gift, Claim models for migration
-- They will be phased out after data migration

-- ============================================
-- NEW EVENT TEMPLATE MODEL
-- ============================================

model EventTemplate {
  id          String   @id @default(cuid())
  name        String
  description String?
  eventType   EventType
  
  // Template structure
  structure   Json     // Categories and items template
  
  // Default settings
  defaultSettings Json?
  
  isPublic    Boolean  @default(false)
  usageCount  Int      @default(0)
  
  createdBy   String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

-- ============================================
-- ENHANCED USER MANAGEMENT
-- ============================================

model EventOrganizer {
  id         String   @id @default(cuid())
  userId     String   // Clerk user ID
  eventId    String
  event      Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  role       String   @default("owner") // owner, admin, editor
  permissions Json?    // Granular permissions
  
  invitedBy  String?
  invitedAt  DateTime?
  joinedAt   DateTime @default(now())
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@unique([userId, eventId])
  @@index([eventId])
}
