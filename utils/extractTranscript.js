// utils/extractTranscript.js

function extractTranscript(lines) {
  const transcript = [];
  const regex =
    /^\s*(\d{8})\s*([A-Za-z0-9\s\-',:()&\/]+?)\s*([A-D][+]?|F|W|U|N)\s*\(?([0-9])?\)?$/;

  for (const line of lines) {
    const cleaned = line.replace(/[^\x00-\x7F]/g, "").trim();
    const match = cleaned.match(regex);

    if (match) {
      const courseId = match[1];
      const nameEN = match[2].trim();
      const grade = match[3].trim();
      const credit = parseInt(match[4] || 3);

      transcript.push({
        courseId,
        nameEN,
        grade,
        credits: credit,
      });
    } else {
      console.log("❌ ไม่ match:", line);
    }
  }

  return transcript;
}

module.exports = { extractTranscript };
