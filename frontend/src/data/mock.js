export const formatLKR = (value) => {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value).replace("LKR", "Rs.");
};

export const revenueData = [
  { month: "Feb", revenue: 320000 },
  { month: "Mar", revenue: 410000 },
  { month: "Apr", revenue: 390000 },
  { month: "May", revenue: 520000 },
  { month: "Jun", revenue: 600000 },
  { month: "Jul", revenue: 750000 },
  { month: "Aug", revenue: 610000 },
];

export const vehicles = Array(8).fill({});

export const rentals = [
  {
    id: "BK-2481",
    vehicleName: "Toyota Land Cruiser Prado",
    image: "https://images.unsplash.com/photo-1594502184342-2e12fbf77aca?auto=format&fit=crop&q=80&w=150&h=100",
    renter: "Nimal Perera",
    pickupDate: "2026-08-14",
    returnDate: "2026-08-18",
    totalPrice: 98000,
    status: "active",
  },
  {
    id: "BK-2477",
    vehicleName: "Toyota Aqua Hybrid",
    image: "https://images.unsplash.com/photo-1623869675781-80aa31012a5a?auto=format&fit=crop&q=80&w=150&h=100",
    renter: "Sanduni Fernando",
    pickupDate: "2026-08-16",
    returnDate: "2026-08-19",
    totalPrice: 25500,
    status: "confirmed",
  },
  {
    id: "BK-2470",
    vehicleName: "Bajaj RE Three-Wheeler",
    image: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&q=80&w=150&h=100",
    renter: "Marek Novak",
    pickupDate: "2026-08-20",
    returnDate: "2026-08-24",
    totalPrice: 12800,
    status: "pending",
  },
  {
    id: "BK-2402",
    vehicleName: "Toyota KDH High Roof",
    image: "https://images.unsplash.com/photo-1566472856417-73d84a719bd9?auto=format&fit=crop&q=80&w=150&h=100",
    renter: "Ayesha Rizwan",
    pickupDate: "2026-07-28",
    returnDate: "2026-08-02",
    totalPrice: 80000,
    status: "completed",
  },
  {
    id: "BK-2388",
    vehicleName: "Nissan Leaf EV",
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=150&h=100",
    renter: "Tharindu Silva",
    pickupDate: "2026-07-10",
    returnDate: "2026-07-13",
    totalPrice: 34500,
    status: "completed",
  },
];
