import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";

const SiteConfigContext = createContext();

export const DEFAULT_CONFIG = {
  global: {
    brandName: "Yamu Car Rentals",
    brandTagline: "Sri Lanka's Premier Vehicle Rental Platform",
    logoUrl: "/logo.png",
    themePreset: "yamu-orange",
    primaryColor: "#f97316",
    primaryDark: "#ea580c",
    primaryLight: "#fb923c",
    accentColor: "#10b981",
    announcement: {
      enabled: false,
      text: "🎉 Special Promo: 15% OFF on all Luxury Sedans & Vans! Use code YAMU15",
      link: "/vehicles",
      bgColor: "#f97316",
      textColor: "#ffffff",
    },
    whatsAppSupport: {
      enabled: true,
      phoneNumber: "+94770000000",
      greetingMessage: "Hello Yamu Team! I need help with renting a vehicle.",
    },
    contact: {
      phone: "+94 77 123 4567",
      email: "hello@yamucarrentals.lk",
      address: "Colombo, Sri Lanka",
    },
    socialLinks: {
      tiktok: "https://www.tiktok.com/@yamucarrentals?_r=1&_t=ZS-98SNnP8jRBp",
      facebook: "https://www.facebook.com/share/1Bb9AkvaZz/",
      instagram: "https://www.instagram.com",
      linkedin: "https://www.linkedin.com",
      youtube: "https://www.youtube.com",
    },
  },

  hero: {
    watermarkText: "YAMU",
    taglineTop: "Make The Right Choice",
    taglineBottom: "Find Your Dream Car, Which will Give You Wings",
    fleetCutoutUrl: "",
    backgroundSlides: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1920",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1920",
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=1920",
    ],
    popularSearchChips: [
      "Airport Transfers",
      "Self-Drive 4x4",
      "Budget City Cars",
      "Weddings & VIP",
      "Vans for Groups",
    ],
  },

  home: {
    categories: [
      {
        id: "suv",
        label: "SUV",
        vehicleType: "premium-car",
        image:
          "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=400",
      },
      {
        id: "sedan",
        label: "Sedan",
        vehicleType: "car",
        image:
          "https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&q=80&w=400",
      },
      {
        id: "luxury",
        label: "Luxury",
        vehicleType: "premium-car",
        image:
          "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=400",
      },
      {
        id: "electric",
        label: "Electric",
        vehicleType: "car",
        image:
          "https://images.unsplash.com/photo-1593941707882-a5bba14938bc?auto=format&fit=crop&q=80&w=400",
      },
      {
        id: "van",
        label: "Van",
        vehicleType: "van",
        image:
          "https://images.unsplash.com/photo-1527786356703-4b100916cd20?auto=format&fit=crop&q=80&w=400",
      },
      {
        id: "coupe",
        label: "Coupe",
        vehicleType: "car",
        image:
          "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400",
      },
    ],
    stats: [
      {
        number: "500+",
        label: "Verified Vehicles",
        desc: "Across Sri Lanka",
      },
      {
        number: "100+",
        label: "Rental Partners",
        desc: "Trusted fleet hosts",
      },
      {
        number: "98%",
        label: "Satisfaction Rate",
        desc: "From happy travelers",
      },
      {
        number: "24/7",
        label: "Support & Roadside",
        desc: "Anywhere on the island",
      },
    ],
    testimonials: [
      {
        name: "Thivina pehasara",
        location: "Colombo",
        rating: 5,
        text: "Booked a Toyota Fortuner for our family trip to Ella. Smooth process, verified host, and the car was spotless. Will definitely use again!",
        avatar: "/assets/images/thivina.png",
      },
      {
        name: "Punsara Rajapaksa",
        location: "Kandy",
        rating: 5,
        text: "As a tourist, Yamu Car Rentals made renting so easy. Transparent pricing, no hidden fees, and 24/7 support when I had a question.",
        avatar: "/assets/images/punsara.png",
      },
      {
        name: "Nirmal Perera",
        location: "Galle",
        rating: 5,
        text: "I listed my car and started earning within a week. The platform handles everything — verification, bookings, payments. Highly recommend!",
        avatar: "/assets/images/nirmal.png",
      },
    ],
    steps: [
      {
        num: "01",
        title: "Browse & Select",
        desc: "Explore verified vehicles across Sri Lanka with smart filters.",
        image:
          "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=300",
      },
      {
        num: "02",
        title: "Book Instantly",
        desc: "Pick your dates and confirm your booking in seconds.",
        image:
          "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=300",
      },
      {
        num: "03",
        title: "Pick Up & Drive",
        desc: "Meet your host, grab the keys, and hit the road.",
        image:
          "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=300",
      },
      {
        num: "04",
        title: "Return & Rate",
        desc: "Return the car and share your experience with the community.",
        image:
          "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=300",
      },
    ],
    whyUsCards: [
      {
        title: "Verified Hosts & Fleets",
        desc: "Every vehicle and rental partner is background checked and verified for top safety.",
        iconKey: "ShieldCheck",
      },
      {
        title: "Instant Booking & Bids",
        desc: "Send price offers or book instantly without waiting for lengthy quotes.",
        iconKey: "Zap",
      },
      {
        title: "Zero Hidden Fees",
        desc: "Transparent day rates, deposit terms, and mileage policies up front.",
        iconKey: "HeartHandshake",
      },
      {
        title: "24/7 Islandwide Support",
        desc: "Emergency roadside assistance and support wherever you drive in Sri Lanka.",
        iconKey: "Clock",
      },
    ],
    bottomCta: {
      title: "Ready to Hit the Open Road?",
      subtitle:
        "Book your dream ride in seconds or register your vehicle to start earning today with Yamu.",
      buttonText: "Explore All Vehicles",
      buttonLink: "/vehicles",
      listerButtonText: "List Your Vehicle",
      listerButtonLink: "/choose-listing-type",
    },
  },

  vehicleListing: {
    headerTitle: "Explore Verified Vehicles in Sri Lanka",
    headerSubtitle:
      "Find cars, vans, SUVs, luxury rides, and tuk-tuks with smart filters and instant offers.",
    categoryThumbnails: {},
    defaultPriceMin: 3000,
    defaultPriceMax: 50000,
  },

  companies: {
    headerTitle: "Verified Rental Partners in Sri Lanka",
    headerSubtitle:
      "Connect with top-rated vehicle rental agencies and fleet owners across the island.",
    popularCities: [
      "All Cities",
      "Colombo",
      "Kandy",
      "Galle",
      "Negombo",
      "Bambalapitiya",
      "Polonnaruwa",
      "Gampaha",
      "Matara",
      "Jaffna",
      "Ella",
      "Nuwara Eliya",
    ],
  },

  whyUs: {
    badge: "Our Promise",
    title: "Why Choose Yamu Car Rentals?",
    subtitle:
      "We're redefining the vehicle rental experience in Sri Lanka through trust, transparency, and technology.",
    faqs: [
      {
        q: "How do I book a vehicle on Yamu Car Rentals?",
        a: "Browse the fleet, select your pickup dates and location, and send an offer or booking request directly to the host or rental company.",
      },
      {
        q: "What documents do I need to rent a car?",
        a: "A valid Sri Lankan Driving License or International Driving Permit (IDP), along with a National Identity Card (NIC) or Passport.",
      },
      {
        q: "Can I list my personal car or company fleet?",
        a: "Yes! Sign up as an Owner or Rental Company, add your vehicle details with photos, and receive booking requests directly.",
      },
      {
        q: "Are there hidden fees?",
        a: "No! All rates, deposits, and per-km excess rates after 100km are clearly detailed upfront before confirming.",
      },
    ],
  },

  footer: {
    tagline:
      "Sri Lanka's trusted vehicle rental marketplace. Safe, transparent, and seamless rides islandwide.",
    copyrightText: `© ${new Date().getFullYear()} Yamu Car Rentals. All rights reserved.`,
  },
};

export const HOLIDAY_THEME_PRESETS = {
  "yamu-orange": {
    name: "Yamu Classic Orange",
    primary: "#f97316",
    primaryDark: "#ea580c",
    primaryLight: "#fb923c",
    accent: "#10b981",
    announcementBg: "#f97316",
    announcementText:
      "🚗 Welcome to Yamu Car Rentals — Islandwide vehicle booking with verified hosts!",
  },
  avurudu: {
    name: "🦁 Avurudu / New Year",
    primary: "#e11d48",
    primaryDark: "#be123c",
    primaryLight: "#fb7185",
    accent: "#eab308",
    announcementBg: "#be123c",
    announcementText:
      "🌸 Subha Aluth Avuruddak Wewa! Enjoy special holiday discounts on vans and family SUVs.",
  },
  christmas: {
    name: "🎄 Christmas & Holidays",
    primary: "#dc2626",
    primaryDark: "#991b1b",
    primaryLight: "#f87171",
    accent: "#16a34a",
    announcementBg: "#991b1b",
    announcementText:
      "🎁 Season's Greetings! Book early for holiday road trips and airport pickups.",
  },
  tropical: {
    name: "🌴 Ceylon Tropical Glow",
    primary: "#059669",
    primaryDark: "#047857",
    primaryLight: "#34d399",
    accent: "#d97706",
    announcementBg: "#047857",
    announcementText:
      "🌴 Explore Sri Lanka in style — Coastlines, hill country, and heritage tours.",
  },
  "midnight-gold": {
    name: "👑 Midnight Luxury Gold",
    primary: "#ca8a04",
    primaryDark: "#a16207",
    primaryLight: "#facc15",
    accent: "#38bdf8",
    announcementBg: "#0f172a",
    announcementText:
      "✨ VIP & Chauffeur Services available. Premium Mercedes, BMW, and Prado fleet.",
  },
};

export const SiteConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  // Apply CSS custom properties dynamically to :root
  const applyThemeColors = (themeConfig) => {
    if (!themeConfig?.global) return;
    const root = document.documentElement;
    const { primaryColor, primaryDark, primaryLight, accentColor } =
      themeConfig.global;

    if (primaryColor) {
      root.style.setProperty("--primary", primaryColor);
      root.style.setProperty("--primary-dark", primaryDark || primaryColor);
      root.style.setProperty("--primary-light", primaryLight || primaryColor);
      root.style.setProperty("--primary-soft", `${primaryColor}14`);
      root.style.setProperty("--primary-glow", `${primaryColor}66`);
      root.style.setProperty(
        "--grad-primary",
        `linear-gradient(135deg, ${primaryLight || primaryColor} 0%, ${primaryColor} 45%, ${primaryDark || primaryColor} 100%)`
      );
      root.style.setProperty(
        "--grad-hero",
        `radial-gradient(circle at 50% 34%, ${primaryLight || primaryColor} 0%, ${primaryColor} 26%, ${primaryDark || primaryColor} 58%, #9a3412 100%)`
      );
    }
    if (accentColor) {
      root.style.setProperty("--accent", accentColor);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/site-config`);
      if (res.data) {
        const merged = {
          ...DEFAULT_CONFIG,
          ...res.data,
          global: { ...DEFAULT_CONFIG.global, ...res.data.global },
          hero: { ...DEFAULT_CONFIG.hero, ...res.data.hero },
          home: { ...DEFAULT_CONFIG.home, ...res.data.home },
          vehicleListing: {
            ...DEFAULT_CONFIG.vehicleListing,
            ...res.data.vehicleListing,
          },
          companies: {
            ...DEFAULT_CONFIG.companies,
            ...res.data.companies,
          },
          whyUs: { ...DEFAULT_CONFIG.whyUs, ...res.data.whyUs },
          footer: { ...DEFAULT_CONFIG.footer, ...res.data.footer },
        };
        setConfig(merged);
        applyThemeColors(merged);
      }
    } catch (err) {
      console.warn("Using default site configuration (offline or fallback):", err);
      applyThemeColors(DEFAULT_CONFIG);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const updateConfig = async (newConfigData, snapshotName, snapshotDesc) => {
    const token = localStorage.getItem("token");
    const res = await axios.put(
      `${API_URL}/api/site-config`,
      {
        ...newConfigData,
        _snapshotName: snapshotName,
        _snapshotDesc: snapshotDesc,
      },
      { headers: { "x-auth-token": token } }
    );
    if (res.data?.config) {
      const merged = { ...config, ...res.data.config };
      setConfig(merged);
      applyThemeColors(merged);
    }
    return res.data;
  };

  const restoreSnapshot = async (snapshotId) => {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${API_URL}/api/site-config/rollback/${snapshotId}`,
      {},
      { headers: { "x-auth-token": token } }
    );
    if (res.data?.config) {
      const merged = { ...config, ...res.data.config };
      setConfig(merged);
      applyThemeColors(merged);
    }
    return res.data;
  };

  const resetToDefaults = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${API_URL}/api/site-config/reset`,
      {},
      { headers: { "x-auth-token": token } }
    );
    if (res.data?.config) {
      setConfig(DEFAULT_CONFIG);
      applyThemeColors(DEFAULT_CONFIG);
    }
    return res.data;
  };

  return (
    <SiteConfigContext.Provider
      value={{
        config,
        loading,
        updateConfig,
        restoreSnapshot,
        resetToDefaults,
        refreshConfig: fetchConfig,
        applyThemeColors,
      }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) {
    throw new Error("useSiteConfig must be used within a SiteConfigProvider");
  }
  return ctx;
};
