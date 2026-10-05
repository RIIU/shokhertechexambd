export interface SubscriptionPackage {
  id: string;
  nameBn: string;
  nameEn: string;
  durationDays: number;
  durationLabelBn: string;
  price: number;
  originalPrice: number;
  monthlyEquivBn: string;
  badge?: string;
  popular?: boolean;
  bestValue?: boolean;
  accent: "brand" | "amber" | "leaf" | "violet";
  taglineBn: string;
  features: string[];
}

export interface CoursePackage {
  id: string;
  nameBn: string;
  nameEn: string;
  level: "ssc" | "hsc" | "all";
  stream?: "science" | "arts" | "commerce" | "all";
  durationDays: number;
  durationLabelBn: string;
  price: number;
  originalPrice: number;
  badge?: string;
  popular?: boolean;
  accent: "brand" | "amber" | "leaf" | "violet";
  taglineBn: string;
  features: string[];
}

export interface PackageFaq {
  qBn: string;
  aBn: string;
}

/**
 * Subscription packages modeled like Chorcha (চর্চা) with high-value pricing tiers
 */
export const SUBSCRIPTION_PACKAGES: SubscriptionPackage[] = [
  {
    id: "sub-1m",
    nameBn: "১ মাস সাবস্ক্রিপশন",
    nameEn: "1 Month Plan",
    durationDays: 30,
    durationLabelBn: "১ মাস (৩০ দিন)",
    price: 99,
    originalPrice: 149,
    monthlyEquivBn: "৳৯৯ / মাস",
    accent: "leaf",
    taglineBn: "প্ল্যাটফর্ম যাচাই ও পরীক্ষার পূর্বে প্রস্তুতি ঝালাই করতে",
    features: [
      "৩০ দিন সকল বিষয় ও অধ্যায়ে আনলিমিটেড অ্যাক্সেস",
      "অধ্যায়ভিত্তিক প্র্যাকটিস ও তাৎক্ষণিক উত্তর যাচাই",
      "বিগত সালের বোর্ড প্রশ্ন সমাধান ও ব্যাখ্যা",
      "প্রতিদিনের লাইভ পরীক্ষা ও জাতীয় র‍্যাঙ্কিং",
      "কড়া অ্যান্টি-চিট সিকিউর এক্সাম পরিবেশ",
      "পারফরম্যান্স ও সঠিকতার (Accuracy) চার্ট",
    ],
  },
  {
    id: "sub-3m",
    nameBn: "৩ মাস সাবস্ক্রিপশন",
    nameEn: "3 Months Plan",
    durationDays: 90,
    durationLabelBn: "৩ মাস (৯০ দিন)",
    price: 199,
    originalPrice: 299,
    monthlyEquivBn: "৳৬৬ / মাস",
    badge: "সবচেয়ে জনপ্রিয় 🔥",
    popular: true,
    accent: "brand",
    taglineBn: "বোর্ড ও টেস্ট পরীক্ষার পূর্ণাঙ্গ প্রস্তুতির জন্য শিক্ষার্থীদের সেরা পছন্দ",
    features: [
      "৯০ দিন সম্পূর্ণ প্ল্যাটফর্ম আনলিমিটেড আনলক",
      "সব বিষয়ের পূর্ণাঙ্গ বোর্ড স্ট্যান্ডার্ড মডেল টেস্ট",
      "টপিকভিত্তিক স্পিড টেস্ট ও দুর্বলতা ট্র্যাকার",
      "সারা দেশের শিক্ষার্থীদের সাথে রিয়েলটাইম লিডারবোর্ড",
      "প্রতিটি প্রশ্নের নিখুঁত বিস্তারিত ব্যাখ্যা ও সমাধান",
      "সার্ভার-সাইড সিকিউর গ্রেডিং ও ফুলস্ক্রিন এক্সাম",
      "অগ্রাধিকার ভিত্তিতে ডাউট সমাধান ও সাপোর্ট",
    ],
  },
  {
    id: "sub-6m",
    nameBn: "৬ মাস সাবস্ক্রিপশন",
    nameEn: "6 Months Plan",
    durationDays: 180,
    durationLabelBn: "৬ মাস (১৮০ দিন)",
    price: 299,
    originalPrice: 449,
    monthlyEquivBn: "৳৫০ / মাস",
    badge: "সেরা সঞ্চয় ⭐",
    bestValue: true,
    accent: "amber",
    taglineBn: "দীর্ঘমেয়াদী ধারাবাহিক প্রস্তুতি ও সর্বোচ্চ মূল্যছাড়",
    features: [
      "১৮০ দিন সম্পূর্ণ প্ল্যাটফর্ম আনলিমিটেড অল-অ্যাক্সেস",
      "টেস্ট পেপার সলভিং ও শীর্ষ কলেজের বিশেষ প্রশ্নব্যাংক",
      "ফাইনাল পরীক্ষার পূর্ব পর্যন্ত সকল লাইভ পরীক্ষায় ফ্রি এন্ট্রি",
      "টপিকভিত্তিক বিশদ পারফরম্যান্স অ্যানালিটিক্স রিপোর্ট",
      "ডিভাইস আইডেন্টিটি ওয়াটারমার্ক ও সুরক্ষিত পরীক্ষা",
      "সব নতুন প্রশ্ন ও ফিচার আপডেটে স্বয়ংক্রিয় প্রবেশাধিকার",
      "২৪/৭ ডেডিকেটেড স্টুডেন্ট হেল্পডেস্ক",
    ],
  },
  {
    id: "sub-12m",
    nameBn: "১ বছর মেগা সাবস্ক্রিপশন",
    nameEn: "12 Months Mega Plan",
    durationDays: 365,
    durationLabelBn: "১ বছর (৩৬৫ দিন)",
    price: 399,
    originalPrice: 599,
    monthlyEquivBn: "৳৩৩ / মাস",
    badge: "মেগা সেভার 👑",
    accent: "violet",
    taglineBn: "এসএসসি ও এইচএসসি পরীক্ষার সম্পূর্ণ সিলেবাস কভারেজ",
    features: [
      "৩৬৫ দিন সম্পূর্ণ প্ল্যাটফর্ম আনলিমিটেড অল-অ্যাক্সেস",
      "এসএসসি ও এইচএসসি উভয় স্তরের সকল বিভাগ ও পেপার",
      "বিগত ১০ বছরের সকল বোর্ড প্রশ্ন সমাধান ও ব্যাখ্যা",
      "আনলিমিটেড রি-টেক ও পারফরম্যান্স গ্রাফ হিস্টোরি",
      "মেগা প্র্যাকটিস শিট ও বোর্ড এক্সাম ফাইনাল সাজেশন",
      "প্রিমিয়াম ভিআইপি স্টুডেন্ট ব্যাজ ও প্রায়োরিটি সাপোর্ট",
    ],
  },
];

/**
 * Dedicated exam / level course packages
 */
export const COURSE_PACKAGES: CoursePackage[] = [
  {
    id: "course-ssc-sci",
    nameBn: "SSC ২০২৬ বিজ্ঞান বিভাগ স্পেশাল",
    nameEn: "SSC Science Special",
    level: "ssc",
    stream: "science",
    durationDays: 180,
    durationLabelBn: "৬ মাস (বোর্ড পরীক্ষা পর্যন্ত)",
    price: 199,
    originalPrice: 299,
    badge: "বিজ্ঞান বিভাগ",
    accent: "brand",
    taglineBn: "পদার্থ, রসায়ন, জীববিজ্ঞান ও উচ্চতর গণিতের পূর্ণাঙ্গ অধ্যায়ভিত্তিক প্রস্তুতি",
    features: [
      "পদার্থ, রসায়ন, গণিত, উচ্চতর গণিত, জীববিজ্ঞান ও আইসিটি",
      "১২০+ অধ্যায়ভিত্তিক পরীক্ষা ও প্রতিটি অধ্যায়ের কুইজ",
      "২৫টি পূর্ণাঙ্গ বোর্ড স্ট্যান্ডার্ড মডেল টেস্ট",
      "নেগেティブ মার্কিং সহ বাস্তব পরীক্ষার অভিজ্ঞতা",
      "প্রতিটি বহুনির্বাচনী প্রশ্নের বিস্তারিত গাণিতিক ব্যাখ্যা",
    ],
  },
  {
    id: "course-ssc-all",
    nameBn: "SSC ২০২৬ অল-ইন-ওয়ান পূর্ণাঙ্গ প্যাক",
    nameEn: "SSC All-in-One Full Pack",
    level: "ssc",
    stream: "all",
    durationDays: 365,
    durationLabelBn: "১ বছর (পূর্ণাঙ্গ এসএসসি)",
    price: 299,
    originalPrice: 449,
    badge: "সবচেয়ে জনপ্রিয় 🔥",
    popular: true,
    accent: "amber",
    taglineBn: "বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা সব বিভাগের সকল বিষয়ের মাস্টার প্যাক",
    features: [
      "এসএসসি-র সকল বিভাগ ও আবশ্যিক বিষয়ের পূর্ণ প্রস্তুতি",
      "বাংলা ১ম ও ২য়, ইংরেজি ১ম ও ২য়, গণিত ও আইসিটি কমপ্লিট",
      "বিগত ৫ বছরের সকল শিক্ষা বোর্ডের প্রশ্ন ও সমাধান",
      "সারা দেশের সাথে মেধা যাচাই ও রিয়েলটাইম লিডারবোর্ড",
      "কড়া অ্যান্টি-চিট সিকিউর এক্সাম পরিবেশ",
    ],
  },
  {
    id: "course-hsc-sci",
    nameBn: "HSC ২০২৬ ১ম ও ২য় পত্র স্পেশাল",
    nameEn: "HSC Science 1st & 2nd Paper",
    level: "hsc",
    stream: "science",
    durationDays: 365,
    durationLabelBn: "১ বছর (পূর্ণাঙ্গ এইচএসসি)",
    price: 399,
    originalPrice: 599,
    badge: "এইচএসসি স্পেশাল ⭐",
    accent: "leaf",
    taglineBn: "উচ্চ মাধ্যমিক বিজ্ঞান বিভাগের ১ম ও ২য় পত্রের কমপ্লিট প্যাকেজ",
    features: [
      "পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত ও জীববিজ্ঞানের ১ম ও ২য় পত্র",
      "বিশ্ববিদ্যালয় ভর্তি পরীক্ষার ফাউন্ডেশন প্রশ্নব্যাংক",
      "৪০টি পূর্ণাঙ্গ মডেল টেস্ট ও ফাইনাল রিভিশন এক্সাম",
      "লাইভ পরীক্ষা ও দ্রুত পারফরম্যান্স অ্যানালিটিক্স",
      "ফুলস্ক্রিন মোড ও ওয়াটারমার্ক অ্যান্টি-চিট সুরক্ষা",
    ],
  },
];

export const PACKAGE_FAQS: PackageFaq[] = [
  {
    qBn: "প্যাকেজ কিনলে কি সব বিষয়ের পরীক্ষা দেওয়া যাবে?",
    aBn: "হ্যাঁ! যেকোনো সাবস্ক্রিপশন প্যাকেজ চালু থাকলে প্ল্যাটফর্মের সকল বিষয়, অধ্যায় এবং বোর্ড মডেল টেস্ট যত খুশি ততবার পরীক্ষা দিতে পারবে।",
  },
  {
    qBn: "পেমেন্ট করার পর প্যাকেজ কত দ্রুত সক্রিয় হবে?",
    aBn: "বিকাশ, নগদ, রকেট বা উপায় থেকে সেন্ড মানি করে TrxID সাবমিট করার পর আমাদের অ্যাডমিন তা যাচাই করে কয়েক মিনিটের মধ্যেই প্যাকেজ সক্রিয় করে দেবে।",
  },
  {
    qBn: "মোবাইল ও কম্পিউটার দুটো থেকেই কি পরীক্ষা দেওয়া যাবে?",
    aBn: "অবশ্যই! যেকোনো ডিভাইস (স্মার্টফোন, ট্যাবলেট, ল্যাপটপ বা ডেস্কটপ) থেকে ব্রাউজারের মাধ্যমে সহজে পরীক্ষা দেওয়া যাবে।",
  },
  {
    qBn: "নেগেটিভ মার্কিং কি সব পরীক্ষায় থাকে?",
    aBn: "বোর্ড মডেল টেস্ট ও লাইভ পরীক্ষায় প্রকৃত পরীক্ষার নিয়মে নেগেটিভ মার্কিং থাকে (সাধারণত -০.২৫), যা তোমার সঠিকতা বাড়াতে সাহায্য করবে।",
  },
  {
    qBn: "টাকা পাঠানোর জন্য কোনো অতিরিক্ত ফি দিতে হবে কি?",
    aBn: "না, প্যাকেজের জন্য নির্ধারিত মূল্যের বাইরে কোনো অতিরিক্ত চার্জ দিতে হবে না।",
  },
];
