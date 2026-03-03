"use client";

import { useEffect, useState } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Loader2, LogOut, ArrowUpDown, Download } from "lucide-react";

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
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [data, setData] = useState<RegistrationData[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof RegistrationData; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      if (currentUser) {
        fetchData();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setLoginError("Invalid email or password.");
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
    const headers = ["Full Name", "Email", "Phone", "Gender", "Discipline", "User Type", "ID/Designation", "Buy Book", "TrxID"];
    
    const csvRows = data.map(row => {
      const identity = row.userType === "শিক্ষার্থী" ? row.studentId : row.designation;
      return [
        `"${row.fullName}"`,
        `"${row.email}"`,
        `"${row.phone}"`, // Keeping phone in English for CSV data integrity
        `"${row.gender}"`,
        `"${row.discipline}"`,
        `"${row.userType}"`,
        `"${identity || ""}"`,
        `"${row.buyBook}"`,
        `"${row.trxId || ""}"`
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

  if (loadingAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]"><Loader2 className="animate-spin text-emerald-800 w-10 h-10" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-6 font-kalpurush">
        <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-emerald-100">
          <h2 className="text-3xl font-bold text-emerald-900 mb-6 text-center">অ্যাডমিন লগইন</h2>
          {loginError && <p className="text-red-500 bg-red-50 p-3 rounded-lg text-lg mb-4 font-sans">{loginError}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-emerald-900 mb-1">অ্যাডমিন ইমেইল</label>
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
          <h2 className="text-2xl font-bold text-gray-800">সাম্প্রতিক নিবন্ধনসমূহ</h2>
          
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border text-lg text-gray-600">
              সর্বমোট সাবমিশন: <span className="font-bold text-emerald-700 font-sans">{toBengaliNumber(data.length)}</span>
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
                  <th className="p-4 font-medium">পুরো নাম</th>
                  <th className="p-4 font-medium">ধরন</th>
                  <th className="p-4 font-medium">ডিসিপ্লিন</th>
                  <th className="p-4 font-medium">ফোন নম্বর</th>
                  <th className="p-4 font-medium">বই?</th>
                  <th className="p-4 font-medium">TrxID</th>
                  <th className="p-4 font-medium">আইডি/পদবি</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-base">
                {loadingData ? (
                  <tr><td colSpan={7} className="text-center p-8"><Loader2 className="animate-spin mx-auto text-emerald-500" /></td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={7} className="text-center p-8 text-gray-500">কোনো নিবন্ধন পাওয়া যায়নি।</td></tr>
                ) : (
                  data.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{row.fullName}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${row.userType === "শিক্ষার্থী" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>
                          {row.userType}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{row.discipline}</td>
                      <td className="p-4 text-gray-600 font-sans">{toBengaliNumber(row.phone)}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${row.buyBook === "হ্যাঁ" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-800"}`}>
                          {row.buyBook}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 font-mono text-sm">{row.trxId || "-"}</td>
                      <td className="p-4 text-gray-500 text-sm font-sans">
                        {row.userType === "শিক্ষার্থী" ? `আইডি: ${toBengaliNumber(row.studentId || '')}` : `পদবি: ${row.designation}`}
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