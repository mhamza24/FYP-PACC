import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FineData.css'; // Import CSS file for component-specific styles

function FineData() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [fineType, setFineType] = useState('');
  const [fineAmount, setFineAmount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false); // Track when to show suggestions

  useEffect(() => {
    axios.get('http://localhost:5000/api/students')
      .then(response => {
        setStudents(response.data); // Assuming response.data is an array of student objects
        setSuggestions(response.data); // Populate suggestions with all students initially
        console.log('Data received:', response.data);
      })
      .catch(error => {
        console.error('Error fetching students:', error);
      });
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filteredStudents = students.filter(student =>
      student.Name.toLowerCase().includes(value.toLowerCase()) ||
      student.ID.toLowerCase().includes(value.toLowerCase()) ||
      student.Section.toLowerCase().includes(value.toLowerCase()) ||
      student.Type.toLowerCase().includes(value.toLowerCase())
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
    setSearchTerm(`${student.Name} (${student.ID}) - ${student.Section}`);
    setShowSuggestions(false); // Hide suggestions after selecting a student
  };

  const handleFineTypeChange = (e) => {
    setFineType(e.target.value);
    // Set fine amount based on selected fine type
    switch (e.target.value) {
      case 'Writing wrong name to gain access to University':
        setFineAmount(1000);
        break;
      case 'Not in modest dressing':
      case 'Round Collar':
        setFineAmount(500);
        break;
      default:
        setFineAmount(0);
    }
  };

  const applyFine = () => {
    if (!selectedStudent) {
      alert('Please select a student.');
      return;
    }
    if (!fineType) {
      alert('Please select a fine type.');
      return;
    }
    if (fineAmount === 0) {
      alert('Please select a fine amount.');
      return;
    }

    // Prepare data to send to the server
    const fineData = {
      studentId: selectedStudent,
      studentName: selectedStudentName,
      fineType: fineType,
      fineAmount: fineAmount
    };

    // Make API call to submit fine data
    axios.post('http://localhost:5000/api/fine', fineData)
      .then(response => {
        console.log('Fine applied successfully:', response.data);
        alert(`Applied ${fineType} fine of Rs ${fineAmount} to student ${selectedStudentName} (${selectedStudent})`);
        setSelectedStudent('');
        setSelectedStudentName('');
        setFineType('');
        setFineAmount(0);
        setSearchTerm('');
      })
      .catch(error => {
        console.error('Error applying fine:', error);
        alert('Failed to apply fine. Please try again.');
      });
  };

  return (
    <div className="fine-data-container">
      <div className="fine-search">
        <label htmlFor="search">Search Student:</label>
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
            {suggestions.map(student => (
              <li key={student.ID} onClick={() => handleSelectStudent(student)}>
                {`${student.Name} (${student.ID}) - ${student.Section} - ${student.Type}`}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="fine-apply">
        <h2>Apply Fine</h2>
        <div className="fine-type">
          <label>
            <input
              type="radio"
              name="fineType"
              value="Writing wrong name to gain access to University"
              checked={fineType === 'Writing wrong name to gain access to University'}
              onChange={handleFineTypeChange}
            />
            Writing wrong name to gain access to University (1000)
          </label>
          <label>
            <input
              type="radio"
              name="fineType"
              value="Not in modest dressing"
              checked={fineType === 'Not in modest dressing'}
              onChange={handleFineTypeChange}
            />
            Not in modest dressing (500)
          </label>
          <label>
            <input
              type="radio"
              name="fineType"
              value="Round Collar"
              checked={fineType === 'Round Collar'}
              onChange={handleFineTypeChange}
            />
            Round Collar (500)
          </label>
        </div>

        <button className="fine-apply-button" onClick={applyFine}>Apply Fine</button>
      </div>
    </div>
  );
}

export default FineData;
