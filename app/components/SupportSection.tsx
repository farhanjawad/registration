// components/SupportSection.tsx
"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"; // IMPORT THE HOOK

export default function SupportSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize the hook
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Check if the script loaded properly
    if (!executeRecaptcha) {
      toast.error("সিকিউরিটি সিস্টেম লোড হচ্ছে, অনুগ্রহ করে একটু অপেক্ষা করুন...");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("বার্তা পাঠানো হচ্ছে...");

    try {
      // 2. Generate the invisible v3 token for this specific action
      const token = await executeRecaptcha("support_submit");

      // 3. Send the token to your Next.js backend to get the score
      const captchaResponse = await fetch("/api/verify-captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const captchaData = await captchaResponse.json();

      // 4. If Google says they are a bot, block them!
      if (!captchaResponse.ok || !captchaData.success) {
        toast.error("সিস্টেম আপনাকে বট হিসেবে চিহ্নিত করেছে!", { id: toastId });
        setIsSubmitting(false);
        return;
      }

      // 5. If they are human (score > 0.5), save to Firebase
      await addDoc(collection(db, "support_tickets"), {
        name,
        email,
        message,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      toast.success("আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে।", { id: toastId });
      setName("");
      setEmail("");
      setMessage("");
      
    } catch (error) {
      console.error(error);
      toast.error("সার্ভার এরর। আবার চেষ্টা করুন।", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 font-kalpurush grid grid-cols-1 md:grid-cols-2 gap-10 my-10">
      
      {/* ... Contact Info section remains exactly the same ... */}
      
      <div className="bg-white p-8 rounded-2xl shadow-md border border-emerald-100">
        <h3 className="text-2xl font-bold text-emerald-900 mb-6">বার্তা পাঠান</h3>
        
        {/* Notice how clean the form is now! No checkbox widget at all. */}
        <form onSubmit={handleSupportSubmit} className="space-y-4">
          <div>
            <label className="block text-emerald-900 font-bold mb-1 text-lg">আপনার নাম</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border border-gray-300 text-black rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-sans" placeholder="আপনার পুরো নাম" />
          </div>
          <div>
            <label className="block text-emerald-900 font-bold mb-1 text-lg">ইমেইল ঠিকানা</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 text-black rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-sans" placeholder="example@email.com" />
          </div>
          <div>
            <label className="block text-emerald-900 font-bold mb-1 text-lg">মেসেজ</label>
            <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full p-3 border border-gray-300 text-black rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-sans resize-y" placeholder="আপনার বিস্তারিত সমস্যা বা প্রশ্ন লিখুন..." />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-lg disabled:opacity-50 mt-4">
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            {isSubmitting ? "পাঠানো হচ্ছে..." : "সেন্ড করুন"}
          </button>
          
          {/* Legal requirement: When using v3, you must display this small text somewhere near the form */}
          <p className="text-xs text-gray-400 mt-4 text-center font-sans">
            This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy" className="text-blue-500 hover:underline">Privacy Policy</a> and <a href="https://policies.google.com/terms" className="text-blue-500 hover:underline">Terms of Service</a> apply.
          </p>
        </form>
      </div>
    </div>
  );
}