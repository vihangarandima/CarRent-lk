import React, { useEffect, useLayoutEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Splash from "./pages/Splash";
import VehicleListing from "./pages/VehicleListing";
import VehicleDetail from "./pages/VehicleDetail";
import ListVehicle from "./pages/ListVehicle";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import WhyUs from "./pages/WhyUs";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import CompanyDashboard from "./pages/CompanyDashboard";

import AdminDashboard from "./pages/AdminDashboard";

import ChooseListingType from "./pages/ChooseListingType";
import ModeSwitcher from "./components/ModeSwitcher";
import MobileBottomNav from "./components/MobileBottomNav";

function AppContent() {
  const location = useLocation();

  useLayoutEffect(() => {
    const targetId = location.hash.replace("#", "");

    if (!targetId) {
      window.scrollTo(0, 0);
      return;
    }

    const scrollToTarget = () => {
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const navbarHeight = document.querySelector(".navbar")?.getBoundingClientRect().height ?? 80;
        const offset = navbarHeight + 24;
        const targetTop = window.scrollY + targetElement.getBoundingClientRect().top - offset;

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
      {/* Global Background Aesthetics */}
      <div className="global-bg-overlay">
        {/* Gravity Particles */}
        <div className="gravity-container">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
          <div className="particle particle-5"></div>
          <div className="particle particle-6"></div>
          <div className="particle particle-7"></div>
          <div className="particle particle-8"></div>
          <div className="particle particle-9"></div>
          <div className="particle particle-10"></div>
          <div className="particle particle-11"></div>
          <div className="particle particle-12"></div>
        </div>

        {/* Blobs */}
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <Navbar />

      <style>{`
      
        .app-container {
          position: relative;
          min-height: 100vh;
        }

          .app-container {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg);
        }

        .global-bg-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: -10;
          overflow: hidden;
          background-color: #FFFFFF;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.35;
          animation: globalBlobFloat 25s infinite alternate ease-in-out;
        }

        .blob-1 {
          width: 600px;
          height: 600px;
          background: #f97316;
          top: -150px;
          right: -100px;
        }

        .blob-2 {
          width: 500px;
          height: 500px;
          background: #fb923c;
          bottom: -100px;
          left: -100px;
          animation-delay: -7s;
        }

        .blob-3 {
          width: 400px;
          height: 400px;
          background: #fbbf24;
          top: 30%;
          right: 15%;
          animation-delay: -12s;
          opacity: 0.25;
        }

        @keyframes globalBlobFloat {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(60px, 120px) scale(1.15); }
        }

        main {
          position: relative;
          z-index: 1;
        }
      `}</style>
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/vehicles" element={<VehicleListing />} />
          <Route path="/vehicle/:id" element={<VehicleDetail />} />
          <Route path="/list-my-car" element={<ListVehicle />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/why-us" element={<WhyUs />} />
          <Route path="/splash" element={<Splash />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:id" element={<CompanyDetail />} />
          <Route path="/company-dashboard" element={<CompanyDashboard />} />
          <Route path="/company-list-vehicle" element={<ListVehicle />} />
          <Route path="/choose-listing-type" element={<ChooseListingType />} />
          <Route path="/select-role" element={<ChooseListingType />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
