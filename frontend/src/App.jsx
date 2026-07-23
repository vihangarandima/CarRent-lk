import React, { useEffect } from "react";
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
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SelectRole from "./pages/SelectRole";
import Profile from "./pages/Profile";
import WhyUs from "./pages/WhyUs";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import CompanyDashboard from "./pages/CompanyDashboard";

function AppContent() {
  const location = useLocation();
  const hideFooter = ["/login", "/register", "/select-role", "/splash"].includes(
    location.pathname,
  );

  useEffect(() => {
    const targetId = location.hash.replace("#", "");

    if (!targetId) {
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

      <Navbar />

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
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/vehicles" element={<VehicleListing />} />
          <Route path="/vehicle/:id" element={<VehicleDetail />} />
          <Route path="/list-my-car" element={<ListVehicle />} />
          <Route path="/login" element={<Login />} />
          <Route path="/select-role" element={<SelectRole />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/why-us" element={<WhyUs />} />
          <Route path="/splash" element={<Splash />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:id" element={<CompanyDetail />} />
          <Route path="/company-dashboard" element={<CompanyDashboard />} />
        </Routes>
      </main>

      {!hideFooter && <Footer />}
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
