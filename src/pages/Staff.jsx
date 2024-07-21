import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StaffSlipForm.css'; // Import CSS file for component-specific styles

function StaffSlipForm() {
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedStaffName, setSelectedStaffName] = useState("");
  const [department, setDepartment] = useState("");
  const [duration, setDuration] = useState("");
  const [reason, setReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState({}); // State for form errors

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/staff")
      .then((response) => {
        setStaff(response.data);
        setSuggestions(response.data);
        console.log("Data received:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching staff:", error);
      });
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filteredStaff = staff.filter(
      (member) =>
        member.Name.toLowerCase().includes(value.toLowerCase()) ||
        member.ID.toLowerCase().includes(value.toLowerCase()) ||
        member.Section.toLowerCase().includes(value.toLowerCase()) ||
        member.Type.toLowerCase().includes(value.toLowerCase()) ||
        member.department.toLowerCase().includes(value.toLowerCase()) ||
        member.duration.toLowerCase().includes(value.toLowerCase())
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
    setDuration(member.duration);
    setSearchTerm(`${member.Name} (${member.ID}) - ${member.Section}`);
    setShowSuggestions(false);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedStaff)
      newErrors.selectedStaff = "Please select a staff member.";
    if (!reason) newErrors.reason = "Please provide a reason.";
    if (!duration) newErrors.duration = "Please select a duration.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const slipData = {
      staffId: selectedStaff,
      staffName: selectedStaffName,
      department: department,
      reason: reason,
      duration: duration,
    };

    axios
      .post("http://localhost:5000/api/staff-slips", slipData)
      .then((response) => {
        console.log("Slip submitted successfully:", response.data);
        alert(`Slip submitted for ${selectedStaffName} (${selectedStaff})`);
        setSelectedStaff("");
        setSelectedStaffName("");
        setDepartment("");
        setReason("");
        setDuration("");
        setSearchTerm("");
        setErrors({}); // Clear errors
      })
      .catch((error) => {
        console.error("Error submitting slip:", error);
        alert("Failed to submit slip. Please try again.");
      });
  };

  return (
    <div className="staff-slip-form-container">
      <div className="staff-search">
        <label htmlFor="search" className="searchLabel">
          Search Staff
        </label>
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
            {suggestions.map((member) => (
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
            {errors.selectedStaff && (
              <p className="error">{errors.selectedStaff}</p>
            )}
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
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            {errors.reason && <p className="error">{errors.reason}</p>}
          </div>
          <div className="form-group">
            <label>Duration:</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="">Select Duration</option>
              <option value="Less than 1 Hour">Less than 1 hour</option>
              <option value="2 Hour">2 Hour</option>
              <option value="3 Hour">3 Hour</option>
              <option value="More than 3 Hour">More than 3 Hour</option>
              <option value="Halfday">Halfday</option>
            </select>
            {errors.duration && <p className="error">{errors.duration}</p>}
          </div>

          <button type="submit">Submit Slip</button>
        </form>
      </div>
    </div>
  );
}

export default StaffSlipForm;
