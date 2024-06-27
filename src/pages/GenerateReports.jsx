import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GenerateReports.css'; // Import CSS file for component-specific styles

function GenerateReports() {
  const [fines, setFines] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterWeek, setFilterWeek] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/getfines');
      console.log("data: ", response.data);
      setFines(response.data);
    } catch (error) {
      console.error('Error fetching fines:', error);
    }
  };

  // const applyFilters = async () => {
  //   let url = 'http://localhost:5000/api/fines/filter?';
  //   if (filterDate) url += `date=${filterDate}&`;
  //   if (filterWeek) url += `week=${filterWeek}&`;
  //   if (filterMonth) url += `month=${filterMonth}&`;
  //   if (filterDepartment) url += `department=${filterDepartment}&`;
    
  //   const response = await fetch(url);
  //   const data = await response.json();
  //   setFines(data);
  // };

  // const clearFilters = () => {
  //   setFilterDate('');
  //   setFilterWeek('');
  //   setFilterMonth('');
  //   setFilterDepartment('');
  //   fetchFines();
  // };

  return (
    <div className="generate-reports-container">
      <h1>Generate Reports</h1>

      {/* Filters */}
      {/* <div className="filters-container">
        <h2>Filters</h2>
        <label>Date:
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
        </label> */}
        {/* Add more filters as needed */}
        {/* <div className="filter-buttons">
          <button className="filter-button" onClick={applyFilters}>Apply Filters</button>
          <button className="filter-button" onClick={clearFilters}>Clear Filters</button>
        </div>
      </div> */}

      {/* Fines List */}
      <div className="fines-list-container">
        <h2>Fines</h2>
        <table className="fines-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Fine Type</th>
              <th>Amount</th>
              <th>Date</th>
             
            </tr>
          </thead>
          <tbody>
            {fines.map(fine => (
              <tr key={fine.id}>
                <td>{fine.id}</td>
                <td>{fine.student_name}</td>
                <td>{fine.fine_type}</td>
                <td>{fine.fine_amount}</td>
                <td>{fine.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GenerateReports;
