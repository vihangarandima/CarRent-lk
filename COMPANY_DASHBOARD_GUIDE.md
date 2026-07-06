# Company Dashboard - Complete Implementation Guide

## 📊 DASHBOARD STRUCTURE

Your company dashboard currently shows:

- Company profile management
- Vehicle listing/deletion

### WHAT COMPANIES NEED TO SEE:

```
┌────────────────────────────────────────────────────────────────┐
│                    COMPANY DASHBOARD                           │
│  Welcome back, ABC Rentals | June 16, 2026                    │
└────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬─────────────────┐
│ REVENUE      │ BOOKINGS     │ FLEET        │ PENDING PAYMENTS│
│ THIS MONTH   │ THIS MONTH   │ STATUS       │ DUE TODAY       │
├──────────────┼──────────────┼──────────────┼─────────────────┤
│ Rs. 125,000  │ 8            │ 4 Booked     │ Rs. 22,000      │
│ +12% vs last │ +20% vs last │ 8 Available  │ 2 Overdue       │
│ month        │ month        │ 2 Maintenance│                 │
└──────────────┴──────────────┴──────────────┴─────────────────┘

╔════════════════════════════════════════════════════════════════╗
║ 🔴 ACTIVE BOOKINGS (4)                                         ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║ [1] Toyota Corolla (ABC-1234)                                 ║
║     ├─ Renter: John Doe | ☎️ +94-71-234-5678                ║
║     ├─ Pickup: Today 14:00 | Return: June 20, 2026           ║
║     ├─ Days: 5 | Rate: Rs. 5,000/day → Total: Rs. 25,000    ║
║     ├─ Status: 🟢 Confirmed | 💳 Paid ✓                    ║
║     └─ Actions: [View] [Confirm Pickup] [Message] [Track]   ║
║                                                                ║
║ [2] Honda City (ABC-2345)                                     ║
║     ├─ Renter: Jane Smith | ☎️ +94-77-123-4567              ║
║     ├─ Pickup: June 18 | Return: June 22, 2026              ║
║     ├─ Days: 4 | Rate: Rs. 5,500/day → Total: Rs. 22,000    ║
║     ├─ Status: 🟡 Awaiting Pickup | 💳 Paid ✓              ║
║     └─ Actions: [View] [Confirm Pickup] [Message]           ║
║                                                                ║
║ [3] Toyota Prius (ABC-3456)                                   ║
║     ├─ Renter: Mike Johnson | ☎️ +94-70-345-6789            ║
║     ├─ Pickup: June 19 | Return: June 25, 2026              ║
║     ├─ Days: 6 | Rate: Rs. 6,000/day → Total: Rs. 36,000    ║
║     ├─ Status: 🟢 In Transit | 💳 Paid ✓                  ║
║     └─ Actions: [View] [Complete Return] [Message] [Report Issue]║
║                                                                ║
║ [4] Nissan Altima (ABC-4567)                                  ║
║     ├─ Renter: Sarah Wilson | ☎️ +94-76-567-8901            ║
║     ├─ Pickup: June 20 | Return: June 23, 2026              ║
║     ├─ Days: 3 | Rate: Rs. 4,500/day → Total: Rs. 13,500    ║
║     ├─ Status: ⏳ Pending | 💳 Pending Payment ❌            ║
║     └─ Actions: [View] [Send Reminder] [Confirm Pickup]     ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════╗
║ 📈 REVENUE ANALYTICS                                           ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║ Revenue Trend (Last 30 Days)                                  ║
║ ┌────────────────────────────────────────────────────────┐   ║
║ │ Jun │                        ▲ 25k                      │   ║
║ │ 16  │                       ╱│╲                        │   ║
║ │ 15  │        ▲ 20k         ╱ │ ╲ 24k                 │   ║
║ │ 14  │       ╱│╲           ╱  │  ╲   ╲                │   ║
║ │ 13  │18k   ╱ │ ╲ 22k     ╱   │   ╲   ╲ 23k         │   ║
║ │ 12  │ ╱───╱  │  ╲   ╲   ╱    │    ╲───╲─╲───      │   ║
║ │ 11  │╱       │   ╲   ╲ ╱     │         ╲         │   ║
║ │ ... │        │    ╲   ╲      │          ╲       │   ║
║ │     └────────────────────────────────────────────   │   ║
║ │ Peak: June 15 (Rs. 25,000) | Low: June 11 (Rs. 18k) │   ║
║ └────────────────────────────────────────────────────────┘   ║
║                                                                ║
║ Top Performing Vehicles:                                      ║
║ 1. Toyota Corolla (ABC-1234) - Rs. 55,000 (8 bookings)      ║
║ 2. Honda City (ABC-2345) - Rs. 44,000 (7 bookings)          ║
║ 3. Toyota Prius (ABC-3456) - Rs. 36,000 (5 bookings)        ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════╗
║ 🚗 FLEET STATUS                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║ Status Overview:                                              ║
║ ├─ 🟢 Available (8): Ready for booking                       ║
║ ├─ 🔴 Booked (4): Currently with renters                    ║
║ ├─ 🟡 Awaiting Pickup (2): Confirmed, waiting pickup       ║
║ └─ 🟠 Maintenance (1): Not available                        ║
║                                                                ║
║ Fleet Utilization: 65%                                        ║
║ ├─ Ideal Target: 70-80%                                      ║
║ └─ Recommendation: Add 1-2 more vehicles                     ║
║                                                                ║
║ Vehicles by Occupancy Rate:                                  ║
║ 1. Toyota Corolla (ABC-1234) ████████░░ 85% utilization    ║
║ 2. Honda City (ABC-2345) ████████░░ 78% utilization        ║
║ 3. Toyota Prius (ABC-3456) ██████░░░░ 68% utilization      ║
║ 4. Nissan Altima (ABC-4567) ████░░░░░░ 42% utilization    ║
║ 5. Hyundai i10 (ABC-5678) ██░░░░░░░░ 22% utilization       ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════╗
║ 💳 PAYMENT STATUS                                              ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║ Total Bookings: 12                                            ║
║ ├─ ✅ Paid: 8 (Rs. 125,000)                                 ║
║ ├─ ⏳ Pending: 2 (Rs. 22,000)                               ║
║ ├─ ⚠️ Overdue: 2 (Rs. 18,000) - Payment due today          ║
║ └─ ❌ Failed: 0                                              ║
║                                                                ║
║ Overdue Payments:                                             ║
║ 1. Sarah Wilson - Nissan Altima - Rs. 13,500 - 2 days late ║
║    [Send Reminder] [Approve Late] [Cancel Booking]          ║
║ 2. Tom Brown - Hyundai i10 - Rs. 4,500 - 5 days late       ║
║    [Send Reminder] [Approve Late] [Cancel Booking]          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

┌────────────────────────────────────────────────────────────────┐
│ QUICK ACTIONS                                                  │
│ [➕ List New Vehicle] [📊 View Full Reports] [⚙️ Settings]   │
│ [💬 Messages] [👥 Renters] [📋 Documentation]                │
└────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ IMPLEMENTATION COMPONENTS

### 1. Dashboard Main Layout

```jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CompanyDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch all dashboard data in parallel
      const [statsRes, bookingsRes, vehiclesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/rentals/company/stats", {
          headers: { "x-auth-token": token },
        }),
        axios.get(
          "http://localhost:5000/api/rentals/company?status=confirmed,active,awaiting_pickup",
          {
            headers: { "x-auth-token": token },
          },
        ),
        axios.get("http://localhost:5000/api/vehicles/my", {
          headers: { "x-auth-token": token },
        }),
      ]);

      setStats(statsRes.data);
      setBookings(bookingsRes.data);
      setVehicles(vehiclesRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="company-dashboard">
      {/* Stats Cards */}
      <StatsSection stats={stats} />

      {/* Active Bookings */}
      <BookingsSection bookings={bookings} />

      {/* Revenue Analytics */}
      <RevenueSection stats={stats} bookings={bookings} />

      {/* Fleet Status */}
      <FleetStatusSection vehicles={vehicles} bookings={bookings} />

      {/* Payment Status */}
      <PaymentStatusSection bookings={bookings} />

      {/* Quick Actions */}
      <QuickActionsSection />
    </div>
  );
}
```

### 2. Stats Section Component

```jsx
function StatsSection({ stats }) {
  return (
    <section className="stats-grid">
      <StatCard
        title="Revenue This Month"
        value={`Rs. ${stats?.thisMonthRevenue?.toLocaleString() || 0}`}
        trend="+12%"
        icon="📊"
      />
      <StatCard
        title="Active Bookings"
        value={stats?.activeBookings || 0}
        trend="+20%"
        icon="🚗"
      />
      <StatCard
        title="Pending Payments"
        value={`Rs. ${stats?.outstandingAmount?.toLocaleString() || 0}`}
        icon="💳"
      />
      <StatCard
        title="Total Bookings This Month"
        value={stats?.totalBookingsThisMonth || 0}
        icon="📅"
      />
    </section>
  );
}

function StatCard({ title, value, trend, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <h3>{title}</h3>
      <p className="stat-value">{value}</p>
      {trend && <p className="stat-trend">{trend} vs last month</p>}
    </div>
  );
}
```

### 3. Bookings List Component

```jsx
function BookingsSection({ bookings }) {
  const getStatusColor = (status) => {
    const colors = {
      pending_confirmation: "#FFA500",
      confirmed: "#4CAF50",
      awaiting_pickup: "#2196F3",
      active: "#9C27B0",
      completed: "#8B8B8B",
      cancelled: "#F44336",
    };
    return colors[status] || "#999";
  };

  return (
    <section className="bookings-section">
      <h2>Active Bookings ({bookings.length})</h2>

      {bookings.length > 0 ? (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <BookingCard key={booking._id} booking={booking} />
          ))}
        </div>
      ) : (
        <p className="no-data">No active bookings</p>
      )}
    </section>
  );
}

function BookingCard({ booking }) {
  return (
    <div className="booking-card">
      <div className="booking-header">
        <h3>
          {booking.vehicle.brand} {booking.vehicle.model}
        </h3>
        <span className={`status ${booking.status}`}>
          {booking.status.replace("_", " ").toUpperCase()}
        </span>
      </div>

      <div className="booking-body">
        <div className="booking-info">
          <p>
            <strong>Renter:</strong> {booking.renter.name}
          </p>
          <p>
            <strong>Phone:</strong> {booking.renter.phone}
          </p>
          <p>
            <strong>Duration:</strong>{" "}
            {new Date(booking.pickupDate).toLocaleDateString()} to{" "}
            {new Date(booking.returnDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Days:</strong> {booking.totalDays}
          </p>
        </div>

        <div className="booking-pricing">
          <p>
            <strong>Rate:</strong> Rs. {booking.pricePerDay.toLocaleString()}
            /day
          </p>
          <p>
            <strong>Total:</strong> Rs. {booking.totalPrice.toLocaleString()}
          </p>
          <p>
            <strong>Payment:</strong>{" "}
            <span className={`payment-${booking.paymentStatus}`}>
              {booking.paymentStatus.toUpperCase()}
            </span>
          </p>
        </div>
      </div>

      <div className="booking-actions">
        <button className="btn-primary">View Details</button>
        <button className="btn-secondary">Update Status</button>
        <button className="btn-secondary">Message</button>
        {booking.status === "active" && (
          <button className="btn-warning">Report Issue</button>
        )}
      </div>
    </div>
  );
}
```

### 4. Revenue Analytics Component

```jsx
function RevenueSection({ stats, bookings }) {
  // Group bookings by date for chart
  const chartData = bookings.reduce((acc, booking) => {
    const date = new Date(booking.createdAt).toLocaleDateString();
    const existing = acc.find((item) => item.date === date);
    if (existing) {
      existing.revenue += booking.totalPrice;
    } else {
      acc.push({ date, revenue: booking.totalPrice });
    }
    return acc;
  }, []);

  // Sort by vehicle revenue
  const vehicleRevenue = bookings
    .reduce((acc, booking) => {
      const vehicleId = booking.vehicle._id;
      const existing = acc.find((item) => item.vehicleId === vehicleId);
      if (existing) {
        existing.revenue += booking.totalPrice;
        existing.count += 1;
      } else {
        acc.push({
          vehicleId,
          vehicle: booking.vehicle,
          revenue: booking.totalPrice,
          count: 1,
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <section className="revenue-section">
      <h2>Revenue Analytics</h2>

      <div className="revenue-grid">
        {/* Revenue Trend Chart */}
        <div className="chart-container">
          <h3>Revenue Trend (Last 30 Days)</h3>
          <SimpleLineChart data={chartData} />
        </div>

        {/* Top Vehicles */}
        <div className="top-vehicles">
          <h3>Top Performing Vehicles</h3>
          {vehicleRevenue.slice(0, 5).map((item, idx) => (
            <div key={item.vehicleId} className="vehicle-stat">
              <p>
                <strong>
                  {idx + 1}. {item.vehicle.brand} {item.vehicle.model}
                </strong>
              </p>
              <p>
                Rs. {item.revenue.toLocaleString()} ({item.count} bookings)
              </p>
              <div
                className="bar"
                style={{
                  width: `${(item.revenue / vehicleRevenue[0].revenue) * 100}%`,
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### 5. Fleet Status Component

```jsx
function FleetStatusSection({ vehicles, bookings }) {
  const bookedIds = new Set(bookings.map((b) => b.vehicle._id));

  const stats = {
    total: vehicles.length,
    available: vehicles.filter((v) => !bookedIds.has(v._id)).length,
    booked: bookings.length,
    maintenance: 0, // From vehicle status
  };

  const utilization = ((stats.booked / stats.total) * 100).toFixed(1);

  return (
    <section className="fleet-section">
      <h2>Fleet Status</h2>

      <div className="fleet-overview">
        <p>Total Vehicles: {stats.total}</p>
        <p>🟢 Available: {stats.available}</p>
        <p>🔴 Booked: {stats.booked}</p>
        <p>Fleet Utilization: {utilization}%</p>
      </div>

      <div className="vehicle-grid">
        {vehicles.map((vehicle) => (
          <div key={vehicle._id} className="vehicle-card">
            <img src={vehicle.images[0]} alt={vehicle.brand} />
            <h4>
              {vehicle.brand} {vehicle.model}
            </h4>
            <p>{vehicle.location}</p>
            <p>Rs. {vehicle.pricePerDay}/day</p>
            <p className={bookedIds.has(vehicle._id) ? "booked" : "available"}>
              {bookedIds.has(vehicle._id) ? "Booked" : "Available"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### 6. Payment Status Component

```jsx
function PaymentStatusSection({ bookings }) {
  const paymentStats = {
    paid: bookings.filter((b) => b.paymentStatus === "paid").length,
    pending: bookings.filter((b) => b.paymentStatus === "pending").length,
    overdue: 0, // Add logic to check overdue
  };

  const paidAmount = bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const pendingAmount = bookings
    .filter((b) => b.paymentStatus === "pending")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <section className="payment-section">
      <h2>Payment Status</h2>

      <div className="payment-summary">
        <div className="payment-stat">
          <h3>Total Bookings</h3>
          <p>{bookings.length}</p>
        </div>
        <div className="payment-stat paid">
          <h3>✅ Paid</h3>
          <p>{paymentStats.paid}</p>
          <p>Rs. {paidAmount.toLocaleString()}</p>
        </div>
        <div className="payment-stat pending">
          <h3>⏳ Pending</h3>
          <p>{paymentStats.pending}</p>
          <p>Rs. {pendingAmount.toLocaleString()}</p>
        </div>
      </div>

      {pendingAmount > 0 && (
        <div className="pending-list">
          <h3>Pending Payments</h3>
          {bookings
            .filter((b) => b.paymentStatus === "pending")
            .map((booking) => (
              <div key={booking._id} className="pending-item">
                <p>
                  {booking.renter.name} - Rs.{" "}
                  {booking.totalPrice.toLocaleString()}
                </p>
                <button>Send Reminder</button>
                <button>View Details</button>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}
```

### 7. CSS Styling

```css
/* Add to your stylesheet */

.company-dashboard {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stat-trend {
  color: #4caf50;
  font-size: 14px;
}

/* Bookings */
.bookings-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.booking-card {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 15px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 15px;
  align-items: center;
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.status {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.status.confirmed {
  background: #4caf50;
  color: white;
}

.status.pending_confirmation {
  background: #ffa500;
  color: white;
}

.booking-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* Revenue */
.revenue-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.revenue-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

/* Fleet */
.fleet-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.vehicle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.vehicle-card {
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
  text-align: center;
}

.vehicle-card img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.vehicle-card p {
  padding: 5px;
  margin: 0;
  font-size: 14px;
}

.vehicle-card .booked {
  color: #f44336;
  font-weight: bold;
}

.vehicle-card .available {
  color: #4caf50;
  font-weight: bold;
}

/* Payment */
.payment-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.payment-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.payment-stat {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 6px;
  text-align: center;
}

.payment-stat.paid {
  border-color: #4caf50;
  background: #f1f8f4;
}

.payment-stat.pending {
  border-color: #ffa500;
  background: #fff9e6;
}

.payment-stat h3 {
  margin: 0 0 10px;
  color: #333;
}

.payment-stat p {
  margin: 5px 0;
  font-size: 18px;
  font-weight: bold;
}

/* Buttons */
.btn-primary,
.btn-secondary,
.btn-warning {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: #2196f3;
  color: white;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-warning {
  background: #ffa500;
  color: white;
}

button:hover {
  opacity: 0.8;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .revenue-grid {
    grid-template-columns: 1fr;
  }

  .vehicle-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
```

---

## 🚀 INTEGRATION STEPS

1. **Update CompanyDashboard.jsx** - Replace current dashboard with new components
2. **Add API endpoints** - Ensure rentals API returns necessary data
3. **Add styling** - Include CSS above to your stylesheet
4. **Test dashboard** - Create test data and verify all sections display correctly
5. **Add filters** - Allow filtering by status, date range, payment status
6. **Export reports** - Add PDF export functionality

---

## 📊 RECOMMENDED NEXT FEATURES

After dashboard is working:

1. Message system (chat with renters)
2. PDF invoice generation
3. Damage report form
4. Mobile app version
5. SMS notifications
6. Advanced analytics/reports

---

This dashboard will give your company complete visibility into their rental business operations and is critical before launch! 🚀
