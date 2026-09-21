const mongoose = require("mongoose");

const SiteConfigSchema = new mongoose.Schema(
  {
    global: {
      brandName: { type: String, default: "Yamu Car Rentals" },
      brandTagline: {
        type: String,
        default: "Sri Lanka's Premier Vehicle Rental Platform",
      },
      logoUrl: { type: String, default: "/logo.png" },
      themePreset: {
        type: String,
        enum: [
          "yamu-orange",
          "avurudu",
          "christmas",
          "tropical",
          "midnight-gold",
          "custom",
        ],
        default: "yamu-orange",
      },
      primaryColor: { type: String, default: "#f97316" },
      primaryDark: { type: String, default: "#ea580c" },
      primaryLight: { type: String, default: "#fb923c" },
      accentColor: { type: String, default: "#10b981" },
      announcement: {
        enabled: { type: Boolean, default: false },
        text: {
          type: String,
          default:
            "🎉 Holiday Special: Get 15% OFF on all Luxury Sedans & Vans! Use code YAMU15",
        },
        link: { type: String, default: "/vehicles" },
        bgColor: { type: String, default: "#f97316" },
        textColor: { type: String, default: "#ffffff" },
      },
      whatsAppSupport: {
        enabled: { type: Boolean, default: true },
        phoneNumber: { type: String, default: "+94770000000" },
        greetingMessage: {
          type: String,
          default: "Hello Yamu Team! I need help with renting a vehicle.",
        },
      },
      contact: {
        phone: { type: String, default: "+94 77 123 4567" },
        email: { type: String, default: "hello@yamucarrentals.lk" },
        address: { type: String, default: "Colombo, Sri Lanka" },
      },
      socialLinks: {
        tiktok: {
          type: String,
          default:
            "https://www.tiktok.com/@yamucarrentals?_r=1&_t=ZS-98SNnP8jRBp",
        },
        facebook: {
          type: String,
          default: "https://www.facebook.com/share/1Bb9AkvaZz/",
        },
        instagram: { type: String, default: "https://www.instagram.com" },
        linkedin: { type: String, default: "https://www.linkedin.com" },
        youtube: { type: String, default: "https://www.youtube.com" },
      },
    },

    hero: {
      watermarkText: { type: String, default: "YAMU" },
      taglineTop: { type: String, default: "Make The Right Choice" },
      taglineBottom: {
        type: String,
        default: "Find Your Dream Car, Which will Give You Wings",
      },
      fleetCutoutUrl: { type: String, default: "" },
      backgroundSlides: {
        type: [String],
        default: [
          "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1920",
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1920",
          "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=1920",
        ],
      },
      popularSearchChips: {
        type: [String],
        default: [
          "Airport Transfers",
          "Self-Drive 4x4",
          "Budget City Cars",
          "Weddings & VIP",
          "Vans for Groups",
        ],
      },
    },

    home: {
      categories: {
        type: [
          {
            id: String,
            label: String,
            vehicleType: String,
            image: String,
          },
        ],
        default: [
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
      },
      stats: {
        type: [
          {
            number: String,
            label: String,
            desc: String,
          },
        ],
        default: [
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
      },
      testimonials: {
        type: [
          {
            name: String,
            location: String,
            rating: Number,
            text: String,
            avatar: String,
          },
        ],
        default: [
          {
            name: "Nimal Perera",
            location: "Colombo",
            rating: 5,
            text: "Booked a Toyota Fortuner for our family trip to Ella. Smooth process, verified host, and the car was spotless. Will definitely use again!",
            avatar:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
          },
          {
            name: "Sarah Mitchell",
            location: "Kandy",
            rating: 5,
            text: "As a tourist, Yamu Car Rentals made renting so easy. Transparent pricing, no hidden fees, and 24/7 support when I had a question.",
            avatar:
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
          },
          {
            name: "Kasun Silva",
            location: "Galle",
            rating: 5,
            text: "I listed my car and started earning within a week. The platform handles everything — verification, bookings, payments. Highly recommend!",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100",
          },
        ],
      },
      steps: {
        type: [
          {
            num: String,
            title: String,
            desc: String,
            image: String,
          },
        ],
        default: [
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
      },
      whyUsCards: {
        type: [
          {
            title: String,
            desc: String,
            iconKey: String,
          },
        ],
        default: [
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
      },
      bottomCta: {
        title: { type: String, default: "Ready to Hit the Open Road?" },
        subtitle: {
          type: String,
          default:
            "Book your dream ride in seconds or register your vehicle to start earning today with Yamu.",
        },
        buttonText: { type: String, default: "Explore All Vehicles" },
        buttonLink: { type: String, default: "/vehicles" },
        listerButtonText: { type: String, default: "List Your Vehicle" },
        listerButtonLink: { type: String, default: "/choose-listing-type" },
      },
    },

    vehicleListing: {
      headerTitle: {
        type: String,
        default: "Explore Verified Vehicles in Sri Lanka",
      },
      headerSubtitle: {
        type: String,
        default:
          "Find cars, vans, SUVs, luxury rides, and tuk-tuks with smart filters and instant offers.",
      },
      categoryThumbnails: {
        type: Map,
        of: String,
        default: {},
      },
      defaultPriceMin: { type: Number, default: 3000 },
      defaultPriceMax: { type: Number, default: 50000 },
    },

    companies: {
      headerTitle: {
        type: String,
        default: "Verified Rental Partners in Sri Lanka",
      },
      headerSubtitle: {
        type: String,
        default:
          "Connect with top-rated vehicle rental agencies and fleet owners across the island.",
      },
      popularCities: {
        type: [String],
        default: [
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
    },

    whyUs: {
      badge: { type: String, default: "Our Promise" },
      title: { type: String, default: "Why Choose Yamu Car Rentals?" },
      subtitle: {
        type: String,
        default:
          "We're redefining the vehicle rental experience in Sri Lanka through trust, transparency, and technology.",
      },
      faqs: {
        type: [
          {
            q: String,
            a: String,
          },
        ],
        default: [
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
    },

    footer: {
      tagline: {
        type: String,
        default:
          "Sri Lanka's trusted vehicle rental marketplace. Safe, transparent, and seamless rides islandwide.",
      },
      copyrightText: {
        type: String,
        default: `© ${new Date().getFullYear()} Yamu Car Rentals. All rights reserved.`,
      },
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteConfig", SiteConfigSchema);
