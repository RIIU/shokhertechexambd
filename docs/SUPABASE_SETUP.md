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

## ৩. URL আর secret key
- **Project Settings → Data API**: **Project URL** (যেমন `https://abcdxyz.supabase.co`)। এটা `SUPABASE_URL`
- **Project Settings → API Keys → Secret keys**: `sb_secret_…` দিয়ে শুরু হওয়া key। এটা `SUPABASE_SECRET_KEY`
  (পুরোনো প্রজেক্টে **Legacy API keys**-এর `service_role` key-ও চলবে, তখন নাম দাও `SUPABASE_SERVICE_ROLE_KEY`)

> ⚠️ secret key দিয়ে পুরো ডেটাবেস পড়া ও বদলানো যায়। এটা কখনো GitHub-এ, ব্রাউজারের কোডে, চ্যাটে বা কাউকে পাঠাবে না। নামের আগে `NEXT_PUBLIC_` লাগাবে না। কোথাও ফাঁস হয়ে গেলে **API Keys** পেজ থেকে নতুন secret key বানিয়ে পুরোনোটা মুছে দাও।
> **publishable key** (`sb_publishable_…`) এই অ্যাপে লাগে না। সব টেবিলে RLS চালু, তাই ওই key দিয়ে কিছুই পড়া যায় না।

## ৪. `.env.local` ফাইল
প্রজেক্টের মূল ফোল্ডারে `.env.local` তৈরি করো (`.env.example` দেখে):

```
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
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

> মনে রেখো: Vercel-এ ভেরিয়েবল বদলালে **Deployments → … → Redeploy** না করা পর্যন্ত নতুন মান কাজ করে না।

## ৭. সমস্যা হলে: `/api/health`
ডিপ্লয়ের পর ব্রাউজারে `https://তোমার-সাইট/api/health` খোলো। কোন ভেরিয়েবল আছে বা নেই, টেবিল আছে কিনা, key ঠিক কিনা সব দেখাবে (কোনো secret দেখায় না)। সব ঠিক থাকলে `"ok": true`।

| কোড | মানে | সমাধান |
|---|---|---|
| `TABLES_MISSING` | টেবিল তৈরি হয়নি | ধাপ ২-এর SQL পুরোটা Run করো |
| `NO_DATABASE_ON_SERVERLESS` | Vercel-এ Supabase ভেরিয়েবল নেই | `SUPABASE_URL`, `SUPABASE_SECRET_KEY` বসিয়ে Redeploy |
| `SESSION_SECRET_MISSING` | `SESSION_SECRET` নেই বা ৩২ অক্ষরের কম | লম্বা র‍্যান্ডম স্ট্রিং বসিয়ে Redeploy |
| `PUBLISHABLE_KEY_USED` | secret-এর জায়গায় publishable key | `sb_secret_…` key দাও |
| `INVALID_KEY` | key ভুল বা বাতিল (rotate করার পর পুরনো key) | নতুন secret key বসাও |
| `SUPABASE_UNREACHABLE` | URL ভুল বা প্রজেক্ট pause | URL দেখো, Supabase ড্যাশবোর্ডে প্রজেক্ট Restore করো |

রেজিস্টার/লগইন ফর্মেও এখন এই কোডসহ বার্তা দেখাবে। বিস্তারিত কারণ Vercel-এর **Logs** ট্যাবে `[register]` বা `[login]` লিখে খুঁজলে পাবে।

## ব্যাকআপ
Supabase-এর ফ্রি প্ল্যানে স্বয়ংক্রিয় ব্যাকআপ সীমিত। গুরুত্বপূর্ণ পরীক্ষার আগে **Database → Backups** দেখে নাও, অথবা নিয়মিত `pg_dump` দিয়ে কপি রাখো।
