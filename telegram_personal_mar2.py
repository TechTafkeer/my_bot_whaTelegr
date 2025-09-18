
from telethon.sync import TelegramClient, events
from telethon.sessions import StringSession
import re
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

api_id = int(os.getenv("TG_API_ID1")) #
api_hash = os.getenv("TG_API_HASH1")
session = os.getenv("TG_SESSION1")

رقم_قروب_الروابط = int(os.getenv("TG_LINKS_GROUP1")) # قروباتيezzi
رقم_المتحكم = int(os.getenv("TG_CONTROL_GROUP1")) # حسابك الشخصي


  

# تحميل كلمات المساعدة من الملف
with open("stor/help_keywords.txt", "r", encoding="utf-8") as f:
    كلمات_المساعدة = [line.strip() for line in f if line.strip()]

client = TelegramClient(StringSession(session), api_id, api_hash)

@client.on(events.NewMessage)
async def handler(event):
    if event.chat_id in [-4956929780, -4871272362]:
        return  # تجاهل الرسائل من القروبين المستثناة
    if event.is_private:
        return  # تجاهل الرسائل من المحادثات الخاصة

    text = event.message.message

    # التحقق من وجود رابط واتساب
    match = re.search(r'https://chat\.whatsapp\.com/\S+', text)
    if match:
        link = match.group(0)
        try:
            with open("stor/whatsapp_links.txt", "r", encoding="utf-8") as f:
                المحتوى = f.read()
            if link in المحتوى:
                return
        except FileNotFoundError:
            pass

        source = event.chat.title if hasattr(event.chat, 'title') else str(event.chat_id)
        date = datetime.now().strftime('%Y-%m-%d')
        with open("stor/whatsapp_links.txt", "a", encoding="utf-8") as f:
            f.write(f"{link}\nالمصدر: Telegram - {source}\nالتاريخ: {date}\n\n")

    # التحقق من روابط قروبات تليجرام
    match_group = re.search(r'https://t\.me/(joinchat/\S+|\+\S+)', text)
    if match_group:
        tg_link = match_group.group(0)
        try:
            with open("stor/telegram_groups.txt", "r", encoding="utf-8") as f:
                if tg_link in f.read():
                    return
        except FileNotFoundError:
            pass

        group_name = event.chat.title if hasattr(event.chat, 'title') else str(event.chat_id)
        date = datetime.now().strftime('%Y-%m-%d')
        with open("stor/telegram_groups.txt", "a", encoding="utf-8") as f:
            f.write(f"{tg_link}\nالمصدر: {group_name}\nالتاريخ: {date}\n\n")

        await client.send_message(رقم_قروب_الروابط, f"📎 رابط قروب جديد:\n{tg_link}\nمن: {group_name}")
    #______________________________________________________________________
    match_username = re.findall(r'@[\w\d_]{5,}', text)
    for username in match_username:
        tg_link = f"https://t.me/{username[1:]}"  # نحذف @ ونبني الرابط

        try:
            with open("stor/telegram_groups.txt", "r", encoding="utf-8") as f:
                if tg_link in f.read():
                    continue
        except FileNotFoundError:
            pass

        group_name = event.chat.title if hasattr(event.chat, 'title') else str(event.chat_id)
        date = datetime.now().strftime('%Y-%m-%d')
        with open("stor/telegram_groups.txt", "a", encoding="utf-8") as f:
            f.write(f"{tg_link}\nالمصدر: {group_name}\nالتاريخ: {date}\n\n")

        await client.send_message(رقم_قروب_الروابط, f"📎 رابط قروب/قناة:\n{tg_link}\nمن: {group_name}")

    #_____________________________________________________________________
    # التحقق من كلمات المساعدة
    for كلمة in كلمات_المساعدة:
        if كلمة in text:
            sender = await event.get_sender()
            اسم_المرسل = sender.first_name or "مجهول"
            if sender.username:
                رابط_المرسل = f"https://t.me/{sender.username}"
            else:
                رابط_المرسل = f"tg://user?id={sender.id}"
           # اسم_القروب = event.chat.title if hasattr(event.chat, 'title') else str(event.chat_id)
            اسم_القروب = event.chat.title if hasattr(event.chat, 'title') else str(event.chat_id)

            # if hasattr(event.chat, 'username') and event.chat.username:
            #     رابط_القروب = f"https://t.me/{event.chat.username}"
            # else:
            #     رابط_القروب = f"tg://resolve?domain=group&id={event.chat_id}"
            رابط_القروب = None
            if hasattr(event.chat, 'username') and event.chat.username:
                رابط_القروب = f"https://t.me/{event.chat.username}"
            elif "https://t.me/+" in text or "https://t.me/joinchat/" in text:
                match = re.search(r'https://t\.me/(joinchat/\S+|\+\S+)', text)
                if match:
                    رابط_القروب = match.group(0)

            الرسالة = (
                f"🆘 طلب\n"
                f"👤 [اضغط هنا للتواصل مع المرسل]({رابط_المرسل})\n اسم المرسل:[{اسم_المرسل}]\n"
                f"👥 القروب: [{اسم_القروب}]\n"
                f"{f'🔗 رابط القروب: {رابط_القروب}' if رابط_القروب else '🔒 لا يوجد رابط مباشر للقروب'}\n"
                f"📩 رسالتك:\n{text}"
            )

            await client.send_message(رقم_المتحكم, الرسالة, parse_mode='markdown')
            break

client.start()
print("📡 Personal bot is running ✅2✅2✅2✅2✅2✅2✅2✅2✅2✅2...")
client.run_until_disconnected()
#________________________________________________________________________________________________________
