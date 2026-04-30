import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import VehicleListing from './pages/VehicleListing';
import VehicleDetail from './pages/VehicleDetail';
import ListVehicle from './pages/ListVehicle';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/vehicles" element={<VehicleListing />} />
            <Route path="/vehicle/:id" element={<VehicleDetail />} />
            <Route path="/list-my-car" element={<ListVehicle />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
