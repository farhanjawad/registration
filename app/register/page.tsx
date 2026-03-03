"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  CheckCircle2, Loader2, ArrowLeft, User, Mail, Phone, 
  BookOpen, GraduationCap, Briefcase, Hash, CreditCard, Library
} from "lucide-react";
import Link from "next/link";

const DISCIPLINES = [
  'Architecture', 'Computer Science and Engineering', 'Electronics and Communication Engineering', 
  'Urban and Rural Planning', 'Mathematics', 'Physics', 'Chemistry', 'Statistics',
  'Forestry and Wood Technology', 'Fisheries and Marine Resource Technology', 
  'Biotechnology and Genetic Engineering', 'Agrotechnology', 'Pharmacy', 'Environmental Science',
  'Business Administration', 'Human Resource Management', 
  'Economics', 'Sociology', 'Development Studies', 'Mass Communication and Journalism', 
  'English', 'History and Civilization', 'Law', 
  'Drawing and Painting', 'Printmaking', 'Sculpture', 'Other'
];

// Zod Schema with Bangla Error Messages
const formSchema = z.object({
  fullName: z.string().min(3, "নাম কমপক্ষে ৩ অক্ষরের হতে হবে"),
  email: z.string().email("সঠিক ইমেইল ঠিকানা দিন"),
  phone: z.string().min(11, "সঠিক ফোন নম্বর প্রয়োজন"),
  gender: z.enum(["পুরুষ", "মহিলা"], { message: "অনুগ্রহ করে আপনার লিঙ্গ নির্বাচন করুন" }),
  discipline: z.string().min(1, "অনুগ্রহ করে আপনার ডিসিপ্লিন নির্বাচন করুন"),
  userType: z.enum(["শিক্ষার্থী", "শিক্ষক/কর্মকর্তা"], { message: "ব্যবহারকারীর ধরন নির্বাচন করুন" }),
  studentId: z.string().optional(),
  designation: z.string().optional(),
  buyBook: z.enum(["হ্যাঁ", "না"], { message: "বইটি নিতে চান কিনা তা জানান" }),
  trxId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.userType === "শিক্ষার্থী" && (!data.studentId || data.studentId.trim() === "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "শিক্ষার্থী আইডি প্রয়োজন", path: ["studentId"] });
  }
  if (data.userType === "শিক্ষক/কর্মকর্তা" && (!data.designation || data.designation.trim() === "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "পদবি প্রয়োজন", path: ["designation"] });
  }
  if (data.buyBook === "হ্যাঁ" && (!data.trxId || data.trxId.trim() === "")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "বই কেনার জন্য ট্রানজেকশন আইডি (TrxID) প্রয়োজন", path: ["trxId"] });
  }
});

type FormData = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ name: string; gender: string } | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const userType = watch("userType");
  const buyBook = watch("buyBook");

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "registrations"), {
        ...data,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setSuccessData({ name: data.fullName, gender: data.gender });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("সাবমিট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successData) {
    const title = successData.gender === "পুরুষ" ? "ভাই" : "বোন";
    return (
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-6 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] bg-size-[40px_40px] font-kalpurush">
        <div className="bg-white/90 backdrop-blur-xl p-12 rounded-[2.5rem] shadow-2xl max-w-lg w-full text-center border border-white/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 bg-linear-to-r from-emerald-600 to-amber-400"></div>
          <CheckCircle2 className="w-24 h-24 text-emerald-500 mx-auto mb-8 animate-in zoom-in duration-500" />
          <h2 className="text-4xl font-extrabold text-emerald-900 mb-4 tracking-tight">নিবন্ধন<br/>সফল হয়েছে!</h2>
          <p className="text-emerald-700 text-xl mb-10 leading-relaxed">
            জাযাকাল্লাহু খাইরান, {title} <strong className="text-emerald-900">{successData.name}</strong>। আল্লাহ জ্ঞান অন্বেষণে আপনার এই যাত্রাকে বরকতময় করুন।
          </p>
          <Link href="/" className="inline-flex bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-4 px-8 rounded-full transition-all shadow-sm items-center gap-2 group text-lg font-sans">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> মূল পাতায় ফিরে যান
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] py-12 px-4 sm:px-6 relative selection:bg-amber-200 font-kalpurush">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#10b981_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/" className="inline-flex items-center text-emerald-700 hover:text-emerald-900 mb-8 font-semibold bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm shadow-sm transition-all hover:shadow font-sans">
          <ArrowLeft size={18} className="mr-2" /> মূল পাতা
        </Link>
        
        <div className="bg-white rounded-4xl shadow-2xl shadow-emerald-900/10 overflow-hidden border border-emerald-50">
          
          <div className="relative bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-950 p-12 text-center rounded-b-[3rem] shadow-inner">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#fbbf24 2px, transparent 2px)", backgroundSize: "30px 30px" }}></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-amber-400/20 p-4 rounded-full mb-4 backdrop-blur-sm border border-amber-400/30">
                <BookOpen size={40} className="text-amber-400" />
              </div>
              <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">প্রোগ্রাম নিবন্ধন</h2>
              <p className="text-emerald-100 text-xl font-medium">রাসূল-ই-আরবী কোর্সে আপনার আসন নিশ্চিত করুন</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 sm:p-12 space-y-10">
            
            {/* Section 1: Personal Details */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-emerald-900 border-b-2 border-emerald-100 pb-2 flex items-center gap-2">
                <User className="text-amber-500" size={24}/> ব্যক্তিগত তথ্য
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
                <div className="relative group">
                  <label className="block text-emerald-900 font-semibold mb-2 ml-1">আপনার পুরো নাম</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-emerald-600/50 group-focus-within:text-amber-500 transition-colors" />
                    </div>
                    <input {...register("fullName")} className="w-full pl-12 pr-4 py-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all outline-none text-emerald-900 placeholder:text-emerald-900/30" placeholder="উদাঃ আব্দুল্লাহ" />
                  </div>
                  {errors.fullName && <p className="text-red-500 text-sm mt-1 ml-1">{errors.fullName.message}</p>}
                </div>

                <div className="relative group">
                  <label className="block text-emerald-900 font-semibold mb-2 ml-1">ইমেইল ঠিকানা</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-emerald-600/50 group-focus-within:text-amber-500 transition-colors" />
                    </div>
                    <input {...register("email")} type="email" className="w-full pl-12 pr-4 py-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all outline-none text-emerald-900 placeholder:text-emerald-900/30 font-sans" placeholder="abdullah@example.com" />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1 ml-1">{errors.email.message}</p>}
                </div>

                <div className="relative group">
                  <label className="block text-emerald-900 font-semibold mb-2 ml-1">ফোন নম্বর</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-emerald-600/50 group-focus-within:text-amber-500 transition-colors" />
                    </div>
                    <input {...register("phone")} className="w-full pl-12 pr-4 py-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all outline-none text-emerald-900 placeholder:text-emerald-900/30 font-sans" placeholder="01XXXXXXXXX" />
                  </div>
                  {errors.phone && <p className="text-red-500 text-sm mt-1 ml-1">{errors.phone.message}</p>}
                </div>

                <div className="relative group">
                  <label className="block text-emerald-900 font-semibold mb-2 ml-1">লিঙ্গ</label>
                  <select {...register("gender")} className="w-full px-4 py-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all outline-none text-emerald-900 appearance-none">
                    <option value="">নির্বাচন করুন...</option>
                    <option value="পুরুষ">পুরুষ</option>
                    <option value="মহিলা">মহিলা</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-sm mt-1 ml-1">{errors.gender.message}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Academic Details */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-emerald-900 border-b-2 border-emerald-100 pb-2 flex items-center gap-2">
                <Library className="text-amber-500" size={24}/> একাডেমিক তথ্য
              </h3>

              <div className="relative group text-lg">
                <label className="block text-emerald-900 font-semibold mb-2 ml-1">বিশ্ববিদ্যালয়ের ডিসিপ্লিন</label>
                <select {...register("discipline")} className="w-full px-4 py-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all outline-none text-emerald-900 appearance-none">
                  <option value="">আপনার ডিসিপ্লিন নির্বাচন করুন...</option>
                  {DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.discipline && <p className="text-red-500 text-sm mt-1 ml-1">{errors.discipline.message}</p>}
              </div>

              <div>
                <label className="block text-emerald-900 font-semibold mb-4 text-lg ml-1">আমি নিবন্ধন করছি একজন:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <label className={`relative flex flex-col items-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${userType === 'শিক্ষার্থী' ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-500/10 scale-[1.02]' : 'border-emerald-100 bg-white hover:border-emerald-300 hover:bg-emerald-50/50'}`}>
                    <input type="radio" value="শিক্ষার্থী" {...register("userType")} className="sr-only" />
                    <div className={`p-3 rounded-full mb-3 ${userType === 'শিক্ষার্থী' ? 'bg-amber-400 text-emerald-900' : 'bg-emerald-100 text-emerald-600'}`}>
                      <GraduationCap size={28} />
                    </div>
                    <span className={`font-bold text-xl ${userType === 'শিক্ষার্থী' ? 'text-amber-900' : 'text-emerald-800'}`}>শিক্ষার্থী</span>
                  </label>

                  <label className={`relative flex flex-col items-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${userType === 'শিক্ষক/কর্মকর্তা' ? 'border-emerald-600 bg-emerald-50 shadow-lg shadow-emerald-600/10 scale-[1.02]' : 'border-emerald-100 bg-white hover:border-emerald-300 hover:bg-emerald-50/50'}`}>
                    <input type="radio" value="শিক্ষক/কর্মকর্তা" {...register("userType")} className="sr-only" />
                    <div className={`p-3 rounded-full mb-3 ${userType === 'শিক্ষক/কর্মকর্তা' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                      <Briefcase size={28} />
                    </div>
                    <span className={`font-bold text-xl ${userType === 'শিক্ষক/কর্মকর্তা' ? 'text-emerald-900' : 'text-emerald-800'}`}>শিক্ষক বা কর্মকর্তা</span>
                  </label>

                </div>
                {errors.userType && <p className="text-red-500 text-sm mt-2 ml-1">{errors.userType.message}</p>}
              </div>

              <div className="min-h-22.5 text-lg">
                {userType === "শিক্ষার্থী" && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-500 relative group">
                    <label className="block text-emerald-900 font-semibold mb-2 ml-1">স্টুডেন্ট আইডি (Student ID)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Hash className="h-5 w-5 text-emerald-600/50 group-focus-within:text-amber-500 transition-colors" />
                      </div>
                      <input {...register("studentId")} className="w-full pl-12 pr-4 py-3.5 bg-white border border-emerald-200 rounded-2xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all outline-none text-emerald-900 shadow-sm font-sans" placeholder="e.g. 190200" />
                    </div>
                    {errors.studentId && <p className="text-red-500 text-sm mt-1 ml-1">{errors.studentId.message}</p>}
                  </div>
                )}
                {userType === "শিক্ষক/কর্মকর্তা" && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-500 relative group">
                    <label className="block text-emerald-900 font-semibold mb-2 ml-1">পদবি (Designation)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-emerald-600/50 group-focus-within:text-emerald-600 transition-colors" />
                      </div>
                      <input {...register("designation")} className="w-full pl-12 pr-4 py-3.5 bg-white border border-emerald-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-emerald-900 shadow-sm" placeholder="উদাঃ প্রভাষক (Lecturer)" />
                    </div>
                    {errors.designation && <p className="text-red-500 text-sm mt-1 ml-1">{errors.designation.message}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Book Purchase */}
            <div className="bg-linear-to-br from-amber-50 to-orange-50 p-8 rounded-3xl border border-amber-200 shadow-inner">
              <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-2">
                <BookOpen className="text-amber-600" size={24}/> নির্ধারিত বই 
              </h3>
              
              <label className="block text-amber-900 font-medium mb-4 text-lg">আপনি কি "রাসূল-ই-আরবী" বইটির হার্ডকপি কিনতে চান? (১০০ টাকা)</label>
              
              <div className="space-y-3 mb-6 text-lg">
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${buyBook === 'হ্যাঁ' ? 'bg-white border-amber-400 shadow-md ring-1 ring-amber-400' : 'bg-white/50 border-amber-200 hover:bg-white'}`}>
                  <input type="radio" value="হ্যাঁ" {...register("buyBook")} className="w-5 h-5 text-amber-600 focus:ring-amber-500 border-amber-300" />
                  <span className="ml-3 text-amber-900 font-medium">হ্যাঁ, আমি বইটি নিতে চাই (১০০ টাকা)</span>
                </label>
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${buyBook === 'না' ? 'bg-white border-gray-400 shadow-md ring-1 ring-gray-400' : 'bg-white/50 border-amber-200 hover:bg-white'}`}>
                  <input type="radio" value="না" {...register("buyBook")} className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 border-amber-300" />
                  <span className="ml-3 text-amber-900 font-medium">না, আমার প্রয়োজন নেই</span>
                </label>
              </div>
              {errors.buyBook && <p className="text-red-500 text-sm mb-4">{errors.buyBook.message}</p>}

              {/* Payment Details Reveal */}
              {buyBook === "হ্যাঁ" && (
                <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-amber-100 p-2 rounded-lg text-amber-700 mt-1"><CreditCard size={20}/></div>
                    <p className="text-lg text-amber-800 leading-relaxed">
                      অনুগ্রহ করে <strong>১০০ টাকা</strong> বিকাশ বা নগদে <strong className="bg-amber-100 px-2 py-0.5 rounded font-sans">01XXXXXXXXX</strong> (পার্সোনাল) নম্বরে পাঠান। পাঠানোর পর নিচের ঘরে আপনার ট্রানজেকশন আইডি (TrxID) দিন।
                    </p>
                  </div>
                  
                  <div className="relative group text-lg">
                    <label className="block text-amber-900 font-semibold mb-2 ml-1">ট্রানজেকশন আইডি (TrxID)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Hash className="h-5 w-5 text-amber-500/50 group-focus-within:text-amber-600 transition-colors" />
                      </div>
                      <input {...register("trxId")} className="w-full pl-12 pr-4 py-3.5 bg-amber-50/50 border border-amber-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none text-amber-900 font-mono tracking-wider placeholder:tracking-normal placeholder:font-sans placeholder:text-amber-900/30" placeholder="e.g. 8AB3CD9F" />
                    </div>
                    {errors.trxId && <p className="text-red-500 text-sm mt-1 ml-1">{errors.trxId.message}</p>}
                  </div>
                </div>
              )}
            </div>

            <hr className="border-emerald-100" />

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-linear-to-r from-emerald-800 to-emerald-600 hover:from-emerald-700 hover:to-emerald-500 text-white font-bold py-5 rounded-2xl transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 hover:-translate-y-0.5 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none text-xl font-sans"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  প্রসেস হচ্ছে...
                </>
              ) : (
                "নিবন্ধন সম্পন্ন করুন"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}