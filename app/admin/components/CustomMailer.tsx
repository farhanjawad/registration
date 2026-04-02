// app/admin/components/CustomMailer.tsx
import { useState, useMemo } from "react";
import { RegistrationData, toBengaliNumber } from "../types";
import { Send, Filter, Users, Loader2, Info } from "lucide-react";

export default function CustomMailer({ data }: { data: RegistrationData[] }) {
  // Main Category
  const [mailAudience, setMailAudience] = useState<'all' | 'pending' | 'approved' | 'no-book'>('all');
  
  // New Advanced Filters
  const [mailGender, setMailGender] = useState<'all' | 'পুরুষ' | 'মহিলা'>('all');
  const [mailDiscipline, setMailDiscipline] = useState<string>('all');

  // Email Content
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [sendingBulkMail, setSendingBulkMail] = useState(false);

  // Automatically extract unique disciplines for the dropdown
  const uniqueDisciplines = useMemo(() => {
    const disciplines = data.map(item => item.discipline).filter(Boolean);
    return Array.from(new Set(disciplines)).sort();
  }, [data]);

  // Upgraded Filtering Logic: Checks Status, Gender, AND Discipline
  const targetUsers = data.filter(row => {
    if (!row.email) return false;
    
    // 1. Status/Book Filter
    if (mailAudience === 'pending' && (row.buyBook !== "হ্যাঁ" || row.status === "approved")) return false;
    if (mailAudience === 'approved' && row.status !== "approved") return false;
    if (mailAudience === 'no-book' && row.buyBook !== "না") return false;

    // 2. Gender Filter
    if (mailGender !== 'all' && row.gender !== mailGender) return false;

    // 3. Discipline Filter
    if (mailDiscipline !== 'all' && row.discipline !== mailDiscipline) return false;

    return true;
  });

  const handleSendCustomMail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetUsers.length === 0) return alert("এই ফিল্টারে কোনো ইমেইল পাওয়া যায়নি!");
    
    setSendingBulkMail(true);
    try {
      const response = await fetch('/api/send-custom-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipients: targetUsers, subject: mailSubject, body: mailBody }),
      });
      
      if (response.ok) {
        alert(`সফলভাবে ${targetUsers.length} জনকে পার্সোনালাইজড ইমেইল পাঠানো হয়েছে!`);
        setMailSubject("");
        setMailBody("");
      } else {
        alert("ইমেইল পাঠাতে সমস্যা হয়েছে।");
      }
    } catch (error) {
      console.error(error);
      alert("সার্ভার এরর।");
    } finally {
      setSendingBulkMail(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-linear-to-r from-amber-500 to-orange-400 p-8 text-white">
          <h2 className="text-3xl font-bold flex items-center gap-3"><Send size={28} /> কাস্টম ব্রডকাস্ট মেইল</h2>
          <p className="mt-2 text-amber-50 text-lg">আপনার ফিল্টার করা শিক্ষার্থীদের কাছে পার্সোনালাইজড ইমেইল পাঠান।</p>
        </div>
        
        <form onSubmit={handleSendCustomMail} className="p-8 space-y-6">
          
          {/* Main Category Filter */}
          <div>
            <label className="block text-gray-700 font-bold mb-3 text-lg items-center gap-2"><Filter size={18}/> প্রাথমিক ফিল্টার (Status):</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { val: 'all', label: 'সবাই' },
                { val: 'pending', label: 'পেমেন্ট পেন্ডিং' },
                { val: 'approved', label: 'পেমেন্ট অনুমোদিত' },
                { val: 'no-book', label: 'বই নিবে না' }
              ].map(opt => (
                <label key={opt.val} className={`border p-3 rounded-xl cursor-pointer text-center font-bold transition-all ${mailAudience === opt.val ? 'bg-amber-100 border-amber-400 text-amber-800 ring-2 ring-amber-400' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                  <input type="radio" name="audience" className="hidden" checked={mailAudience === opt.val} onChange={() => setMailAudience(opt.val as any)} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* New Advanced Filters (Gender & Discipline) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-base">লিঙ্গ (Gender):</label>
              <select 
                value={mailGender} 
                onChange={(e) => setMailGender(e.target.value as any)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-base font-sans bg-white cursor-pointer"
              >
                <option value="all">সব লিঙ্গ</option>
                <option value="পুরুষ">পুরুষ</option>
                <option value="মহিলা">মহিলা</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2 text-base">ডিসিপ্লিন (Discipline):</label>
              <select 
                value={mailDiscipline} 
                onChange={(e) => setMailDiscipline(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-base font-sans bg-white cursor-pointer"
              >
                <option value="all">সব ডিসিপ্লিন</option>
                {uniqueDisciplines.map(disc => (
                  <option key={disc} value={disc}>{disc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Recipient Count Indicator */}
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-center justify-between border border-emerald-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-200 p-2 rounded-full"><Users className="text-emerald-700" size={24}/></div>
              <span className="text-xl font-medium">নির্ধারিত প্রাপক সংখ্যা:</span>
            </div>
            <span className="text-3xl font-bold font-sans text-emerald-900">{toBengaliNumber(targetUsers.length)}</span>
          </div>

          {/* Shortcode Helper Guide */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-900 text-base">
            <h4 className="font-bold flex items-center gap-2 mb-2"><Info size={18}/> ব্যবহারযোগ্য শর্টকোড (Shortcodes)</h4>
            <p className="mb-2 text-blue-800">নিচের কোডগুলো মেসেজের ভেতর ব্যবহার করলে ইমেইল পাঠানোর সময় স্বয়ংক্রিয়ভাবে শিক্ষার্থীর তথ্য বসে যাবে:</p>
            <div className="flex flex-wrap gap-2 font-mono text-sm">
              <span className="bg-white px-2 py-1 rounded shadow-sm border border-blue-100 cursor-pointer hover:bg-blue-100" onClick={() => setMailBody(prev => prev + "{{fullName}}")}>{"{{fullName}}"}</span>
              <span className="bg-white px-2 py-1 rounded shadow-sm border border-blue-100 cursor-pointer hover:bg-blue-100" onClick={() => setMailBody(prev => prev + "{{email}}")}>{"{{email}}"}</span>
              <span className="bg-white px-2 py-1 rounded shadow-sm border border-blue-100 cursor-pointer hover:bg-blue-100" onClick={() => setMailBody(prev => prev + "{{phone}}")}>{"{{phone}}"}</span>
              <span className="bg-white px-2 py-1 rounded shadow-sm border border-blue-100 cursor-pointer hover:bg-blue-100" onClick={() => setMailBody(prev => prev + "{{discipline}}")}>{"{{discipline}}"}</span>
              <span className="bg-white px-2 py-1 rounded shadow-sm border border-blue-100 cursor-pointer hover:bg-blue-100" onClick={() => setMailBody(prev => prev + "{{userType}}")}>{"{{userType}}"}</span>
              <span className="bg-white px-2 py-1 rounded shadow-sm border border-blue-100 cursor-pointer hover:bg-blue-100" onClick={() => setMailBody(prev => prev + "{{id_designation}}")}>{"{{id_designation}}"}</span>
              <span className="bg-white px-2 py-1 rounded shadow-sm border border-blue-100 cursor-pointer hover:bg-blue-100" onClick={() => setMailBody(prev => prev + "{{verificationCode}}")}>{"{{verificationCode}}"}</span>
            </div>
            <p className="mt-2 text-xs text-blue-600 italic">* শর্টকোডগুলোতে ক্লিক করলেই মেসেজ বডিতে যুক্ত হয়ে যাবে।</p>
          </div>

          {/* Subject & Body */}
          <div>
            <label className="block text-gray-700 font-bold mb-2 text-lg">ইমেইল সাবজেক্ট (Subject)</label>
            <input type="text" required value={mailSubject} onChange={e => setMailSubject(e.target.value)} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-lg font-sans" placeholder="উদাঃ আপনার নিবন্ধনের আপডেট" />
          </div>
          
          <div>
            <label className="block text-gray-700 font-bold mb-2 text-lg">ইমেইল মেসেজ (Message Body)</label>
            <textarea required rows={8} value={mailBody} onChange={e => setMailBody(e.target.value)} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-lg font-sans resize-y leading-relaxed" 
            placeholder="আসসালামু আলাইকুম {{fullName}},&#10;&#10;আপনার ভেরিফিকেশন কোডটি হলো: {{verificationCode}}&#10;&#10;বই সংগ্রহের সময় কোডটি সাথে আনবেন।" />
          </div>

          <button type="submit" disabled={sendingBulkMail || targetUsers.length === 0} className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg text-xl disabled:opacity-50">
            {sendingBulkMail ? <><Loader2 className="animate-spin" /> পাঠানো হচ্ছে...</> : <><Send /> ইমেইল পাঠান</>}
          </button>
        </form>
      </div>
    </div>
  );
}