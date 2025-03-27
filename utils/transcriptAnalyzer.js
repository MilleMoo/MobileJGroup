// 📘 ฟังก์ชันหลัก: ตรวจสอบ Transcript ว่าครบเงื่อนไขจบหรือไม่
function analyzeTranscript(transcript, curriculum) {
  // 🎓 เกรดที่ถือว่าผ่าน
  const PASSING_GRADES = ["A", "B+", "B", "C+", "C", "D+", "D"];

  // ✅ เงื่อนไขหลักสูตร
  const REQUIREMENTS = {
    totalCredits: 124,
    general: 30,
    generalSub: {
      อยู่ดีมีสุข: 3,
      ศาสตร์แห่งผู้ประกอบการ: 3,
      ภาษากับการสื่อสาร: 12,
      ภาษาไทย: 3,
      ภาษาอังกฤษ: 9,
      พลเมืองไทยและพลเมืองโลก: 3,
      สุนทรียศาสตร์: 3,
    },
    major: 88,
    majorSub: {
      แกน: 12,
      เฉพาะบังคับ: 58,
      เฉพาะเลือก: 18,
    },
    freeElective: 6,
  };

  // 🧹 กรองเฉพาะวิชาที่ผ่าน และไม่ซ้ำกัน
  const passedMap = {};
  for (const course of transcript) {
    if (PASSING_GRADES.includes(course.grade) && !passedMap[course.courseId]) {
      passedMap[course.courseId] = course;
    }
  }
  const passed = Object.values(passedMap);

  // 📊 สรุปรวมหน่วยกิตแต่ละหมวด
  const summary = {
    total: 0,
    general: 0,
    generalSub: {
      อยู่ดีมีสุข: 0,
      ศาสตร์แห่งผู้ประกอบการ: 0,
      ภาษากับการสื่อสาร: 0,
      ภาษาไทย: 0,
      ภาษาอังกฤษ: 0,
      พลเมืองไทยและพลเมืองโลก: 0,
      สุนทรียศาสตร์: 0,
    },
    major: 0,
    majorSub: {
      แกน: 0,
      เฉพาะบังคับ: 0,
      เฉพาะเลือก: 0,
    },
  };

  const notFound = []; // ❌ รายวิชาที่ไม่มีใน curriculum
  const passedCourseIds = passed.map(course => course.courseId); // 📌 รหัสวิชาที่ผ่านแล้ว

  for (const course of passed) {
    const info = curriculum.find((c) => c.courseId === course.courseId);
    if (!info) {
      notFound.push(`${course.courseId} - ${course.nameEN || course.nameTH}`);
      continue;
    }

    const credits = info.credits;
    summary.total += credits;

    if (info.category === "วิชาศึกษาทั่วไป") {
      summary.general += credits;
      if (summary.generalSub[info.subCategory] !== undefined) {
        summary.generalSub[info.subCategory] += credits;

        if (info.subCategory === "ภาษากับการสื่อสาร") {
          const lang = info.languageType;
          if (lang === "thai") summary.generalSub["ภาษาไทย"] += credits;
          else if (lang === "english")
            summary.generalSub["ภาษาอังกฤษ"] += credits;
        }
      }
    } else if (info.category === "วิชาเฉพาะ") {
      summary.major += credits;
      if (summary.majorSub[info.subCategory] !== undefined) {
        summary.majorSub[info.subCategory] += credits;
      }
    }
  }

  // ✅ ตรวจสอบเงื่อนไขทั้งหมด
  const metConditions = [];
  const unmetConditions = [];

  const check = (label, actual, required) => {
    if (actual >= required) {
      metConditions.push(`${label} ✔ (${actual}/${required})`);
    } else {
      unmetConditions.push(`${label} ❌ (${actual}/${required})`);
    }
  };

  check("หน่วยกิตรวม", summary.total, REQUIREMENTS.totalCredits);
  check("ศึกษาทั่วไปรวม", summary.general, REQUIREMENTS.general);

  let extraCredits = 0; // 🔄 หน่วยกิตเกินเพื่อใช้ชดเชยเลือกเสรี

  for (const [sub, min] of Object.entries(REQUIREMENTS.generalSub)) {
    const actual = summary.generalSub[sub];
    check(`ศึกษาทั่วไป > ${sub}`, actual, min);
    if (actual > min) extraCredits += actual - min;
  }

  check("วิชาเฉพาะรวม", summary.major, REQUIREMENTS.major);
  for (const [sub, min] of Object.entries(REQUIREMENTS.majorSub)) {
    const actual = summary.majorSub[sub];
    check(`วิชาเฉพาะ > ${sub}`, actual, min);
    if (actual > min) extraCredits += actual - min;
  }

  // ✅ เลือกเสรี จากวิชาที่เกิน
  check("เลือกเสรี", extraCredits, REQUIREMENTS.freeElective);

   // 📌 หาวิชาเฉพาะบังคับที่ยังไม่ได้ลงเรียน
   const missingRequiredCourses = curriculum
   .filter(course => 
     course.category === "วิชาเฉพาะ" && 
     course.subCategory === "เฉพาะบังคับ" && 
     course.required === true &&
     !passedCourseIds.includes(course.courseId))
   .map(course => ({
     courseId: course.courseId,
     nameTH: course.nameTH,
     nameEN: course.nameEN,
     credits: course.credits
   }));

 return {
   canGraduate: unmetConditions.length === 0,
   metConditions,
   unmetConditions,
   passedCourses: passed,
   summary,
   missingCourses: notFound,
   missingRequiredCourses,
 };
}

module.exports = { analyzeTranscript };
