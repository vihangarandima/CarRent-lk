import React, { Suspense, lazy, useLayoutEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AnnouncementBar from "./components/AnnouncementBar";
import WhatsAppFloat from "./components/WhatsAppFloat";
import FestivalAccessoriesManager from "./components/festivals/FestivalAccessoriesManager";
import { SiteConfigProvider } from "./context/SiteConfigContext";
import { ToastProvider } from "./context/ToastContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import {
  DASHBOARD_PATH,
  isBrowsingAsCustomer,
  isLister,
} from "./utils/session";

// Every page except the home page loads on demand, so first visit downloads far less code
const Splash = lazy(() => import("./pages/Splash"));
const VehicleListing = lazy(() => import("./pages/VehicleListing"));
const VehicleDetail = lazy(() => import("./pages/VehicleDetail"));
const ListVehicle = lazy(() => import("./pages/ListVehicle"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const WhyUs = lazy(() => import("./pages/WhyUs"));
const Companies = lazy(() => import("./pages/Companies"));
const CompanyDetail = lazy(() => import("./pages/CompanyDetail"));
const CompanyDashboard = lazy(() => import("./pages/CompanyDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ChooseListingType = lazy(() => import("./pages/ChooseListingType"));
const ReviewsPortal = lazy(() => import("./pages/ReviewsPortal"));
const QuickAddFleet = lazy(() => import("./pages/QuickAddFleet"));
const EarningsCalculator = lazy(() => import("./pages/EarningsCalculator"));

const PageLoader = () => (
  <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
    <div
      style={{
        width: 40,
        height: 40,
        border: "3px solid #FFEDD5",
        borderTopColor: "#F97316",
        borderRadius: "50%",
        animation: "app-spin 0.8s linear infinite",
      }}
    />
    <style>{`@keyframes app-spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);


// Listers (hosts / rent-a-car companies) live in their dashboard. They only see
// the customer-facing home page after choosing "View site as customer".
function ListerRedirect({ children }) {
  if (isLister() && !isBrowsingAsCustomer()) {
    return <Navigate to={DASHBOARD_PATH} replace />;
  }
  return children;
}

// Old dashboard URL -> new one, keeping any ?query
function LegacyDashboardRedirect() {
  const location = useLocation();
  return <Navigate to={`${DASHBOARD_PATH}${location.search}`} replace />;
}

function AppContent() {
  const location = useLocation();
  const hideNavAndFooter = [
    "/login",
    "/register",
    "/splash",
    "/choose-listing-type",
    "/select-role",
    "/company-dashboard",
    DASHBOARD_PATH,
    "/admin",
  ].includes(location.pathname);

  const hideFloatingWidgets = [
    "/login",
    "/register",
    "/splash",
    "/admin",
    "/company-dashboard",
    DASHBOARD_PATH,
  ].includes(location.pathname);

  useLayoutEffect(() => {
    const targetId = location.hash.replace("#", "");

    if (!targetId) {
      window.scrollTo(0, 0);
      return;
    }

    const scrollToTarget = () => {
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const navbarHeight =
          document.querySelector(".navbar")?.getBoundingClientRect().height ??
          80;
        const offset = navbarHeight + 24;
        const targetTop =
          window.scrollY + targetElement.getBoundingClientRect().top - offset;

        window.scrollTo({
          top: Math.max(targetTop, 0),
          behavior: "smooth",
        });
      }
    };

    const initialTimer = window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(scrollToTarget);
      });
    }, 150);

    const correctionTimer = window.setTimeout(scrollToTarget, 500);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearTimeout(correctionTimer);
    };
  }, [location.pathname, location.hash]);

  return (
    <div className="app-container">
      <div className="app-bg-orbs" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {!hideNavAndFooter && (
        <>
          <AnnouncementBar />
          <Navbar />
        </>
      )}

      <style>{`
        .app-container {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg);
        }

        .app-bg-orbs {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
        }

        .orb-1 {
          width: 600px;
          height: 600px;
          background: rgba(249, 115, 22, 0.07);
          top: -200px;
          right: -150px;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: rgba(251, 146, 60, 0.05);
          bottom: 20%;
          left: -100px;
        }

        .orb-3 {
          width: 300px;
          height: 300px;
          background: rgba(249, 115, 22, 0.04);
          top: 50%;
          right: 10%;
        }

        main {
          position: relative;
          z-index: 1;
          flex: 1;
        }
      `}</style>

      <main>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<ListerRedirect><LandingPage /></ListerRedirect>} />
          <Route path="/home" element={<ListerRedirect><LandingPage /></ListerRedirect>} />
          <Route path="/vehicles" element={<VehicleListing />} />
          <Route path="/vehicle/:id" element={<VehicleDetail />} />
          <Route path="/list-my-car" element={<ListVehicle />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={isLister() ? <Navigate to={DASHBOARD_PATH} replace /> : <Profile />} />
          <Route path="/why-us" element={<WhyUs />} />
          <Route path="/splash" element={<Splash />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:id" element={<CompanyDetail />} />
          <Route path={DASHBOARD_PATH} element={<CompanyDashboard />} />
          <Route path="/company-dashboard" element={<LegacyDashboardRedirect />} />
          <Route path="/company-list-vehicle" element={<ListVehicle />} />
          <Route path="/fleet/quick-add" element={<QuickAddFleet />} />
          <Route path="/earnings-calculator" element={<EarningsCalculator />} />
          <Route path="/choose-listing-type" element={<ChooseListingType />} />
          <Route path="/select-role" element={<ChooseListingType />} />
          <Route path="/reviews" element={<ReviewsPortal />} />
          <Route path="/reviews-portal" element={<ReviewsPortal />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </main>

      {!hideFloatingWidgets && <WhatsAppFloat />}
      {!hideFloatingWidgets && <FestivalAccessoriesManager />}
      {!hideNavAndFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <SiteConfigProvider>
      <ToastProvider>
        <CurrencyProvider>
          <Router>
            <AppContent />
          </Router>
        </CurrencyProvider>
      </ToastProvider>
    </SiteConfigProvider>
  );
}

export default App;
