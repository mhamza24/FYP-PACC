import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, subDays, startOfWeek, startOfMonth, isWithinInterval } from 'date-fns';
import Papa from 'papaparse';
import './GenerateReports.css'; // Import CSS file for component-specific styles
import { blue } from '@mui/material/colors';

function GenerateReports() {
  const [studentData, setStudentData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [selectedType, setSelectedType] = useState('student');
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const rowsPerPage = 10;

  useEffect(() => {
    if (selectedType === 'student' && studentData.length === 0) {
      fetchStudentData();
    } else if (selectedType === 'staff' && staffData.length === 0) {
      fetchStaffData();
    } else {
      applyFilterAndPagination();
    }
  }, [selectedType, filter, searchQuery, currentPage]);

  const fetchStudentData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/getfines');
      setStudentData(response.data);
      if (selectedType === 'student') {
        applyFilterAndPagination(response.data);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const fetchStaffData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/getstaffslips');
      setStaffData(response.data);
      if (selectedType === 'staff') {
        applyFilterAndPagination(response.data);
      }
    } catch (error) {
      console.error('Error fetching staff data:', error);
    }
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const applyFilterAndPagination = (rawData = selectedType === 'student' ? studentData : staffData) => {
    const now = new Date();
    const filteredData = rawData.filter(item => {
      const date = new Date(selectedType === 'student' ? item.created_at : item.time);
      switch (filter) {
        case 'daily':
          return isWithinInterval(date, { start: subDays(now, 1), end: now });
        case 'weekly':
          return isWithinInterval(date, { start: startOfWeek(now, { weekStartsOn: 1 }), end: now });
        case 'monthly':
          return isWithinInterval(date, { start: startOfMonth(now), end: now });
        default:
          return true;
      }
    }).filter(item => {
      const searchTerm = searchQuery.toLowerCase();
      const fine_amount = item.fine_amount ? parseInt(item.fine_amount, 10) : null;
      const searchValue = parseInt(searchQuery, 10);
      return (
        item.student_id?.toLowerCase().includes(searchTerm) ||
        item.staff_id?.toLowerCase().includes(searchTerm) ||
        item.student_name?.toLowerCase().includes(searchTerm) ||
        item.staff_name?.toLowerCase().includes(searchTerm) ||
        item.fine_type?.toLowerCase().includes(searchTerm) ||
        item.department?.toLowerCase().includes(searchTerm) ||
        item.reason?.toLowerCase().includes(searchTerm) ||
        item.time?.toLowerCase().includes(searchTerm) ||
        item.created_at?.toLowerCase().includes(searchTerm) ||
        (fine_amount !== null && !isNaN(searchValue) && fine_amount === searchValue)
      );
    });
  
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);
    setData(paginatedData);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return ''; // Handle null or undefined dateTime
    try {
      return format(new Date(dateTime), 'dd-MM-yyyy hh:mm:ss a');
    } catch (error) {
      console.error('Invalid date format:', error);
      return ''; // Return empty string or handle the error as needed
    }
  };

  const downloadCSV = () => {
    const now = new Date();
    const rawData = selectedType === 'student' ? studentData : staffData;
    const filteredData = rawData.filter(item => {
      const date = new Date(selectedType === 'student' ? item.created_at : item.time);
      switch (filter) {
        case 'daily':
          return isWithinInterval(date, { start: subDays(now, 1), end: now });
        case 'weekly':
          return isWithinInterval(date, { start: startOfWeek(now, { weekStartsOn: 1 }), end: now });
        case 'monthly':
          return isWithinInterval(date, { start: startOfMonth(now), end: now });
        default:
          return true;
      }
    }).filter(item => {
      const searchTerm = searchQuery.toLowerCase();
      const fine_amount = item.fine_amount ? parseInt(item.fine_amount, 10) : null;
      const searchValue = parseInt(searchQuery, 10);
      return (
        item.student_id?.toLowerCase().includes(searchTerm) ||
        item.staff_id?.toLowerCase().includes(searchTerm) ||
        item.student_name?.toLowerCase().includes(searchTerm) ||
        item.staff_name?.toLowerCase().includes(searchTerm) ||
        item.fine_type?.toLowerCase().includes(searchTerm) ||
        item.department?.toLowerCase().includes(searchTerm) ||
        item.reason?.toLowerCase().includes(searchTerm) ||
        item.time?.toLowerCase().includes(searchTerm) ||
        item.created_at?.toLowerCase().includes(searchTerm) ||
        (fine_amount !== null && !isNaN(searchValue) && fine_amount === searchValue)
      );
    });

    const csvData = filteredData.map(item => {
      if (selectedType === 'student') {
        return {
          ID: item.student_id,
          Name: item.student_name,
          FineType: item.fine_type,
          Amount: item.fine_amount,
          Department: item.department,
          Date: formatDateTime(item.created_at)
        };
      } else {
        return {
          ID: item.staff_id,
          Name: item.staff_name,
          Department: item.department,
          Reason: item.reason,
          Duration: item.duration,
          Date: formatDateTime(item.time)
        };
      }
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedType}_data.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="generate-reports-container">
      <h1>Generate Reports</h1>

      <div className="controls-container">
        <div className="type-switch-container">
          <label>
            <input
              type="radio"
              name="type"
              value="student"
              checked={selectedType === 'student'}
              onChange={handleTypeChange}
            />
            Student
          </label>
          <label>
            <input
              type="radio"
              name="type"
              value="staff"
              checked={selectedType === 'staff'}
              onChange={handleTypeChange}
            />
            Staff
          </label>
        </div>

        <div className="form-group">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="filter-container">
          <label>
            Filter by:
            <select value={filter} onChange={handleFilterChange}>
              <option value="all">All</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
        </div>
      </div>

      <div className="data-list-container">
        <h2>{selectedType === 'student' ? 'Fines' : 'Staff Slips'}</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{selectedType === 'student' ? 'Student' : 'Staff'}</th>
              {selectedType === 'student' ? (
                <>
                  <th>Fine Type</th>
                  <th>Amount</th>
                  <th>Department</th>
                </>
              ) : (
                <>
                  <th>Department</th>
                  <th>Reason</th>
                  <th>Duration</th>
                </>
              )}
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={selectedType === 'student' ? item.id : item.slip_id}>
                <td>{selectedType === 'student' ? item.student_id : item.staff_id}</td>
                <td>{selectedType === 'student' ? item.student_name : item.staff_name}</td>
                {selectedType === 'student' ? (
                  <>
                    <td>{item.fine_type}</td>
                    <td>{item.fine_amount}</td>
                    <td>{item.department}</td>
                    <td>{formatDateTime(item.created_at)}</td>
                  </>
                ) : (
                  <>
                    <td>{item.department}</td>
                    <td>{item.reason}</td>
                    <td>{item.duration}</td>
                    <td>{formatDateTime(item.time)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination-container">
          <button  className="pagination-button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </button>
          <span>Page {currentPage}</span>
          <button  className="pagination-button" onClick={() => handlePageChange(currentPage + 1)} disabled={data.length < rowsPerPage}>
            Next
          </button>
        </div>
      </div>

      <button onClick={downloadCSV} className="download-button">Download CSV</button>
    </div>
  );
}

export default GenerateReports;
