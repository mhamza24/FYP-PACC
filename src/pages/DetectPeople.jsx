import { useRef, useEffect, useState } from 'react';
import '../../src/App.css';
import * as faceapi from 'face-api.js';
import axios from 'axios';

function DetectPeople({ setActivePage }) {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [detectedName, setDetectedName] = useState('');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [data, setData] = useState({
    Name: 'unknown',
    ID: 'unknown',
    Section: 'unknown'
  });
  const [error, setError] = useState(null);
  const [showData, setShowData] = useState(false);
  const [unknownTimer, setUnknownTimer] = useState(null);
  const [alertShown, setAlertShown] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    loadModels();
    startVideo();

    return () => {
      clearCanvas();
      window.removeEventListener('resize', handleResize);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  useEffect(() => {
    if (modelsLoaded && videoLoaded) {
      initializeCanvas();
      faceMyDetect();
    }
  }, [modelsLoaded, videoLoaded]);

  const startVideo = () => {
    if (videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setVideoLoaded(true);
          };
        })
        .catch((error) => {
          setError(`Error accessing webcam: ${error.message}`);
        });
    }
    window.addEventListener('resize', handleResize);
  };

  const loadModels = () => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
    ])
      .then(() => {
        setModelsLoaded(true);
      })
      .catch((err) => {
        setError(`Error loading models: ${err.message}`);
      });
  };

  const initializeCanvas = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);
    }
  };

  const faceMyDetect = async () => {
    const labeledDescriptors = await loadLabeledImages().catch((err) => {
      setError(`Error loading labeled images: ${err.message}`);
    });

    if (!labeledDescriptors) return;

    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.45);

    const detectInterval = setInterval(async () => {
      const videoElement = videoRef.current;
      if (!videoElement || !modelsLoaded || !videoLoaded) {
        return;
      }

      const detections = await faceapi.detectAllFaces(videoElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.2 }))
        .withFaceLandmarks()
        .withFaceDescriptors();
      const displaySize = { width: videoElement.videoWidth, height: videoElement.videoHeight };
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);

      const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));

      if (results.length > 0) {
        const name = results[0].toString();
        setDetectedName(name);
        handleUnknownName(name);
      }

      results.forEach((result, i) => {
        const name = result.toString();
        const box = resizedDetections[i].detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, { label: name });
        drawBox.draw(canvas);
      });
    }, 100);

    videoRef.current.addEventListener('pause', () => {
      clearInterval(detectInterval);
    });

    return () => {
      clearInterval(detectInterval);
    };
  };

  const handleUnknownName = (name) => {
    if (name.includes('unknown')) {
      if (!unknownTimer) {
        const timer = setTimeout(() => {
          captureImage();
          setAlertShown(true);
        }, 5000);
        setUnknownTimer(timer);
      }
    } else {
      clearTimeout(unknownTimer);
      setUnknownTimer(null);
    }
  };

  const fetchLabeledImages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/getLabelDirectories'); // Adjust URL/port as needed
      return response.data;
    } catch (error) {
      console.error('Error fetching labeled images:', error);
    }
  };

  const loadLabeledImages = async () => {
    const fetchedLabels = await fetchLabeledImages();
    try {
      const labeledDescriptors = await Promise.all(
        fetchedLabels.map(async (label) => {
          const descriptions = [];
          for (let i = 1; i <= 3; i++) {
            const imagePath = `server/src/labeled_images/${label}/${i}.jpg`;
            try {
              const img = await faceapi.fetchImage(imagePath);
              const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
              if (detections) {
                descriptions.push(detections.descriptor);
              }
            } catch (error) {
              console.error(`Error processing ${imagePath}: ${error.message}`);
            }
          }
          if (descriptions.length > 0) {
            return new faceapi.LabeledFaceDescriptors(label, descriptions);
          } else {
            return null;
          }
        })
      );
      return labeledDescriptors.filter(descriptor => descriptor !== null);
    } catch (error) {
      console.error(`Error loading labeled images: ${error.message}`);
      throw error;
    }
  };

  const handleDetection = async () => {
    if (!detectedName) return;
    const cleanedName = detectedName.replace(/[^a-zA-Z ]/g, '');
    const fullName = cleanedName.split(' ').slice(0, 2).join(' ');

    videoRef.current.pause();
    setShowData(true);
    try {
      const response = await axios.get('http://localhost:5000/api/getPersonDetails', {
        params: {
          name: fullName
        }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching person details:', error);
      setError('Error fetching person details');
    }
  };

  const handleResize = () => {
    initializeCanvas();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleFine = () => {
    setActivePage('FineData');
  };

  const handleSlip = () => {
    setActivePage('Staff');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCapturedImage(canvas.toDataURL('image/png'));
  };

  if (alertShown) {
    return (
      <div className="alert">
        <h2 className="alertText">Unknown Person Detected</h2>
        {capturedImage && <img src={capturedImage} alt="Captured Unknown Person" />}
        <br></br>
        <button className ="alertButton"onClick={handleRefresh}>Refresh</button>
      </div>
    );
  }

  return (
    <div className='detect_container'>
      {showData && (
        <div className='card'>
          <h2>Person Detected</h2>
          <div className='image-container'>
            <img src={`server/src/labeled_images/${data.Name}/1.jpg`} alt="Person" className='image' />
          </div>
          <div className='field'>
            <span className='label'>Name :</span> {data.Name}
          </div>
          <div className='field'>
            <span className='label'>Student ID :</span> {data.ID}
          </div>
          <div className='field'>
            <span className='label'>Department :</span> {data.department}
          </div>
          <div className='field'>
            <span className='label'>Section :</span> {data.Section}
          </div>
          {data.Type === "student" ? (
            <button onClick={handleFine} className='fine-btn'>Fine</button>
          ) : (
            <button onClick={handleSlip} className='fine-btn'>Generate Slip</button>
          )}
        </div>
      )}
      <div className="myapp">
        <h1 className='detect_h1'>Your Face is being detected</h1>
        {error && <p>Error: {error}</p>}
        <div className="appvideo">
          <video ref={videoRef} autoPlay muted width="940" height="650"></video>
          <canvas ref={canvasRef} className="appcanvas" />
        </div>
        <button className='confirmDetectBtn' onClick={handleDetection} disabled={!detectedName}>Confirm Detection</button>
      </div>
    </div>
  );
}

export default DetectPeople;
