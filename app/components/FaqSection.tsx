"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    question: "আমি কীভাবে বইটি সংগ্রহ করব?",
    answer: (
      <span>
        নিবন্ধন ও পেমেন্ট সম্পন্ন হওয়ার পর আপনার ইমেইলে একটি ৬-ডিজিটের ভেরিফিকেশন কোড পাঠানো হবে। আমাদের নির্দিষ্ট বুথ বা অফিসে এসে স্টাফকে কোডটি দেখালেই আপনি বই সংগ্রহ করতে পারবেন। কোনো সমস্যা হলে আমাদের <Link href="/support" className="text-amber-600 font-bold hover:underline">সাপোর্ট পেজে</Link> যোগাযোগ করুন।
      </span>
    )
  },
  {
    question: "পেমেন্ট ভেরিফাই হতে কত সময় লাগে?",
    answer: (
      <span>
        সাধারণত পেমেন্ট করার ২৪ ঘণ্টার মধ্যে আমাদের অ্যাডমিন প্যানেল থেকে তা যাচাই করে অনুমোদন দেওয়া হয়। অনুমোদনের সাথে সাথেই আপনি ইমেইল পেয়ে যাবেন।
      </span>
    )
  },
  {
    question: "আমি কি পেমেন্ট ছাড়া শুধু প্রোগ্রামে অংশ নিতে পারব?",
    answer: (
      <span>
        হ্যাঁ, ফর্মে <strong className="text-emerald-700">'বই কিনতে চাই'</strong> অপশনে 'না' নির্বাচন করলে কোনো পেমেন্ট ছাড়াই আপনি প্রোগ্রামে অংশ নিতে পারবেন।
      </span>
    )
  },
  {
    question: "আমি কি বইটি অনলাইনে পড়তে পারব?",
    answer: "না, বইটি শুধুমাত্র প্রিন্টেড ফরম্যাটে পাওয়া যাবে। অনলাইন ভার্সন বর্তমানে উপলব্ধ নেই।"
  },
  {
    question: "রেজিস্ট্রেশান করতে কোনো সমস্যা হচ্ছে, আমি কি করব?",
    answer: (
      <span>
        যদি রেজিস্ট্রেশান বা পেমেন্ট সংক্রান্ত কোনো সমস্যা হয়, তাহলে আমাদের <Link href="/support" className="text-amber-600 font-bold hover:underline">সাপোর্ট পেজে</Link> আমাদের সাথে যোগাযোগ করুন। আমরা দ্রুত আপনার সমস্যার সমাধান করার চেষ্টা করব। আমরা দ্রুত আপনার সমস্যার সমাধান করার চেষ্টা করব।
      </span>
    )
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto p-6 font-kalpurush">
      <div className="flex items-center gap-3 justify-center mb-8 text-emerald-900">
        <HelpCircle size={32} className="text-amber-500" />
        <h2 className="text-3xl font-bold">সাধারণ জিজ্ঞাসা (FAQ)</h2>
      </div>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-emerald-100 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <button 
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex justify-between items-center p-5 text-left bg-white hover:bg-emerald-50/50 transition-colors"
            >
              <span className="text-xl font-bold text-emerald-900">{faq.question}</span>
              <ChevronDown className={`text-emerald-600 transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="p-5 pt-0 text-lg text-emerald-800/80 border-t border-emerald-50">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}