// require("./bot"); // بوت واتساب
// require("./telegram_bot"); // بوت تليجرام
//___________________________________________________________________________________________
const { spawn } = require("child_process");

// تشغيل بوت واتساب
require("./bot");

// تشغيل سكربت تليجرام الشخصي
const telegramProcess = spawn("python", ["telegram_personal.py"], {
  stdio: "inherit",
});
// تشغيل سكربت تليجرام الشخصي 2
const telegramProcess1 = spawn("python", ["telegram_personal_mar2.py"], {
  stdio: "inherit",
});
