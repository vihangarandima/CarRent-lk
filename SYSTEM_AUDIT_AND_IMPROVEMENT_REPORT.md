# 🚗 Yamu Car Rentals: Full System Audit, Bug Report & UX Roadmap

**Document Type:** Technical & Usability Audit Report  
**Platform:** Yamu Car Rentals (Sri Lanka Vehicle Rental Marketplace)  
**Target Audience:** Development Team, Product Owners & Stakeholders  
**Status:** Ready for Review & Implementation  

---

## 📌 Executive Summary

This report provides an in-depth code audit of the **Yamu Car Rentals** codebase across the Node/Express backend, MongoDB database schemas, and Vite/React frontend.

The audit identifies:
1. **Critical functional & security bugs** that currently hinder bookings, prevent contacting peer-to-peer car owners, allow self-review/self-bidding exploits, or cause unhandled 500 server crashes.
2. **Usability friction points** such as dead-end tabs, lack of sorting, and jarring page reloads.
3. **High-converting UX enhancements** (dynamic trip price calculators, draft auto-saving, and tourist features) designed to maximize conversion rates and customer satisfaction.

---

## 🚨 PART 1: Critical Bugs, Security Exploits & Functional Fixes

### 1. Private Vehicle Owner Contact Info Missing (WhatsApp / Call Failure)
- **Files Affected**:
  - `backend/routes/vehicles.js` (lines 46, 149)
  - `frontend/src/pages/VehicleDetail.jsx` (line 93)
- **The Issue**:
  When a vehicle detail is loaded, the backend populates:
  ```js
  .populate("owner", "name email") // ❌ phone is omitted!
  ```
  On the frontend detail page, the contact handler evaluates:
  ```js
  const hostPhone = vehicle.company?.phone || "+94770000000"; // ❌ Falls back to dummy phone!
  ```
- **Consequence**:
  When an individual peer-to-peer host lists a car (without registering as a corporate company), clicking **"Contact via WhatsApp"** or **"Call Host"** redirects renters to the dummy number `+94770000000` instead of the actual owner. Renters cannot complete their inquiries.
- **Solution**:
  1. In `backend/routes/vehicles.js`, populate phone: `.populate("owner", "name email phone")`.
  2. In `frontend/src/pages/VehicleDetail.jsx`, dynamically resolve the contact phone:
     ```js
     const hostPhone = vehicle.company?.phone || vehicle.owner?.phone || "+94702434288";
     ```

---

### 2. Vehicle Search Filters Ignore Model Names
- **File Affected**: `frontend/src/pages/VehicleListing.jsx` (line 485)
- **The Issue**:
  In the search bar, Step 2 is labelled **"Brand / Model"**, but the filtering logic only inspects `v.brand`:
  ```js
  const matchBrand = !filter.brand || v.brand?.toLowerCase().includes(filter.brand.toLowerCase());
  ```
- **Consequence**:
  If a customer searches for popular Sri Lankan car models like **"Axio"**, **"Prius"**, **"Alto"**, **"Vezel"**, or **"Fortuner"**, zero vehicles are returned because the model name is never checked against the search input.
- **Solution**:
  Update `matchBrand` to check both the brand and model fields:
  ```js
  const term = filter.brand.toLowerCase().trim();
  const matchBrand = !term ||
    v.brand?.toLowerCase().includes(term) ||
    v.model?.toLowerCase().includes(term) ||
    `${v.brand} ${v.model}`.toLowerCase().includes(term);
  ```

---

### 3. Hardcoded Calendar Booked Dates on Vehicle Detail Page
- **File Affected**: `frontend/src/pages/VehicleDetail.jsx` (lines 44–48)
- **The Issue**:
  The availability calendar excludes hardcoded dummy dates:
  ```js
  const bookedDates = [
    addDays(new Date(), 2),
    addDays(new Date(), 3),
    addDays(new Date(), 7),
  ];
  ```
- **Consequence**:
  Actual active rentals stored in MongoDB are not reflected on the customer calendar, and customers are arbitrarily prevented from picking days 2, 3, and 7 regardless of whether the vehicle is truly free.
- **Solution**:
  1. Retrieve active bookings for the vehicle from the backend via `/api/rentals/vehicle/:id` or vehicle availability dates (`availableFrom` and `availableTo`).
  2. Populate `excludeDates` with real booked date ranges rather than static demo dates.

---

### 4. Profile Editing Forgets Phone Number in LocalStorage & Triggers Full Reload
- **File Affected**: `frontend/src/pages/Profile.jsx` (line 270)
- **The Issue**:
  In `handleSaveProfile`, the user inputs both name and phone. While the backend saves both, the frontend updates `localStorage` as:
  ```js
  const updatedUser = { ...user, name: res.data.user.name }; // ❌ Phone is omitted!
  ```
  Immediately after, it calls `window.location.reload()`, causing a white-screen flash and disrupting SPA navigation.
- **Solution**:
  1. Store the updated phone: `const updatedUser = { ...user, name: res.data.user.name, phone: editPhone.trim() };`.
  2. Dispatch a `user-updated` event (`window.dispatchEvent(new Event("user-updated"))`) to update components reactively without a full page refresh.

---

### 5. Inquiries & Price Bids Missing Host Management View
- **Files Affected**:
  - `backend/routes/bids.js`
  - `frontend/src/pages/CompanyDashboard.jsx`
- **The Issue**:
  Renters can submit price offers ("Tag a Price") via `/api/bids`, and the backend collects them. However:
  - There is no table or tab in the host/company dashboard where owners can inspect incoming inquiries, view customer messages, or contact them back.
  - The backend lacks an endpoint to mark a bid as accepted, declined, or countered.
- **Solution**:
  1. Add `PUT /api/bids/:id` (`status: "accepted" | "rejected" | "pending"`).
  2. Add an **"Inquiries & Bids"** view in the Host & Company dashboard displaying the renter's name, offer price, message, and a one-click WhatsApp response button.

---

### 6. Self-Review Exploitation via `/api/reviews` (Manipulated 5-Star Ratings)
- **File Affected**: `backend/routes/reviews.js` (lines 229–247)
- **The Issue**:
  In `backend/routes/vehicles.js` line 389, an owner is blocked from reviewing their own car (`if (vehicle.owner.toString() === req.user.id)`). However, in the global reviews route `POST /api/reviews`, this check was omitted entirely.
- **Consequence**:
  Vehicle owners or fleet companies can submit unlimited fake 5-star reviews to their own vehicles to manipulate ratings and rank higher in search results.
- **Solution**:
  Enforce the owner check in `backend/routes/reviews.js`:
  ```js
  if (vehicle.owner && vehicle.owner.toString() === req.user.id) {
    return res.status(400).json({ msg: "You cannot review your own vehicle." });
  }
  ```

---

### 7. Vehicle "Rented" Status Locks Permanently Until Specific Host Logs In
- **File Affected**: `backend/routes/rentals.js` (lines 14–40)
- **The Issue**:
  When a vehicle rental is created, its status is marked as `"rented"`, removing it from the marketplace. The cleanup function `autoExpireRentals` only executes when that specific vehicle owner visits `GET /api/rentals/my` or `GET /api/rentals/stats`.
- **Consequence**:
  If a customer rents a car for 2 days and the host doesn't log in for several weeks, the vehicle remains locked in `"rented"` status and completely hidden from public listings even though it has been returned.
- **Solution**:
  Run an overdue rental auto-expiry check on public vehicle lookups (`GET /api/vehicles`), or execute a periodic background cleanup.

---

### 8. Uncaught Backend 500 Crash on Seeded/Unowned Vehicles (`vehicle.owner.toString()`)
- **Files Affected**:
  - `backend/routes/rentals.js` (line 137)
  - `backend/routes/vehicles.js` (lines 289, 362)
  - `backend/routes/bids.js` (line 60)
- **The Issue**:
  Endpoints call `.toString()` directly on `vehicle.owner` without null safety checks:
  ```js
  if (vehicle.owner.toString() !== req.user.id) // ❌ Crashes if owner is undefined/null!
  ```
- **Consequence**:
  For vehicles created by company accounts where only `company` was stored, or legacy seeded cars without an owner, any attempt to record rentals, update availability, delete, or inspect bids throws an unhandled `TypeError` and crashes with a **500 Server Error**.
- **Solution**:
  Use optional chaining: `if (vehicle.owner?.toString() !== req.user.id)`.

---

### 9. Self-Bidding / Self-Inquiry Exploit
- **File Affected**: `backend/routes/bids.js` (lines 27–49)
- **The Issue**:
  `POST /api/bids` validates the offer price and vehicle existence, but does not verify whether the logged-in user is the owner of the vehicle.
- **Consequence**:
  Vehicle owners can send fake bids/inquiries to their own vehicles to inflate dashboard metrics and manipulate inquiry counts.
- **Solution**:
  ```js
  if (vehicle.owner && vehicle.owner.toString() === req.user.id) {
    return res.status(400).json({ msg: "You cannot place a bid on your own vehicle." });
  }
  ```

---

### 10. WhatsApp Floating Support Widget Fails on Standard Sri Lankan Numbers (`07...`)
- **File Affected**: `frontend/src/components/WhatsAppFloat.jsx` (line 11)
- **The Issue**:
  The floating button cleans numbers using:
  ```js
  const cleanNumber = wa.phoneNumber.replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/${cleanNumber}?text=${encodedMsg}`;
  ```
- **Consequence**:
  When an admin enters `0702434288` (the domestic format starting with `0`), clicking the button opens `wa.me/0702434288`. WhatsApp fails with: *"Phone number shared via url is invalid"*. WhatsApp requires international country format without leading zeroes (`94702434288`).
- **Solution**:
  Apply international normalization (consistent with `frontend/src/pages/CompanyDetail.jsx`):
  ```js
  let cleanNumber = wa.phoneNumber.replace(/[^0-9]/g, "");
  if (cleanNumber.startsWith("0")) cleanNumber = "94" + cleanNumber.slice(1);
  else if (cleanNumber.length === 9) cleanNumber = "94" + cleanNumber;
  ```

---

### 11. Super Admin Blocked with 403 Forbidden on Standard Vehicle Deletion
- **File Affected**: `backend/routes/vehicles.js` (lines 357–370)
- **The Issue**:
  `DELETE /api/vehicles/:id` strictly checks:
  ```js
  if (vehicle.owner.toString() !== req.user.id)
    return res.status(403).json({ msg: "Not authorized" });
  ```
- **Consequence**:
  Super Admins trying to delete inappropriate or fraudulent listings from standard vehicle pages are rejected with `403 Not authorized`.
- **Solution**:
  Allow Super Admin bypass:
  ```js
  const user = await User.findById(req.user.id).select("role");
  const isAdmin = user?.role === "admin";
  if (!isAdmin && vehicle.owner?.toString() !== req.user.id) {
    return res.status(403).json({ msg: "Not authorized" });
  }
  ```

---

### 12. Incomplete Cascade Deletes Leave Orphaned Reviews and Rentals
- **Files Affected**:
  - `backend/routes/vehicles.js` (line 364)
  - `backend/routes/admin.js` (lines 337–348, 424–441)
- **The Issue**:
  When an owner or admin deletes a vehicle, associated `Review` and `Rental` documents are not cleaned up. When an admin deletes a user account, the user's `Bid` and `Review` records remain in the database pointing to non-existent users and vehicles.
- **Consequence**:
  Orphaned references clutter MongoDB and cause `null` reference errors when calculating aggregate rating averages and rental metrics.
- **Solution**:
  Add proper cascade cleanup:
  ```js
  await Promise.all([
    Review.deleteMany({ vehicle: req.params.id }),
    Bid.deleteMany({ vehicle: req.params.id })
  ]);
  ```

---

### 13. Host Vehicle Detail View Prompts Hosts to Message Themselves
- **File Affected**: `frontend/src/pages/VehicleDetail.jsx` (lines 423–449)
- **The Issue**:
  When a host views their own vehicle listing on the public site, the interface renders the public booking form instead of recognizing them as the listing owner.
- **Consequence**:
  Hosts testing their listings accidentally send inquiries and WhatsApp messages to themselves, with no shortcut to edit or manage the car from the detail page.
- **Solution**:
  Show a dedicated host banner when `isOwnListing` is true with a link to *"Manage this listing in Dashboard"*.

---

### 14. Anonymous / Guest "Helpful" Vote Spam Exploit on Reviews
- **File Affected**: `backend/routes/reviews.js` (lines 315–318)
- **The Issue**:
  In `POST /api/reviews/:id/helpful`, when unauthenticated guest users click the helpful button, the backend unconditionally increments:
  ```js
  } else {
    // Guest vote
    review.helpfulCount += 1;
  }
  ```
  There is zero IP check, session check, or rate limiting.
- **Consequence**:
  Anyone can write a simple loop script to hit this endpoint 50,000 times in seconds to artificially inflate any review's score and manipulate customer perception.
- **Solution**:
  Require logged-in authentication to vote, or track voter IP addresses in an expiring cache to prevent multiple votes per IP.

---

### 15. Registered Renters Trapped in Redirect Loop (`/dashboard` ➔ `/choose-listing-type`)
- **File Affected**: `frontend/src/pages/CompanyDashboard.jsx` (lines 133–136)
- **The Issue**:
  When a user with role `"renter"` visits `/dashboard`:
  ```js
  if (user.role === "renter" && !wantsCompanySetup) {
    navigate("/choose-listing-type", { replace: true });
    return;
  }
  ```
- **Consequence**:
  Customers who only want to rent vehicles have **no customer dashboard** to view their active booking inquiries, rental receipts, or saved vehicles. If they don't want to list a vehicle, clicking "Dashboard" traps them in an unwanted onboarding funnel.
- **Solution**:
  Provide a dedicated Renter Dashboard view displaying their active rentals, past trip history, and submitted price bids.

---

### 16. Logged-in Users Cannot Change Their Password
- **Files Affected**:
  - `backend/routes/auth.js` (lines 461–509)
  - `frontend/src/pages/Profile.jsx`
- **The Issue**:
  There is no endpoint (`POST /api/auth/change-password`) and no UI in `Profile.jsx` allowing an authenticated user to update their password.
- **Consequence**:
  If a user wants to update their password for security reasons, their only recourse is to log out, go to the login screen, click "Forgot Password", and wait for an email OTP.
- **Solution**:
  Add a standard `POST /api/auth/change-password` endpoint requiring the user's current password and new password, paired with a "Security" card on the Profile page.

---

### 17. Vehicle Hosts Locked Out of Personal `/profile`
- **File Affected**: `frontend/src/App.jsx` (line 212)
- **The Issue**:
  In `App.jsx`, the profile route is guarded as:
  ```jsx
  <Route path="/profile" element={isLister() ? <Navigate to={DASHBOARD_PATH} replace /> : <Profile />} />
  ```
- **Consequence**:
  Personal car owners and fleet managers are forcibly redirected away from `/profile` back to `/dashboard`. They are completely locked out of updating their personal profile picture, name, or account credentials.
- **Solution**:
  Allow all authenticated users access to `/profile`:
  ```jsx
  <Route path="/profile" element={<Profile />} />
  ```

---

### 18. Renters Cannot View the Inquiries / Bids They Sent
- **File Affected**: `backend/routes/bids.js` (lines 8–23)
- **The Issue**:
  `GET /api/bids/my` only retrieves bids received for vehicles owned by the logged-in user. There is no endpoint (e.g. `GET /api/bids/sent`) to retrieve bids submitted by the logged-in renter (`Bid.find({ renter: req.user.id })`).
- **Consequence**:
  When renters submit custom price offers ("Tag a Price"), they have no interface or API to track their offers, view responses, or check whether a host accepted.
- **Solution**:
  Add `GET /api/bids/sent` populated with vehicle and owner contact details.

---

### 19. Hosts Cannot Accept or Decline Bids (Missing `PUT /api/bids/:id`)
- **Files Affected**:
  - `backend/routes/bids.js`
  - `backend/models/Bid.js` (line 8)
- **The Issue**:
  The `Bid` schema explicitly defines `status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }`, but `bids.js` lacks an endpoint allowing hosts to update the status.
- **Consequence**:
  Hosts cannot resolve incoming customer bids within the system, rendering the bid status field static and non-functional.
- **Solution**:
  Add `PUT /api/bids/:id` allowing the vehicle owner to update status to `"accepted"` or `"rejected"`.

---

### 20. Inconsistent Authorization Header Support in `reviews.js` (Ignores `Bearer <token>`)
- **File Affected**: `backend/routes/reviews.js` (lines 10–24)
- **The Issue**:
  Unlike `backend/middleware/auth.js` (which parses both `x-auth-token` and `Authorization: Bearer <token>`), `reviews.js` defines custom auth middleware that strictly checks `req.header("x-auth-token")`.
- **Consequence**:
  Third-party API integrations, mobile clients, and testing tools sending standard HTTP `Authorization: Bearer <token>` headers are falsely rejected with `401 No token, authorization denied`.
- **Solution**:
  Import and reuse the shared `auth` and `optionalAuth` middleware from `backend/middleware/auth.js`.

---

## ⚡ PART 2: Usability & User-Friendliness Enhancements

### 1. Dead-End Tabs in the Company Dashboard
- **File Affected**: `frontend/src/pages/CompanyDashboard.jsx` (lines 902–911)
- **The Problem**:
  The sidebar features **"Payments"**, **"Customers"**, and **"Settings"**, but clicking any of them displays a placeholder message: *"This section is coming soon."*
- **Recommended Action**:
  - **Payments Tab**: Provide a breakdown of completed rental revenues, active deposits, and daily fleet earning averages.
  - **Customers Tab**: Provide a contact list of past and current renters (name, phone, vehicle rented, date).
  - **Settings Tab**: Allow companies to update operating hours, cancellation policies, and emergency contact numbers.

---

### 2. Vehicle Sorting Dropdown is Missing
- **File Affected**: `frontend/src/pages/VehicleListing.jsx`
- **The Problem**:
  Vehicles can only be filtered by type or radius. There is no dropdown to sort inventory.
- **Recommended Action**:
  Add a standard sort selector in the search header:
  - 💰 **Price: Low to High**
  - 💎 **Price: High to Low**
  - 🆕 **Newest Listings First**
  - ⭐ **Top Rated Vehicles**

---

### 3. "List Another Vehicle" Triggers Hard Browser Reload
- **File Affected**: `frontend/src/pages/ListVehicle.jsx` (line 988)
- **The Problem**:
  After completing a vehicle listing, clicking the secondary button **"List Another Vehicle"** runs `window.location.reload()`. This blows away the SPA cache and slows down host workflow.
- **Recommended Action**:
  Replace `window.location.reload()` with a clean form state reset:
  ```js
  setFormData(INITIAL_FORM_DATA);
  setStep(1);
  ```

---

### 4. Navbar Authentication State is Non-Reactive
- **Files Affected**:
  - `frontend/src/components/Navbar.jsx` (line 8)
  - `frontend/src/pages/Login.jsx` (lines 43, 79)
- **The Problem**:
  `Navbar.jsx` reads `const token = localStorage.getItem("token")` as an unreactive variable outside of state. Consequently, `Login.jsx` has to call `window.location.reload()` after signing in just so the Navbar switches to the logged-in user state.
- **Recommended Action**:
  Store `token` in React state and listen to `window.addEventListener("user-updated", ...)` so that login/logout transitions occur instantaneously without full page reloads.

---

## 🚀 PART 3: Experience Enhancements to "WOW" Users

### 1. Dynamic Trip Duration & Auto-Pricing Calculator
- **Where**: `frontend/src/pages/VehicleDetail.jsx`
- **Current State**: Only displays the flat rate (e.g. `LKR 12,000 / day`).
- **Upgrade**:
  When a renter selects dates on the calendar (e.g. 5 days), dynamically render a booking summary card:
  - **Rental Duration**: 5 Days
  - **Base Rate**: `5 × LKR 12,000 = LKR 60,000`
  - **Mileage Allowance**: 500 km included free (100 km/day)
  - **Excess Mileage Rate**: LKR 80/km after 500 km
  - **Refundable Deposit**: LKR 25,000
- **Impact**: Provides instant transparency and eliminates back-and-forth pricing questions.

---

### 2. Multi-Step Listing Draft Auto-Save
- **Where**: `frontend/src/pages/ListVehicle.jsx`
- **Current State**: If a host accidentally closes or refreshes their browser during the 4-step listing wizard, all entered vehicle details, specs, and uploaded photos are lost.
- **Upgrade**:
  Persist `formData` into `sessionStorage` on change (`yamu_listing_draft`). If a host returns or refreshes, prompt:
  > *"We saved your unfinished vehicle listing draft. Would you like to resume?"*
- **Impact**: Dramatically reduces host drop-off and increases listing completion rates.

---

### 3. Direct Host Verification Badge Explanatory Tooltip
- **Where**: Vehicle cards and detail pages.
- **Current State**: Displays a green checkmark icon without contextual explanation.
- **Upgrade**:
  Adding a hover tooltip or click modal that explains Yamu's verification standard:
  > *"Verified Host: Physical identity, vehicle registration documents, and commercial insurance have been vetted by Yamu Quality Assurance."*
- **Impact**: Instills immediate trust for high-value bookings and tourists.

---

### 4. International Tourist Currency Display Toggle
- **Where**: Header / Navbar.
- **Current State**: Only displays rates in Sri Lankan Rupees (LKR).
- **Upgrade**:
  Provide an optional currency toggle in the navbar (LKR, USD, EUR, GBP) using a daily exchange rate multiplier.
- **Impact**: Greatly appeals to foreign tourists planning vacations to Sri Lanka.

---

## 📅 Recommended Implementation Plan

| Phase | Focus Areas | Estimated Effort |
| :--- | :--- | :--- |
| **Phase 1: Critical Fixes & Security** | • Owner contact phone populated on Vehicle Detail & WhatsApp<br>• Brand & Model search query fix<br>• Prevent self-reviews & self-bidding<br>• Block guest vote spam on reviews<br>• Add null-safety for `vehicle.owner.toString()`<br>• Fix WhatsApp floating button domestic phone formatting | Immediate (1–2 days) |
| **Phase 2: Data Integrity & User Flows** | • Unlock `/profile` for hosts and add Change Password<br>• Create customer inquiries view (`GET /api/bids/sent`)<br>• Add host bid response endpoint (`PUT /api/bids/:id`)<br>• Standardize Bearer auth header in `reviews.js`<br>• Global auto-expiry for rented vehicle status<br>• Admin permission bypass for vehicle deletion<br>• Cascade cleanup for deleted vehicles/users | Short Term (2–3 days) |
| **Phase 3: Experience Polish** | • Renter dashboard for bookings & inquiries<br>• Dynamic trip pricing calculator on vehicle detail page<br>• Host "Manage Listing" shortcut on detail view<br>• Listing wizard draft auto-save in `sessionStorage`<br>• Verified host badge modal & currency toggle | Enhancement (2–4 days) |

---

*Report prepared for the Yamu Car Rentals Engineering & Product Team.*
