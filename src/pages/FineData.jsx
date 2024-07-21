import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FineData.css'; // Import CSS file for component-specific styles

function FineData() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [department, setDepartment] = useState('');
  const [fineType, setFineType] = useState('');
  const [fineAmount, setFineAmount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false); // Track when to show suggestions
  const [customFineType, setCustomFineType] = useState(''); // State for custom fine type
  const [customFineAmount, setCustomFineAmount] = useState(''); // State for custom fine amount
  const [errors, setErrors] = useState({}); // State for form errors

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/students")
      .then((response) => {
        setStudents(response.data); // Assuming response.data is an array of student objects
        setSuggestions(response.data); // Populate suggestions with all students initially
        console.log("Data received:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
      });
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filteredStudents = students.filter(
      (student) =>
        student.Name.toLowerCase().includes(value.toLowerCase()) ||
        student.ID.toLowerCase().includes(value.toLowerCase()) ||
        student.Section.toLowerCase().includes(value.toLowerCase()) ||
        student.Type.toLowerCase().includes(value.toLowerCase()) ||
        student.department.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filteredStudents);
  };

  const handleInputFocus = () => {
    // When input field is focused, show suggestions
    setShowSuggestions(true);
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student.ID);
    setSelectedStudentName(student.Name); // Set selected student's name
    setDepartment(student.department); // Set selected student's department
    setSearchTerm(`${student.Name} (${student.ID}) - ${student.Section}`);
    setShowSuggestions(false); // Hide suggestions after selecting a student
  };

  const handleFineTypeChange = (e) => {
    const selectedFineType = e.target.value;
    setFineType(selectedFineType);

    if (
      selectedFineType === "Writing wrong name to gain access to University"
    ) {
      setFineAmount(1000);
      setCustomFineType(""); // Clear custom fine type input
      setCustomFineAmount(""); // Clear custom fine amount input
    } else if (selectedFineType === "Not in modest dressing") {
      setFineAmount(500);
      setCustomFineType(""); // Clear custom fine type input
      setCustomFineAmount(""); // Clear custom fine amount input
    } else if (selectedFineType === "Round Collar") {
      setFineAmount(500);
      setCustomFineType(""); // Clear custom fine type input
      setCustomFineAmount(""); // Clear custom fine amount input
    } else {
      setFineAmount(0); // For 'Other' option, fine amount will be manually set
    }
  };

  const handleCustomFineTypeChange = (e) => {
    setCustomFineType(e.target.value);
  };

  const handleCustomFineAmountChange = (e) => {
    setCustomFineAmount(e.target.value);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedStudent)
      newErrors.selectedStudent = "Please select a student.";
    if (!fineType && !customFineType)
      newErrors.fineType =
        "Please select a fine type or enter a custom fine type.";
    if (fineAmount === 0 && !customFineAmount)
      newErrors.fineAmount = "Please set a fine amount.";
    if (fineType === "Other" && (!customFineType || !customFineAmount)) {
      newErrors.customFine = "Please enter the custom fine type and amount.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const applyFine = () => {
    if (!validateForm()) return;

    // Prepare data to send to the server
    const fineData = {
      studentId: selectedStudent,
      studentName: selectedStudentName,
      department: department,
      fineType: fineType === "Other" ? customFineType : fineType, // Use custom fine type if provided
      fineAmount: fineType === "Other" ? customFineAmount : fineAmount, // Use custom fine amount if provided
    };

    // Make API call to submit fine data
    axios
      .post("http://localhost:5000/api/fine", fineData)
      .then((response) => {
        console.log("Fine applied successfully:", response.data);
        alert(
          `Applied ${
            fineType === "Other" ? customFineType : fineType
          } fine of Rs ${
            fineType === "Other" ? customFineAmount : fineAmount
          } to student ${selectedStudentName} (${selectedStudent})`
        );
        setSelectedStudent("");
        setSelectedStudentName("");
        setDepartment("");
        setFineType("");
        setFineAmount(0);
        setCustomFineType(""); // Reset custom fine type input
        setCustomFineAmount(""); // Reset custom fine amount input
        setSearchTerm("");
        setErrors({}); // Clear errors
      })
      .catch((error) => {
        console.error("Error applying fine:", error);
        alert("Failed to apply fine. Please try again.");
      });
  };

  return (
    <div className="fine-data-container">
      <div className="fine-search">
        <label htmlFor="search" className="searchLabel">
          Search Student
        </label>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={handleInputFocus} // Show suggestions on input focus
          placeholder="Search by name, ID, or Section..."
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul>
            {suggestions.map((student) => (
              <li key={student.ID} onClick={() => handleSelectStudent(student)}>
                {`${student.Name} (${student.ID}) - ${student.Section} - ${student.Type}`}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="fine-apply">
        <h2>Apply Fine</h2>
        <div>
          <label>
            Student Name:
            <input type="text" value={selectedStudentName} readOnly />
          </label>
          {errors.selectedStudent && (
            <p className="error">{errors.selectedStudent}</p>
          )}
        </div>
        <div>
          <label>
            Department:
            <input type="text" value={department} readOnly />
          </label>
        </div>
        <div className="fine-type">
          <label>
            <input
              type="radio"
              name="fineType"
              value="Writing wrong name to gain access to University"
              checked={
                fineType === "Writing wrong name to gain access to University"
              }
              onChange={handleFineTypeChange}
            />
            Writing wrong name to gain access to University (1000)
          </label>
          <label>
            <input
              type="radio"
              name="fineType"
              value="Not in modest dressing"
              checked={fineType === "Not in modest dressing"}
              onChange={handleFineTypeChange}
            />
            Not in modest dressing (500)
          </label>
          <label>
            <input
              type="radio"
              name="fineType"
              value="Round Collar"
              checked={fineType === "Round Collar"}
              onChange={handleFineTypeChange}
            />
            Round Collar (500)
          </label>
          <label>
            <input
              type="radio"
              name="fineType"
              value="Other"
              checked={fineType === "Other"}
              onChange={handleFineTypeChange}
            />
            Other
          </label>
          {fineType === "Other" && (
            <div>
              <label>
                Custom Fine Type:
                <input
                  type="text"
                  value={customFineType}
                  onChange={handleCustomFineTypeChange}
                />
              </label>
              <label>
                Custom Fine Amount:
                <input
                  type="number"
                  value={customFineAmount}
                  onChange={handleCustomFineAmountChange}
                />
              </label>
              {errors.customFine && (
                <p className="error">{errors.customFine}</p>
              )}
            </div>
          )}
          {errors.fineType && <p className="error">{errors.fineType}</p>}
          {errors.fineAmount && <p className="error">{errors.fineAmount}</p>}
        </div>

        <button className="fine-apply-button" onClick={applyFine}>
          Apply Fine
        </button>
      </div>
    </div>
  );
}

export default FineData;
