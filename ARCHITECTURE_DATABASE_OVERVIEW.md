# CarRents.lk - Architecture & Database Overview

## 📊 CURRENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (React + Vite)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Pages:                                                    │
│  ├─ Landing Page                                          │
│  ├─ Login / Register (Firebase Auth)                     │
│  ├─ Select Role (Owner/Renter/Company)                  │
│  ├─ Vehicle Listing                                      │
│  ├─ Vehicle Detail                                       │
│  ├─ List Vehicle (Upload)                               │
│  ├─ Company Dashboard ⚠️ (INCOMPLETE)                   │
│  ├─ Company Detail                                       │
│  ├─ Profile                                              │
│  └─ LandingPage                                          │
│                                                             │
│  Components:                                              │
│  ├─ Navbar                                                │
│  ├─ Hero                                                  │
│  ├─ VehicleCard                                          │
│  └─ ... (others)                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↕
                         [Axios]
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               BACKEND (Node.js + Express)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Routes:                                                  │
│  ├─ /api/auth          ✅ (Login, Register, OTP)        │
│  ├─ /api/vehicles      ✅ (List, Create, Delete)        │
│  ├─ /api/bids          ✅ (Create, Get by vehicle)      │
│  ├─ /api/companies     ✅ (Get, Get me, Update me)      │
│  ├─ /api/upload        ✅ (Image upload)                │
│  ├─ /api/rentals       ❌ MISSING                       │
│  └─ /api/payments      ❌ MISSING                       │
│                                                             │
│  Middleware:                                              │
│  ├─ JWT Auth                                             │
│  ├─ CORS                                                 │
│  ├─ Body Parser                                          │
│  └─ Static Files (uploads/)                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↕
            [Mongoose ODM for MongoDB]
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 DATABASE (MongoDB)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Collections:                                             │
│  ├─ users           (name, email, password, role)       │
│  ├─ companies       (companyName, logo, contact info)   │
│  ├─ vehicles        (brand, model, price, location)     │
│  ├─ bids            (vehicle, renter, offer, status)    │
│  ├─ otps            (email, otp, expiry)                │
│  ├─ rentals         ❌ MISSING                          │
│  └─ payments        ❌ MISSING                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
              ↕
         [Storage]
              ↓
┌─────────────────────────────────────────────────────────────┐
│           External Services                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ├─ Firebase (Authentication)  ✅                         │
│  ├─ Nodemailer (Email)         ✅ (OTP only)           │
│  ├─ Google Maps API            ✅ (Location picker)      │
│  ├─ SSLCommerz (Payments)      ❌ MISSING               │
│  └─ Cloud Storage (Images)     ⚠️ (Local uploads only)  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 DATABASE SCHEMA

### Users Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  firebaseId: String,
  role: String (owner|renter|company),
  createdAt: Date
}
```

### Companies Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  companyName: String,
  logo: String (URL),
  description: String,
  contactEmail: String,
  phone: String,
  address: String,
  isVerified: Boolean,
  createdAt: Date
}
```

### Vehicles Collection

```javascript
{
  _id: ObjectId,
  owner: ObjectId (ref: User),
  brand: String,
  model: String,
  year: Number,
  pricePerDay: Number,
  vehicleType: String (bicycle|threewheeler|car|van|others),
  fuelType: String,
  transmission: String,
  description: String,
  location: String,
  lat: Number,
  lng: Number,
  images: [String],
  company: ObjectId (ref: Company),
  availableFrom: Date,
  availableTo: Date,
  createdAt: Date
}
```

### Bids Collection

```javascript
{
  _id: ObjectId,
  vehicle: ObjectId (ref: Vehicle),
  renter: ObjectId (ref: User),
  offerPrice: Number,
  message: String,
  status: String (pending|accepted|rejected),
  createdAt: Date
}
```

### OTP Collection

```javascript
{
  _id: ObjectId,
  email: String,
  otp: String,
  createdAt: Date (with TTL index for auto-delete)
}
```

---

## 🔴 MISSING DATABASE COLLECTIONS

### ❌ Rentals Collection (CRITICAL)

```javascript
{
  _id: ObjectId,
  vehicle: ObjectId (ref: Vehicle),
  renter: ObjectId (ref: User),
  company: ObjectId (ref: Company),
  pickupDate: Date,
  returnDate: Date,
  pricePerDay: Number,
  totalDays: Number,
  basePrice: Number,
  discount: Number,
  totalPrice: Number,
  pickupLocation: String,
  returnLocation: String,
  status: String (pending_confirmation|confirmed|awaiting_pickup|active|completed|cancelled),
  paymentStatus: String (pending|partial|paid|refunded),
  notes: String,
  damageReported: Boolean,
  damageDetails: String,
  damageCharge: Number,
  fuelStatus: {
    pickupFuel: Number,
    returnFuel: Number,
    fuelCharge: Number
  },
  createdAt: Date,
  confirmedAt: Date,
  pickupAt: Date,
  returnedAt: Date
}
```

### ❌ Payments Collection (CRITICAL)

```javascript
{
  _id: ObjectId,
  rental: ObjectId (ref: Rental),
  user: ObjectId (ref: User),
  amount: Number,
  currency: String,
  paymentMethod: String (card|online_banking|mobile_wallet|cash),
  transactionId: String,
  paymentGateway: String,
  status: String (initiated|completed|failed|pending|refunded),
  gatewayResponse: Object,
  createdAt: Date,
  completedAt: Date
}
```

---

## 🎯 TARGET ARCHITECTURE (After Implementation)

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  New Pages:                                               │
│  ├─ ✨ RentalCheckout              (Multi-step booking)  │
│  ├─ ✨ BookingConfirmation          (Success page)       │
│  ├─ ✨ CompanyDashboard (Enhanced)  (Bookings + Analytics)│
│  ├─ ✨ AdminDashboard              (Admin panel)        │
│  └─ ✨ InvoiceViewer               (PDF invoices)       │
│                                                             │
│  Enhanced Components:                                     │
│  ├─ 🎨 Enhanced CompanyDashboard                         │
│  ├─ 🎨 BookingsList                                     │
│  ├─ 🎨 RevenueChart                                     │
│  ├─ 🎨 PaymentStatus                                    │
│  └─ 🎨 QuickActions                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↕
                         [Axios]
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               BACKEND (Node.js + Express)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  NEW Routes:                                              │
│  ├─ ✨ /api/rentals                                      │
│  │    ├─ POST / - Create rental                          │
│  │    ├─ GET /company - Get company rentals             │
│  │    ├─ GET /company/stats - Dashboard stats           │
│  │    ├─ PUT /:id/status - Update status                │
│  │    └─ GET /:id - Get rental details                 │
│  │                                                       │
│  ├─ ✨ /api/payments                                     │
│  │    ├─ POST /initiate - Start payment                │
│  │    └─ POST /ipn - Webhook from SSLCommerz          │
│  │                                                       │
│  └─ ✨ /api/admin (New)                                 │
│       ├─ GET /dashboard - Admin stats                  │
│       ├─ GET /users - List users                       │
│       └─ PUT /users/:id/verify - Verify company        │
│                                                             │
│  Enhanced Security:                                      │
│  ├─ 🔒 Rate limiting                                    │
│  ├─ 🔒 Input validation                                │
│  ├─ 🔒 Payment encryption                              │
│  └─ 🔒 Audit logging                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↕
            [Mongoose ODM for MongoDB]
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 DATABASE (MongoDB)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  New Collections:                                         │
│  ├─ ✅ rentals        (Complete rental lifecycle)       │
│  ├─ ✅ payments       (Payment tracking)                 │
│  └─ ⚡ Optimized indexes (Performance)                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
              ↕
         [Storage]
              ↓
┌─────────────────────────────────────────────────────────────┐
│           External Services                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Existing:                                                │
│  ├─ Firebase (Authentication)  ✅                        │
│  ├─ Nodemailer (Email)         ✅ Enhanced              │
│  ├─ Google Maps API            ✅                        │
│  │                                                       │
│  NEW:                                                    │
│  ├─ ✨ SSLCommerz (Payment Gateway)                     │
│  ├─ ✨ SMS Provider (Notifications)                     │
│  └─ ✨ Email Templates (Transactional emails)           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 BOOKING FLOW (Current vs Target)

### ❌ CURRENT FLOW (Broken)

```
User Views Car → User Creates Bid → Company Responds
    ↓                    ↓                    ↓
   NO CONFIRMATION   NO BOOKING        MANUAL PROCESS
   NO PAYMENT        NO PAYMENT         NO TRACKING
```

### ✅ TARGET FLOW (What you need)

```
┌──────────────────────────────────────────────────────────┐
│ COMPLETE RENTAL BOOKING FLOW                             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ 1. User Views Vehicle                                  │
│    └─ Shows availability calendar                     │
│                                                        │
│ 2. User Selects Dates & Location                     │
│    └─ System checks availability (REAL-TIME)        │
│                                                        │
│ 3. System Shows Pricing                              │
│    ├─ Base price = pricePerDay × totalDays          │
│    ├─ Discount (if applicable)                       │
│    ├─ Taxes                                          │
│    └─ Final total                                    │
│                                                        │
│ 4. User Creates Booking                              │
│    ├─ [POST /api/rentals]                            │
│    ├─ Status: "pending_confirmation"                │
│    └─ Payment status: "pending"                      │
│                                                        │
│ 5. User Initiates Payment                            │
│    ├─ [POST /api/payments/initiate]                  │
│    ├─ Redirects to SSLCommerz gateway               │
│    └─ Handles success/failure                        │
│                                                        │
│ 6. Payment Webhook Received                          │
│    ├─ [POST /api/payments/ipn]                       │
│    ├─ Updates payment status                         │
│    ├─ Updates rental status to "confirmed"          │
│    └─ Sends confirmation email                       │
│                                                        │
│ 7. Rental Confirmed                                  │
│    ├─ Vehicle marked as "booked"                     │
│    ├─ Company sees booking in dashboard             │
│    ├─ User sees confirmation                        │
│    └─ Calendar updated (real-time)                  │
│                                                        │
│ 8. Pickup Day                                        │
│    ├─ Company marks as "awaiting_pickup"            │
│    ├─ Send pickup reminders                         │
│    └─ Both parties exchange details                 │
│                                                        │
│ 9. Pickup Completed                                 │
│    ├─ Company marks as "active"                    │
│    ├─ Start tracking rental                        │
│    └─ Check fuel/condition                         │
│                                                        │
│ 10. Return Day                                       │
│     ├─ Company marks as "completed"                │
│     ├─ Check vehicle condition                     │
│     ├─ Check fuel level                            │
│     ├─ Apply any damage charges                    │
│     └─ Release payment to company                  │
│                                                        │
│ 11. Invoice Generated                              │
│     ├─ Show itemized charges                       │
│     ├─ Payment confirmation                        │
│     └─ Option to download as PDF                  │
│                                                        │
└──────────────────────────────────────────────────────────┘
```

---

## 💾 DATABASE INDEXES NEEDED

```javascript
// For Performance Optimization

// Rentals indexes
db.rentals.createIndex({ company: 1, status: 1, createdAt: -1 });
db.rentals.createIndex({ vehicle: 1, status: 1 });
db.rentals.createIndex({ renter: 1, createdAt: -1 });
db.rentals.createIndex({ pickupDate: 1, returnDate: 1, status: 1 });
db.rentals.createIndex({ paymentStatus: 1, status: 1 });

// Payments indexes
db.payments.createIndex({ rental: 1 });
db.payments.createIndex({ user: 1, createdAt: -1 });
db.payments.createIndex({ status: 1, createdAt: -1 });
db.payments.createIndex({ transactionId: 1 }, { unique: true, sparse: true });

// Vehicles indexes
db.vehicles.createIndex({ company: 1, createdAt: -1 });
db.vehicles.createIndex({ location: "2dsphere" }); // For geo-queries
db.vehicles.createIndex({ pricePerDay: 1, vehicleType: 1 });

// Users indexes (already should exist)
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

// Companies indexes
db.companies.createIndex({ user: 1 }, { unique: true });
db.companies.createIndex({ isVerified: 1, createdAt: -1 });
```

---

## 📈 BUSINESS IMPACT

### What's Missing Costs You:

| Issue                | Lost Revenue    | Customer Impact    |
| -------------------- | --------------- | ------------------ |
| No rentals system    | 100%            | Can't book         |
| No payment tracking  | 100%            | Can't pay          |
| No company dashboard | Business chaos  | Can't manage       |
| No admin panel       | Staff overhead  | Manual everything  |
| No notifications     | Missed bookings | Poor communication |

---

## 🚀 IMPLEMENTATION PRIORITY

### WEEK 1 (Critical Path)

```
Day 1-2:
├─ Create Rental & Payment models ✅
├─ Add rental API endpoints ✅
└─ Test with Postman

Day 3-4:
├─ Integrate SSLCommerz ✅
├─ Test payment flow ✅
└─ Add payment webhook

Day 5:
├─ Update company dashboard ✅
├─ Add bookings section ✅
└─ Deploy to test server
```

### WEEK 2 (Supporting Features)

```
Day 1-3:
├─ Admin dashboard (basic) ✅
├─ Email notifications ✅
└─ Database optimization

Day 4-5:
├─ Security hardening ✅
├─ Load testing ✅
└─ Production readiness
```

---

## ✅ LAUNCH READINESS CHECKLIST

- [ ] Rental system complete & tested
- [ ] Payment integration working
- [ ] Company dashboard fully functional
- [ ] Admin panel operational
- [ ] All API endpoints secured
- [ ] Error handling implemented
- [ ] Logging/monitoring active
- [ ] Database backups configured
- [ ] SSL/HTTPS enabled
- [ ] Rate limiting added
- [ ] Input validation on all endpoints
- [ ] CORS properly configured
- [ ] Documentation complete
- [ ] Load testing passed
- [ ] Security audit completed

---

## 📊 SUCCESS METRICS (Month 1)

Track these after launch:

- Bookings per day
- Payment success rate
- Average booking value
- Customer satisfaction
- System uptime %
- API response time
- Database performance

---

## 🎓 KEY LEARNINGS

1. **MongoDB is right choice** - Perfect for rental business
2. **Rental system is core** - Everything else builds on this
3. **Payment integration is critical** - Revenue depends on it
4. **Dashboard visibility essential** - Companies need to see business
5. **Admin controls needed** - For dispute resolution & support

Ready to implement? Start with the Rental model and work through the implementation guides! 🚀
