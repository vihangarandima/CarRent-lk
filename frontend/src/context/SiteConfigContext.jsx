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
      phoneNumber: "+94702434288",
      greetingMessage: "Hello Yamu Team! I need help with renting a vehicle.",
    },
    contact: {
      phone: "+94 70 243 4288",
      email: "yamucarrentals@gmail.com",
      address: "551/1, Thalgahawatta Lane, Wawa Road, Boralasgamuwa",
    },
    socialLinks: {
      tiktok: "https://www.tiktok.com/@yamucarrentals?_r=1&_t=ZS-98SNnP8jRBp",
      facebook: "https://www.facebook.com/share/1Bb9AkvaZz/",
      instagram: "https://www.instagram.com",
      linkedin: "https://www.linkedin.com",
      youtube: "https://www.youtube.com",
    },
    festivalTheme: {
      active: "none",
      christmas: {
        showTree: true,
        treePosition: "bottom-left",
        showBells: true,
        showOrnaments: true,
        showSnow: true,
      },
      vesak: {
        showLantern: true,
        lanternPosition: "top-right",
        showLotus: true,
        lotusPosition: "bottom-left",
        showFlag: true,
        flagPosition: "top-left",
        showLightString: true,
        showParticles: true,
      },
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
        image: "/assets/images/suv_category.jpg",
      },
      {
        id: "sedan",
        label: "Sedan",
        vehicleType: "car",
        image: "/assets/images/sedan_category.jpg",
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
        image: "/assets/images/electric_category.jpg",
      },
      {
        id: "van",
        label: "Van",
        vehicleType: "van",
        image: "/assets/images/van_category.jpg",
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

const getInitialSiteConfig = () => {
  try {
    const saved = localStorage.getItem("yamu_site_config");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        global: {
          ...DEFAULT_CONFIG.global,
          ...(parsed.global || {}),
          festivalTheme: {
            ...DEFAULT_CONFIG.global.festivalTheme,
            ...(parsed.global?.festivalTheme || {}),
            christmas: {
              ...DEFAULT_CONFIG.global.festivalTheme.christmas,
              ...(parsed.global?.festivalTheme?.christmas || {}),
            },
            vesak: {
              ...DEFAULT_CONFIG.global.festivalTheme.vesak,
              ...(parsed.global?.festivalTheme?.vesak || {}),
            },
          },
        },
      };
    }
  } catch (err) {
    console.warn("Could not load stored site config:", err);
  }
  return DEFAULT_CONFIG;
};

export const SiteConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(getInitialSiteConfig);
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
        const serverData = res.data;
        const serverTheme = serverData.global?.festivalTheme || {};
        const stored = getInitialSiteConfig();
        const storedTheme = stored.global?.festivalTheme || {};
        const storedActive = storedTheme.active;
        const serverActive = serverTheme.active;

        // If server has a festival active, use server. If server is "none" or unset, but local storage has an active theme, preserve it.
        const resolvedActive =
          serverActive && serverActive !== "none"
            ? serverActive
            : storedActive && storedActive !== "none"
            ? storedActive
            : serverActive || "none";

        const merged = {
          ...DEFAULT_CONFIG,
          ...serverData,
          global: {
            ...DEFAULT_CONFIG.global,
            ...(serverData.global || {}),
            festivalTheme: {
              ...DEFAULT_CONFIG.global.festivalTheme,
              ...storedTheme,
              ...serverTheme,
              active: resolvedActive,
              christmas: {
                ...DEFAULT_CONFIG.global.festivalTheme.christmas,
                ...(storedTheme.christmas || {}),
                ...(serverTheme.christmas || {}),
              },
              vesak: {
                ...DEFAULT_CONFIG.global.festivalTheme.vesak,
                ...(storedTheme.vesak || {}),
                ...(serverTheme.vesak || {}),
              },
            },
          },
          hero: { ...DEFAULT_CONFIG.hero, ...(serverData.hero || {}) },
          home: { ...DEFAULT_CONFIG.home, ...(serverData.home || {}) },
          vehicleListing: {
            ...DEFAULT_CONFIG.vehicleListing,
            ...(serverData.vehicleListing || {}),
          },
          companies: {
            ...DEFAULT_CONFIG.companies,
            ...(serverData.companies || {}),
          },
          whyUs: { ...DEFAULT_CONFIG.whyUs, ...(serverData.whyUs || {}) },
          footer: { ...DEFAULT_CONFIG.footer, ...(serverData.footer || {}) },
        };
        setConfig(merged);
        try {
          localStorage.setItem("yamu_site_config", JSON.stringify(merged));
        } catch (e) {}
        applyThemeColors(merged);
      }
    } catch (err) {
      console.warn("Could not fetch remote site config, using stored/default:", err.message);
      const currentStored = getInitialSiteConfig();
      setConfig(currentStored);
      applyThemeColors(currentStored);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    const handleSync = () => fetchConfig();
    window.addEventListener("user-updated", handleSync);
    return () => {
      window.removeEventListener("user-updated", handleSync);
    };
  }, []);

  const updateConfig = async (newConfigData, snapshotName, snapshotDesc) => {
    const currentActiveFestival =
      newConfigData?.global?.festivalTheme?.active !== undefined
        ? newConfigData.global.festivalTheme.active
        : config.global?.festivalTheme?.active || "none";

    const payload = {
      ...config,
      ...newConfigData,
      global: {
        ...config.global,
        ...(newConfigData.global || {}),
        festivalTheme: {
          ...config.global?.festivalTheme,
          ...(newConfigData.global?.festivalTheme || {}),
          active: currentActiveFestival,
          christmas: {
            ...config.global?.festivalTheme?.christmas,
            ...(newConfigData.global?.festivalTheme?.christmas || {}),
          },
          vesak: {
            ...config.global?.festivalTheme?.vesak,
            ...(newConfigData.global?.festivalTheme?.vesak || {}),
          },
        },
      },
    };

    // 1. Immediately apply locally to state & storage so it NEVER disappears in this login
    setConfig(payload);
    applyThemeColors(payload);
    try {
      localStorage.setItem("yamu_site_config", JSON.stringify(payload));
    } catch (e) {
      console.warn("Local storage write error:", e);
    }

    // 2. Sync with backend API
    let serverSynced = false;
    let syncError = null;

    try {
      const token = localStorage.getItem("token");
      const headers = token
        ? {
            "x-auth-token": token,
            Authorization: `Bearer ${token}`,
          }
        : {};

      const res = await axios.put(
        `${API_URL}/api/site-config`,
        {
          ...payload,
          _snapshotName: snapshotName,
          _snapshotDesc: snapshotDesc,
        },
        { headers }
      );

      if (res.data?.config) {
        serverSynced = true;
        const serverConfig = res.data.config;
        const finalMerged = {
          ...DEFAULT_CONFIG,
          ...serverConfig,
          global: {
            ...DEFAULT_CONFIG.global,
            ...(serverConfig.global || {}),
            festivalTheme: {
              ...DEFAULT_CONFIG.global.festivalTheme,
              ...(serverConfig.global?.festivalTheme || {}),
              active: serverConfig.global?.festivalTheme?.active || currentActiveFestival,
              christmas: {
                ...DEFAULT_CONFIG.global.festivalTheme.christmas,
                ...(serverConfig.global?.festivalTheme?.christmas || {}),
              },
              vesak: {
                ...DEFAULT_CONFIG.global.festivalTheme.vesak,
                ...(serverConfig.global?.festivalTheme?.vesak || {}),
              },
            },
          },
        };

        setConfig(finalMerged);
        applyThemeColors(finalMerged);
        try {
          localStorage.setItem("yamu_site_config", JSON.stringify(finalMerged));
        } catch (e) {}

        return { success: true, serverSynced: true, config: finalMerged };
      }
    } catch (err) {
      syncError =
        err.response?.data?.msg ||
        (err.code === "ERR_NETWORK"
          ? "Backend server is offline or unreachable at " + API_URL
          : err.message);
      console.warn("Backend site config sync notice:", syncError);
    }

    return {
      success: true,
      serverSynced,
      syncError,
      config: payload,
    };
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
      localStorage.setItem("yamu_site_config", JSON.stringify(merged));
      applyThemeColors(merged);
    }
    return res.data;
  };

  const resetToDefaults = async () => {
    localStorage.removeItem("yamu_site_config");
    setConfig(DEFAULT_CONFIG);
    applyThemeColors(DEFAULT_CONFIG);
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(
          `${API_URL}/api/site-config/reset`,
          {},
          { headers: { "x-auth-token": token } }
        );
      }
    } catch (e) {
      console.warn("Reset error:", e);
    }
    return { config: DEFAULT_CONFIG };
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
