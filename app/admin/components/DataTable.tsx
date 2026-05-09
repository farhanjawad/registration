// app/admin/components/DataTable.tsx
import { useState, useMemo } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RegistrationData, toBengaliNumber } from "../types";
import { Loader2, ArrowUpDown, Download, CheckCircle, Users, Clock, Filter } from "lucide-react";
import toast from "react-hot-toast";

interface DataTableProps {
  data: RegistrationData[];
  loadingData: boolean;
  refreshData: () => void;
}

export default function DataTable({ data, loadingData, refreshData }: DataTableProps) {
  // Filter States
  const [dataFilter, setDataFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'পুরুষ' | 'মহিলা'>('all');
  const [disciplineFilter, setDisciplineFilter] = useState<string>('all');
  
  const [sortConfig, setSortConfig] = useState<{ key: keyof RegistrationData; direction: 'asc' | 'desc' } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Automatically extract unique disciplines from the data for our dropdown
  const uniqueDisciplines = useMemo(() => {
    const disciplines = data.map(item => item.discipline).filter(Boolean);
    return Array.from(new Set(disciplines)).sort();
  }, [data]);

  // Combined Filtering Logic
  const filteredData = data.filter(row => {
    // 1. Status Filter
    if (dataFilter === 'pending' && (row.buyBook !== "হ্যাঁ" || row.status === "approved")) return false;
    if (dataFilter === 'approved' && row.status !== "approved") return false;

    // 2. Gender Filter
    if (genderFilter !== 'all' && row.gender !== genderFilter) return false;

    // 3. Discipline Filter
    if (disciplineFilter !== 'all' && row.discipline !== disciplineFilter) return false;

    return true;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: keyof RegistrationData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const handleApprovePayment = async (row: RegistrationData) => {
    setActionLoading(row.id);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await updateDoc(doc(db, "registrations", row.id), {
        status: "approved",
        verificationCode: code,
        bookCollected: false
      });
      await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: row.email, name: row.fullName, code: code }),
      });
      toast.success("পেমেন্ট অনুমোদিত হয়েছে এবং ইমেইলে কোড পাঠানো হয়েছে!");
      refreshData(); 
    } catch (error) {
      console.error(error);
      toast.error("কোনো সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    } finally {
      setActionLoading(null);
    }
  };

  const exportToCSV = () => {
    const headers = ["Full Name", "Email", "Phone", "Gender", "Discipline", "User Type", "ID/Designation", "Buy Book", "TrxID", "Status", "Verification Code", "Book Collected"];
    const csvRows = sortedData.map(row => {
      const identity = row.userType === "শিক্ষার্থী" ? row.studentId : row.designation;
      return [
        `"${row.fullName}"`, `"${row.email}"`, `"${row.phone}"`, `"${row.gender}"`, `"${row.discipline}"`, `"${row.userType}"`,
        `"${identity || ""}"`, `"${row.buyBook}"`, `"${row.trxId || ""}"`, `"${row.status === "approved" ? "Approved" : "Pending"}"`,
        `"${row.verificationCode || ""}"`, `"${row.bookCollected ? "Yes" : "No"}"`
      ].join(",");
    });
    const csvContent = "\uFEFF" + [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `student_data_${dataFilter}_${genderFilter}.csv`;
    link.click();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Filters & Export Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        
        {/* Advanced Filters Area */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Buttons */}
          <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
            <button onClick={() => setDataFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${dataFilter === 'all' ? 'bg-emerald-100 text-emerald-800' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Users size={16} /> সব ডেটা
            </button>
            <button onClick={() => setDataFilter('pending')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${dataFilter === 'pending' ? 'bg-amber-100 text-amber-800' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Clock size={16} /> পেন্ডিং
            </button>
            <button onClick={() => setDataFilter('approved')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${dataFilter === 'approved' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-50'}`}>
              <CheckCircle size={16} /> অনুমোদিত
            </button>
          </div>

          {/* Gender Dropdown */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm px-3 py-1">
            <Filter size={16} className="text-gray-400 mr-2" />
            <select 
              value={genderFilter} 
              onChange={(e) => setGenderFilter(e.target.value as any)}
              className="bg-transparent text-sm font-bold text-gray-700 outline-none py-1 cursor-pointer"
            >
              <option value="all">সব লিঙ্গ</option>
              <option value="পুরুষ">পুরুষ</option>
              <option value="মহিলা">মহিলা</option>
            </select>
          </div>

          {/* Discipline Dropdown */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm px-3 py-1 max-w-200">
            <Filter size={16} className="text-gray-400 mr-2 shrink-0" />
            <select 
              value={disciplineFilter} 
              onChange={(e) => setDisciplineFilter(e.target.value)}
              className="bg-transparent text-sm font-bold text-gray-700 outline-none py-1 cursor-pointer w-full truncate"
            >
              <option value="all">সব ডিসিপ্লিন</option>
              {uniqueDisciplines.map(disc => (
                <option key={disc} value={disc}>{disc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Counter and Download */}
        <div className="flex items-center gap-4">
          <div className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 text-emerald-800 text-lg">
            মোট: <span className="font-bold font-sans">{toBengaliNumber(sortedData.length)}</span>
          </div>
          <button onClick={exportToCSV} disabled={sortedData.length === 0} className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50 whitespace-nowrap">
            <Download size={18} /> CSV ডাউনলোড
          </button>
        </div>
      </div>

      {/* Expanded Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                {[
                  { key: "fullName", label: "নাম" },
                  { key: "gender", label: "লিঙ্গ" },
                  { key: "discipline", label: "ডিসিপ্লিন" },
                  { key: "userType", label: "ধরন" },
                  { key: "email", label: "ইমেইল" },
                  { key: "phone", label: "ফোন" },
                  { key: "buyBook", label: "বই?" },
                  { key: "trxId", label: "TrxID" },
                  { key: "status", label: "অবস্থা" }
                ].map(({ key, label }) => (
                  <th key={key} className="p-4 font-medium cursor-pointer hover:bg-gray-100" onClick={() => handleSort(key as keyof RegistrationData)}>
                    <div className="flex items-center gap-1">{label} <ArrowUpDown size={14} className="text-gray-400" /></div>
                  </th>
                ))}
                <th className="p-4 font-medium text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-base">
              {loadingData ? (
                <tr><td colSpan={10} className="text-center p-8"><Loader2 className="animate-spin mx-auto text-emerald-500" /></td></tr>
              ) : sortedData.length === 0 ? (
                <tr><td colSpan={10} className="text-center p-8 text-gray-500">কোনো ডেটা পাওয়া যায়নি।</td></tr>
              ) : (
                sortedData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{row.fullName}</td>
                    <td className="p-4 text-gray-600">{row.gender}</td>
                    <td className="p-4 text-gray-600 max-w-50 truncate" title={row.discipline}>{row.discipline}</td>
                    
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium w-max ${row.userType === "শিক্ষার্থী" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>
                          {row.userType}
                        </span>
                        <span className="text-xs text-gray-500 font-sans">{row.userType === "শিক্ষার্থী" ? row.studentId : row.designation}</span>
                      </div>
                    </td>
                    
                    <td className="p-4 text-gray-600 font-sans text-sm">{row.email}</td>
                    <td className="p-4 text-gray-600 font-sans">{toBengaliNumber(row.phone)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.buyBook === "হ্যাঁ" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-800"}`}>{row.buyBook}</span>
                    </td>
                    <td className="p-4 text-gray-600 font-mono text-sm">{row.trxId || "-"}</td>
                    <td className="p-4">
                      {row.buyBook === "হ্যাঁ" ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {row.status === "approved" ? "অনুমোদিত" : "পেন্ডিং"}
                          </span>
                      ) : <span className="text-gray-400 text-sm">প্রযোজ্য নয়</span>}
                    </td>
                    <td className="p-4 text-center">
                      {row.buyBook === "হ্যাঁ" && row.status !== "approved" && (
                        <button onClick={() => handleApprovePayment(row)} disabled={actionLoading === row.id} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-sm font-bold flex justify-center mx-auto disabled:opacity-50">
                          {actionLoading === row.id ? <Loader2 className="animate-spin h-4 w-4" /> : "অনুমোদন করুন"}
                        </button>
                      )}
                      {row.status === "approved" && (
                        <div className="text-green-600 font-bold flex flex-col items-center text-xs">
                          <CheckCircle size={16} /> <span className="mt-1">{row.bookCollected ? "বই দেওয়া হয়েছে" : "বই দেওয়া বাকি"}</span>
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
    </div>
  );
}