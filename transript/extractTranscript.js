const fs = require("fs");
const pdfParse = require("pdf-parse");

// โหลดไฟล์ PDF
const buffer = fs.readFileSync("./Sl2.pdf");

pdfParse(buffer).then((data) => {
  const rawText = data.text;
  const lines = rawText.split("\n");

  const transcript = [];

  // ปรับ regex ให้ยืดหยุ่นขึ้น
  const regex =
    /^(\d{8})\s*([A-Za-z0-9\s\-',:()&\/]+?)\s*([A-D][+]?|F|W|U|N)\s*\(?(\d)?\)?$/;

  for (const line of lines) {
    const cleaned = line.replace(/[^\x00-\x7F]/g, "").trim(); // 💡 ลบตัวอักษรพิเศษ (เช่น ฺ)

    const match = cleaned.match(regex);

    if (match) {
      const courseId = match[1];
      const nameEN = match[2].trim();
      const grade = match[3].trim();
      const credit = parseInt(match[4] || 3); // ถ้าไม่มีระบุ ให้ใช้ default = 3

      transcript.push({
        courseId,
        nameEN,
        grade,
        credits: credit,
      });
    } else {
      console.log("❌ ไม่ match:", line); // 💡 ใช้บรรทัดดิบ (ไม่ใช่ cleaned) เพื่อ debug ได้แม่นยำ
    }
  }

  // ✅ แสดงผล + บันทึก
  console.log("\n✅ วิชาที่ดึงได้:");
  console.table(transcript);

  fs.writeFileSync("transcript-data2.json", JSON.stringify(transcript, null, 2));
  console.log("\n📁 บันทึก transcript-data.json เรียบร้อยแล้ว!");
});
