# 🚗 Yamu Car Rentals: Full System Audit, Bug Report & UX Roadmap

**Document Type:** Technical & Usability Audit Report  
**Platform:** Yamu Car Rentals (Sri Lanka Vehicle Rental Marketplace)  
**Target Audience:** Development Team, Product Owners & Stakeholders  
**Status:** Ready for Review & Implementation  

---

## 📌 Executive Summary

This report provides an in-depth code audit of the **Yamu Car Rentals** codebase across the Node/Express backend, MongoDB database schemas, and Vite/React frontend.

The audit identifies:
1. **Critical functional bugs** that currently hinder bookings, prevent contacting peer-to-peer car owners, or break vehicle search queries.
2. **Usability friction points** such as dead-end tabs, lack of sorting, and jarring page reloads.
3. **High-converting UX enhancements** (dynamic trip price calculators, draft auto-saving, and tourist features) designed to maximize conversion rates and customer satisfaction.

---

## 🚨 PART 1: Critical Bugs & Functional Fixes

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
| **Phase 1: Critical Fixes** | • Owner contact phone populated on Vehicle Detail & WhatsApp<br>• Brand & Model search query fix<br>• Profile editing phone number fix in localStorage<br>• Vehicle sorting dropdown | Immediate (1–2 days) |
| **Phase 2: Host Operations** | • Inquiries & Bids management tab in Company Dashboard<br>• Replace demo booked dates with real rental schedules<br>• Eliminate hard reloads on listing & login | Short Term (2–3 days) |
| **Phase 3: Experience Polish** | • Dynamic trip pricing calculator on vehicle detail page<br>• Listing wizard draft auto-save in `sessionStorage`<br>• Verified host badge modal & currency toggle | Enhancement (2–4 days) |

---

*Report prepared for the Yamu Car Rentals Engineering & Product Team.*
