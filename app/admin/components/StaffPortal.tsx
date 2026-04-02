// app/admin/components/StaffPortal.tsx
import { useState } from "react";
import { collection, getDocs, query, updateDoc, doc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RegistrationData } from "../types";
import { Loader2, Search, BookOpen, CheckCircle } from "lucide-react";

export default function StaffPortal() {
  const [searchCode, setSearchCode] = useState("");
  const [staffSearchResult, setStaffSearchResult] = useState<RegistrationData | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearchCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchLoading(true);
    setStaffSearchResult(null);
    try {
      const q = query(collection(db, "registrations"), where("verificationCode", "==", searchCode));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        alert("এই কোড দিয়ে কোনো অনুমোদিত নিবন্ধন পাওয়া যায়নি!");
      } else {
        querySnapshot.forEach((doc) => setStaffSearchResult({ id: doc.id, ...doc.data() } as RegistrationData));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleBookHandover = async () => {
    if (!staffSearchResult) return;
    setSearchLoading(true);
    try {
      await updateDoc(doc(db, "registrations", staffSearchResult.id), { bookCollected: true });
      alert("বই সফলভাবে হস্তান্তর করা হয়েছে!");
      setStaffSearchResult({ ...staffSearchResult, bookCollected: true });
    } catch (error) {
      console.error(error);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-2xl mx-auto mt-10">
      <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-emerald-900 mb-6 text-center">শিক্ষার্থীর ভেরিফিকেশন কোড যাচাই করুন</h2>
        <form onSubmit={handleSearchCode} className="flex gap-4 mb-8">
          <input 
            type="text" value={searchCode} onChange={(e) => setSearchCode(e.target.value)} placeholder="উদাঃ 123456" required
            className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-xl text-center font-sans tracking-widest"
          />
          <button type="submit" disabled={searchLoading} className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 rounded-xl font-bold flex items-center gap-2 transition-colors text-lg disabled:opacity-70">
            {searchLoading ? <Loader2 className="animate-spin" /> : <Search />} খুঁজুন
          </button>
        </form>
        {staffSearchResult && (
          <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200 animate-in fade-in">
            <h3 className="text-xl font-bold text-emerald-900 mb-4 border-b border-emerald-200 pb-2">শিক্ষার্থীর বিবরণ</h3>
            <div className="space-y-2 text-lg text-emerald-800 mb-6">
              <p><strong>নাম:</strong> {staffSearchResult.fullName}</p>
              <p><strong>আইডি/পদবি:</strong> {staffSearchResult.studentId || staffSearchResult.designation}</p>
            </div>
            {staffSearchResult.bookCollected ? (
              <div className="bg-green-100 text-green-800 p-4 rounded-lg flex items-center justify-center gap-2 font-bold text-lg"><CheckCircle /> ইতিমধ্যে বই দেওয়া হয়েছে!</div>
            ) : (
              <button onClick={handleBookHandover} disabled={searchLoading} className="w-full bg-amber-500 hover:bg-amber-600 text-emerald-900 font-bold py-4 rounded-xl flex justify-center gap-2 text-xl shadow-md"><BookOpen /> বই হস্তান্তর নিশ্চিত করুন</button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}