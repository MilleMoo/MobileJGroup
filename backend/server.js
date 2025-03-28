const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const cors = require("cors");
const { extractTranscript } = require("../frontend/groupProject/src/utils/extractTranscript");

const app = express();
app.use(express.json());
app.use(cors());

const upload = multer({ dest: "uploads/" });

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
  transcript_json TEXT,
  curriculum_version TEXT DEFAULT '2565'
)`);

// ====================== USER AUTH & PROFILE ======================

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const encryptedPassword = await bcrypt.hash(password, 10);
  const defaultProfileImage =
    "https://cdn.marvel.com/content/1x/349red_com_crd_01.png";

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
      res.send({ token, profileImage: user.profile_image });
    }
  );
});

app.put("/update-name", (req, res) => {
  const { username, newName } = req.body;
  db.run(
    `UPDATE users SET username = ? WHERE username = ?`,
    [newName, username],
    function (err) {
      if (err) return res.status(500).send({ message: "Error updating name" });
      res.send({ message: "Name updated successfully" });
    }
  );
});

app.get("/get-user", (req, res) => {
  const { username } = req.query;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (!user) return res.status(404).json({ message: "User not found" });
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
  db.run(
    `UPDATE users SET Bio = ? WHERE username = ?`,
    [bio, username],
    function (err) {
      if (err) return res.status(500).send({ message: "Error updating bio" });
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
      if (err)
        return res
          .status(500)
          .send({ message: "Error updating profile image" });
      res.send({ message: "Profile image updated successfully", profileImage });
    }
  );
});

app.put("/update-password", async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  db.get(
    `SELECT * FROM users WHERE username = ?`,
    [username],
    async (err, user) => {
      if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
        return res.status(400).send({ message: "Old password is incorrect" });
      }
      const encryptedPassword = await bcrypt.hash(newPassword, 10);
      db.run(
        `UPDATE users SET password = ? WHERE username = ?`,
        [encryptedPassword, username],
        function (err) {
          if (err)
            return res.status(500).send({ message: "Error updating password" });
          res.send({ message: "Password updated successfully" });
        }
      );
    }
  );
});

// ====================== FILE UPLOAD & PDF PARSE ======================

app.post("/upload-transcript", upload.single("file"), async (req, res) => {
  try {
    const username = req.body.username;
    if (!username || !req.file) {
      return res
        .status(400)
        .send({ message: "Username and file are required" });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const lines = pdfData.text.split("\n");
    const transcriptData = extractTranscript(lines);
    const transcriptJson = JSON.stringify(transcriptData);

    fs.unlinkSync(req.file.path); // ลบไฟล์ชั่วคราว

    db.run(
      `UPDATE users SET transcript_json = ? WHERE username = ?`,
      [transcriptJson, username],
      function (err) {
        if (err) {
          console.error("❌ บันทึกไม่สำเร็จ:", err);
          return res.status(500).send({ message: "Database update failed" });
        }
        res.json({
          message: "Transcript saved",
          data: transcriptData,
          canGraduate: true, // คุณสามารถเพิ่ม logic เช็กจบได้ตรงนี้
        });
      }
    );
  } catch (error) {
    console.error("❌ Error extracting transcript:", error);
    res.status(500).send("Error extracting transcript");
  }
});

app.get("/transcript-json", (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  db.get(
    `SELECT transcript_json FROM users WHERE username = ?`,
    [username],
    (err, row) => {
      if (err) {
        console.error(" Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (!row || !row.transcript_json) {
        return res.status(404).json({ message: "Transcript data not found" });
      }

      res.json({ transcript: JSON.parse(row.transcript_json) });
    }
  );
});

app.listen(5000, () => console.log("✅ Server running on port 5000"));
