import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import "./TrainData.css";

const TrainData = () => {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [section, setSection] = useState("");
  const [type, setType] = useState("");
  const [department, setDepartment] = useState("");
  const [images, setImages] = useState([]);
  const [instruction, setInstruction] = useState("Look into the camera");
  const [capturedImagesCount, setCapturedImagesCount] = useState(0);
  const [errors, setErrors] = useState({});
  const webcamRef = useRef(null);

  const instructions = [
    "Look into the camera",
    "Look right",
    "Look left",
    "Look down",
    "Smile",
  ];

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImages((prevImages) => [...prevImages, imageSrc]);
    setCapturedImagesCount((prevCount) => prevCount + 1);

    if (capturedImagesCount < instructions.length - 1) {
      setInstruction(instructions[capturedImagesCount + 1]);
    } else {
      setInstruction("All images captured. Click submit.");
    }
  }, [webcamRef, capturedImagesCount]);

  const handleSubmit = async () => {
    // Validation
    const newErrors = {};
    if (!name) newErrors.name = "Name is required";
    if (!id) newErrors.id = "ID is required";
    if (!section) newErrors.section = "Section is required";
    if (!department) newErrors.department = "Department is required";
    if (!type) newErrors.type = "Type is required";
    if (images.length === 0)
      newErrors.images = "At least one image is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return; // Stop submission if there are validation errors
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("id", id);
    formData.append("section", section);
    formData.append("type", type);
    formData.append("department", department);

    images.forEach((image, index) => {
      const byteString = atob(image.split(",")[1]);
      const mimeString = image.split(",")[0].split(":")[1].split(";")[0];
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const intArray = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        intArray[i] = byteString.charCodeAt(i);
      }
      const file = new Blob([arrayBuffer], { type: mimeString });

      formData.append("images", file, `${index + 1}.jpg`);
    });

    try {
      await axios.post("http://localhost:5000/api/uploadTrainData", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Data and images uploaded successfully");

      // Reset form
      setName("");
      setId("");
      setSection("");
      setType("");
      setDepartment("");
      setImages([]);
      setCapturedImagesCount(0);
      setInstruction("Look into the camera");
      setErrors({});
    } catch (error) {
      console.error("Error uploading data and images", error);
      alert("Error uploading data and images");
    }
  };

  return (
    <div className="train-data-container">
      <div className="form-container">
        <h1>Train Data Page</h1>
        <form>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className="error">{errors.name}</p>}
          </div>
          <div className="form-group">
            <label>ID:</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
            {errors.id && <p className="error">{errors.id}</p>}
          </div>
          <div className="form-group">
            <label>Section:</label>
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
            />
            {errors.section && <p className="error">{errors.section}</p>}
          </div>
          <div className="form-group">
            <label>Department:</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">Select Department</option>
              <option value="Management Sciences">Management Sciences</option>
              <option value="Humanities & Social Sciences">
                Humanities & Social Sciences
              </option>
              <option value="Mechanical">Mechanical</option>
              <option value="Electrical">Electrical</option>
              <option value="Civil">Civil</option>
              <option value="Computer Science">Computer Science</option>
            </select>
            {errors.department && <p className="error">{errors.department}</p>}
          </div>
          <div className="form-group">
            <label>Type:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="staff"
                  checked={type === "staff"}
                  onChange={(e) => setType(e.target.value)}
                />
                Staff
              </label>
              <label>
                <input
                  type="radio"
                  value="student"
                  checked={type === "student"}
                  onChange={(e) => setType(e.target.value)}
                />
                Student
              </label>
            </div>
            {errors.type && <p className="error">{errors.type}</p>}
          </div>
        </form>
        {capturedImagesCount >= instructions.length && (
          <button
            className="submit-button"
            type="button"
            onClick={handleSubmit}
          >
            Submit
          </button>
        )}
      </div>
      <div className="webcam-container">
        <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
        <p className="instruction-text">{instruction}</p>
        <button className="capture-button" onClick={handleCapture}>
          Capture Photo
        </button>
        <div className="images-container">
          {images.map((image, index) => (
            <img key={index} src={image} alt={`Captured ${index}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainData;
