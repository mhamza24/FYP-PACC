import React, { useState } from "react";
import "../src/style.css";
import TrainData from "./pages/TrainData";
import DetectPeople from "./pages/DetectPeople";
import FineData from "./pages/FineData";
import GenerateReports from "./pages/GenerateReports";
import Staff from "./pages/Staff";
import StaffData from "./pages/alert";
import uniLogo from './assets/uni_logo.png';

function App() {
  const [activePage, setActivePage] = useState("TrainData");
  const handleMenuClick = (page) => {
    setActivePage(page);
  };

  return (
    <div className="App">
      <header className="navbar">
        <div className="navbar-brand">
          <img 
            src={uniLogo} 
            alt="University Logo" 
            className="navbar-logo"
            onClick={() => handleMenuClick("TrainData")}
          />
        </div>
        <nav className="navbar-nav">
          <div 
            className={`nav-item ${activePage === "TrainData" ? "active" : ""}`}
            onClick={() => handleMenuClick("TrainData")}
          >
            <h3>Register Person</h3>
          </div>

          <div 
            className={`nav-item ${activePage === "DetectPeople" ? "active" : ""}`}
            onClick={() => handleMenuClick("DetectPeople")}
          >
            <h3>Detect Face</h3>
          </div>

          <div 
            className={`nav-item ${activePage === "FineData" ? "active" : ""}`}
            onClick={() => handleMenuClick("FineData")}
          >
            <h3>Student</h3>
          </div>

          <div 
            className={`nav-item ${activePage === "Staff" ? "active" : ""}`}
            onClick={() => handleMenuClick("Staff")}
          >
            <h3>Staff</h3>
          </div>

          <div 
            className={`nav-item ${activePage === "GenerateReports" ? "active" : ""}`}
            onClick={() => handleMenuClick("GenerateReports")}
          >
            <h3>Generate Reports</h3>
          </div>
        </nav>
      </header>

      <div className="main-container">
        <div className="main">
          {activePage === "TrainData" && <TrainData />}
          {activePage === "DetectPeople" && (
            <DetectPeople setActivePage={setActivePage} />
          )}
          {activePage === "FineData" && <FineData />}
          {activePage === "GenerateReports" && <GenerateReports />}
          {activePage === "Staff" && <Staff />}
          {activePage === "StaffData" && <StaffData />}
        </div>
      </div>
    </div>
  );
}

export default App;
