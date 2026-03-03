// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, getDocs, query, orderBy, updateDoc, doc, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Loader2, LogOut, ArrowUpDown, Download, CheckCircle, Search, BookOpen } from "lucide-react";

// Add your main admin email(s) here. Anyone else who logs in will be treated as "Staff".
const ADMIN_EMAILS = ["230540@ku.ac.bd"];

type RegistrationData = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  discipline: string;
  userType: string;
  studentId?: string;
  designation?: string;
  buyBook: string;
  trxId?: string;
  status: string;
  verificationCode?: string;
  bookCollected?: boolean;
  createdAt: any; 
};

// Helper function to convert English numbers to Bengali
const toBengaliNumber = (num: number | string) => {
  if (!num) return "";
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (digit) => bengaliDigits[Number(digit)]);
};

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  // Login States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin Data States
  const [data, setData] = useState<RegistrationData[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof RegistrationData; direction: 'asc' | 'desc' } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Staff States
  const [searchCode, setSearchCode] = useState("");
  const [staffSearchResult, setStaffSearchResult] = useState<RegistrationData | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      // Only fetch all data if the user is a super admin
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

  const handleSort = (key: keyof RegistrationData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedData = [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setData(sortedData);
  };

  const exportToCSV = () => {
    const headers = ["Full Name", "Email", "Phone", "Gender", "Discipline", "User Type", "ID/Designation", "Buy Book", "TrxID", "Status", "Verification Code", "Book Collected"];
    
    const csvRows = data.map(row => {
      const identity = row.userType === "শিক্ষার্থী" ? row.studentId : row.designation;
      return [
        `"${row.fullName}"`,
        `"${row.email}"`,
        `"${row.phone}"`, 
        `"${row.gender}"`,
        `"${row.discipline}"`,
        `"${row.userType}"`,
        `"${identity || ""}"`,
        `"${row.buyBook}"`,
        `"${row.trxId || ""}"`,
        `"${row.status === "approved" ? "Approved" : "Pending"}"`,
        `"${row.verificationCode || ""}"`,
        `"${row.bookCollected ? "Yes" : "No"}"`
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "student_registrations.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Admin Logic: Approve Payment & Send Email ---
  const handleApprovePayment = async (row: RegistrationData) => {
    setActionLoading(row.id);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      await updateDoc(doc(db, "registrations", row.id), {
        status: "approved",
        verificationCode: code,
        bookCollected: false
      });

      await fetch('/api/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: row.email, name: row.fullName, code: code }),
      });

      alert("পেমেন্ট অনুমোদিত হয়েছে এবং ইমেইলে কোড পাঠানো হয়েছে!");
      fetchData(); 
    } catch (error) {
      console.error(error);
      alert("কোনো সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    } finally {
      setActionLoading(null);
    }
  };

  // --- Staff Logic: Search Code & Handover Book ---
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
        querySnapshot.forEach((doc) => {
          setStaffSearchResult({ id: doc.id, ...doc.data() } as RegistrationData);
        });
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
      await updateDoc(doc(db, "registrations", staffSearchResult.id), {
        bookCollected: true
      });
      alert("বই সফলভাবে হস্তান্তর করা হয়েছে!");
      setStaffSearchResult({ ...staffSearchResult, bookCollected: true });
    } catch (error) {
      console.error(error);
    } finally {
      setSearchLoading(false);
    }
  };

  if (loadingAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]"><Loader2 className="animate-spin text-emerald-800 w-10 h-10" /></div>;
  }

  // --- Login Screen ---
  if (!user) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-6 font-kalpurush">
        <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-emerald-100">
          <h2 className="text-3xl font-bold text-emerald-900 mb-6 text-center">সিস্টেম লগইন</h2>
          {loginError && <p className="text-red-500 bg-red-50 p-3 rounded-lg text-lg mb-4 font-kalpuprush">{loginError}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-emerald-900 mb-1">ইমেইল</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 border border-emerald-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-kalpuprush" />
            </div>
            <div>
              <label className="block text-lg font-medium text-emerald-900 mb-1">পাসওয়ার্ড</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 border border-emerald-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-kalpuprush" />
            </div>
            <button type="submit" disabled={isLoggingIn} className="w-full bg-emerald-800 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors flex justify-center items-center text-lg">
              {isLoggingIn ? <Loader2 className="animate-spin mr-2" size={20} /> : "লগইন করুন"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Staff View (Only for Book Distribution) ---
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 font-kalpurush">
        <nav className="bg-amber-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
          <h1 className="text-2xl font-bold">পোর্টাল - বই বিতরণ</h1>
          <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-amber-100 hover:text-white transition-colors text-lg">
            <LogOut size={18} /> লগআউট
          </button>
        </nav>

        <main className="p-8 max-w-2xl mx-auto mt-10">
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold text-emerald-900 mb-6 text-center">শিক্ষার্থীর ভেরিফিকেশন কোড যাচাই করুন</h2>
            
            <form onSubmit={handleSearchCode} className="flex gap-4 mb-8">
              <input 
                type="text" 
                value={searchCode} 
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="উদাঃ 123456" 
                required
                className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-xl text-center font-kalpuprush tracking-widest"
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
                  <p><strong>ধরন:</strong> {staffSearchResult.userType}</p>
                  <p><strong>আইডি/পদবি:</strong> {staffSearchResult.studentId || staffSearchResult.designation}</p>
                  <p><strong>ডিসিপ্লিন:</strong> {staffSearchResult.discipline}</p>
                </div>
                
                {staffSearchResult.bookCollected ? (
                  <div className="bg-green-100 text-green-800 p-4 rounded-lg flex items-center justify-center gap-2 font-bold text-lg">
                    <CheckCircle /> এই শিক্ষার্থীকে ইতিমধ্যে বই দেওয়া হয়েছে!
                  </div>
                ) : (
                  <button 
                    onClick={handleBookHandover}
                    disabled={searchLoading}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-emerald-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-xl shadow-md"
                  >
                    <BookOpen /> বই হস্তান্তর নিশ্চিত করুন
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // --- Admin View (Payment Verification Table) ---
  return (
    <div className="min-h-screen bg-gray-50 font-kalpurush">
      <nav className="bg-emerald-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">অ্যাডমিন ড্যাশবোর্ড</h1>
        <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-emerald-200 hover:text-white transition-colors text-lg">
          <LogOut size={18} /> লগআউট
        </button>
      </nav>

      <main className="p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">নিবন্ধনসমূহ</h2>
          
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border text-lg text-gray-600">
              সর্বমোট সাবমিশন: <span className="font-bold text-emerald-700 font-kalpuprush">{toBengaliNumber(data.length)}</span>
            </div>
            
            <button 
              onClick={exportToCSV}
              disabled={data.length === 0}
              className="bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              <Download size={18} /> CSV ডাউনলোড
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-lg">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  {[
                    { key: "fullName", label: "পুরো নাম" },
                    { key: "phone", label: "ফোন নম্বর" },
                    { key: "gender", label: "লিঙ্গ" },
                    { key: "discipline", label: "ডিসিপ্লিন" },
                    { key: "userType", label: "ধরন" },
                    { key: "studentId", label: "আইডি/পদবি" },
                    { key: "buyBook", label: "বই?" },
                    { key: "trxId", label: "TrxID" },
                    { key: "status", label: "পেমেন্ট অবস্থা" }
                  ].map(({ key, label }) => (
                    <th key={key} className="p-4 font-medium cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort(key as keyof RegistrationData)}>
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        {label} <ArrowUpDown size={14} className="text-gray-400" />
                      </div>
                    </th>
                  ))}
                  <th className="p-4 font-medium text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-base">
                {loadingData ? (
                  <tr><td colSpan={6} className="text-center p-8"><Loader2 className="animate-spin mx-auto text-emerald-500" /></td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={6} className="text-center p-8 text-gray-500">কোনো নিবন্ধন পাওয়া যায়নি।</td></tr>
                ) : (
                  data.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{row.fullName}</td>
                      <td className="p-4 text-gray-600 font-kalpuprush">{toBengaliNumber(row.phone)}</td>
                      <td className="p-4 text-gray-600 font-kalpuprush">{row.gender}</td>
                      <td className="p-4 text-gray-600 font-kalpuprush">{row.discipline}</td>
                      <td className="p-4 text-gray-600 font-kalpuprush">{row.userType}</td>
                      <td className="p-4 text-gray-600 font-kalpuprush">{row.studentId}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${row.buyBook === "হ্যাঁ" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-800"}`}>
                          {row.buyBook}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 font-mono text-sm">{row.trxId || "-"}</td>
                      
                      <td className="p-4">
                        {row.buyBook === "হ্যাঁ" ? (
                           <span className={`px-3 py-1 rounded-full text-sm font-medium ${row.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                             {row.status === "approved" ? "অনুমোদিত" : "পেন্ডিং"}
                           </span>
                        ) : (
                          <span className="text-gray-400 text-sm">প্রযোজ্য নয়</span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        {row.buyBook === "হ্যাঁ" && row.status !== "approved" && (
                          <button 
                            onClick={() => handleApprovePayment(row)}
                            disabled={actionLoading === row.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center mx-auto transition-colors disabled:opacity-50"
                          >
                            {actionLoading === row.id ? <Loader2 className="animate-spin h-4 w-4" /> : "অনুমোদন করুন"}
                          </button>
                        )}
                        {row.status === "approved" && (
                          <div className="text-green-600 font-bold flex flex-col items-center text-sm">
                            <CheckCircle size={18} />
                            <span className="text-xs text-gray-500 mt-1">{row.bookCollected ? "বই দেওয়া হয়েছে" : "বই দেওয়া বাকি"}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}