# Supabase সেটআপ (ধাপে ধাপে)

এই প্রজেক্টের সব ডেটা (শিক্ষার্থী, পরীক্ষা, প্রশ্ন, ফলাফল, অ্যান্টি-চিট লগ) Supabase-এর Postgres ডেটাবেসে থাকে।

## ১. প্রজেক্ট তৈরি করো
1. https://supabase.com এ লগইন করে **New project** চাপো।
2. Region হিসেবে **Singapore (ap-southeast-1)** বেছে নাও (বাংলাদেশ থেকে সবচেয়ে কাছে, তাই দ্রুত)।
3. ডেটাবেস পাসওয়ার্ড কোথাও সংরক্ষণ করে রাখো।

## ২. টেবিল তৈরি করো
1. বাঁদিকের মেনু থেকে **SQL Editor** খোলো।
2. এই রিপোর `supabase/migrations/20261003000000_init.sql` ফাইলের পুরোটা কপি করে পেস্ট করো, তারপর **Run** চাপো।
3. **Table Editor**-এ গেলে `users`, `exams`, `questions`, `attempts`, `violations` এই ৫টি টেবিল দেখা যাবে।

ফাইলটা দুবার চালালেও কোনো সমস্যা নেই, কিছু ডুপ্লিকেট হবে না।

## ৩. চাবি (key) কপি করো
**Project Settings → API** থেকে:
- **Project URL**: এটা `SUPABASE_URL`
- **service_role** key (secret): এটা `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ service_role key দিয়ে পুরো ডেটাবেস পড়া ও বদলানো যায়। এটা কখনো GitHub-এ, ব্রাউজারের কোডে বা কাউকে পাঠাবে না। নামের আগে `NEXT_PUBLIC_` লাগাবে না।
> anon key এই অ্যাপে লাগে না। নিরাপত্তার জন্য সব টেবিলে RLS চালু, তাই anon key দিয়ে কিছুই পড়া যায় না।

## ৪. `.env.local` ফাইল
প্রজেক্টের মূল ফোল্ডারে `.env.local` তৈরি করো (`.env.example` দেখে):

```
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
SESSION_SECRET=৩২+ অক্ষরের র‍্যান্ডম লেখা
ADMIN_PHONE=01XXXXXXXXX
ADMIN_PASSWORD=শক্ত-একটা-পাসওয়ার্ড
```

`SESSION_SECRET` বানাতে: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

## ৫. চালাও
```
npm install
npm run dev
```
প্রথমবার চালু হলে নিজে থেকেই ডেমো পরীক্ষা আর অ্যাডমিন অ্যাকাউন্ট (`ADMIN_PHONE` / `ADMIN_PASSWORD`) Supabase-এ তৈরি হয়ে যাবে। Supabase-এর **Table Editor**-এ গিয়ে মিলিয়ে দেখতে পারো।

## ৬. Vercel-এ ডিপ্লয়
Vercel প্রজেক্টের **Settings → Environment Variables**-এ উপরের ৫টি ভেরিয়েবল বসাও, তারপর ডিপ্লয় করো। Supabase থাকায় Vercel-এও ডেটা হারাবে না।

## ব্যাকআপ
Supabase-এর ফ্রি প্ল্যানে স্বয়ংক্রিয় ব্যাকআপ সীমিত। গুরুত্বপূর্ণ পরীক্ষার আগে **Database → Backups** দেখে নাও, অথবা নিয়মিত `pg_dump` দিয়ে কপি রাখো।
