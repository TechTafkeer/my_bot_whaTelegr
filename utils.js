const fs = require("fs");
const path = require("path");

function حفظ_رابط_في_ملف(الرابط, النص, المصدر, التاريخ) {
  const الملف = path.join(__dirname, "stor", "whatsapp_links.txt");
  const موجود = fs.existsSync(الملف) ? fs.readFileSync(الملف, "utf-8") : "";

  if (!موجود.includes(الرابط)) {
    const سطر = `📅 ${التاريخ}\n🔗 ${الرابط}\n📝 ${النص}\n👥 ${المصدر}\n\n`;
    fs.appendFileSync(الملف, سطر, "utf-8");
  }
}

function حفظ_رقم_في_ملف(رقم) {
  const الملف = path.join(__dirname, "stor", "number.txt");
  const موجود = fs.existsSync(الملف) ? fs.readFileSync(الملف, "utf-8") : "";

  if (!موجود.includes(رقم)) {
    fs.appendFileSync(الملف, رقم + "\n", "utf-8");
  }
}

module.exports = { حفظ_رابط_في_ملف, حفظ_رقم_في_ملف };
//___________________________________________________________________________________________
