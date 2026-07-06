import React from "react";
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
import SelectRole from "./pages/SelectRole";
import Profile from "./pages/Profile";
import WhyUs from "./pages/WhyUs";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import CompanyDashboard from "./pages/CompanyDashboard";

function AppContent() {
  return (
    <div className="app-container">
      {/* Global Background Aesthetics */}
      <div className="global-bg-overlay">
        {/* Animated Grid */}
        <svg
          className="grid-background"
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(249, 115, 22, 0.25)"
                strokeWidth="1.5"
              />
            </pattern>
            <linearGradient id="gridGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(249, 115, 22, 0.35)" />
              <stop offset="50%" stopColor="rgba(249, 115, 22, 0.15)" />
              <stop offset="100%" stopColor="rgba(249, 115, 22, 0.02)" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="url(#gridGradient)" />
        </svg>

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

        /* Animated Grid Background */
        .grid-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.9;
          animation: gridShift 15s linear infinite;
        }

        @keyframes gridShift {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(40px);
          }
        }

        /* Gravity Particles Container */
        .gravity-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        /* Individual Particles */
        .particle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(249, 115, 22, 1), rgba(251, 146, 60, 0.6));
          box-shadow: 0 0 30px rgba(249, 115, 22, 0.9), 0 0 60px rgba(249, 115, 22, 0.5), inset -2px -2px 8px rgba(255, 255, 255, 0.4);
        }

        .particle-1 {
          width: 8px;
          height: 8px;
          left: 15%;
          animation: gravityFall 7s infinite ease-in, horizontalDrift 6s infinite ease-in-out;
        }

        .particle-2 {
          width: 10px;
          height: 10px;
          left: 25%;
          animation: gravityFall 8s infinite ease-in 1s, horizontalDrift 7s infinite ease-in-out 0.5s;
        }

        .particle-3 {
          width: 6px;
          height: 6px;
          left: 35%;
          animation: gravityFall 7.5s infinite ease-in 2s, horizontalDrift 8s infinite ease-in-out 1s;
        }

        .particle-4 {
          width: 9px;
          height: 9px;
          left: 45%;
          animation: gravityFall 8.5s infinite ease-in 1.5s, horizontalDrift 6.5s infinite ease-in-out 0.8s;
        }

        .particle-5 {
          width: 7px;
          height: 7px;
          left: 55%;
          animation: gravityFall 7.2s infinite ease-in 0.5s, horizontalDrift 7.5s infinite ease-in-out 0.3s;
        }

        .particle-6 {
          width: 10px;
          height: 10px;
          left: 65%;
          animation: gravityFall 8.8s infinite ease-in 2.5s, horizontalDrift 8.5s infinite ease-in-out 1.2s;
        }

        .particle-7 {
          width: 6px;
          height: 6px;
          left: 75%;
          animation: gravityFall 7.8s infinite ease-in 0.8s, horizontalDrift 7s infinite ease-in-out 0.6s;
        }

        .particle-8 {
          width: 8px;
          height: 8px;
          left: 85%;
          animation: gravityFall 8.3s infinite ease-in 1.2s, horizontalDrift 8s infinite ease-in-out 0.9s;
        }

        @keyframes gravityFall {
          0% {
            top: -20px;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100vh;
            opacity: 0;
          }
        }

        @keyframes horizontalDrift {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(100px);
          }
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
