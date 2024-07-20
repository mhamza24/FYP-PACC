const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Khuz@im@123",
  database: "face_detection",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to database.");
});

const getCounterFilePath = (dir) => path.join(dir, "counter.json");

// Function to get the next file number from the counter file
const getNextFileNumber = (dir) => {
  const counterFilePath = getCounterFilePath(dir);
  if (fs.existsSync(counterFilePath)) {
    const counterData = JSON.parse(fs.readFileSync(counterFilePath));
    return counterData.fileNumber + 1;
  } else {
    return 1;
  }
};

// Function to update the counter file with the new file number
const updateFileNumber = (dir, nextNumber) => {
  const counterFilePath = getCounterFilePath(dir);
  fs.writeFileSync(counterFilePath, JSON.stringify({ fileNumber: nextNumber }));
};

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `src/labeled_images/${req.body.name}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const dir = `src/labeled_images/${req.body.name}`;

    const nextNumber = getNextFileNumber(dir);
    updateFileNumber(dir, nextNumber);

    cb(null, `${nextNumber}.jpg`);
  },
});

const upload = multer({ storage: storage });

// Endpoint to fetch person details by name
app.get("/api/getPersonDetails", (req, res) => {
  const { name } = req.query;
  const sql = "SELECT * FROM traindata WHERE Name = ?";

  db.query(sql, [name], (err, result) => {
    if (err) {
      console.error("Error fetching person details:", err);
      res.status(500).send("Internal Server Error");
    } else {
      if (result.length > 0) {
        res.json(result[0]);
      } else {
        res.status(404).send("Person not found");
      }
    }
  });
});

// POST endpoint for detecting faces
app.post("/api/detect", (req, res) => {
  const { name } = req.body;
  const sql = "INSERT INTO detected_faces (name) VALUES (?)";

  db.query(sql, [name], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send(result);
  });
});

// POST endpoint to upload images
app.post("/api/upload", upload.array("images", 12), (req, res) => {
  const { name } = req.body;
  console.log("name: ", name);

  res.send(`Images uploaded successfully for ${name}.`);
});

// Endpoint to handle form submission (uploadTrainData)
app.post("/api/uploadTrainData", upload.array("images", 10), (req, res) => {
  const { name, id, section, type, department } = req.body;

  console.log("Uploaded files:", req.files);

  // Insert data into MySQL
  const sql =
    "INSERT INTO traindata (Name, ID, Section, Type,Department) VALUES (?, ?, ?, ?,?)";
  db.query(sql, [name, id, section, type, department], (err, result) => {
    if (err) {
      console.error("Error inserting data into MySQL:", err);
      res.status(500).send("Error uploading data");
    } else {
      console.log("Data inserted into MySQL:", result);
      res.send("Data uploaded successfully");
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/api/students", (req, res) => {
  const sql = "SELECT * FROM traindata where Type like 'student' ";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching person details:", err);
      res.status(500).send("Internal Server Error");
    } else {
      if (result.length > 0) {
        res.json(result); // Return the entire result array
      } else {
        res.status(404).send("No data found in traindata"); // Return a 404 if no data found
      }
    }
  });
});

app.get("/api/staff", (req, res) => {
  const sql = "SELECT * FROM traindata where Type like 'staff' "; // Replace 'your_table_name' with actual table name
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(result);
  });
});

// Route to handle POST request to apply fine
app.post("/api/fine", (req, res) => {
  const { studentId, studentName, fineType, fineAmount, department } = req.body;

  // Insert into MySQL fine table
  const sql =
    "INSERT INTO fine (student_id, student_name,department, fine_type, fine_amount) VALUES (?, ?,?, ?, ?)";
  db.query(
    sql,
    [studentId, studentName, department, fineType, fineAmount],
    (err, result) => {
      if (err) {
        console.error("Error applying fine:", err);
        res
          .status(500)
          .json({ error: "Failed to apply fine. Please try again." });
        return;
      }
      console.log("Fine applied successfully:", result);
      res.json({ message: "Fine applied successfully" });
    }
  );
});

app.get("/api/getfines", (req, res) => {
  const query = "SELECT * FROM fine order by id desc";
  db.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

app.get("/api/getLabelDirectories", (req, res) => {
  const directoryPath = path.join(__dirname, "src/labeled_images");

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error("Error reading directories:", err);
      res.status(500).send("Internal Server Error");
    } else {
      const directories = files.filter((file) =>
        fs.statSync(path.join(directoryPath, file)).isDirectory()
      );
      console.log(directories);
      res.json(directories);
    }
  });
});

app.post("/api/staff-slips", (req, res) => {
  const { staffId, staffName, department, reason,duration } = req.body;
  const slip = {
    staff_id: staffId,
    staff_name: staffName,
    department,
    reason,
    duration: duration,
  };
  const sql = "INSERT INTO staff_slips SET ?";

  db.query(sql, slip, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json({ message: "Slip added", id: result.insertId });
  });
});
app.get("/api/getstaffslips", (req, res) => {
  const query = "SELECT * FROM staff_slips";
  db.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});