"use client";

import { useEffect, useState } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Loader2, LogOut, BookOpen, LayoutDashboard, Mail, UserCheck } from "lucide-react";
import { ADMIN_EMAILS, RegistrationData } from "./types";
import StaffPortal from "./components/StaffPortal";
import DataTable from "./components/DataTable";
import CustomMailer from "./components/CustomMailer";

export default function AdminDashboardWrapper() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [data, setData] = useState<RegistrationData[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  
  // Added 'verification' to the available tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'mailer' | 'verification'>('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      if (currentUser && ADMIN_EMAILS.includes(currentUser.email || "")) {
        fetchData(); 
      }
    });
    return () => unsubscribe();
  }, []);

  const isSuperAdmin = ADMIN_EMAILS.includes(user?.email || "");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setLoginError("ভুল ইমেইল বা পাসওয়ার্ড।");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const docs: RegistrationData[] = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() } as RegistrationData);
      });
      setData(docs);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loadingAuth) return <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]"><Loader2 className="animate-spin text-emerald-800 w-10 h-10" /></div>;

  // --- Auth Screen ---
  if (!user) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-6 font-kalpurush">
        <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-emerald-100">
          <h2 className="text-3xl font-bold text-emerald-900 mb-6 text-center">সিস্টেম লগইন</h2>
          {loginError && <p className="text-red-500 bg-red-50 p-3 rounded-lg text-lg mb-4 font-sans">{loginError}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-emerald-900 mb-1">ইমেইল</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 border border-emerald-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-sans" />
            </div>
            <div>
              <label className="block text-lg font-medium text-emerald-900 mb-1">পাসওয়ার্ড</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 border border-emerald-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-sans" />
            </div>
            <button type="submit" disabled={isLoggingIn} className="w-full bg-emerald-800 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors flex justify-center items-center text-lg">
              {isLoggingIn ? <Loader2 className="animate-spin mr-2" size={20} /> : "লগইন করুন"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Staff View (Only sees the Verification Portal) ---
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 font-kalpurush flex flex-col">
        <nav className="bg-amber-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
          <h1 className="text-2xl font-bold">স্টাফ পোর্টাল - বই বিতরণ</h1>
          <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-amber-100 hover:text-white transition-colors text-lg">
            <LogOut size={18} /> লগআউট
          </button>
        </nav>
        <StaffPortal />
      </div>
    );
  }

  // --- Admin View (Sees all Tabs) ---
  return (
    <div className="min-h-screen bg-gray-50 font-kalpurush flex flex-col">
      <nav className="bg-emerald-900 text-white px-8 py-4 flex justify-between items-center shadow-lg relative z-20">
        <div className="flex items-center gap-3">
          <BookOpen className="text-amber-400" size={28} />
          <h1 className="text-2xl font-bold tracking-wide">অ্যাডমিন প্যানেল</h1>
        </div>
        <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-emerald-200 hover:text-white transition-colors text-lg">
          <LogOut size={18} /> লগআউট
        </button>
      </nav>

      {/* Admin Tab Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm px-8 pt-4 flex gap-8 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 pb-4 px-2 text-lg font-bold border-b-4 transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <LayoutDashboard size={20} /> ডেটা ড্যাশবোর্ড
        </button>
        <button 
          onClick={() => setActiveTab('mailer')}
          className={`flex items-center gap-2 pb-4 px-2 text-lg font-bold border-b-4 transition-all whitespace-nowrap ${activeTab === 'mailer' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Mail size={20} /> কাস্টম মেইল
        </button>
        <button 
          onClick={() => setActiveTab('verification')}
          className={`flex items-center gap-2 pb-4 px-2 text-lg font-bold border-b-4 transition-all whitespace-nowrap ${activeTab === 'verification' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <UserCheck size={20} /> বই বিতরণ ও যাচাই
        </button>
      </div>

      <main className="flex-1 p-8 overflow-auto">
        {/* Render the appropriate component based on the active tab */}
        {activeTab === 'dashboard' && <DataTable data={data} loadingData={loadingData} refreshData={fetchData} />}
        {activeTab === 'mailer' && <CustomMailer data={data} />}
        
        {/* Reusing the StaffPortal component for the Admin! */}
        {activeTab === 'verification' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StaffPortal />
          </div>
        )}
      </main>
    </div>
  );
}