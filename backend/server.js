const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");

const app = express();
app.use(express.json());

// ตั้งค่า multer สำหรับการจัดการไฟล์
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const db = new sqlite3.Database("./users.db", (err) => {
  if (err) console.error(err.message);
  console.log("Connected to SQLite DB");
});

db.run(`CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    Bio TEXT,
    profile_image TEXT DEFAULT 'https://cdn.marvel.com/content/1x/349red_com_crd_01.png',
    transcript_file BLOB,
    final_project_file BLOB
    )`);

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const encryptedPassword = await bcrypt.hash(password, 10);
  const defaultProfileImage = "https://cdn.marvel.com/content/1x/349red_com_crd_01.png";

  console.log("POST:", username, email ,password);

  db.run(
    `INSERT INTO users (username, email, password, profile_image) VALUES (?, ?, ?, ?)`,
    [username, email, encryptedPassword, defaultProfileImage],
    function (err) {
      if (err) return res.status(400).send({ message: "User already exists" });
      res.send({
        message: "User registered",
        profileImage: defaultProfileImage,
      });
    }
  );
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get(
    `SELECT * FROM users WHERE username = ?`,
    [username],
    async (err, user) => {
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).send({ message: "Invalid" });
      }
      const token = jwt.sign({ userID: user.id }, "secretkey");
      res.send({
        token,
        profileImage: user.profile_image,
      });
    }
  );
});

app.put("/update-name", (req, res) => {
  const { username, newName } = req.body;

  db.run(
    `UPDATE users SET username = ? WHERE username = ?`,
    [newName, username],
    function (err) {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send({ message: "Error updating name" });
      }
      res.send({ message: "Name updated successfully" });
    }
  );
});

app.get("/get-user", (req, res) => {
  const { username } = req.query;

  if (!username) {
    console.error("No username provided");
    return res.status(400).json({ message: "Username is required" });
  }

  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (!user) {
      console.log("User not found:", username);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User data fetched:", user);
    res.json({
      username: user.username,
      email: user.email,
      bio: user.Bio,
      profileImage: user.profile_image,
    });
  });
});

app.put("/update-Bio", (req, res) => {
  const { username, bio } = req.body;

  if (!username || !bio) {
    return res.status(400).send({ message: "Username and bio are required" });
  }

  console.log("Updating bio for user:", username, "with bio:", bio);
  db.run(
    `UPDATE users SET Bio = ? WHERE username = ?`,
    [bio, username],
    function (err) {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send({ message: "Error updating bio" });
      }
      res.send({ message: "Bio updated successfully" });
    }
  );
});

app.put("/update-profile-image", (req, res) => {
  const { username, profileImage } = req.body;

  db.run(
    `UPDATE users SET profile_image = ? WHERE username = ?`,
    [profileImage, username],
    function (err) {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send({ message: "Error updating profile image" });
      }
      res.send({ message: "Profile image updated successfully", profileImage });
    }
  );
});

app.put("/update-password", async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  if (!username || !oldPassword || !newPassword) {
    return res.status(400).send({ message: "All fields are required" });
  }

  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(400).send({ message: "Old password is incorrect" });
    }

    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    db.run(
      `UPDATE users SET password = ? WHERE username = ?`,
      [encryptedPassword, username],
      function (err) {
        if (err) {
          console.error("Error updating password:", err);
          return res.status(500).send({ message: "Error updating password" });
        }
        res.send({ message: "Password updated successfully" });
      }
    );
  });
});

// API สำหรับอัปโหลดไฟล์ transcript และ final project
app.put("/upload-files", upload.fields([{ name: "transcript" }, { name: "final_project" }]), (req, res) => {
  const { username } = req.body;
  const transcriptFile = req.files["transcript"] ? req.files["transcript"][0].buffer : null;
  const finalProjectFile = req.files["final_project"] ? req.files["final_project"][0].buffer : null;

  if (!transcriptFile && !finalProjectFile) {
    return res.status(400).send({ message: "No files uploaded" });
  }

  db.run(
    `UPDATE users SET transcript_file = ?, final_project_file = ? WHERE username = ?`,
    [transcriptFile, finalProjectFile, username],
    function (err) {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send({ message: "Error uploading files" });
      }
      res.send({ message: "Files uploaded successfully" });
    }
  );
});

// API สำหรับดาวน์โหลดไฟล์ transcript และ final project
app.get("/download-file", (req, res) => {
  const { username, fileType } = req.query;

  if (!username || !fileType) {
    return res.status(400).send({ message: "Username and fileType are required" });
  }

  const fileColumn = fileType === "transcript" ? "transcript_file" : "final_project_file";

  db.get(`SELECT ${fileColumn} FROM users WHERE username = ?`, [username], (err, row) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send({ message: "Error fetching file" });
    }
    if (!row || !row[fileColumn]) {
      return res.status(404).send({ message: "File not found" });
    }

    res.setHeader("Content-Type", "application/octet-stream");
    res.send(row[fileColumn]);
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));
