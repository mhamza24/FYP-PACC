import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import Papa from 'papaparse';
import './GenerateReports.css'; // Import CSS file for component-specific styles

function GenerateReports() {
  const [studentData, setStudentData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [selectedType, setSelectedType] = useState('student');
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, [selectedType]);

  const fetchData = async () => {
    const endpoint = selectedType === 'student' ? 'getfines' : 'getstaffslips';
    try {
      const response = await axios.get(`http://localhost:5000/api/${endpoint}`);
      console.log("data: ", response.data);
      if (selectedType === 'student') {
        setStudentData(response.data);
        setData(response.data);
      } else {
        setStaffData(response.data);
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setData(e.target.value === 'student' ? studentData : staffData);
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
    const filteredData = data.filter(item => {
      if (selectedType === 'student') {
        return item.hasOwnProperty('student_id');
      } else if (selectedType === 'staff') {
        return item.hasOwnProperty('staff_id');
      }
      return false;
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
      } else if (selectedType === 'staff') {
        return {
          ID: item.staff_id,
          Name: item.staff_name,
          Department: item.department,
          Reason: item.reason,
          Date: formatDateTime(item.time)
        };
      }
      return {};
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
                </>
              )}
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={selectedType === 'student' ? item.student_id : item.staff_id}>
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
                    <td>{formatDateTime(item.time)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={downloadCSV} className="download-button">Download CSV</button>
    </div>
  );
}

export default GenerateReports;
