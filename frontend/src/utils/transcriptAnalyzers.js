const fs = require("fs");
const { analyzeTranscript } = require("./transcriptAnalyzer");

// โหลดข้อมูล
const curriculum = JSON.parse(fs.readFileSync("curriculum.json", "utf-8"));
const transcript = JSON.parse(fs.readFileSync("transcript-data2.json", "utf-8"));

// เรียกใช้งานฟังก์ชัน
const result = analyzeTranscript(transcript, curriculum);

// แสดงผล
console.log("🎓 สรุปผลการวิเคราะห์ Transcript");
console.log(
  "📘 สถานะ:",
  result.canGraduate ? "✅ เรียนจบได้" : "❌ ยังเรียนไม่ครบ"
);
console.log("🎯 หน่วยกิตรวม:", result.summary.total);
console.log("✅ เงื่อนไขที่ผ่านแล้ว:");
result.metConditions.forEach((item) => console.log("  -", item));
console.log("❗ เงื่อนไขที่ยังไม่ผ่าน:");
result.unmetConditions.forEach((item) => console.log("  -", item));
console.log(
  "📦 วิชาที่ผ่านทั้งหมด:",
  result.passedCourses.map((c) => c.courseId).join(", ")
);
console.log("🔎 วิชาที่ไม่พบใน curriculum:");
result.missingCourses.forEach((item) => console.log("  -", item));
