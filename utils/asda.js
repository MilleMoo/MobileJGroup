const fs = require("fs");

// โหลดข้อมูล transcript และ curriculum
const transcript = JSON.parse(fs.readFileSync("transcript-data.json", "utf-8"));
const curriculum = JSON.parse(fs.readFileSync("curriculum.json", "utf-8"));

// สร้าง Set จาก courseId ใน curriculum เพื่อเช็คเร็วขึ้น
const curriculumIds = new Set(curriculum.map((c) => c.courseId));

// ตรวจสอบวิชาใน transcript ว่ามีใน curriculum หรือไม่
const missingCourses = transcript
  .filter((course) => !curriculumIds.has(course.courseId))
  .map(
    (course) =>
      `${course.courseId} - ${course.nameEN || course.nameTH || "ไม่ระบุชื่อ"}`
  );

// แสดงผล
if (missingCourses.length === 0) {
  console.log("✅ ทุกวิชาใน transcript มีอยู่ใน curriculum แล้ว");
} else {
  console.log("❌ วิชาต่อไปนี้ไม่มีใน curriculum:");
  missingCourses.forEach((course) => console.log("- " + course));
}
