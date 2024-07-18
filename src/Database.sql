create database face_detection;
use face_detection;

CREATE TABLE traindata (
    auto_id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255),
    ID VARCHAR(50),
    Section VARCHAR(50),
    Type ENUM('staff','student'),
    department VARCHAR(255)
);

CREATE TABLE staff_slips (
    slip_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id VARCHAR(50),
    staff_name VARCHAR(255),
    department VARCHAR(255),
    reason TEXT,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE fine (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(255) NOT NULL,
 student_name VARCHAR(255) NOT NULL,
 department varchar(255),
  fine_type VARCHAR(255) NOT NULL,
  fine_amount INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from traindata;