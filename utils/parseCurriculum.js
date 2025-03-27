const fs = require("fs");

const raw = fs.readFileSync("curriculum.txt", "utf-8");
const lines = raw.split("\n");

const curriculum = [];

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;

  let match;

  // รูปแบบ: 01418212: ชื่อไทย (ชื่ออังกฤษ) | 3 | หมวด | กลุ่ม | required | thai
  const fullPattern =
    /^(\d{8}):\s*(.+?)\s*\((.+?)\)\s*\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(required|elective)\s*(?:\|\s*(thai|english))?$/i;

  // รูปแบบ: 01418212: ชื่อไทย | 3 | หมวด | กลุ่ม | required | thai
  const shortPattern =
    /^(\d{8}):\s*(.+?)\s*\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(required|elective)\s*(?:\|\s*(thai|english))?$/i;

  // รูปแบบพิเศษ: ชื่อไทย (3 หน่วยกิต) - คณะ... | english | required
  const patternAlt =
/^(\d{8}):\s*(.+?)\s*\((\d+)\s*หน่วยกิต\)\s*-\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(required|elective)$/i;

  if ((match = trimmed.match(fullPattern))) {
    const [
      _,
      courseId,
      nameTH,
      nameEN,
      credits,
      category,
      subCategory,
      requirement,
      languageType,
    ] = match;

    curriculum.push({
      courseId,
      nameTH: nameTH.trim(),
      nameEN: nameEN.trim(),
      credits: parseInt(credits),
      category: category.trim(),
      subCategory: subCategory.trim(),
      required: requirement.toLowerCase() === "required",
      ...(languageType && { languageType: languageType.trim().toLowerCase() }),
    });
  } else if ((match = trimmed.match(shortPattern))) {
    const [
      _,
      courseId,
      nameTH,
      credits,
      category,
      subCategory,
      requirement,
      languageType,
    ] = match;

    curriculum.push({
      courseId,
      nameTH: nameTH.trim(),
      nameEN: "",
      credits: parseInt(credits),
      category: category.trim(),
      subCategory: subCategory.trim(),
      required: requirement.toLowerCase() === "required",
      ...(languageType && { languageType: languageType.trim().toLowerCase() }),
    });
  } else if ((match = trimmed.match(patternAlt))) {
    const [
      _,
      courseId,
      nameTH,
      credits,
      nameEN,
      category,
      subCategory,
      requirement,
    ] = match;

    curriculum.push({
      courseId,
      nameTH: nameTH.trim(),
      nameEN: nameEN.trim(),
      credits: parseInt(credits),
      category: category.trim(),
      subCategory: subCategory.trim(),
      required: requirement.toLowerCase() === "required",
    });
  } else {
    console.log("❌ ไม่ match:", trimmed);
  }
}

fs.writeFileSync(
  "curriculum.json",
  JSON.stringify(curriculum, null, 2),
  "utf-8"
);
console.log(`✅ สร้าง curriculum.json สำเร็จแล้ว (${curriculum.length} วิชา)`);
