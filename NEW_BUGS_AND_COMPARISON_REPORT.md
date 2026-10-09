# Yamu Car Rentals: New Bugs Audit & Previous Bugs Comparison Report

**Generated Date:** October 07, 2026  
**Repository:** `https://github.com/vihangarandima/CarRent-lk`  
**Branch:** `main` (synchronized with commit `923511b`)  
**Scope:** Full-stack codebase audit across Node.js/Express backend, MongoDB schemas, and React/Vite frontend.

---

## 1. Executive Summary

Following the synchronization with the latest GitHub remote version (`923511b fix(email): add robust mailer with port 587 STARTTLS and HTTPS API fallback`), an exhaustive verification and differential audit was executed. 

### Key Takeaways:
1. **Substantial Improvements Fixed:** 
   - **8 of the previously reported issues** (including major functional blockers such as owner phone population on vehicle detail, brand/model search query parsing, real rental calendar exclusions, reactive profile and auth states, host bid management, and multi-step draft saving) are now **FIXED** in the current code.
2. **Remaining Previous Issues:**
   - **12 of the previous issues** remain open (notably self-review and self-bidding prevention, guest vote spam, missing change password endpoint, host `/profile` lockout, and null-safety on legacy `owner.toString()` calls).
3. **7 New Bugs Discovered:**
   - 7 newly identified bugs and architectural edge-cases were uncovered that were **not** documented in the previous audit reports (`Githubb.md` / `SYSTEM_AUDIT_AND_IMPROVEMENT_REPORT.md`), including an unhandled TypeError crash during vehicle updates, festival theme schema dropouts, unpropagated review ratings, and missing cascade cleanup during company deletion.

---

## 2. Comparison Matrix: Previous Bugs vs Current Status

The table below cross-references all 20 critical bugs documented in the initial system audit report against the live code:

| Bug ID | Description in Previous Report | Affected Files | Status | Findings in Current Code |
| :--- | :--- | :--- | :---: | :--- |
| **Bug 1** | Private vehicle owner contact info missing (WhatsApp/Call failure) | `backend/routes/vehicles.js`<br>`frontend/src/pages/VehicleDetail.jsx` | **FIXED** | `owner.phone` is now populated in `vehicles.js` line 60 & 287. `VehicleDetail.jsx` resolves `vehicle.company?.phone || vehicle.owner?.phone || config.global.whatsAppSupport.phoneNumber`. |
| **Bug 2** | Vehicle search filters ignore model names | `frontend/src/pages/VehicleListing.jsx` | **FIXED** | Filter matches `v.brand`, `v.model`, and `${v.brand} ${v.model}` (lines 497–502). Searches for "Axio", "Prius", "Alto" work correctly. |
| **Bug 3** | Hardcoded calendar booked dates on vehicle detail | `frontend/src/pages/VehicleDetail.jsx` | **FIXED** | Fetches live rental reservations from `/api/rentals` and passes `excludeDateIntervals={bookedIntervals}` to the calendar. |
| **Bug 4** | Profile editing forgets phone in LocalStorage & reloads | `frontend/src/pages/Profile.jsx` | **FIXED** | Saves `phone: editPhone.trim()`, updates LocalStorage, updates React state, and dispatches `user-updated` event without hard reload. |
| **Bug 5** | Inquiries & price bids missing host dashboard view | `frontend/src/pages/CompanyDashboard.jsx` | **FIXED** | Added dedicated **"Inquiries & Bids"** tab with pending/accepted filters, customer details, and 1-click WhatsApp reply. |
| **Bug 6** | Self-review exploitation via global `/api/reviews` | `backend/routes/reviews.js` | **STILL OPEN** | Global `POST /api/reviews` still does not verify `vehicle.owner.toString() === req.user.id`. Owners can post 5-star reviews to their own cars. |
| **Bug 7** | Vehicle "rented" status locks permanently until host visits | `backend/routes/rentals.js` | **STILL OPEN** | `autoExpireRentals` is still only triggered when that specific host visits `GET /api/rentals/my` or `/stats`. |
| **Bug 8** | Uncaught 500 crash on unowned/seeded vehicles (`owner.toString()`) | `backend/routes/vehicles.js`<br>`backend/routes/rentals.js`<br>`backend/routes/bids.js` | **STILL OPEN** | `vehicle.owner.toString()` calls remain without optional chaining (`?.`), causing crashes if `owner` is null. |
| **Bug 9** | Self-bidding / Self-inquiry exploit | `backend/routes/bids.js` | **STILL OPEN** | `POST /api/bids` validates offer price but does not verify whether `req.user.id` is the vehicle owner. |
| **Bug 10** | WhatsApp floating widget fails on domestic numbers (`07...`) | `frontend/src/components/WhatsAppFloat.jsx` | **STILL OPEN** | `WhatsAppFloat.jsx` strips non-digits but does not convert leading `0` to international code `94`. `wa.me/07...` fails. |
| **Bug 11** | Super Admin blocked with 403 on vehicle deletion | `backend/routes/vehicles.js` | **STILL OPEN** | `DELETE /api/vehicles/:id` strictly checks `vehicle.owner.toString() !== req.user.id` without admin role bypass. |
| **Bug 12** | Incomplete cascade deletes leave orphaned reviews & rentals | `backend/routes/vehicles.js`<br>`backend/routes/admin.js` | **STILL OPEN** | Deleting a vehicle in `vehicles.js` or `admin.js` leaves orphaned `Review` and `Rental` documents in MongoDB. |
| **Bug 13** | Host vehicle detail view prompts hosts to message themselves | `frontend/src/pages/VehicleDetail.jsx` | **PARTIAL** | `isOwnListing` boolean is calculated, but company listings evaluate false (`vehicle.owner` null), and hosts are still shown the booking inquiry form. |
| **Bug 14** | Anonymous / Guest "helpful" vote spam on reviews | `backend/routes/reviews.js` | **STILL OPEN** | Lines 315–318 increment `review.helpfulCount` unconditionally without session, IP, or rate limit check. |
| **Bug 15** | Renters trapped in redirect loop (`/dashboard` -> `/choose-listing-type`) | `frontend/src/pages/CompanyDashboard.jsx` | **STILL OPEN** | Visiting `/dashboard` as a `"renter"` immediately redirects to `/choose-listing-type`. No customer renter dashboard exists. |
| **Bug 16** | Logged-in users cannot change their password | `backend/routes/auth.js`<br>`frontend/src/pages/Profile.jsx` | **STILL OPEN** | No `POST /api/auth/change-password` endpoint exists; authenticated users must log out and use forgot-password OTP. |
| **Bug 17** | Vehicle hosts locked out of personal `/profile` | `frontend/src/App.jsx` | **STILL OPEN** | Line 215: `<Route path="/profile" element={isLister() ? <Navigate to={DASHBOARD_PATH} replace /> : <Profile />} />`. |
| **Bug 18** | Renters cannot view the inquiries/bids they sent | `backend/routes/bids.js` | **STILL OPEN** | `GET /api/bids/sent` (`Bid.find({ renter: req.user.id })`) does not exist. Renters cannot track their submitted offers. |
| **Bug 19** | Hosts cannot accept or decline bids | `backend/routes/bids.js` | **FIXED** | `PUT /api/bids/:id` route is implemented and supports status updates (`accepted`, `rejected`, `pending`). |
| **Bug 20** | Inconsistent auth header support in `reviews.js` | `backend/routes/reviews.js` | **STILL OPEN** | `reviews.js` lines 11–32 only check `x-auth-token`, ignoring standard `Authorization: Bearer <token>`. |

---

## 3. Usability & Experience Enhancements Status

| Enhancement | Original Recommendation | Status | Notes |
| :--- | :--- | :---: | :--- |
| **Usability 1** | Dead-end tabs in Company Dashboard | **FIXED** | Replaced placeholder tabs with active Overview, Fleet, Bookings, and Inquiries & Bids views. |
| **Usability 2** | Vehicle sorting dropdown missing | **FIXED** | Implemented interactive sort dropdown (Price: Low to High, Price: High to Low, Newest, Top Rated, Nearest). |
| **Usability 3** | "List Another Vehicle" triggers hard browser reload | **FIXED** | Replaced `window.location.reload()` with clean React form reset (`handleResetForm`). |
| **Usability 4** | Navbar auth state non-reactive | **FIXED** | Integrated `user-updated` and `storage` event listeners for instantaneous re-rendering. |
| **UX 1** | Dynamic trip duration & pricing calculator | **FIXED** | Implemented in `VehicleDetail.jsx` with date-based multiplier, included km, and excess rates. |
| **UX 2** | Multi-step listing draft auto-save | **FIXED** | Implemented with `sessionStorage` draft recovery banner in `ListVehicle.jsx`. |
| **UX 3** | Verified Host badge tooltip | **STILL OPEN** | Tooltip/modal explaining verification checks has not yet been implemented. |
| **UX 4** | International currency display toggle | **FIXED** | Implemented currency switcher (LKR, USD, EUR, GBP) in Navbar via `CurrencyContext`. |

---

## 4. Newly Discovered Bugs (Not in Previous Audit)

The following 7 bugs were identified during this audit across backend routes, data consistency, and frontend components:

---

### New Bug 1: Unhandled TypeError Crash in `handleVehicleUpdate` for Unowned/Company Listings
- **File Affected:** `backend/routes/vehicles.js` (line 307)
- **Code:**
  ```javascript
  const user = await User.findById(req.user.id).select("role");
  const isAdmin = user?.role === "admin";
  let isAuthorized = isAdmin || vehicle.owner.toString() === req.user.id;
  if (!isAuthorized && vehicle.company) {
    const company = await Company.findOne({ user: req.user.id }).select("_id");
    isAuthorized = Boolean(company && vehicle.company.toString() === company._id.toString());
  }
  ```
- **The Issue:**
  Line 307 attempts to call `.toString()` on `vehicle.owner` before checking company ownership. If a listing belongs to a company where `vehicle.owner` is `null` or `undefined` (or legacy seeded data), JavaScript immediately throws:
  `TypeError: Cannot read properties of null (reading 'toString')`
- **Consequence:**
  The server responds with a 500 Internal Server Error crash, preventing company account managers from updating or pausing their vehicles.
- **Recommended Fix:**
  Add optional chaining:
  ```javascript
  let isAuthorized = isAdmin || vehicle.owner?.toString() === req.user.id;
  ```

---

### New Bug 2: Festival Theme Mismatch — Avurudu and Diwali in Admin Schema but Missing in Frontend
- **Files Affected:**
  - `backend/models/SiteConfig.js` (lines 90–93)
  - `backend/routes/siteConfig.js`
  - `frontend/src/components/festivals/FestivalAccessoriesManager.jsx` (lines 15–55)
- **The Issue:**
  In `SiteConfig.js`, the admin configuration schema defines:
  ```javascript
  festivalTheme: {
    active: {
      type: String,
      enum: ["none", "christmas", "avurudu", "vesak", "diwali"],
      default: "none",
    }
  }
  ```
  However, in `FestivalAccessoriesManager.jsx`, only `christmas` and `vesak` are handled:
  ```javascript
  if (activeFestival === "christmas") return <ChristmasAccessories ... />;
  if (activeFestival === "vesak") return <VesakAccessories ... />;
  return null;
  ```
- **Consequence:**
  When an admin activates **"Avurudu"** (Sri Lanka's premier Sinhala & Tamil New Year national festival) or **"Diwali"** in the Super Admin dashboard, the frontend renders nothing (returns `null`), giving the illusion of a broken configuration save.
- **Recommended Fix:**
  Create and export `AvuruduAccessories` and `DiwaliAccessories` components or guard the Admin UI with clear indicators until the accessories are built.

---

### New Bug 3: Vehicle Reviews Endpoint Does Not Update Aggregate Vehicle Ratings
- **Files Affected:**
  - `backend/routes/vehicles.js` (lines 397–430)
  - `backend/models/Vehicle.js`
- **The Issue:**
  When a customer submits a review via `POST /api/vehicles/:id/reviews`, the new `Review` record is created in MongoDB, but no aggregation is executed to update vehicle ratings, nor does `Vehicle.find()` in `GET /api/vehicles` calculate live ratings for public search cards.
- **Consequence:**
  Public vehicle inventory cards cannot display dynamic star ratings or review counts without querying the separate `/reviews` portal, causing inconsistent rating displays across the marketplace.
- **Recommended Fix:**
  Add a post-save hook on `Review` or execute an aggregation update in the route to maintain `avgRating` and `numReviews` fields on the `Vehicle` document.

---

### New Bug 4: Mailer API Error Handler Masks Raw Error Details on Non-JSON Responses
- **File Affected:** `backend/utils/mailer.js` (lines 34, 60)
- **Code:**
  ```javascript
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Brevo API error (${response.status}): ${response.statusText}`);
  }
  ```
- **The Issue:**
  When cloud transactional email providers (Brevo, Resend) return rate limits, account suspensions, or upstream gateway errors (e.g. 502/503 HTML error pages or nested error payloads like `{ error: { message: "..." } }`), `data.message` evaluates to `undefined`, losing the true diagnostic error.
- **Consequence:**
  Troubleshooting email delivery failures in production becomes difficult because the real API error is swallowed.
- **Recommended Fix:**
  Inspect both `data.message`, `data.error?.message`, and capture raw response text if JSON parsing fails:
  ```javascript
  const rawText = await response.text();
  let errMsg;
  try {
    const data = JSON.parse(rawText);
    errMsg = data.message || data.error?.message || data.error;
  } catch {
    errMsg = rawText.slice(0, 200);
  }
  throw new Error(errMsg || `API error (${response.status}): ${response.statusText}`);
  ```

---

### New Bug 5: Client-Side Axios Interceptor Omits Standard RFC `Authorization: Bearer <token>`
- **File Affected:** `frontend/src/utils/session.js` (lines 80–92)
- **Code:**
  ```javascript
  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    const url = config.url || "";
    if (token && url.startsWith(API_URL)) {
      config.headers = config.headers || {};
      if (!config.headers["x-auth-token"]) {
        config.headers["x-auth-token"] = token;
      }
    }
    return config;
  });
  ```
- **The Issue:**
  The interceptor exclusively attaches `x-auth-token`, omitting `Authorization: Bearer <token>`. While `backend/middleware/auth.js` checks both, standard third-party tools, API proxies, and edge workers expect the standard `Authorization` header.
- **Recommended Fix:**
  Attach both headers simultaneously:
  ```javascript
  config.headers["x-auth-token"] = token;
  config.headers["Authorization"] = `Bearer ${token}`;
  ```

---

### New Bug 6: Deleting a Company in Admin Route Leaves Dangling Vehicle References
- **File Affected:** `backend/routes/admin.js` (lines 529–541)
- **Code:**
  ```javascript
  router.delete("/companies/:id", auth, adminOnly, async (req, res) => {
    try {
      const company = await Company.findByIdAndDelete(req.params.id);
      if (!company) return res.status(404).json({ msg: "Company not found" });
      res.json({ msg: "Company deleted" });
  ```
- **The Issue:**
  When a Super Admin deletes a fraudulent or closed company account, `Vehicle.find({ company: req.params.id })` are left unchanged in MongoDB.
- **Consequence:**
  Vehicles previously attached to that company continue to display on public listings with a non-existent `company` ID, causing 404 errors when renters click through to view the company fleet or company profile.
- **Recommended Fix:**
  Either unassign or cascade delete the company's vehicle listings:
  ```javascript
  await Vehicle.updateMany({ company: req.params.id }, { $set: { company: null } });
  ```

---

### New Bug 7: Lack of IP-Level Rate Limiting on Email OTP Generation (`/api/auth/send-otp`)
- **File Affected:** `backend/routes/auth.js` (lines 142–155, 200–225)
- **The Issue:**
  `issueOtp` enforces a 30-second cooldown per target `email`:
  ```javascript
  const recent = await OTP.findOne({ email }).select("createdAt");
  if (recent && Date.now() - new Date(recent.createdAt).getTime() < 30 * 1000) ...
  ```
  However, there is no rate limiting keyed by client IP address (`req.ip`). An automated script can iterate through distinct email addresses (`user1@gmail.com`, `user2@gmail.com`, etc.) without hitting the per-email cooldown.
- **Consequence:**
  An attacker can flood the Gmail SMTP / Brevo account with thousands of OTP dispatch requests in minutes, triggering provider rate limits and shutting down registration for genuine users.
- **Recommended Fix:**
  Apply `rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: "Too many OTP requests from this IP. Please wait 15 minutes." })` directly to the `/api/auth/send-otp` route.

---

## 5. Next Steps & Recommended Action Plan

1. **Immediate High Priority:**
   - Apply `vehicle.owner?.toString()` optional chaining across `vehicles.js`, `rentals.js`, and `bids.js` (fixes New Bug 1 and Bug 8).
   - Enforce self-review and self-bidding prevention in `reviews.js` and `bids.js` (fixes Bug 6 and Bug 9).
   - Format `07...` to `947...` in `WhatsAppFloat.jsx` (fixes Bug 10).
   - Add IP rate limiting to `/api/auth/send-otp` (fixes New Bug 7).

2. **Medium Priority:**
   - Remove the `/profile` redirect in `App.jsx` for hosts, and add `POST /api/auth/change-password` (fixes Bug 16 and Bug 17).
   - Implement `GET /api/bids/sent` for renters (fixes Bug 18).
   - Clean up company deletion cascade in `admin.js` (fixes New Bug 6).
   - Require authentication or IP checks on `POST /api/reviews/:id/helpful` (fixes Bug 14).

3. **Feature Enhancements:**
   - Build Avurudu and Diwali festival theme accessories (fixes New Bug 2).
   - Build verified host badge modal / explanation tooltip (completes UX 3).
