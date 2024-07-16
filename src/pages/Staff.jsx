import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StaffSlipForm.css'; // Import CSS file for component-specific styles

function StaffSlipForm() {
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedStaffName, setSelectedStaffName] = useState('');
  const [department, setDepartment] = useState('');
  const [reason, setReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/staff')
      .then(response => {
        setStaff(response.data);
        setSuggestions(response.data);
        console.log('Data received:', response.data);
      })
      .catch(error => {
        console.error('Error fetching staff:', error);
      });
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filteredStaff = staff.filter(member =>
      member.Name.toLowerCase().includes(value.toLowerCase()) ||
      member.ID.toLowerCase().includes(value.toLowerCase()) ||
      member.Section.toLowerCase().includes(value.toLowerCase()) ||
      member.Type.toLowerCase().includes(value.toLowerCase()) ||
      member.department.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filteredStaff);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleSelectStaff = (member) => {
    setSelectedStaff(member.ID);
    setSelectedStaffName(member.Name);
    setDepartment(member.department);
    setSearchTerm(`${member.Name} (${member.ID}) - ${member.Section}`);
    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStaff) {
      alert('Please select a staff member.');
      return;
    }
    if (!reason) {
      alert('Please provide a reason.');
      return;
    }

    const slipData = {
      staffId: selectedStaff,
      staffName: selectedStaffName,
      department: department,
      reason: reason
    };

    axios.post('http://localhost:5000/api/staff-slips', slipData)
      .then(response => {
        console.log('Slip submitted successfully:', response.data);
        alert(`Slip submitted for ${selectedStaffName} (${selectedStaff})`);
        setSelectedStaff('');
        setSelectedStaffName('');
        setDepartment('');
        setReason('');
        setSearchTerm('');
      })
      .catch(error => {
        console.error('Error submitting slip:', error);
        alert('Failed to submit slip. Please try again.');
      });
  };

  return (
    <div className="staff-slip-form-container">
      <div className="staff-search">
        <label htmlFor="search" className='searchLabel'>Search Staff</label>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          placeholder="Search by name, ID, or Section..."
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul>
            {suggestions.map(member => (
              <li key={member.ID} onClick={() => handleSelectStaff(member)}>
                {`${member.Name} (${member.ID}) - ${member.Section} - ${member.Type}`}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="staff-slip-apply">
        <h2>Submit Staff Slip</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Staff Name:
              <input type="text" value={selectedStaffName} readOnly />
            </label>
          </div>
          <div>
            <label>
              Department:
              <input type="text" value={department} readOnly />
            </label>
          </div>
          <div>
            <label>
              Reason:
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} required />
            </label>
          </div>
          <button type="submit">Submit Slip</button>
        </form>
      </div>
    </div>
  );
}

export default StaffSlipForm;
