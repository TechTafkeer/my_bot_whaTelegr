require("dotenv").config();
const { حفظ_رابط_في_ملف, حفظ_رقم_في_ملف } = require("./utils");

const { create } = require("@open-wa/wa-automate"); // استيراد create من wa-automate
const db = require("./db"); // استيراد وظائف قاعدة البيانات
const fs = require("fs"); // استيراد نظام الملفات

const num = process.env.num;
console.log(" WhatsApp control number from env:", num);

let البوت_مفعل = true;

const كلمات_محظورة = fs
  .readFileSync("./stor/banned.txt", "utf-8")

  .split("\n")
  .map((w) => w.trim().toLowerCase())
  .filter(Boolean);

// const محتاجين = fs
//   .readFileSync("./stor/help_keywords2.txt", "utf-8")

//   .split("\n")
//   .map((w) => w.trim().toLowerCase())
//   .filter(Boolean);

const كلمات_مساعدة = fs
  .readFileSync("./stor/help_keywords.txt", "utf-8")

  .split("\n")
  .map((w) => w.trim().toLowerCase())
  .filter(Boolean);

const كلمات_معلنين = fs
  .readFileSync("./stor/advertisers_keywords.txt", "utf-8")
  .split("\n")
  .map((w) => w.trim().toLowerCase())
  .filter(Boolean);

create({
  sessionId: "new_num",
  useChrome: true,
  headless: true, //عند استخراج الاعضاء من القروبات نجعله false
  timeout: 60000, //دقائق 1
  authTimeout: 300, //دقائق 5
  qrTimeout: 180000, //دقائق 3
}).then((client) => {
  client.onMessage(async (message) => {
    if (!message.sender || !message.sender.id) return;

    const النص = message.body?.toLowerCase();
    const المرسل = message.sender.id;

    db.logMessage(المرسل, النص);
    // ✅ تخزين الروابط تلقائيًا في whatsapp_links.txt
    const الرابط = النص?.match(/https:\/\/chat\.whatsapp\.com\/\S+/)?.[0];

    if (الرابط) {
      const المصدر = message.chat?.name || message.chatId;
      const التاريخ = message.timestamp
        ? new Date(message.timestamp * 1000).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
      حفظ_رابط_في_ملف(الرابط, النص, المصدر, التاريخ);
    }

    // ✅ [تعديل 1] جمع أرقام أعضاء القروبات من الرسائل
    if (message.isGroupMsg) {
      const رقم_المرسل = message.sender.id;
      حفظ_رقم_في_ملف(رقم_المرسل);
    }
    // فلترة كلمات المعلنين وطردهم
    // for (const كلمة of كلمات_معلنين) {
    //   if (message.isGroupMsg && النص.includes(كلمة)) {
    //     try {
    //       // ✅ حذف الرسالة
    //       await client.deleteMessage(message.chatId, message.id);

    //       // ✅ طرد المعلن
    //       const رقم_المرسل = message.sender.id;
    //       await client.removeParticipant(message.chatId, رقم_المرسل);
    //       fs.appendFileSync(
    //         "./stor/kicked.txt",
    //         `${رقم_المرسل} - ${message.chat?.name || message.chatId}\n`
    //       );
    //       console.log(`🚫 تم حذف وطرد المعلن: ${رقم_المرسل}`);
    //     } catch (err) {
    //       console.log(`⚠️ فشل في حذف أو طرد المعلن: ${message.sender.id}`);
    //     }

    //     return; // ⛔ أوقف المعالجة فورًا
    //   }
    // }

    // التحقق من رسائل طلب المساعدة داخل القروبات
    // ✅ الكلمات التي ترسل إلى البوت الثاني
    // for (const كلمة of محتاجين) {
    //   if (message.isGroupMsg && النص.includes(كلمة)) {
    //     const اسم_القروب = message.chat?.name || message.chatId;
    //     const رقم_المرسل = message.sender.id.replace("@c.us", "");
    //     const رابط_المرسل = `https://wa.me/${رقم_المرسل}`;
    //     const محتوى = message.body;

    //     const رقم_البوت_الثاني = process.env.bot2; // غيّره حسب رقم البوت الثاني
    //     const رسالة_للبوت_الثاني = `👤 ${رابط_المرسل}\n📱 ${رقم_المرسل}\n👥 ${اسم_القروب}\n📝 ${محتوى}`;

    //     await client.sendText(رقم_البوت_الثاني, رسالة_للبوت_الثاني);
    //     return;
    //   }
    // }
    // ✅ الكلمات التي ترسل إلى المتحكم
    for (const كلمة of كلمات_مساعدة) {
      if (message.isGroupMsg && النص.includes(كلمة)) {
        const اسم_القروب = message.chat?.name || message.chatId;

        const رقم_المرسل = message.sender.id.replace("@c.us", "");
        const رابط_المرسل = `https://wa.me/${رقم_المرسل}`;

        const محتوى = message.body;

        await client.sendText(
          num,
          `📌 طلب مساعدة جديد:\n\n👤 [اضغط هنا للتواصل مع المرسل](${رابط_المرسل})\n📱 الرقم: ${رقم_المرسل}\n👥 القروب: ${اسم_القروب}\n📝 الرسالة:\n${محتوى}`
        );

        return;
      }
    }

    // أوامر التحكم من رقمك فقط
    if (المرسل === num && (message.isGroupMsg ? النص === "_" : true)) {
      if (النص === "تعليمات") {
        const الرد = `
      📘 قائمة التعليمات المتاحة:

      🔹 commander: تشغيل — تفعيل البوت
      🔹 commander: ايقاف — إيقاف البوت مؤقتًا
      🔹 comm: حالة — معرفة حالة البوت الحالية

      🔹 comm: url — عرض روابط واتساب من قاعدة البيانات (مثال: url 30)
      🔹 comm: url all — عرض كل الروابط المخزنة في ملف whatsapp_links.txt
      
      🔹 comm: urldir اختيار [أرقام القروبات] — استخراج روابط من قروبات محددة (مثال: urldir  1 3 5)

      🔹 comm: sendto [رسالة] — إرسال رسالة خاصة لكل رقم في number.txt
      🔹 comm: طرد — طرد الأرقام المحظورة من القروب (إذا أُرسل من داخل القروب)

      🔹 comm: _ — استخراج أعضاء القروب الحالي (يُستخدم فقط داخل القروبات)

      🔹 comm: تعليمات — عرض هذه القائمة
      🔹 comm: طردk يقوم بطرد الاشخاص الموجودون في ملف k.txt   
      🔹 comm: قائمة القروبات — عرض قائمة القروبات التي يتواجد فيها البوت
      📁 comm: كل الملفات تُخزن داخل مجلد stor
      📞 comm: كل الأوامر تُرسل من المحادثة الخاصة فقط، ماعدا أمر "_"
      `;

        await client.sendText(num, الرد);
        return;
      }
      if (النص === "قائمة القروبات") {
        const كل_المحادثات = await client.getAllChats();
        if (!كل_المحادثات || typeof كل_المحادثات !== "object") {
          console.log("❌ getAllChats رجعت قيمة غير صالحة:", كل_المحادثات);
          await client.sendText(
            num,
            "⚠️ فشل في جلب المحادثات. قد يكون العدد كبير جدًا أو الاتصال ضعيف."
          );
          return;
        }
        const القروبات = Array.isArray(كل_المحادثات)
          ? كل_المحادثات.filter((c) => c.isGroup)
          : Object.values(كل_المحادثات).filter((c) => c.isGroup);

        let الرد = "📋 قائمة القروبات:\n\n";
        القروبات.forEach((قروب, index) => {
          الرد += `${index + 1}. ${قروب.name || قروب.id}\n`;
        });

        await client.sendText(num, الرد);
        return;
      }

      if (النص === "ايقاف") {
        البوت_مفعل = false;
        await client.sendText(message.from, "🛑 تم إيقاف البوت مؤقتًا");
        return;
      }

      if (النص === "تشغيل") {
        البوت_مفعل = true;
        await client.sendText(message.from, "✅ تم تشغيل البوت");
        return;
      }

      if (النص === "حالة") {
        await client.sendText(
          message.from,
          البوت_مفعل ? "✅ البوت مفعل" : "🛑 البوت غير مفعل"
        );
        return;
      }
      if (النص === "_") {
        if (!message.isGroupMsg) {
          await client.sendText(num, "❌ هذا الأمر يعمل فقط داخل القروبات.");
          return;
        }

        try {
          const الأعضاء = await client.getGroupMembers(message.chatId);
          const قائمة_الأرقام = الأعضاء.map((عضو) => عضو.id).join("\n");

          // اسم القروب أو معرفه
          const اسم_القروب =
            message.chat?.name?.replace(/[^\w\d]/g, "_") || message.chatId;
          const اسم_الملف = `./stor/members_${اسم_القروب}.txt`;
          fs.writeFileSync(اسم_الملف, قائمة_الأرقام, "utf-8");

          await client.sendText(
            num,
            `✅ تم استخراج ${الأعضاء.length} عضو من القروب: ${
              message.chat?.name || message.chatId
            }\n📁 تم حفظهم في الملف: ${اسم_الملف}`
          );
        } catch (err) {
          await client.sendText(
            num,
            `⚠️ فشل استخراج الأعضاء من القروب: ${
              message.chat?.name || message.chatId
            }\n📌 تأكد أن البوت مشرف فيه.`
          );
        }

        return;
      }
      if (النص === "حظرk") {
        try {
          const الأرقام = fs
            .readFileSync("./stor/k.txt", "utf-8")
            .split("\n")
            .map((رقم) => رقم.trim())
            .filter((رقم) => رقم.endsWith("@c.us"));

          let عدد_الناجحين = 0;
          for (const رقم of الأرقام) {
            try {
              await client.blockContact(رقم);
              عدد_الناجحين++;
            } catch (err) {
              console.log(`❌ فشل حظر ${رقم}`);
            }
          }

          await client.sendText(
            message.from,
            `✅ تم حظر ${عدد_الناجحين} رقم من القائمة في k.txt`
          );
        } catch (err) {
          await client.sendText(message.from, "❌ فشل قراءة ملف k.txt");
        }

        return;
      }

      // ✅ [تعديل 2] إرسال رسالة خاصة لكل رقم في number.txt
      if (النص.startsWith("sendto ")) {
        const الرسالة = النص.replace("sendto ", "").trim();
        const الأرقام = fs
          .readFileSync("./stor/number.txt", "utf-8")

          .split("\n")
          .filter(Boolean);
        for (const رقم of الأرقام) {
          try {
            await client.sendText(رقم, الرسالة);
          } catch (err) {
            console.log(`فشل الإرسال إلى ${رقم}`);
          }
        }
        await client.sendText(
          message.from,
          `✅ تم إرسال الرسالة إلى ${الأرقام.length} رقم`
        );
        return;
      }
      if (النص === "url all") {
        const روابط = fs
          .readFileSync("./stor/whatsapp_links.txt", "utf-8")

          .split("\n\n")
          .filter(Boolean);
        for (const سطر of روابط) {
          await client.sendText(num, سطر);
        }
        return;
      }

      if (النص.startsWith("url")) {
        const أجزاء = النص.split(" ");
        const أرقام = أجزاء
          .slice(2)
          .map((n) => parseInt(n))
          .filter((n) => !isNaN(n));

        const كل_المحادثات = await client.getAllChats();
        if (!كل_المحادثات || typeof كل_المحادثات !== "object") {
          await client.sendText(
            num,
            "⚠️ فشل في جلب المحادثات. تأكد من اتصال البوت."
          );
          return;
        }
        const القروبات = Array.isArray(كل_المحادثات)
          ? كل_المحادثات.filter((c) => c.isGroup)
          : Object.values(كل_المحادثات).filter((c) => c.isGroup);

        const القروبات_المحددة = أرقام
          .map((i) => القروبات[i - 1])
          .filter(Boolean);

        const تاريخ_اليوم = new Date().toISOString().split("T")[0];
        let محتوى_الملف = `📅 عملية استخراج بتاريخ: ${تاريخ_اليوم}\n=============================\n\n`;

        for (const محادثة of القروبات_المحددة) {
          try {
            const الرسائل = await client.loadEarlierMessages(محادثة.id);
            for (const msg of الرسائل) {
              const محتوى_الرسالة = msg.body;
              const الرابط = محتوى_الرسالة?.match(
                /https:\/\/chat\.whatsapp\.com\/\S+/
              )?.[0];
              if (الرابط) {
                const المصدر = محادثة.name || محادثة.id;
                const التاريخ = msg.timestamp
                  ? new Date(msg.timestamp * 1000).toISOString().split("T")[0]
                  : "غير معروف";

                const سطر = `📅 ${التاريخ}\n🔗 ${الرابط}\n👥 ${المصدر}\n\n`;
                محتوى_الملف += سطر;

                حفظ_رابط_في_ملف(الرابط, محتوى_الرسالة, المصدر, التاريخ);
              }
            }
          } catch (err) {
            console.log(`⚠️ فشل قراءة المحادثة: ${محادثة.id}`);
          }
        }

        fs.appendFileSync(
          "./stor/whatsapp_links_urldir.txt",
          محتوى_الملف,
          "utf-8"
        );

        await client.sendText(
          num,
          `✅ تم استخراج الروابط من ${القروبات_المحددة.length} قروب حسب اختيارك`
        );
        return;
      }

      // أمر url من قاعدة البيانات
      if (النص.startsWith("url")) {
        const أجزاء = النص.split(" ");
        const مدخل = أجزاء[1]?.trim();
        let عدد_الأيام = null;

        if (مدخل === "30") عدد_الأيام = 30;
        else if (مدخل === "60") عدد_الأيام = 60;
        else if (مدخل === "90") عدد_الأيام = 90;
        else if (مدخل && !["30", "60", "90"].includes(مدخل)) {
          await client.sendText(
            message.from,
            "⚠️ استخدم فقط: url أو url 30 أو url 60 أو url 90"
          );
          return;
        }

        const روابط = await db.getWhatsLinks(عدد_الأيام);
        if (روابط.length === 0) {
          await client.sendText(
            message.from,
            "📭 لا توجد روابط واتساب مسجلة في الفترة المحددة."
          );
          return;
        }

        let محتوى_الملف = "";

        for (const row of روابط) {
          const النص = row.message;
          const المصدر = row.group_name || "محادثة خاصة";
          const التاريخ = row.timestamp?.split("T")[0] || "غير معروف";
          const الرابط = النص?.match(/https:\/\/chat\.whatsapp\.com\/\S+/)?.[0];

          if (الرابط) {
            const سطر = `📅 التاريخ: ${التاريخ}\n🔗 الرابط: ${الرابط}\n📝 النص: ${نص}\n👥 المصدر: ${المصدر}\n\n`;
            await client.sendText(num, سطر);
            محتوى_الملف += سطر;
          }
        }

        fs.writeFileSync("./stor/whatsapp_links.txt", محتوى_الملف, "utf-8");

        return;
      }

      // أمر طرد الأرقام المحظورة من القروب
      if (النص === "طرد" && message.isGroupMsg) {
        for (const رقم of كلمات_محظورة) {
          if (رقم.endsWith("@c.us")) {
            try {
              await client.removeParticipant(message.chatId, رقم);
            } catch (err) {
              // فشل الطرد
            }
          }
        }
        return;
      }
    }

    // فلترة الكلمات المحظورة
    for (const كلمة of كلمات_محظورة) {
      if (!كلمة.endsWith("@c.us") && النص?.includes(كلمة)) {
        if (message.isGroupMsg) {
          await client.deleteMessage(message.chatId, message.id);
        }
        return;
      }
    }

    if (!البوت_مفعل) return;

    // الرد التلقائي من قاعدة البيانات
    const رد = await db.getReply(النص);
    if (رد) {
      await client.sendText(message.from, رد);
      return;
    }

    if (النص === "ezzi") {
      await client.sendText(message.from, "أهلًا بك   👋");
    }
  });
});
