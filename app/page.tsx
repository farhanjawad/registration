import Link from "next/link";
import Image from "next/image";
import { BookOpen, Star, Users, ArrowRight } from "lucide-react";

// Helper function to convert English numbers to Bengali
const toBengaliNumber = (num: number | string) => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (digit) => bengaliDigits[Number(digit)]);
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] font-kalpurush selection:bg-emerald-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#fdfbf7]/90 backdrop-blur-md border-b border-emerald-100 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
          <span>খুলনা বিশ্ববিদ্যালয় দ্বীনি কমিউনিটি</span>
        </div>
        <Link
          href="/register"
          className="bg-emerald-800 hover:bg-emerald-700 text-white px-6 py-2 rounded-full font-medium transition-all shadow-md font-sans"
        >
          নিবন্ধন করুন
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-emerald-900 text-white overflow-hidden py-20 px-6 lg:px-20">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#fbbf24 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <div className="inline-block bg-emerald-800/50 border border-emerald-600 px-4 py-1 rounded-full text-amber-400 text-sm font-semibold tracking-wider font-sans">
              খুলনা বিশ্ববিদ্যালয় সীরাত অলিম্পিয়াড - ২০২৬
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-[#fdfbf7]">
            রাসূলে আরাবি (সা.) 
              <br /> <span className="text-5xl text-amber-400"> এক মহাজীবনের মহাকাব্য পাঠ</span>
            </h1>
            <p className="text-emerald-100 text-lg lg:text-2xl max-w-lg leading-relaxed">
              নবী মুহাম্মদ ﷺ এর বরকতময় জীবন জানার এই যাত্রায় যোগ দিন। শিক্ষার্থী এবং শিক্ষকদের উভয়ে অংশগ্রহণ করতে পারবেন।
            </p>
            <div className="flex gap-4 pt-4 text-lg">
              <div className="flex items-center gap-2 text-emerald-200"><Users size={20} className="text-amber-400" /> সবার জন্য উন্মুক্ত</div>
              <div className="flex items-center gap-2 text-emerald-200"><Star size={20} className="text-amber-400" /> ১ম ২০ জনের জন্য থাকছে পুরষ্কার</div>
            </div>
          </div>

          {/* Archway Design */}
          <div className="flex justify-center lg:justify-end mt-10 lg:mt-0">
            <div className="bg-[#fdfbf7] p-8 rounded-t-full rounded-b-3xl w-[320px] shadow-2xl border-4 border-emerald-800/30 flex flex-col items-center text-center mt-12">
              <div className="bg-amber-100 p-4 rounded-full mb-6 mt-10">
                <BookOpen size={40} className="text-emerald-800" />
              </div>
              <h3 className="text-2xl font-bold text-emerald-900 mb-2">রেজিস্ট্রেশান পোর্টাল</h3>
              <p className="text-emerald-700 mb-8 text-base">আসন্ন প্রোগ্রামের জন্য আপনার আসন নিশ্চিত করুন এবং বই সংগ্রহ করুন।</p>
              <Link
                href="/register"
                className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg font-sans text-lg"
              >
                এখনই যুক্ত হোন <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About the Text Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto relative">
        <div className="bg-emerald-50/80 backdrop-blur-sm rounded-[2.5rem] p-8 lg:p-16 border border-emerald-100 shadow-lg relative overflow-hidden">

          <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none">
            <BookOpen size={300} className="text-emerald-900" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-12 h-1 bg-amber-400 rounded-full"></span>
                <h2 className="text-amber-600 font-bold tracking-wider text-lg font-sans">বইটি সম্পর্কে</h2>
              </div>

              <h3 className="text-3xl lg:text-5xl font-extrabold text-emerald-900 mb-6 tracking-tight">
               রাসূলে আরাবি ﷺ </h3>

              <div className="space-y-5 text-emerald-800/90 text-xl leading-relaxed">
                <p>
                  নবিজি ﷺ-এর জীবনী অত্যন্ত মহান ও মর্যাদাপূর্ণ একটি বিষয়। নবি ও রাসূল হিসেবে মুহাম্মাদ ﷺ-এর আগমন এবং ইসলামের উত্থান সম্পর্কে বিস্তারিত জানা যায় তাঁর সীরাত থেকে। অসহনীয় কষ্টের পর আল্লাহ কীভাবে সাফল্য দেন, তা উপলব্ধি করা যায় নবি ও সাহাবিদের জীবনী থেকে।

                  অন্য যে কারও জীবনীর চেয়ে নবিজীবন অধ্যয়নে শিক্ষা লাভ করা যায় অনেক অনেক বেশি। আল্লাহ তাআলা কীভাবে তাঁর নবিকে প্রস্তুত করলেন, মানুষের অন্তরে কীভাবে প্রোথিত করলেন তাঁর কিতাবের শিক্ষা, অনেক শক্তিশালী ও বিশাল বিশাল শত্রুদলের বিরুদ্ধে ছোট্ট একটি দলকে কেমন করে বিজয় দান করলেন, চারদিকে মিথ্যে আর পাপ-পঙ্কিলতার সয়লাবের মাঝে ইসলামের সত্য ও সৌন্দর্যকে কীভাবে সমুন্নত করলেন—এসবের মাঝে নিহিত রয়েছে বহু প্রজ্ঞা।</p>

                <p>
                  ‘রাসূলে আরাবী’ বইটি বিশুদ্ধ উৎসের ভিত্তিতে লেখা রাসূলুল্লাহ ﷺ-এর জীবনী। এই বইটি লিখতে লেখক সাহায্য নিয়েছেন কুরআন, বিশুদ্ধ তাফসীর, বিশুদ্ধ হাদীস এবং অন্যান্য বিশুদ্ধ সীরাহ-গ্রন্থের মতো বিশুদ্ধ উৎসের।                </p>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
              <div className="relative w-full max-w-[320px] aspect-2/3 transform hover:scale-105 transition-transform duration-500 shadow-2xl rounded-lg overflow-hidden border-4 border-white">
                <Image
                  src="/book-cover.jpg"
                  alt="রাসূল-ই-আরবী বইয়ের প্রচ্ছদ"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-amber-400/30 blur-3xl -z-10 rounded-full"></div>
            </div>

          </div>
        </div>
      </section>

      {/* Chapters Section */}
      <section className="pb-20 pt-10 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-emerald-900 mb-4">অধ্যায়ের শিরোনাম</h2>
          <div className="w-24 h-1 bg-amber-400 mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            "মুহাম্মাদ ﷺ-এর বেড়ে ওঠা, বংশ-পরিচয় ও নুবুওয়াতের পূর্বের ঘটনাগুলো",
            "নুবুওয়াত-প্রাপ্তি, আল্লাহর প্রতি আহ্বান ও আপতিত নিপীড়ন-নির্যাতন",
            "মদিনায় হিজরত",
            "সামরিক অভিযান (গযওয়া ও সারিয়্যাহ)",            
            "ফরজ হজ্জের বিধান (৯ম হিজরি) বিদায় হজ্জ (১০ম হিজরি)",
            "সুউচ্চ বন্ধুর পানে নবী ﷺ-এর যাত্রা",
            "নবিজীর পরিবার, গুণ ও আখলাকের বিবরণ"
          ].map((chapter, i) => {
            // Convert to a 2-digit format (01, 02) then transform to Bengali (০১, ০২)
            const chapterNum = (i + 1).toString().padStart(2, '0');
            const bengaliNum = toBengaliNumber(chapterNum);

            return (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100 hover:shadow-md transition-shadow group flex flex-col items-center text-center">
                <div className="text-5xl font-light text-emerald-200 mb-4 group-hover:text-amber-300 transition-colors font-kalpurush">
                অধ্যায়  {bengaliNum}
                </div>
                <h4 className="text-2xl font-bold text-emerald-900">{chapter}</h4>
              </div>
            );
          })}
        </div>
      </section>
    
     {/* Footer */}
      <footer className="w-full text-center py-8 text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} KUDC Exam Management System. Dedicated to Preserving Knowledge.</p>
      </footer>
    </div>

  );
}
