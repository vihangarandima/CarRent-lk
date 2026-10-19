# Yamu Car Rentals: Full-Stack System Bugs Audit Report

**Generated Date:** October 18, 2026  
**Repository:** `CarRent-lk`  
**Scope:** Full-stack codebase audit across Node.js/Express backend routes, MongoDB Mongoose schemas, and React/Vite frontend.

---

## 1. Executive Summary

This report documents all active software bugs, security vulnerabilities, business logic oversights, and data integrity edge-cases uncovered in the Yamu Car Rentals platform.

### Summary Statistics:
- **Total Issues Identified:** 18
- **High Severity (Security & Workflow Blockers):** 4
- **Medium Severity (Data Integrity & Account Lockouts):** 6
- **Low Severity (Formatting, Polish & Missing Endpoints):** 8

---

## 2. Issues Summary Matrix

| ID | Severity | Category | Description | Affected Files |
| :--- | :---: | :--- | :--- | :--- |
| **BUG-01** | `HIGH` | Security / Auth | Unauthorized bid status manipulation on company vehicles | `backend/routes/bids.js` |
| **BUG-02** | `HIGH` | Business Logic | Premature all-or-nothing vehicle lockout on future rentals | `backend/routes/rentals.js`<br>`backend/routes/vehicles.js`<br>`backend/routes/bookings.js` |
| **BUG-03** | `HIGH` | Integration | Concierge dispatch link authentication failure via WhatsApp | `backend/routes/bookings.js`<br>`frontend/src/pages/VehicleDetail.jsx` |
| **BUG-04** | `HIGH` | Data Integrity | Incomplete cascade delete leaves orphaned reviews and rentals | `backend/routes/vehicles.js`<br>`backend/routes/admin.js` |
| **BUG-05** | `MEDIUM` | Routing / UX | Vehicle hosts locked out of personal `/profile` | `frontend/src/App.jsx` |
| **BUG-06** | `MEDIUM` | Business Logic | Fleet companies cannot see inquiries/bids in dashboard | `backend/routes/bids.js` |
| **BUG-07** | `MEDIUM` | Business Logic | Fleet companies cannot see rentals or revenue in dashboard | `backend/routes/rentals.js` |
| **BUG-08** | `MEDIUM` | Data Integrity | Deleting companies leaves dangling references on vehicles | `backend/routes/admin.js` |
| **BUG-09** | `MEDIUM` | Data Flow | Broken company profile link (`/companies/undefined`) on fleet cards | `backend/routes/companies.js`<br>`frontend/src/components/VehicleCard.jsx` |
| **BUG-10** | `MEDIUM` | Security | Unrestricted review "Helpful" vote spamming | `backend/routes/reviews.js` |
| **BUG-11** | `LOW` | Routing / UX | Renters trapped in redirect loop on `/dashboard` | `frontend/src/pages/CompanyDashboard.jsx` |
| **BUG-12** | `LOW` | Feature Gap | Missing change-password endpoint for authenticated users | `backend/routes/auth.js`<br>`frontend/src/pages/Profile.jsx` |
| **BUG-13** | `LOW` | Feature Gap | Renters cannot view submitted inquiries/bids | `backend/routes/bids.js` |
| **BUG-14** | `LOW` | Integration | WhatsApp floating button fails on `07...` domestic numbers | `frontend/src/components/WhatsAppFloat.jsx` |
| **BUG-15** | `LOW` | Standards | Non-standard auth headers in reviews route | `backend/routes/reviews.js` |
| **BUG-16** | `LOW` | Standards | Axios interceptor omits standard RFC `Authorization: Bearer` | `frontend/src/utils/session.js` |
| **BUG-17** | `LOW` | Reliability | Mailer API error handler masks diagnostic errors on non-JSON payloads | `backend/utils/mailer.js` |
| **BUG-18** | `LOW` | UI / Feature | Festival themes "Avurudu" and "Diwali" render blank | `backend/models/SiteConfig.js`<br>`frontend/src/components/festivals/FestivalAccessoriesManager.jsx` |

---

## 3. Detailed Bug Reports

---

### BUG-01: Unauthorized Bid Status Manipulation & Missing Company Ownership Checks
* **Severity:** High
* **Category:** Security / Authorization
* **Affected File:** `backend/routes/bids.js` (lines 85–105)
* **Code in Question:**
  ```javascript
  const bid = await Bid.findById(req.params.id).populate('vehicle', 'owner');
  if (!bid) return res.status(404).json({ msg: 'Bid not found' });

  if (bid.vehicle && bid.vehicle.owner && bid.vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to manage this bid' });
  }
  ```
* **Vulnerability Description:**
  1. For vehicles listed under a **company account**, `bid.vehicle.owner` may be `null` or unpopulated. The expression `bid.vehicle && bid.vehicle.owner && ...` evaluates to falsy (`null`), so authorization succeeds unconditionally. **Any authenticated user (even regular renters) can accept, reject, or modify the status of any company vehicle's bid.**
  2. If the associated vehicle was deleted (`bid.vehicle` is `null`), the check is bypassed entirely.
  3. Legitimate company account managers are never checked against company records (`Company.findOne({ user: req.user.id })`), preventing companies from updating bids on their own fleet.
* **Recommended Fix:**
  ```javascript
  const vehicle = await Vehicle.findById(bid.vehicle).select('owner company');
  if (!vehicle) return res.status(404).json({ msg: 'Associated vehicle not found' });

  const isAdmin = req.user.role === 'admin';
  let isAuthorized = isAdmin || (vehicle.owner && vehicle.owner.toString() === req.user.id);
  if (!isAuthorized && vehicle.company) {
    const company = await Company.findOne({ user: req.user.id }).select('_id');
    isAuthorized = Boolean(company && vehicle.company.toString() === company._id.toString());
  }
  if (!isAuthorized) {
    return res.status(403).json({ msg: 'Not authorized to manage this bid' });
  }
  ```

---

### BUG-02: Premature All-or-Nothing Vehicle Lockout on Future Rentals
* **Severity:** High
* **Category:** Core Business Logic
* **Affected Files:**
  * `backend/routes/rentals.js` (lines 171–173, lines 226–229)
  * `backend/routes/vehicles.js` (lines 413–415)
  * `backend/routes/bookings.js` (lines 410–414)
* **Vulnerability Description:**
  When a host books a vehicle or an admin confirms a booking for future dates (e.g., December 1 to 5):
  1. The vehicle's status is immediately updated to `status = "rented"`.
  2. Line 171 of `rentals.js` throws a blocking 400 error:
     ```javascript
     if (vehicle.status === "rented") {
       return res.status(400).json({ msg: "This vehicle is already rented. Mark that rental as returned first." });
     }
     ```
     The host is barred from adding other non-overlapping rental dates.
  3. Line 413 of `vehicles.js` blocks the host from editing their vehicle pricing, images, or details:
     ```javascript
     else if (vehicle.status === "rented") {
       return res.status(400).json({ msg: "This vehicle is currently rented. Mark the rental as returned first." });
     }
     ```
  4. The platform's date-exclusion calendar (`excludeDateIntervals`) is rendered useless because the system treats `"rented"` as an immediate, total freeze rather than an active-time check.
* **Recommended Fix:**
  A vehicle should only have `status = "rented"` if the current date falls between `pickupDate` and `returnDate` (`now >= pickupDate && now <= returnDate`). If the booking is for the future, the vehicle status should remain `"active"`, and availability is enforced purely by date interval conflict checks.

---

### BUG-03: Concierge Dispatch Link Authentication Failure via WhatsApp
* **Severity:** High
* **Category:** Workflow / Integration
* **Affected Files:**
  * `backend/routes/bookings.js` (lines 42–74)
  * `frontend/src/pages/VehicleDetail.jsx` (lines 222–245)
  * `frontend/src/pages/DispatchDashboard.jsx` (lines 87–109)
* **Vulnerability Description:**
  1. When a customer initiates a booking inquiry on `VehicleDetail.jsx`, the generated WhatsApp message includes:
     ```
     🔑 Admin Concierge Dispatch Portal:
     http://.../dispatch/<id>?token=<dispatch_token>
     ```
     This pre-fills an administrative link directly into the customer's personal WhatsApp text box.
  2. In `backend/routes/bookings.js`, `verifyDispatchAccess` requires an `admin` JWT in the request headers (`x-auth-token` or `Authorization`) and **ignores `req.query.token`**.
  3. When an administrator taps the link on their mobile device from WhatsApp, the mobile browser does not have the desktop admin session stored, causing a `401 Unauthorized` lockout.
* **Recommended Fix:**
  * Remove the internal dispatch link from the customer's WhatsApp text template (admins already receive this link via automated email alert).
  * Allow `verifyDispatchAccess` to authenticate requests if a valid, unexpired `dispatchToken` matching `booking.dispatchToken` is provided in the query string.

---

### BUG-04: Incomplete Cascade Delete Leaves Orphaned Reviews, Bookings & Rentals
* **Severity:** High
* **Category:** Data Integrity
* **Affected Files:**
  * `backend/routes/vehicles.js` (lines 457–458)
  * `backend/routes/admin.js` (lines 346–356)
* **Vulnerability Description:**
  * When a host deletes a vehicle in `vehicles.js`:
    ```javascript
    await vehicle.deleteOne();
    res.json({ msg: "Vehicle removed" });
    ```
    No cleanup is run on `Review`, `Rental`, `Booking`, or `Bid` collections.
  * In `admin.js`, vehicle deletion cleans up `Bid.deleteMany()`, but still leaves `Review`, `Rental`, and `Booking` untouched.
* **Impact:** MongoDB retains orphaned documents pointing to non-existent vehicle IDs. In `AdminDashboard.jsx`, the reviews table is forced to render `"Vehicle Deleted"` as an error fallback.
* **Recommended Fix:**
  Add a unified cascade helper or execute concurrent cleanup:
  ```javascript
  await Promise.all([
    vehicle.deleteOne(),
    Bid.deleteMany({ vehicle: vehicle._id }),
    Review.deleteMany({ vehicle: vehicle._id }),
    Rental.deleteMany({ vehicle: vehicle._id }),
    Booking.updateMany({ vehicle: vehicle._id }, { $set: { status: "cancelled", cancellationReason: "Vehicle deleted by owner" } }),
  ]);
  ```

---

### BUG-05: Vehicle Hosts Locked Out of Personal `/profile`
* **Severity:** Medium
* **Category:** Routing / User Experience
* **Affected File:** `frontend/src/App.jsx` (line 218)
* **Code in Question:**
  ```jsx
  <Route path="/profile" element={isLister() ? <Navigate to={DASHBOARD_PATH} replace /> : <Profile />} />
  ```
* **Vulnerability Description:**
  Any user registered as `owner` or `company` (`isLister()` returns true) who navigates to `/profile` or clicks their profile settings is forcefully redirected to `/dashboard`.
* **Impact:** Vehicle hosts cannot access `Profile.jsx` to update their personal phone number, change their personal name or avatar, or view rentals where they acted as a customer.
* **Recommended Fix:**
  Remove the redirect guard on `/profile` so all authenticated users can view and edit their personal profile:
  ```jsx
  <Route path="/profile" element={<Profile />} />
  ```

---

### BUG-06: Fleet Companies Cannot View Inquiries/Bids in Dashboard
* **Severity:** Medium
* **Category:** Core Business Logic
* **Affected File:** `backend/routes/bids.js` (lines 11–24)
* **Code in Question:**
  ```javascript
  const userVehicles = await Vehicle.find({ owner: req.user.id }).select('_id');
  const vehicleIds = userVehicles.map((v) => v._id);
  const bids = await Bid.find({ vehicle: { $in: vehicleIds } })
  ```
* **Vulnerability Description:**
  In fleet company listings, vehicles are associated via `company: companyId`. By strictly querying `Vehicle.find({ owner: req.user.id })`, any vehicle assigned to the company where `owner` differs or is seeded does not get returned.
* **Impact:** Fleet companies cannot view or reply to customer inquiries or price bids for their fleet vehicles.
* **Recommended Fix:**
  ```javascript
  const company = await Company.findOne({ user: req.user.id }).select('_id');
  const vehicleQuery = {
    $or: [
      { owner: req.user.id },
      ...(company ? [{ company: company._id }] : [])
    ]
  };
  const userVehicles = await Vehicle.find(vehicleQuery).select('_id');
  ```

---

### BUG-07: Fleet Companies Cannot View Rentals or Revenue in Dashboard
* **Severity:** Medium
* **Category:** Core Business Logic
* **Affected File:** `backend/routes/rentals.js` (lines 72–75, lines 89–91)
* **Code in Question:**
  ```javascript
  const rentals = await Rental.find({ owner: req.user.id })
  ```
* **Vulnerability Description:**
  Both `GET /api/rentals/my` and `GET /api/rentals/stats` strictly query `{ owner: req.user.id }`. Rentals created for company vehicles (`company: companyId`) are ignored if the rental record references the company entity rather than `req.user.id`.
* **Impact:** Fleet hosts see 0 active rentals and Rs. 0 in revenue on their dashboard analytics.
* **Recommended Fix:**
  Query both user ownership and company fleet assignments:
  ```javascript
  const company = await Company.findOne({ user: req.user.id }).select('_id');
  const query = {
    $or: [
      { owner: req.user.id },
      ...(company ? [{ company: company._id }] : [])
    ]
  };
  const rentals = await Rental.find(query)...
  ```

---

### BUG-08: Deleting a Company Leaves Dangling References in Vehicles
* **Severity:** Medium
* **Category:** Data Integrity
* **Affected File:** `backend/routes/admin.js` (lines 553–562)
* **Code in Question:**
  ```javascript
  router.delete("/companies/:id", auth, adminOnly, async (req, res) => {
    try {
      const company = await Company.findByIdAndDelete(req.params.id);
      if (!company) return res.status(404).json({ msg: "Company not found" });
      res.json({ msg: "Company deleted successfully" });
  ```
* **Vulnerability Description:**
  When a Super Admin deletes a company account, `Vehicle.find({ company: req.params.id })` are left unchanged in the database.
* **Impact:** Vehicles continue referencing the deleted company ID, causing 404 errors when customers attempt to view the company fleet.
* **Recommended Fix:**
  ```javascript
  await Vehicle.updateMany({ company: req.params.id }, { $set: { company: null } });
  ```

---

### BUG-09: Broken Company Link (`/companies/undefined`) on Fleet Cards
* **Severity:** Medium
* **Category:** Data Flow / Frontend UI
* **Affected Files:**
  * `backend/routes/companies.js` (lines 149–151)
  * `frontend/src/components/VehicleCard.jsx` (lines 94–100)
* **Code in Question:**
  In `companies.js`:
  ```javascript
  const vehicles = await Vehicle.find({ company: company._id, ...PUBLIC_STATUS_FILTER });
  ```
  In `VehicleCard.jsx`:
  ```jsx
  {vehicle.company && (
    <Link to={`/companies/${vehicle.company._id}`} className="v-company-link">
      <Building2 size={12} /> {vehicle.company.companyName}
    </Link>
  )}
  ```
* **Vulnerability Description:**
  `GET /api/companies/:id` queries vehicles without `.populate("company")`. Thus, `vehicle.company` is a raw MongoDB ObjectId string. `vehicle.company._id` evaluates to `undefined`, generating links such as `<a href="/companies/undefined">` with empty text.
* **Recommended Fix:**
  Add `.populate("company", "companyName logo isVerified")` to the vehicles query in `backend/routes/companies.js`.

---

### BUG-10: Anonymous / Guest "Helpful" Vote Spam on Reviews
* **Severity:** Medium
* **Category:** Security / Data Integrity
* **Affected File:** `backend/routes/reviews.js` (lines 337–341)
* **Code in Question:**
  ```javascript
  } else {
    // Guest vote
    review.helpfulCount += 1;
  }
  await review.save();
  ```
* **Vulnerability Description:**
  Unauthenticated guests can send unlimited POST requests to `/api/reviews/:id/helpful`, incrementing `helpfulCount` infinitely.
* **Recommended Fix:**
  Require authentication for helpful votes, or enforce strict IP-based rate-limiting with a Redis/in-memory cooldown map.

---

### BUG-11: Renters Trapped in Redirect Loop on `/dashboard`
* **Severity:** Low
* **Category:** Routing / User Experience
* **Affected File:** `frontend/src/pages/CompanyDashboard.jsx` (lines 144–147)
* **Code in Question:**
  ```javascript
  if (user.role === "renter" && !wantsCompanySetup) {
    navigate("/choose-listing-type", { replace: true });
    return;
  }
  ```
* **Vulnerability Description:**
  When a renter navigates to `/dashboard`, they are redirected to `/choose-listing-type` to become a host, rather than receiving a customer view or being redirected to `/profile`.
* **Recommended Fix:**
  Redirect renters to `/profile` with a notification tab for their booking history:
  ```javascript
  if (user.role === "renter" && !wantsCompanySetup) {
    navigate("/profile", { replace: true });
    return;
  }
  ```

---

### BUG-12: Logged-in Users Cannot Change Their Password
* **Severity:** Low
* **Category:** Feature Gap / Account Management
* **Affected Files:**
  * `backend/routes/auth.js`
  * `frontend/src/pages/Profile.jsx`
* **Vulnerability Description:**
  No `POST /api/auth/change-password` endpoint exists. Authenticated users who know their password cannot update it without logging out and requesting a 6-digit OTP reset.
* **Recommended Fix:**
  Implement `POST /api/auth/change-password` accepting `currentPassword` and `newPassword`, verifying `bcrypt.compare(currentPassword, user.password)`.

---

### BUG-13: Renters Cannot View Submitted Inquiries/Bids
* **Severity:** Low
* **Category:** Feature Gap / User Experience
* **Affected File:** `backend/routes/bids.js`
* **Vulnerability Description:**
  `Bid.find({ renter: req.user.id })` is not exposed by any route. Renters cannot see the offers they have placed or whether a host accepted or declined them.
* **Recommended Fix:**
  Add `GET /api/bids/sent` route returning all bids where `renter: req.user.id`.

---

### BUG-14: WhatsApp Floating Button Fails on Domestic Numbers (`07...`)
* **Severity:** Low
* **Category:** Integration / Formatting
* **Affected File:** `frontend/src/components/WhatsAppFloat.jsx` (lines 11–15)
* **Code in Question:**
  ```javascript
  const cleanNumber = wa.phoneNumber.replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/${cleanNumber}?text=${encodedMsg}`;
  ```
* **Vulnerability Description:**
  If the phone number in site configuration starts with `0` (e.g. `070 243 4288`), `cleanNumber` retains the leading zero (`0702434288`). `wa.me/0702434288` fails to open in WhatsApp.
* **Recommended Fix:**
  ```javascript
  let cleanNumber = wa.phoneNumber.replace(/[^0-9]/g, "");
  if (cleanNumber.startsWith("0")) cleanNumber = "94" + cleanNumber.slice(1);
  if (cleanNumber.length === 9) cleanNumber = "94" + cleanNumber;
  ```

---

### BUG-15: Inconsistent Auth Header Support in Reviews Route
* **Severity:** Low
* **Category:** API Standards
* **Affected File:** `backend/routes/reviews.js` (lines 11–34)
* **Vulnerability Description:**
  `reviews.js` defines local `auth` and `optionalAuth` functions that only inspect `x-auth-token`, ignoring `Authorization: Bearer <token>`.
* **Recommended Fix:**
  Import `{ auth, optionalAuth }` directly from `../middleware/auth`.

---

### BUG-16: Axios Interceptor Omits Standard `Authorization: Bearer`
* **Severity:** Low
* **Category:** API Standards
* **Affected File:** `frontend/src/utils/session.js` (lines 80–90)
* **Code in Question:**
  ```javascript
  if (!config.headers["x-auth-token"]) {
    config.headers["x-auth-token"] = token;
  }
  ```
* **Vulnerability Description:**
  The client-side interceptor omits `Authorization: Bearer <token>`, causing failures when calling endpoints that rely on standard RFC 6750 headers.
* **Recommended Fix:**
  ```javascript
  config.headers["x-auth-token"] = token;
  config.headers["Authorization"] = `Bearer ${token}`;
  ```

---

### BUG-17: Mailer Error Handler Masks Diagnostic Errors on Non-JSON Payloads [RESOLVED]
* **Severity:** Low
* **Category:** Reliability / Debugging
* **Affected File:** `backend/utils/mailer.js`
* **Status:** Resolved — implemented `parseApiError` to handle raw text, nested JSON errors, and HTML proxy fallbacks.
* **Vulnerability Description:**
  When cloud transactional mail providers return upstream HTML error pages or nested error payloads, `data.message` evaluates to `undefined`, swallowing the true error.
* **Fix Applied:**
  Safely extracts `data.message`, `data.error?.message`, string errors, descriptions, and parses HTML/plaintext fallbacks.

---

### BUG-18: Festival Themes "Avurudu" and "Diwali" Render Blank
* **Severity:** Low
* **Category:** UI / Feature Completion
* **Affected Files:**
  * `backend/models/SiteConfig.js` (lines 69–74)
  * `frontend/src/components/festivals/FestivalAccessoriesManager.jsx` (lines 22–30)
* **Vulnerability Description:**
  The schema allows `"avurudu"` and `"diwali"`, but `FestivalAccessoriesManager.jsx` only supports `"christmas"` and `"vesak"`. Setting Avurudu or Diwali in Admin results in `null` rendering.
* **Recommended Fix:**
  Implement accessory components for Avurudu and Diwali, or disable their radio options in the Admin panel.

---

## 4. Priority Remediation Plan

1. **Step 1: Security & Auth Hardening (Immediate)**
   - Fix `PUT /api/bids/:id` authorization checks (`BUG-01`).
   - Require authentication for review helpful votes (`BUG-10`).
   - Allow token-based access on dispatch booking endpoints (`BUG-03`).

2. **Step 2: Core Booking & Rental Availability (Immediate)**
   - Revise vehicle status updating to avoid locking vehicles for future rentals (`BUG-02`).
   - Enable company fleet visibility in `bids.js` and `rentals.js` (`BUG-06`, `BUG-07`).

3. **Step 3: Data Integrity & Cascade Cleanup (High)**
   - Implement cascade deletions on vehicle removal (`BUG-04`).
   - Cascade unassign vehicles on company removal (`BUG-08`).
   - Populate `company` on `GET /api/companies/:id` (`BUG-09`).

4. **Step 4: User Experience & Standards Polish (Medium)**
   - Unlock `/profile` for hosts (`BUG-05`).
   - Redirect renters cleanly from `/dashboard` (`BUG-11`).
   - Add domestic number formatting in `WhatsAppFloat.jsx` (`BUG-14`).
   - Standardize `Authorization: Bearer` across client and server (`BUG-15`, `BUG-16`).
   - Implement `change-password` endpoint (`BUG-12`).
