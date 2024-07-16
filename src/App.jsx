import React, { useState, useEffect } from "react";
import "../src/style.css";
import TrainData from "./pages/TrainData";
import DetectPeople from "./pages/DetectPeople";
import FineData from "./pages/FineData";
import GenerateReports from "./pages/GenerateReports";
import Staff from "./pages/Staff";
import StaffData from "./pages/StaffData";
import uniLogo from './assets/uni_logo.png';

function App() {
  const [activePage, setActivePage] = useState("TrainData");
  const handleMenuClick = (page) => {
    setActivePage(page);
  };

  return (
    <div className="App">
      <header>
        <div>
          <img src={uniLogo} alt="University Logo" 
          style={{ width: "150px", height: "45px", cursor: "pointer"}}
          onClick={() => handleMenuClick("TrainData")}
          />
        </div>
        <div
          className={`nav-option ${activePage === "TrainData" ? "active" : ""}`}
          onClick={() => handleMenuClick("TrainData")}
        >
          <h3>Train Data</h3>
        </div>

        <div
          className={`nav-option ${
            activePage === "DetectPeople" ? "active" : ""
          }`}
          onClick={() => handleMenuClick("DetectPeople")}
        >
          <h3>Detect People</h3>
        </div>

        <div
          className={`nav-option ${activePage === "FineData" ? "active" : ""}`}
          onClick={() => handleMenuClick("FineData")}
        >
          <h3>Fine Data</h3>
        </div>

        <div
          className={`nav-option ${
            activePage === "GenerateReports" ? "active" : ""
          }`}
          onClick={() => handleMenuClick("GenerateReports")}
        >
          <h3>Generate Reports</h3>
        </div>

        <div
          className={`nav-option ${activePage === "Staff" ? "active" : ""}`}
          onClick={() => handleMenuClick("Staff")}
        >
          <h3>Staff</h3>
        </div>

        <div
          className={`nav-option ${activePage === "StaffData" ? "active" : ""}`}
          onClick={() => handleMenuClick("StaffData")}
        >
          <h3>Staff Data</h3>
        </div>
      </header>

      <div className="main-container">
        <div className="navcontainer"></div>
        <div className="main" style={{paddingLeft: "0px", paddingRight: "0px"}}>
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
