import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { formatVehicleImageUrl, handleImageError } from "../utils/imageHelper";
import DateRangeField from "../components/DateRangeField";
import VehicleCard from "../components/VehicleCard";
import PageHero from "../components/PageHero";
import { formatPublicLocation } from "../utils/locationHelper";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  InfoWindowF,
  CircleF,
} from "@react-google-maps/api";
import { Link, useSearchParams } from "react-router-dom";
import { useSiteConfig } from "../context/SiteConfigContext";
import { useToast } from "../context/ToastContext";
import {
  MapPin,
  Car,
  Search,
  Map,
  LayoutGrid,
  LocateFixed,
  ChevronLeft,
  ChevronRight,
  Layers,
  Wallet,
  RotateCcw,
  Calendar,
} from "lucide-react";

// Image Imports
import bikeeImg from "../assets/images/bikee.jpg";
import threewheelerImg from "../assets/images/threewheeler.jpg";
import miniCarImg from "../assets/images/mini_car.png";
import carImg from "../assets/images/car.jpg";
import premiumCarImg from "../assets/images/premium_car.png";
import miniVanImg from "../assets/images/mini_van.png";
import vanImg from "../assets/images/van.jpg";
import othersCarImg from "../assets/images/others_car.png";

const listingMapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "1.5rem",
};

const sriLankaCenter = { lat: 7.8731, lng: 80.7718 };

const BLUE_SEARCH_PIN_SVG = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="60" viewBox="0 0 48 60">
  <defs>
    <filter id="b-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
  </defs>
  <path d="M24 2C11.85 2 2 11.85 2 24c0 16.5 22 34 22 34s22-17.5 22-34C46 11.85 36.15 2 24 2z" fill="#2563eb" stroke="#ffffff" stroke-width="3" filter="url(#b-shadow)"/>
  <circle cx="24" cy="22" r="8" fill="#ffffff"/>
  <circle cx="24" cy="22" r="4" fill="#2563eb"/>
</svg>
`);

const ORANGE_CAR_PIN_SVG = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="42" height="52" viewBox="0 0 42 52">
  <defs>
    <filter id="c-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <path d="M21 2C10.5 2 2 10.5 2 21c0 14 19 29 19 29s19-15 19-29c0-10.5-8.5-19-19-19z" fill="#f97316" stroke="#ffffff" stroke-width="2.5" filter="url(#c-shadow)"/>
  <circle cx="21" cy="19" r="8" fill="#ffffff"/>
  <path d="M16 21c-.3 0-.5-.2-.5-.5V19l1-2.6c.2-.4.6-.6 1-.6h7c.4 0 .8.2 1 .6l1 2.6v1.5c0 .3-.2.5-.5.5h-.5c-.3 0-.5-.2-.5-.5V20H17v.5c0 .3-.2.5-.5.5H16zm1.2-3h7.6l-.6-1.6h-6.4l-.6 1.6zm-.7 2c.3 0 .6-.3.6-.6s-.3-.6-.6-.6-.6.3-.6.6.3.6.6.6zm8 0c.3 0 .6-.3.6-.6s-.3-.6-.6-.6-.6.3-.6.6.3.6.6.6z" fill="#ea580c"/>
</svg>
`);

// SVG generator for overlapping / clustered vehicle markers showing count badge (e.g. "3", "3+", "5+")
const getMultiVehiclePinSvg = (count) => {
  const countStr = count > 9 ? "9+" : `${count}`;
  return (
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="58" viewBox="0 0 48 58">
  <defs>
    <filter id="m-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
    <linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff7a18"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </linearGradient>
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <!-- Main Orange Pin -->
  <path d="M24 2C13 2 4 11 4 22c0 15 20 34 20 34s20-19 20-34C44 11 35 2 24 2z" fill="url(#pinGrad)" stroke="#ffffff" stroke-width="2.5" filter="url(#m-shadow)"/>
  
  <!-- Center White Circle -->
  <circle cx="24" cy="20" r="10" fill="#ffffff"/>
  
  <!-- Car Silhouette Icon in Center -->
  <path d="M18.5 21.8c-.3 0-.5-.2-.5-.5v-1.2l1.2-2.8c.2-.4.6-.7 1.1-.7h7.4c.5 0 .9.3 1.1.7l1.2 2.8v1.2c0 .3-.2.5-.5.5h-.5c-.3 0-.5-.2-.5-.5v-.4h-7.6v.4c0 .3-.2.5-.5.5h-.8zm1.5-3h8l-.6-1.5h-6.8l-.6 1.5zm-.8 2c.3 0 .6-.3.6-.6s-.3-.6-.6-.6-.6.3-.6.6.3.6.6.6zm8.6 0c.3 0 .6-.3.6-.6s-.3-.6-.6-.6-.6.3-.6.6.3.6.6.6z" fill="#ea580c"/>

  <!-- Top Right Count Badge (${countStr}) -->
  <g transform="translate(23, -2)">
    <circle cx="12" cy="12" r="11" fill="url(#badgeGrad)" stroke="#ffffff" stroke-width="2.2"/>
    <text x="12" y="16" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle">${countStr}</text>
  </g>
</svg>
`)
  );
};

const normalizeSearchText = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Haversine formula to calculate distance between two coordinates in kilometers
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// "yyyy-mm-dd" -> local midnight Date (avoids the UTC shift of new Date("yyyy-mm-dd"))
const parseDay = (value) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
};

const dayStart = (value) => {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Free for the whole period: no booked interval touches it (booked days are inclusive)
const isFreeForDates = (vehicle, from, to) => {
  const intervals = vehicle.bookedIntervals || [];
  if (!intervals.length && vehicle.status === "rented") return false;
  return !intervals.some((i) => {
    if (!i.pickupDate || !i.returnDate) return false;
    return from <= dayStart(i.returnDate) && to >= dayStart(i.pickupDate);
  });
};

const VehicleListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Helper to parse pinned coordinates from string or params
  const parseInitialPin = () => {
    const latP = searchParams.get("lat");
    const lngP = searchParams.get("lng");
    const locP = searchParams.get("location") || "";
    if (latP && lngP) {
      return {
        lat: parseFloat(latP),
        lng: parseFloat(lngP),
        address: locP || `Pinned Location (${parseFloat(latP).toFixed(4)}, ${parseFloat(lngP).toFixed(4)})`,
      };
    }
    const match = locP.match(/Pinned Location \(([0-9.-]+),\s*([0-9.-]+)\)/i);
    if (match) {
      return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2]),
        address: locP,
      };
    }
    return null;
  };

  const initialPin = parseInitialPin();

  // Read initial parameters directly from URL searchParams
  const [filter, setFilter] = useState({
    location: searchParams.get("location") || "",
    brand: searchParams.get("brand") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicleType, setVehicleType] = useState(
    searchParams.get("type") || searchParams.get("vehicleType") || ""
  );
  const [viewMode, setViewMode] = useState(searchParams.get("view") || "grid"); // "grid" or "map"
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [activeClusterIndex, setActiveClusterIndex] = useState(0);
  const [filterShow, setFilterShow] = useState(
    searchParams.get("sort") || "nearest"
  );
  const [filterFuel, setFilterFuel] = useState(
    searchParams.get("fuel") || "any"
  );
  // "" = any, "self-drive", "with-driver" (vehicles offered "both" ways match either)
  const [filterMode, setFilterMode] = useState(searchParams.get("mode") || "");
  // Rental dates from the home search or the When field (yyyy-mm-dd)
  const [dates, setDates] = useState({
    from: searchParams.get("from") || "",
    to: searchParams.get("to") || "",
  });
  
  // GPS & Radius Search States
  const [userLocation, setUserLocation] = useState(null);
  const [pinnedLocation, setPinnedLocation] = useState(initialPin);
  const [radius, setRadius] = useState(
    parseInt(searchParams.get("radius")) || 20
  ); // default 20km radius
  const [mapCenter, setMapCenter] = useState(
    initialPin ? { lat: initialPin.lat, lng: initialPin.lng } : sriLankaCenter
  );
  const [mapZoom, setMapZoom] = useState(initialPin ? 11 : 8);
  const [currentZoom, setCurrentZoom] = useState(initialPin ? 11 : 8);
  const mapRef = React.useRef(null);
  const [isLocating, setIsLocating] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const { config } = useSiteConfig();
  const { toast } = useToast();
  const customThumbs = config?.vehicleListing?.categoryThumbnails || {};

  const vehicleTypeCards = [
    { id: "bicycle", title: "Bicycle", image: customThumbs.bicycle || bikeeImg },
    { id: "threewheeler", title: "Three-wheeler", image: customThumbs.threewheeler || threewheelerImg },
    { id: "mini-car", title: "Mini Car", image: customThumbs["mini-car"] || miniCarImg },
    { id: "car", title: "Car", image: customThumbs.car || carImg },
    { id: "premium-car", title: "Premium Car", image: customThumbs["premium-car"] || premiumCarImg },
    { id: "mini-van", title: "Mini Van", image: customThumbs["mini-van"] || miniVanImg },
    { id: "van", title: "Van", image: customThumbs.van || vanImg },
    { id: "others", title: "Others", image: customThumbs.others || othersCarImg },
  ];

  // Sync state changes to URL searchParams
  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.location) params.set("location", filter.location);
    if (filter.brand) params.set("brand", filter.brand);
    if (filter.minPrice) params.set("minPrice", filter.minPrice);
    if (filter.maxPrice) params.set("maxPrice", filter.maxPrice);
    if (vehicleType) params.set("type", vehicleType);
    if (filterFuel && filterFuel !== "any") params.set("fuel", filterFuel);
    if (filterMode) params.set("mode", filterMode);
    if (dates.from) {
      params.set("from", dates.from);
      params.set("to", dates.to || dates.from);
    }
    if (filterShow && filterShow !== "nearest") params.set("sort", filterShow);
    if (viewMode && viewMode !== "grid") params.set("view", viewMode);
    if (radius && radius !== 20) params.set("radius", radius);
    if (pinnedLocation) {
      params.set("lat", pinnedLocation.lat.toFixed(4));
      params.set("lng", pinnedLocation.lng.toFixed(4));
    }

    const paramStr = params.toString();
    if (paramStr !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [filter, vehicleType, filterFuel, filterMode, dates, filterShow, viewMode, radius, pinnedLocation]);

  // Sync back when browser back/forward buttons are pressed
  useEffect(() => {
    const locParam = searchParams.get("location") || "";
    const brandParam = searchParams.get("brand") || "";
    const minPParam = searchParams.get("minPrice") || "";
    const maxPParam = searchParams.get("maxPrice") || "";
    const typeParam = searchParams.get("type") || searchParams.get("vehicleType") || "";
    const fuelParam = searchParams.get("fuel") || "any";
    const modeParam = searchParams.get("mode") || "";
    const fromParam = searchParams.get("from") || "";
    const toParam = searchParams.get("to") || "";
    const sortParam = searchParams.get("sort") || "nearest";
    const viewParam = searchParams.get("view") || "grid";
    const radiusParam = parseInt(searchParams.get("radius")) || 20;

    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");

    setFilter((prev) => {
      if (
        prev.location === locParam &&
        prev.brand === brandParam &&
        prev.minPrice === minPParam &&
        prev.maxPrice === maxPParam
      ) {
        return prev;
      }
      return { location: locParam, brand: brandParam, minPrice: minPParam, maxPrice: maxPParam };
    });
    setVehicleType((prev) => (prev === typeParam ? prev : typeParam));
    setFilterFuel((prev) => (prev === fuelParam ? prev : fuelParam));
    setFilterMode((prev) => (prev === modeParam ? prev : modeParam));
    setDates((prev) => (prev.from === fromParam && prev.to === toParam ? prev : { from: fromParam, to: toParam }));
    setFilterShow((prev) => (prev === sortParam ? prev : sortParam));
    setViewMode((prev) => (prev === viewParam ? prev : viewParam));
    setRadius((prev) => (prev === radiusParam ? prev : radiusParam));

    if (latParam && lngParam) {
      const parsedLat = parseFloat(latParam);
      const parsedLng = parseFloat(lngParam);
      setPinnedLocation({
        lat: parsedLat,
        lng: parsedLng,
        address: locParam || `Pinned Location (${parsedLat.toFixed(4)}, ${parsedLng.toFixed(4)})`,
      });
      setMapCenter({ lat: parsedLat, lng: parsedLng });
      setMapZoom(11);
    } else {
      const match = locParam.match(/Pinned Location \(([0-9.-]+),\s*([0-9.-]+)\)/i);
      if (match) {
        const parsedLat = parseFloat(match[1]);
        const parsedLng = parseFloat(match[2]);
        setPinnedLocation({
          lat: parsedLat,
          lng: parsedLng,
          address: locParam,
        });
        setMapCenter({ lat: parsedLat, lng: parsedLng });
        setMapZoom(11);
      } else if (!locParam || locParam !== "My GPS Location") {
        setPinnedLocation(null);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/vehicles`);
        setVehicles(res.data);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();

    // Auto-fetch user location just to show the blue pin on the map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(loc);
        },
        (error) => {
          console.warn("Auto-location failed:", error.message);
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  const handleReset = () => {
    setFilter({
      location: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
    });
    setFilterShow("nearest");
    setFilterFuel("any");
    setFilterMode("");
    setDates({ from: "", to: "" });
    setVehicleType("");
    setUserLocation(null);
    setPinnedLocation(null);
    setSelectedVehicle(null);
    setSelectedCluster(null);
    setActiveClusterIndex(0);
    setRadius(20);
    setMapCenter(sriLankaCenter);
    setMapZoom(8);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleClearPinnedLocation = () => {
    setPinnedLocation(null);
    setSelectedVehicle(null);
    setSelectedCluster(null);
    setActiveClusterIndex(0);
    if (filter.location && (filter.location.startsWith("Pinned Location") || filter.location === "My GPS Location")) {
      setFilter((prev) => ({ ...prev, location: "" }));
    }
    setMapCenter(sriLankaCenter);
    setMapZoom(8);
  };

  const handleMapClick = async (e) => {
    if (!e || !e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    setSelectedVehicle(null);
    setSelectedCluster(null);
    setActiveClusterIndex(0);

    const initialPoint = {
      lat,
      lng,
      address: `Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    };
    setPinnedLocation(initialPoint);
    setRadius(20);
    setMapCenter({ lat, lng });
    setMapZoom(11);
    setFilter((prev) => ({ ...prev, location: initialPoint.address }));

    // Try reverse geocoding via Google Maps API
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (apiKey) {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
        );
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const bestAddress = data.results[0].formatted_address;
          setPinnedLocation({ lat, lng, address: bestAddress });
          setFilter((prev) => ({ ...prev, location: bestAddress }));
          return;
        }
      }
    } catch (err) {
      console.warn("Reverse geocode error:", err);
    }
  };

  const handleLocateMe = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast.warning("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(userPos);
        setPinnedLocation({
          lat: userPos.lat,
          lng: userPos.lng,
          address: "My GPS Location",
        });
        setRadius(20);
        setMapCenter(userPos);
        setMapZoom(11);
        setFilter({ ...filter, location: "My GPS Location" });
        setViewMode("map");
        setIsLocating(false);
        toast.info("Filtering vehicles near your GPS location.");
      },
      (error) => {
        let errorMsg = `Unable to retrieve your location. (${error.message})`;
        if (error.code === error.PERMISSION_DENIED) {
           errorMsg = "Location permission denied. Please allow location access in your browser.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
           errorMsg = "Location information is currently unavailable on your device.";
        } else if (error.code === error.TIMEOUT) {
           errorMsg = "The request to get your location timed out. Please try again.";
        }
        toast.warning(errorMsg, "Location Notice");
        setIsLocating(false);
      },
      { timeout: 15000, maximumAge: 60000 }
    );
  };

  const activeCenter =
    pinnedLocation ||
    (userLocation && filter.location === "My GPS Location" ? userLocation : null);

  const dateFrom = parseDay(dates.from);
  const dateTo = parseDay(dates.to) || dateFrom;
  const searchDates = dateFrom && dateTo && dateTo >= dateFrom ? { from: dateFrom, to: dateTo } : null;

  const filtered = vehicles
    .map((v) => {
      let distanceFromCenter = null;
      if (activeCenter && v.lat && v.lng) {
        distanceFromCenter = calculateDistance(
          activeCenter.lat,
          activeCenter.lng,
          v.lat,
          v.lng
        );
      }
      return { ...v, distanceFromCenter };
    })
    .filter((v) => {
      let matchLocation = true;
      if (activeCenter) {
        if (v.distanceFromCenter !== null) {
          matchLocation = v.distanceFromCenter <= radius;
        } else {
          matchLocation = false;
        }
      } else {
        const searchLocation = normalizeSearchText(filter.location);
        const vehicleLocation = normalizeSearchText(v.location);
        const companyName = normalizeSearchText(v.company?.companyName);
        matchLocation =
          !searchLocation ||
          vehicleLocation.includes(searchLocation) ||
          companyName.includes(searchLocation);
      }

      const brandTerm = (filter.brand || "").toLowerCase().trim();
      const matchBrand =
        !brandTerm ||
        v.brand?.toLowerCase().includes(brandTerm) ||
        v.model?.toLowerCase().includes(brandTerm) ||
        `${v.brand || ""} ${v.model || ""}`.toLowerCase().includes(brandTerm);
      const matchMinPrice =
        !filter.minPrice || v.pricePerDay >= parseInt(filter.minPrice);
      const matchMaxPrice =
        !filter.maxPrice || v.pricePerDay <= parseInt(filter.maxPrice);
      const matchFuel =
        filterFuel === "any" || v.fuelType?.toLowerCase() === filterFuel;
      const vMode = v.rentMode || "self-drive";
      const matchMode = !filterMode || vMode === "both" || vMode === filterMode;
      const matchType =
        !vehicleType ||
        v.vehicleType?.toLowerCase() === vehicleType.toLowerCase();
      const matchDates = !searchDates || isFreeForDates(v, searchDates.from, searchDates.to);
      return (
        matchDates &&
        matchBrand &&
        matchLocation &&
        matchMinPrice &&
        matchMaxPrice &&
        matchFuel &&
        matchMode &&
        matchType
      );
    })
    .sort((a, b) => {
      if (filterShow === "price-asc") {
        return (a.pricePerDay || 0) - (b.pricePerDay || 0);
      }
      if (filterShow === "price-desc") {
        return (b.pricePerDay || 0) - (a.pricePerDay || 0);
      }
      if (filterShow === "newest") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (filterShow === "top-rated") {
        const rA = Number(a.rating) || 5;
        const rB = Number(b.rating) || 5;
        return rB - rA;
      }
      if (activeCenter && a.distanceFromCenter !== null && b.distanceFromCenter !== null) {
        return a.distanceFromCenter - b.distanceFromCenter;
      }
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });

  // Dynamic clustering threshold based on real map zoom level
  const getClusterDistanceThreshold = (zoom) => {
    if (zoom >= 16) return 0.01;  // 10 meters (street level zoom: only exact same spot/building stays grouped)
    if (zoom >= 15) return 0.035; // 35 meters
    if (zoom >= 14) return 0.10;  // 100 meters
    if (zoom >= 13) return 0.20;  // 200 meters
    if (zoom >= 12) return 0.35;  // 350 meters
    return 0.55;                  // 550 meters for city overview (zoom <= 11)
  };

  // Group vehicles by zoom-dependent proximity to resolve overlapping pins smoothly
  const vehicleClusters = React.useMemo(() => {
    const validVehicles = filtered.filter((v) => v.lat && v.lng);
    const clusters = [];
    const threshold = getClusterDistanceThreshold(currentZoom);

    validVehicles.forEach((vehicle) => {
      const vLat = Number(vehicle.lat);
      const vLng = Number(vehicle.lng);

      // Check if there is an existing cluster within the zoom threshold
      const existing = clusters.find((c) => {
        const dist = calculateDistance(c.lat, c.lng, vLat, vLng);
        return dist < threshold;
      });

      if (existing) {
        existing.vehicles.push(vehicle);
        // Recalculate centroid so pin sits at center of grouped cars
        const totalLat = existing.vehicles.reduce((sum, v) => sum + Number(v.lat), 0);
        const totalLng = existing.vehicles.reduce((sum, v) => sum + Number(v.lng), 0);
        existing.lat = totalLat / existing.vehicles.length;
        existing.lng = totalLng / existing.vehicles.length;
      } else {
        clusters.push({
          id: `cluster-${vehicle._id}`,
          lat: vLat,
          lng: vLng,
          vehicles: [vehicle],
        });
      }
    });

    return clusters;
  }, [filtered, currentZoom]);

  const handleMarkerClick = (cluster, e) => {
    if (e && e.domEvent) e.domEvent.stopPropagation();
    setSelectedCluster(cluster);
    setActiveClusterIndex(0);
    setSelectedVehicle(cluster.vehicles[0]);
  };

  const handleSidebarVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    if (vehicle.lat && vehicle.lng) {
      const matchingCluster = vehicleClusters.find((c) =>
        c.vehicles.some((v) => v._id === vehicle._id)
      );
      if (matchingCluster) {
        const idx = matchingCluster.vehicles.findIndex((v) => v._id === vehicle._id);
        setSelectedCluster(matchingCluster);
        setActiveClusterIndex(idx >= 0 ? idx : 0);
        setMapCenter({ lat: matchingCluster.lat, lng: matchingCluster.lng });
        setMapZoom(13);
      }
    }
  };

  return (
    <div className="listing-page">
      <PageHero
        badge="Find your ride"
        title="Find the"
        highlight="nearest ride in seconds."
        subtitle="Search verified vehicles across Sri Lanka by dates, type, location and price, then book in minutes."
      />

      <div className="container y-overlap">
        <div className="search-card-block">
          {/* Header: what this is, how many match, and a way back to everything */}
          <div className="sc-header">
            <div>
              <h2 className="sc-title">Find your vehicle</h2>
              <p className="sc-count">
                <strong>{filtered.length}</strong> {filtered.length === 1 ? "vehicle matches" : "vehicles match"} your search
              </p>
            </div>
            {(filter.location || filter.brand || filter.minPrice || filter.maxPrice || vehicleType || filterFuel !== "any" || filterMode || dates.from || pinnedLocation) && (
              <button
                type="button"
                className="sc-reset"
                onClick={handleReset}
                title="Clear all search filters"
              >
                <RotateCcw size={14} /> Clear all
              </button>
            )}
          </div>

          {/* Main search bar: where, what, budget */}
          <div className="sc-bar">
            <label className="sc-field sc-field-location">
              <span className="sc-field-label">Where</span>
              <span className="sc-field-input">
                <MapPin size={17} className="sc-field-icon" />
                <input
                  type="text"
                  placeholder="Town or city"
                  value={filter.location}
                  onChange={(e) => {
                    setFilter({ ...filter, location: e.target.value });
                    if (pinnedLocation) setPinnedLocation(null);
                    if (userLocation) setUserLocation(null);
                  }}
                />
                {pinnedLocation ? (
                  <button
                    type="button"
                    onClick={handleClearPinnedLocation}
                    className="sc-chip-btn"
                    title="Clear pinned location"
                  >
                    Clear pin
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleLocateMe}
                    disabled={isLocating}
                    className="sc-chip-btn"
                    title="Use my current location"
                  >
                    <LocateFixed size={14} className={isLocating ? "animate-spin" : ""} />
                    {isLocating ? "Locating…" : "Near me"}
                  </button>
                )}
              </span>
            </label>

            <div className="sc-field sc-field-dates">
              <span className="sc-field-label">When</span>
              <span className="sc-field-input sc-dates">
                <Calendar size={17} className="sc-field-icon" />
                <DateRangeField
                  variant="bare"
                  from={dates.from}
                  to={dates.to}
                  minDate={new Date()}
                  ariaLabel="Rental dates"
                  onChange={({ from, to }) => setDates({ from, to })}
                />
              </span>
            </div>

            <label className="sc-field sc-field-brand">
              <span className="sc-field-label">Brand or model</span>
              <span className="sc-field-input">
                <Car size={17} className="sc-field-icon" />
                <input
                  type="text"
                  placeholder="e.g. Toyota Axio"
                  value={filter.brand}
                  onChange={(e) => setFilter({ ...filter, brand: e.target.value })}
                />
                {filter.brand && (
                  <button
                    type="button"
                    onClick={() => setFilter({ ...filter, brand: "" })}
                    className="sc-clear-x"
                    aria-label="Clear brand"
                  >
                    ×
                  </button>
                )}
              </span>
            </label>

            <div className="sc-field sc-field-price">
              <span className="sc-field-label">Budget per day (LKR)</span>
              <span className="sc-field-input sc-price">
                <Wallet size={17} className="sc-field-icon" />
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Min"
                  aria-label="Minimum price per day"
                  value={filter.minPrice}
                  onChange={(e) => setFilter({ ...filter, minPrice: e.target.value })}
                />
                <span className="sc-price-sep">to</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Max"
                  aria-label="Maximum price per day"
                  value={filter.maxPrice}
                  onChange={(e) => setFilter({ ...filter, maxPrice: e.target.value })}
                />
              </span>
            </div>

            <button
              className="sc-search-btn"
              type="button"
              onClick={() => {
                const el = document.getElementById("vehicle-results-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Search size={18} />
              <span>Show {filtered.length} {filtered.length === 1 ? "vehicle" : "vehicles"}</span>
            </button>
          </div>

          {activeCenter && (
            <div className="sc-radius">
              <span>Search within</span>
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                aria-label="Search radius"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
              </select>
              <span>of {pinnedLocation ? "the pinned spot" : "you"}</span>
            </div>
          )}

          {/* Vehicle type: same pictures, one tap to pick, "All" to go back */}
          <div className="sc-section">
            <div className="sc-section-label">Vehicle type</div>
            <div className="vehicle-type-compact-grid">
              <button
                type="button"
                className={`vehicle-type-pill-card ${!vehicleType ? "active-type-pill" : ""}`}
                onClick={() => setVehicleType("")}
                aria-pressed={!vehicleType}
              >
                <div className="type-card-img-wrap type-card-all">
                  <LayoutGrid size={22} />
                </div>
                <span className="type-card-label">All types</span>
              </button>
              {vehicleTypeCards.map((type) => {
                const isActive = vehicleType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    className={`vehicle-type-pill-card ${isActive ? "active-type-pill" : ""}`}
                    onClick={() => setVehicleType(isActive ? "" : type.id)}
                    aria-pressed={isActive}
                  >
                    <div className="type-card-img-wrap">
                      <img src={type.image} alt="" />
                    </div>
                    <span className="type-card-label">{type.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Refine: two plain choices, each a single segmented control */}
          <div className="sc-refine">
            <div className="sc-refine-group">
              <span className="sc-section-label">Driver</span>
              <div className="sc-segment" role="radiogroup" aria-label="Driver option">
                {[
                  { id: "", label: "Any" },
                  { id: "self-drive", label: "Self-drive" },
                  { id: "with-driver", label: "With driver" },
                ].map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    role="radio"
                    aria-checked={filterMode === m.id}
                    className={filterMode === m.id ? "on" : ""}
                    onClick={() => setFilterMode(m.id)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sc-refine-group">
              <span className="sc-section-label">Fuel</span>
              <div className="sc-segment" role="radiogroup" aria-label="Fuel type">
                {["any", "petrol", "diesel", "hybrid", "electric"].map((f) => (
                  <button
                    key={f}
                    type="button"
                    role="radio"
                    aria-checked={filterFuel === f}
                    className={filterFuel === f ? "on" : ""}
                    onClick={() => setFilterFuel(f)}
                  >
                    {f === "any" ? "Any" : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Phones: the results button comes last, after every choice is made */}
          <button
            className="sc-search-btn sc-search-btn-end"
            type="button"
            onClick={() => {
              const el = document.getElementById("vehicle-results-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Search size={18} />
            <span>Show {filtered.length} {filtered.length === 1 ? "vehicle" : "vehicles"}</span>
          </button>
        </div>
      </div>

      <div className="container" id="vehicle-results-section">
        <div className="results-header-modern">
          <div className="results-titles">
            <h2>Available Vehicles</h2>
            <p>{filtered.length} verified vehicles · live availability</p>
          </div>
          <div className="results-header-actions">
            <div className="sort-dropdown-wrap">
              <span className="sort-label">Sort:</span>
              <select
                id="vehicle-sort-select"
                value={filterShow}
                onChange={(e) => setFilterShow(e.target.value)}
                className="sort-select-input"
                aria-label="Sort vehicles"
              >
                <option value="nearest">📍 Nearest / Recommended</option>
                <option value="price-asc">💰 Price: Low to High</option>
                <option value="price-desc">💎 Price: High to Low</option>
                <option value="newest">🆕 Newest First</option>
                <option value="top-rated">⭐ Top Rated</option>
              </select>
            </div>

            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${viewMode === "grid" ? "active-view" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid View"
              >
                <LayoutGrid size={18} />
                <span>Grid</span>
              </button>
              <button
                className={`view-toggle-btn ${viewMode === "map" ? "active-view" : ""}`}
                onClick={() => setViewMode("map")}
                title="Map View"
              >
                <Map size={18} />
                <span>Map</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading vehicles...</p>
          </div>
        ) : viewMode === "grid" ? (
          filtered.length === 0 ? (
            <div className="empty-state">
              <span>🔍</span>
              <h3>No vehicles found</h3>
              <p>Try changing your filters or expanding your search radius</p>
              {pinnedLocation && (
                <button
                  type="button"
                  className="sidebar-reset-action-btn"
                  onClick={handleClearPinnedLocation}
                  style={{ marginTop: "1rem" }}
                >
                  View All Available Vehicles
                </button>
              )}
            </div>
          ) : (
            <div className="vehicle-grid">
              {filtered.map((vehicle) => (
                <VehicleCard
                  key={vehicle._id}
                  vehicle={vehicle}
                  distance={vehicle.distanceFromCenter}
                  searchDates={searchDates}
                />
              ))}
            </div>
          )
        ) : (
          <div className="listing-map-section">
            <div className="listing-map-container">
              {/* Map UI overlays */}
              {pinnedLocation ? (
                <div className="map-pinned-banner">
                  <div className="map-pinned-left">
                    <span className="pinned-pulse-dot" />
                    <div>
                      <span className="pinned-title">Searching near pinned location</span>
                      <p className="pinned-addr">{pinnedLocation.address}</p>
                    </div>
                  </div>
                  <div className="map-pinned-right">
                    <span className="pinned-count-pill">
                      {filtered.length} within {radius}km
                    </span>
                    <button
                      type="button"
                      onClick={handleClearPinnedLocation}
                      className="pinned-clear-btn"
                      title="Clear pinned location"
                    >
                      Clear Pin
                    </button>
                  </div>
                </div>
              ) : (
                <div className="map-hint-banner">
                  <span className="map-hint-icon">📍</span>
                  <span>Click anywhere on the map to find cars within 20km</span>
                </div>
              )}

              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={listingMapContainerStyle}
                  center={mapCenter}
                  zoom={mapZoom}
                  onLoad={(map) => {
                    mapRef.current = map;
                  }}
                  onZoomChanged={() => {
                    if (mapRef.current) {
                      const newZ = mapRef.current.getZoom();
                      if (typeof newZ === "number") {
                        setCurrentZoom(newZ);
                      }
                    }
                  }}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                    styles: [
                      { featureType: "poi", stylers: [{ visibility: "off" }] },
                      {
                        featureType: "transit",
                        stylers: [{ visibility: "off" }],
                      },
                    ],
                  }}
                  onClick={handleMapClick}
                >
                  {/* Pinned Location Marker & 20km Circle */}
                  {pinnedLocation && (
                    <>
                      <MarkerF
                        position={{ lat: Number(pinnedLocation.lat), lng: Number(pinnedLocation.lng) }}
                        title="Selected Location (20km Search Center)"
                        zIndex={1000}
                        icon={
                          window.google?.maps ? {
                            url: BLUE_SEARCH_PIN_SVG,
                            scaledSize: new window.google.maps.Size(46, 58),
                            anchor: new window.google.maps.Point(23, 56),
                          } : undefined
                        }
                      />
                      <CircleF
                        center={{ lat: Number(pinnedLocation.lat), lng: Number(pinnedLocation.lng) }}
                        radius={radius * 1000}
                        options={{
                          fillColor: "#3b82f6",
                          fillOpacity: 0.16,
                          strokeColor: "#2563eb",
                          strokeOpacity: 0.85,
                          strokeWeight: 2.5,
                          clickable: false,
                        }}
                      />
                    </>
                  )}

                  {/* GPS User Location (if active and not custom pinned) */}
                  {!pinnedLocation && userLocation && filter.location === "My GPS Location" && (
                    <>
                      <MarkerF
                        position={{ lat: Number(userLocation.lat), lng: Number(userLocation.lng) }}
                        icon={
                          window.google?.maps ? {
                            url: BLUE_SEARCH_PIN_SVG,
                            scaledSize: new window.google.maps.Size(40, 50),
                            anchor: new window.google.maps.Point(20, 48),
                          } : undefined
                        }
                        title="Your GPS Location"
                      />
                      <CircleF
                        center={{ lat: Number(userLocation.lat), lng: Number(userLocation.lng) }}
                        radius={radius * 1000}
                        options={{
                          fillColor: "#3b82f6",
                          fillOpacity: 0.12,
                          strokeColor: "#3b82f6",
                          strokeOpacity: 0.6,
                          strokeWeight: 2,
                          clickable: false,
                        }}
                      />
                    </>
                  )}

                  {/* Vehicle Cluster Markers */}
                  {vehicleClusters.map((cluster) => {
                    const isMulti = cluster.vehicles.length > 1;
                    const count = cluster.vehicles.length;
                    const isSelected = selectedCluster?.id === cluster.id;

                    return (
                      <MarkerF
                        key={cluster.id}
                        position={{ lat: cluster.lat, lng: cluster.lng }}
                        title={
                          isMulti
                            ? `${count} Vehicles Available Here: ${cluster.vehicles
                                .map((v) => `${v.brand} ${v.model}`)
                                .join(", ")}`
                            : `${cluster.vehicles[0].brand} ${cluster.vehicles[0].model}`
                        }
                        zIndex={isSelected ? 500 : isMulti ? 200 + count : 100}
                        icon={
                          window.google?.maps
                            ? isMulti
                              ? {
                                  url: getMultiVehiclePinSvg(count),
                                  scaledSize: new window.google.maps.Size(46, 56),
                                  anchor: new window.google.maps.Point(23, 54),
                                }
                              : {
                                  url: ORANGE_CAR_PIN_SVG,
                                  scaledSize: new window.google.maps.Size(38, 48),
                                  anchor: new window.google.maps.Point(19, 46),
                                }
                            : undefined
                        }
                        onClick={(e) => handleMarkerClick(cluster, e)}
                      />
                    );
                  })}

                  {/* Selected Cluster InfoWindow */}
                  {selectedCluster &&
                    selectedCluster.lat &&
                    selectedCluster.lng && (() => {
                      const curV =
                        selectedCluster.vehicles[activeClusterIndex] ||
                        selectedCluster.vehicles[0];
                      if (!curV) return null;
                      const hasMultiple = selectedCluster.vehicles.length > 1;

                      return (
                        <InfoWindowF
                          position={{
                            lat: selectedCluster.lat,
                            lng: selectedCluster.lng,
                          }}
                          onCloseClick={() => {
                            setSelectedCluster(null);
                            setSelectedVehicle(null);
                          }}
                        >
                          <div className="map-info-card">
                            {/* Multi-vehicle navigation bar */}
                            {hasMultiple && (
                              <div className="map-cluster-nav-header">
                                <div className="map-cluster-pill">
                                  <Layers size={13} />
                                  <span>
                                    <strong>{selectedCluster.vehicles.length} Vehicles</strong> at this spot
                                  </span>
                                </div>
                                <div className="map-cluster-arrows">
                                  <button
                                    type="button"
                                    className="map-cluster-arrow-btn"
                                    title="Previous vehicle"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const nextIdx =
                                        (activeClusterIndex -
                                          1 +
                                          selectedCluster.vehicles.length) %
                                        selectedCluster.vehicles.length;
                                      setActiveClusterIndex(nextIdx);
                                      setSelectedVehicle(
                                        selectedCluster.vehicles[nextIdx]
                                      );
                                    }}
                                  >
                                    <ChevronLeft size={13} />
                                  </button>
                                  <span className="map-cluster-counter">
                                    {activeClusterIndex + 1}/
                                    {selectedCluster.vehicles.length}
                                  </span>
                                  <button
                                    type="button"
                                    className="map-cluster-arrow-btn"
                                    title="Next vehicle"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const nextIdx =
                                        (activeClusterIndex + 1) %
                                        selectedCluster.vehicles.length;
                                      setActiveClusterIndex(nextIdx);
                                      setSelectedVehicle(
                                        selectedCluster.vehicles[nextIdx]
                                      );
                                    }}
                                  >
                                    <ChevronRight size={13} />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Quick vehicle switcher tabs */}
                            {hasMultiple && (
                              <div className="map-cluster-tabs">
                                {selectedCluster.vehicles.map((veh, idx) => (
                                  <button
                                    key={veh._id}
                                    type="button"
                                    className={`map-cluster-tab-btn ${
                                      idx === activeClusterIndex ? "active" : ""
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveClusterIndex(idx);
                                      setSelectedVehicle(veh);
                                    }}
                                  >
                                    {veh.brand} {veh.model}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Active vehicle preview */}
                            {curV.images && curV.images[0] && (
                              <div className="map-info-img-wrap">
                                <img
                                  src={formatVehicleImageUrl(curV.images, curV.vehicleType)}
                                  alt={`${curV.brand} ${curV.model}`}
                                  className="map-info-img"
                                  onError={(e) => handleImageError(e, formatVehicleImageUrl(null, curV.vehicleType))}
                                />
                                {hasMultiple && (
                                  <span className="map-info-img-badge">
                                    {activeClusterIndex + 1} of {selectedCluster.vehicles.length}
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="map-info-body">
                              <h4>
                                {curV.brand} {curV.model}
                              </h4>
                              {curV.distanceFromCenter !== null &&
                                curV.distanceFromCenter !== undefined && (
                                  <div className="map-info-dist-badge">
                                    📍 {curV.distanceFromCenter.toFixed(1)} km from pin
                                  </div>
                                )}
                              <p className="map-info-location">
                                <MapPin size={12} /> {formatPublicLocation(curV.location)}
                              </p>
                              <div className="map-info-footer">
                                <span className="map-info-price">
                                  LKR {curV.pricePerDay?.toLocaleString()}/day
                                  <small
                                    style={{
                                      display: "block",
                                      fontSize: "0.68rem",
                                      fontWeight: 700,
                                      color: "#ea580c",
                                    }}
                                  >
                                    +LKR {curV.pricePerKmAfter100km || 0}/km after 100km
                                  </small>
                                </span>
                                <Link
                                  to={`/vehicle/${curV._id}`}
                                  className="map-info-book"
                                >
                                  Book →
                                </Link>
                              </div>
                            </div>
                          </div>
                        </InfoWindowF>
                      );
                    })()}
                </GoogleMap>
              ) : (
                <div className="listing-map-loading">
                  <div className="spinner" />
                  <span>Loading Map...</span>
                </div>
              )}
            </div>

            {/* Sidebar List */}
            <div className="listing-map-sidebar">
              <div className="map-sidebar-header">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3>
                    {activeCenter
                      ? `${filtered.length} vehicles within ${radius}km`
                      : `${filtered.filter((v) => v.lat && v.lng).length} vehicles on map`}
                  </h3>
                  {pinnedLocation && (
                    <button
                      type="button"
                      onClick={handleClearPinnedLocation}
                      className="sidebar-clear-pin-btn"
                    >
                      Clear Pin
                    </button>
                  )}
                </div>
                <p>
                  {activeCenter
                    ? "Vehicles sorted by proximity to your selected point"
                    : "Click anywhere on the map to find cars within 20km"}
                </p>
              </div>

              <div className="map-sidebar-list">
                {filtered.length === 0 ? (
                  <div className="map-sidebar-empty">
                    <span className="empty-icon">🔍</span>
                    <strong>No vehicles found in this 20km radius</strong>
                    <p>Try clicking another town or district on the map, or clear the pin.</p>
                    {pinnedLocation && (
                      <button
                        type="button"
                        className="sidebar-reset-action-btn"
                        onClick={handleClearPinnedLocation}
                      >
                        View All Available Vehicles
                      </button>
                    )}
                  </div>
                ) : (
                  filtered.map((v) => {
                    const isSelected = selectedVehicle?._id === v._id;
                    const isInSelectedCluster =
                      selectedCluster &&
                      selectedCluster.vehicles.length > 1 &&
                      selectedCluster.vehicles.some((cv) => cv._id === v._id);

                    return (
                      <button
                        key={v._id}
                        className={`map-sidebar-item ${
                          isSelected ? "map-sidebar-active" : ""
                        } ${
                          isInSelectedCluster && !isSelected
                            ? "map-sidebar-in-cluster"
                            : ""
                        }`}
                        onClick={() => handleSidebarVehicleClick(v)}
                      >
                        <div className="map-sidebar-img-wrap">
                          {v.images && v.images.length > 0 ? (
                            <img
                              src={formatVehicleImageUrl(v.images, v.vehicleType)}
                              alt={v.brand}
                              onError={(e) => handleImageError(e, formatVehicleImageUrl(null, v.vehicleType))}
                            />
                          ) : (
                            <div className="map-sidebar-placeholder">
                              <Car size={20} />
                            </div>
                          )}
                        </div>
                        <div className="map-sidebar-info">
                          <div className="sidebar-info-top">
                            <strong>
                              {v.brand} {v.model}
                            </strong>
                            {v.distanceFromCenter !== null &&
                              v.distanceFromCenter !== undefined && (
                                <span className="sidebar-dist-pill">
                                  {v.distanceFromCenter.toFixed(1)} km
                                </span>
                              )}
                          </div>
                          <span className="map-sidebar-loc">
                            <MapPin size={11} /> {formatPublicLocation(v.location)}
                          </span>
                          <span className="map-sidebar-price">
                            LKR {v.pricePerDay?.toLocaleString()}/day
                            <small
                              style={{
                                display: "block",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                color: "#ea580c",
                              }}
                            >
                              +LKR {v.pricePerKmAfter100km || 0}/km after 100km
                            </small>
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* Listing Page Core */
        .listing-page {
          min-height: calc(100vh - 68px);
          padding-bottom: 80px;
          background: var(--bg);
        }

        /* Modern Ultra-Sleek Header */
        .modern-header-section {
          background: radial-gradient(circle at 50% 20%, #fff7ed 0%, #ffedd5 55%, #fef3e7 100%);
          padding: 85px 1.5rem 1.75rem;
          text-align: center;
          border-bottom: 1px solid rgba(254, 215, 170, 0.45);
          position: relative;
        }

        .top-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(249, 115, 22, 0.22);
          padding: 0.3rem 0.85rem;
          border-radius: 9999px;
          font-size: 0.78rem;
          font-weight: 700;
          color: #c2410c;
          margin-bottom: 0.75rem;
          box-shadow: 0 2px 8px rgba(249, 115, 22, 0.08);
        }

        .modern-title {
          font-size: clamp(1.85rem, 3.4vw, 2.75rem);
          font-weight: 900;
          color: #111827;
          line-height: 1.15;
          letter-spacing: -0.025em;
          margin: 0 0 0.4rem 0;
        }

        .text-orange {
          color: #f97316;
        }

        .modern-subtitle {
          font-size: 0.95rem;
          color: #6b7280;
          max-width: 580px;
          line-height: 1.45;
          margin: 0 auto;
        }

        /* Search panel: one bar, then vehicle type, then two simple refinements */
        .search-card-block {
          background: #ffffff;
          border: 1px solid rgba(249, 115, 22, 0.14);
          border-radius: 1.5rem;
          padding: 1.4rem 1.6rem 1.5rem;
          box-shadow: 0 20px 45px -12px rgba(249, 115, 22, 0.1), 0 2px 8px rgba(0, 0, 0, 0.03);
          margin-bottom: 2rem;
          position: relative;
        }

        .sc-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.1rem;
        }

        .sc-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.01em;
          margin: 0 0 2px;
        }

        .sc-count {
          margin: 0;
          font-size: 0.86rem;
          color: #6b7280;
        }

        .sc-count strong {
          color: #ea580c;
        }

        .sc-reset {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          background: none;
          border: 1px solid #e5e7eb;
          color: #4b5563;
          padding: 0.45rem 0.9rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .sc-reset:hover {
          border-color: #fdba74;
          color: #ea580c;
        }

        /* Main bar */
        .sc-bar {
          display: grid;
          grid-template-columns: 1.15fr 1.35fr 0.9fr 1.1fr auto;
          align-items: stretch;
          background: #f8f6f3;
          border: 1px solid #efe9e2;
          border-radius: 18px;
          padding: 6px;
          gap: 6px;
        }

        .sc-field {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 2px;
          min-width: 0;
          background: #ffffff;
          border: 1.5px solid transparent;
          border-radius: 13px;
          padding: 8px 12px 9px;
          cursor: text;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .sc-field:focus-within {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12);
        }

        .sc-field-label {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          color: #6b7280;
        }

        .sc-field-input {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .sc-field-icon {
          color: #f97316;
          flex-shrink: 0;
        }

        .sc-field-input input {
          flex: 1;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          font-family: inherit;
          font-size: 0.95rem;
          font-weight: 600;
          color: #111827;
          padding: 2px 0;
        }

        .sc-field-input input::placeholder {
          color: #9ca3af;
          font-weight: 500;
        }

        .sc-price input {
          width: 0;
          text-align: center;
        }

        .sc-dates .drf-trigger {
          flex: 1;
          min-height: 26px;
        }

        .sc-price input::-webkit-outer-spin-button,
        .sc-price input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .sc-price input[type="number"] {
          -moz-appearance: textfield;
        }

        .sc-price-sep {
          font-size: 0.78rem;
          font-weight: 600;
          color: #9ca3af;
        }

        .sc-chip-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          color: #c2410c;
          border-radius: 999px;
          padding: 4px 9px;
          font-size: 0.74rem;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          white-space: nowrap;
        }

        .sc-chip-btn:hover {
          background: #ffedd5;
        }

        .sc-chip-btn:disabled {
          opacity: 0.7;
          cursor: wait;
        }

        .sc-clear-x {
          background: none;
          border: none;
          color: #9ca3af;
          font-size: 1.2rem;
          line-height: 1;
          cursor: pointer;
          padding: 0 2px;
        }

        .sc-search-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 1.4rem;
          min-height: 56px;
          border: none;
          border-radius: 13px;
          background: linear-gradient(135deg, #ff8800 0%, #f97316 45%, #ea580c 100%);
          color: #ffffff;
          font-family: inherit;
          font-size: 0.95rem;
          font-weight: 800;
          white-space: nowrap;
          cursor: pointer;
          box-shadow: 0 6px 18px -4px rgba(249, 115, 22, 0.5);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .sc-search-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 22px -4px rgba(234, 88, 12, 0.55);
        }

        .sc-search-btn:active {
          transform: scale(0.98);
        }

        .sc-search-btn-end {
          display: none;
        }

        .sc-radius {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 0.6rem;
          font-size: 0.82rem;
          color: #4b5563;
        }

        .sc-radius select {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 3px 6px;
          font-family: inherit;
          font-size: 0.82rem;
          font-weight: 700;
          color: #c2410c;
          background: #ffffff;
        }

        /* Sections below the bar */
        .sc-section {
          margin-top: 1.25rem;
        }

        .sc-section-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 800;
          color: #374151;
          margin-bottom: 0.55rem;
        }

        .vehicle-type-compact-grid {
          display: grid;
          grid-template-columns: repeat(9, minmax(0, 1fr));
          gap: 0.6rem;
        }

        .vehicle-type-pill-card {
          background: #ffffff;
          border: 1.5px solid #ebe7e2;
          border-radius: 14px;
          padding: 0.55rem 0.35rem 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          cursor: pointer;
          height: 80px;
          text-align: center;
          font-family: inherit;
          transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
        }

        .vehicle-type-pill-card:hover {
          border-color: #fdba74;
          background: #fffbf7;
        }

        .vehicle-type-pill-card.active-type-pill {
          border-color: #f97316;
          background: #fff7ed;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.14);
        }

        .type-card-img-wrap {
          height: 36px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .type-card-img-wrap img {
          max-height: 100%;
          max-width: 90%;
          object-fit: contain;
        }

        .type-card-all {
          color: #9ca3af;
        }

        .active-type-pill .type-card-all {
          color: #f97316;
        }

        .type-card-label {
          font-size: 0.74rem;
          font-weight: 700;
          color: #374151;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .vehicle-type-pill-card.active-type-pill .type-card-label {
          color: #c2410c;
          font-weight: 800;
        }

        /* Refine row */
        .sc-refine {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem 2rem;
          margin-top: 1.25rem;
          padding-top: 1.1rem;
          border-top: 1px solid #f1ede8;
        }

        .sc-refine-group .sc-section-label {
          margin-bottom: 0.45rem;
        }

        .sc-segment {
          display: inline-flex;
          gap: 3px;
          padding: 3px;
          background: #f4f1ed;
          border-radius: 12px;
          max-width: 100%;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .sc-segment::-webkit-scrollbar {
          display: none;
        }

        .sc-segment button {
          border: none;
          background: transparent;
          padding: 0.45rem 0.9rem;
          border-radius: 9px;
          font-family: inherit;
          font-size: 0.82rem;
          font-weight: 600;
          color: #57534e;
          white-space: nowrap;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .sc-segment button:hover {
          color: #111827;
        }

        .sc-segment button.on {
          background: #ffffff;
          color: #ea580c;
          font-weight: 800;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.06);
        }

        @media (max-width: 1100px) {
          .sc-bar {
            grid-template-columns: 1fr 1fr;
          }
          .sc-field-price {
            grid-column: 1 / 2;
          }
          .vehicle-type-compact-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .search-card-block {
            padding: 1.1rem 1rem 1.2rem;
            border-radius: 1.25rem;
          }
          .sc-header {
            margin-bottom: 0.85rem;
          }
          .sc-title {
            font-size: 1.1rem;
          }
          .sc-count {
            font-size: 0.8rem;
          }
          .sc-reset {
            padding: 0.4rem 0.75rem;
            font-size: 0.76rem;
          }
          .sc-bar {
            grid-template-columns: 1fr;
            padding: 5px;
            gap: 5px;
            border-radius: 16px;
          }
          .sc-field-price {
            grid-column: auto;
          }
          /* 16px stops iOS zooming into the field */
          .sc-field-input input {
            font-size: 16px;
          }
          .sc-bar .sc-search-btn {
            display: none;
          }
          .sc-search-btn-end {
            display: flex;
            width: 100%;
            min-height: 52px;
            margin-top: 1.25rem;
          }
          /* Vehicle types: one swipeable row */
          .vehicle-type-compact-grid {
            display: flex;
            overflow-x: auto;
            gap: 0.5rem;
            margin: 0 -1rem;
            padding: 2px 1rem 6px;
            scroll-snap-type: x proximity;
            scrollbar-width: none;
          }
          .vehicle-type-compact-grid::-webkit-scrollbar {
            display: none;
          }
          .vehicle-type-pill-card {
            flex: 0 0 84px;
            height: 76px;
            scroll-snap-align: start;
          }
          .type-card-label {
            font-size: 0.7rem;
          }
          .sc-refine {
            flex-direction: column;
            gap: 0.9rem;
          }
          .sc-refine-group {
            min-width: 0;
          }
          .sc-segment {
            display: flex;
            width: 100%;
          }
          .sc-segment button {
            flex: 1 0 auto;
            padding: 0.55rem 0.7rem;
          }
        }

        .icon-orange-txt { color: #f97316; }
        .icon-blue-txt { color: #3b82f6; }
        .icon-gray-txt { color: #9ca3af; }

        /* Results & Grid */
        .results-header-modern {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .results-titles h2 {
          font-size: 1.45rem;
          font-weight: 800;
          margin: 0;
          color: #111827;
        }

        .results-titles p {
          margin: 0.2rem 0 0;
          color: #6b7280;
          font-size: 0.85rem;
        }

        .results-header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: nowrap;
          min-width: 0;
          max-width: 100%;
        }

        .sort-dropdown-wrap {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 100px;
          padding: 0.25rem 0.65rem 0.25rem 0.85rem;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
          transition: all 0.2s ease;
        }

        .sort-dropdown-wrap:focus-within {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12);
        }

        .sort-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          white-space: nowrap;
        }

        .sort-select-input {
          border: none;
          background: transparent;
          font-size: 0.74rem;
          font-weight: 600;
          color: #0f172a;
          cursor: pointer;
          outline: none;
          font-family: inherit;
          padding-right: 0.15rem;
        }

        .view-toggle {
          display: flex;
          background: #f3f4f6;
          border-radius: 100px;
          padding: 3px;
          gap: 2px;
        }

        .view-toggle-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0.4rem 0.95rem;
          border-radius: 100px;
          border: none;
          background: transparent;
          font-size: 0.8rem;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .view-toggle-btn:hover { color: #111827; }
        .view-toggle-btn.active-view {
          background: #f97316;
          color: white;
          box-shadow: 0 2px 8px rgba(249,115,22,0.25);
        }

        .vehicle-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 1.25rem;
        }

        .loading-state, .empty-state {
          text-align: center;
          padding: 3.5rem 1rem;
          color: #6b7280;
        }

        /* Map Section Styles */
        .listing-map-section {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 1.5rem;
          height: 670px;
          animation: fadeInUp 0.4s ease both;
        }

        .listing-map-container {
          border-radius: 1.5rem;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.06);
          position: relative;
        }

        .listing-map-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 1rem;
          color: #6b7280;
        }

        .map-pinned-banner {
          position: absolute;
          top: 14px;
          left: 14px;
          right: 14px;
          z-index: 10;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(37, 99, 235, 0.25);
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.15);
          border-radius: 14px;
          padding: 10px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .map-pinned-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .pinned-pulse-dot {
          width: 10px;
          height: 10px;
          background: #2563eb;
          border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
          animation: pulse 1.8s infinite;
          flex-shrink: 0;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.5); }
          70% { box-shadow: 0 0 0 8px rgba(37, 99, 235, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }

        .pinned-title {
          font-size: 0.82rem;
          font-weight: 800;
          color: #1e40af;
          display: block;
        }

        .pinned-addr {
          margin: 0;
          font-size: 0.76rem;
          color: #4b5563;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 320px;
        }

        .map-pinned-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .pinned-count-pill {
          background: #dbeafe;
          color: #1e40af;
          font-weight: 700;
          font-size: 0.74rem;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .pinned-clear-btn {
          background: #fee2e2;
          color: #dc2626;
          border: none;
          font-weight: 700;
          font-size: 0.76rem;
          padding: 5px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.2s;
        }
        .pinned-clear-btn:hover { background: #fecaca; }

        .map-hint-banner {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 10;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          border-radius: 100px;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: #374151;
          pointer-events: none;
        }

        .map-hint-icon { font-size: 1rem; }

        .map-info-card {
          width: 250px;
          font-family: var(--font-body);
        }

        .map-cluster-nav-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 5px 8px;
          margin-bottom: 8px;
          gap: 6px;
        }

        .map-cluster-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          color: #1e293b;
        }

        .map-cluster-pill strong {
          color: #ea580c;
        }

        .map-cluster-arrows {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .map-cluster-arrow-btn {
          width: 22px;
          height: 22px;
          border-radius: 4px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #334155;
          padding: 0;
          transition: all 0.15s ease;
        }

        .map-cluster-arrow-btn:hover {
          background: #ea580c;
          border-color: #ea580c;
          color: #ffffff;
        }

        .map-cluster-counter {
          font-size: 0.72rem;
          font-weight: 800;
          color: #475569;
          min-width: 26px;
          text-align: center;
        }

        .map-cluster-tabs {
          display: flex;
          gap: 4px;
          overflow-x: auto;
          padding-bottom: 4px;
          margin-bottom: 8px;
          scrollbar-width: thin;
        }

        .map-cluster-tab-btn {
          font-size: 0.68rem;
          font-weight: 600;
          padding: 3px 7px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #f1f5f9;
          color: #475569;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .map-cluster-tab-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .map-cluster-tab-btn.active {
          background: #ea580c;
          border-color: #ea580c;
          color: #ffffff;
          font-weight: 700;
        }

        .map-info-img-wrap {
          position: relative;
          width: 100%;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .map-info-img-wrap .map-info-img {
          margin-bottom: 0;
          display: block;
        }

        .map-info-img-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(4px);
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .map-info-img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: 10px;
          margin-bottom: 8px;
        }

        .map-info-body h4 {
          margin: 0 0 4px;
          font-size: 0.95rem;
          font-weight: 800;
          color: #111827;
        }

        .map-info-dist-badge {
          display: inline-block;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 6px;
          margin-bottom: 6px;
          border: 1px solid #bfdbfe;
        }

        .map-info-location {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #6b7280;
          font-size: 0.78rem;
          margin: 0 0 8px;
        }

        .map-info-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .map-info-price {
          font-weight: 800;
          font-size: 0.88rem;
          color: #f97316;
        }

        .map-info-book {
          background: #f97316;
          color: white;
          padding: 5px 14px;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.78rem;
          text-decoration: none;
          transition: 0.2s;
          box-shadow: 0 3px 8px rgba(249,115,22,0.3);
        }
        .map-info-book:hover { background: #ea580c; }

        /* Map Sidebar */
        .listing-map-sidebar {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 1.5rem;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 30px rgba(0,0,0,0.04);
        }

        .map-sidebar-header {
          padding: 1.15rem 1.4rem;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .map-sidebar-header h3 {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 800;
          color: #111827;
        }

        .sidebar-clear-pin-btn {
          background: #fee2e2;
          color: #dc2626;
          border: none;
          border-radius: 6px;
          padding: 3px 8px;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }
        .sidebar-clear-pin-btn:hover { background: #fecaca; }

        .map-sidebar-header p {
          margin: 4px 0 0;
          font-size: 0.78rem;
          color: #9ca3af;
        }

        .map-sidebar-list {
          overflow-y: auto;
          flex: 1;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .map-sidebar-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2.5rem 1rem;
          color: #6b7280;
        }

        .map-sidebar-empty .empty-icon {
          font-size: 2.2rem;
          margin-bottom: 0.75rem;
        }

        .map-sidebar-empty strong {
          color: #1f2937;
          font-size: 0.92rem;
          margin-bottom: 0.35rem;
        }

        .map-sidebar-empty p {
          font-size: 0.78rem;
          color: #9ca3af;
          margin-bottom: 1rem;
        }

        .sidebar-reset-action-btn {
          background: #f97316;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(249,115,22,0.25);
        }
        .sidebar-reset-action-btn:hover { background: #ea580c; }

        .map-sidebar-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem;
          border-radius: 1rem;
          border: 1.5px solid transparent;
          background: #fafafa;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          font-family: inherit;
        }

        .map-sidebar-item:hover {
          border-color: rgba(249,115,22,0.15);
          background: #fff7ed;
        }

        .map-sidebar-item.map-sidebar-active {
          border-color: #f97316;
          background: #fff7ed;
          box-shadow: 0 4px 12px rgba(249,115,22,0.1);
        }

        .map-sidebar-item.map-sidebar-in-cluster {
          border-left: 3px solid #fdba74;
          background: rgba(255, 247, 237, 0.6);
        }

        .map-sidebar-img-wrap {
          width: 56px;
          height: 56px;
          border-radius: 0.75rem;
          overflow: hidden;
          flex-shrink: 0;
        }

        .map-sidebar-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .map-sidebar-placeholder {
          width: 100%;
          height: 100%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
        }

        .map-sidebar-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
          flex: 1;
        }

        .sidebar-info-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 6px;
        }

        .sidebar-info-top strong {
          font-size: 0.9rem;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-dist-pill {
          background: #dbeafe;
          color: #1e40af;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .map-sidebar-loc {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .map-sidebar-price {
          font-size: 0.82rem;
          font-weight: 800;
          color: #f97316;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Responsive Breakpoints */
        @media (max-width: 900px) {
          .modern-header-section {
            padding: 75px 1rem 1.25rem;
          }
          .listing-map-section {
            grid-template-columns: 1fr;
            height: auto;
          }
          .listing-map-container {
            height: 400px;
          }
          .listing-map-sidebar {
            max-height: 300px;
          }
        }

        @media (max-width: 768px) {
          .modern-header-section {
            padding: 70px 0.85rem 1.25rem !important;
          }
          .results-header-modern {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
          .results-header-actions {
            width: 100% !important;
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            align-items: center !important;
            gap: 0.4rem !important;
          }
          .sort-dropdown-wrap {
            flex: 1 1 0% !important;
            min-width: 0 !important;
            padding: 0.22rem 0.42rem 0.22rem 0.55rem !important;
            gap: 0.25rem !important;
          }
          .sort-label {
            font-size: 0.65rem !important;
            letter-spacing: 0.02em !important;
          }
          .sort-select-input {
            width: 100% !important;
            min-width: 0 !important;
            font-size: 0.70rem !important;
            padding: 0 !important;
          }
          .view-toggle {
            flex-shrink: 0 !important;
            padding: 2px !important;
          }
          .view-toggle-btn {
            padding: 0.28rem 0.52rem !important;
            font-size: 0.72rem !important;
          }
        }

        @media (max-width: 640px) {
          .vehicle-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.65rem !important;
          }
        }

        @media (max-width: 480px) {
          .results-header-actions {
            gap: 0.3rem !important;
          }
          .sort-dropdown-wrap {
            padding: 0.2rem 0.35rem 0.2rem 0.45rem !important;
            gap: 0.2rem !important;
          }
          .sort-label {
            font-size: 0.62rem !important;
          }
          .sort-select-input {
            font-size: 0.66rem !important;
            padding: 0 !important;
          }
          .view-toggle-btn {
            padding: 0.25rem 0.42rem !important;
            font-size: 0.68rem !important;
            gap: 2px !important;
          }
          .view-toggle-btn svg {
            width: 14px !important;
            height: 14px !important;
          }
          .vehicle-grid {
            gap: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default VehicleListing;