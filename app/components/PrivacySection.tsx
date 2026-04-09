import { ShieldCheck } from "lucide-react";

export default function PrivacySection() {
  return (
    <div className="max-w-4xl mx-auto p-8 font-kalpurush bg-white rounded-2xl shadow-sm border border-emerald-100 my-10">
      <div className="flex flex-col items-center text-center mb-10 border-b border-gray-100 pb-8">
        <ShieldCheck size={48} className="text-emerald-700 mb-4" />
        <h1 className="text-4xl font-bold text-emerald-900 mb-2">প্রাইভেসি পলিসি</h1>
        <p className="text-lg text-gray-500">সর্বশেষ আপডেট: এপ্রিল ২০২৬</p>
      </div>

      <div className="space-y-8 text-lg text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-emerald-900 mb-3">১. তথ্য সংগ্রহ</h2>
          <p>
            খুলনা বিশ্ববিদ্যালয় সীরাত অলিম্পিয়াড - ২০২৬ প্রোগ্রামে নিবন্ধনের সময় আমরা আপনার নাম, ইমেইল, ফোন নম্বর, এবং প্রাতিষ্ঠানিক তথ্য সংগ্রহ করি। এই তথ্যগুলো শুধুমাত্র আপনার অংশগ্রহণ নিশ্চিত করার উদ্দেশ্যে ব্যবহৃত হয়।
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-emerald-900 mb-3">২. তথ্যের ব্যবহার</h2>
          <p>
            আপনার প্রদানকৃত ইমেইল এবং ফোন নম্বর আমরা শুধুমাত্র ভেরিফিকেশন কোড পাঠানো, পেমেন্ট নিশ্চিতকরণ এবং প্রোগ্রামের গুরুত্বপূর্ণ আপডেট জানানোর জন্য ব্যবহার করব। আমরা কোনো থার্ড-পার্টি কোম্পানির কাছে আপনার ডেটা বিক্রি বা শেয়ার করি না।
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-emerald-900 mb-3">৩. পেমেন্ট ও নিরাপত্তা</h2>
          <p>
            আমরা সরাসরি কোনো আর্থিক তথ্য (যেমন ক্রেডিট কার্ড নম্বর বা পিন) আমাদের ডেটাবেসে সংরক্ষণ করি না। শুধুমাত্র আপনার প্রদানকৃত ট্রানজেকশন আইডি (TrxID) পেমেন্ট যাচাইয়ের জন্য সংরক্ষিত থাকে। আমাদের পুরো সিস্টেমটি অত্যন্ত সুরক্ষিত।
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-emerald-900 mb-3">৪. কুকিজ (Cookies)</h2>
          <p>
            আপনাকে সেরা ইউজার এক্সপেরিয়েন্স দিতে আমাদের ওয়েবসাইট সেশন কুকিজ ব্যবহার করতে পারে। এই কুকিজগুলো আপনার ব্রাউজার সেশন শেষ হলে স্বয়ংক্রিয়ভাবে মুছে যায় এবং কোনো ব্যক্তিগত তথ্য সংগ্রহ করে না।
          </p>
        </section>
      </div>
    </div>
  );
}