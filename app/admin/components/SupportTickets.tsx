import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, CheckCircle, Clock, Trash2, Mail } from "lucide-react";
import toast from "react-hot-toast";

type Ticket = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt: any;
};

export default function SupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "support_tickets"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const docs: Ticket[] = [];
      snapshot.forEach((doc) => docs.push({ id: doc.id, ...doc.data() } as Ticket));
      setTickets(docs);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("টিকেট লোড করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const markAsResolved = async (id: string) => {
    try {
      await updateDoc(doc(db, "support_tickets", id), { status: "resolved" });
      toast.success("টিকেট সমাধান করা হয়েছে!");
      fetchTickets();
    } catch (error) {
      toast.error("সমস্যা হয়েছে!");
    }
  };

  const deleteTicket = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই মেসেজটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "support_tickets", id));
      toast.success("মেসেজটি মুছে ফেলা হয়েছে।");
      fetchTickets();
    } catch (error) {
      toast.error("ডিলিট করতে সমস্যা হয়েছে।");
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-emerald-600 w-10 h-10" /></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-linear-to-r from-blue-600 to-blue-500 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2"><Mail /> সাপোর্ট ইনবক্স</h2>
            <p className="text-blue-100 mt-1">শিক্ষার্থীদের প্রশ্ন এবং মতামত পরিচালনা করুন</p>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-lg font-bold">
            মোট মেসেজ: {tickets.length}
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {tickets.length === 0 ? (
            <p className="p-8 text-center text-gray-500">কোনো মেসেজ নেই।</p>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className={`p-6 transition-colors ${ticket.status === 'pending' ? 'bg-blue-50/30' : 'bg-white'}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{ticket.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${ticket.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                        {ticket.status === 'pending' ? 'অপেক্ষমাণ' : 'সমাধানকৃত'}
                      </span>
                    </div>
                    <p className="text-sm font-sans text-gray-500 mb-4">{ticket.email}</p>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {ticket.message}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-35">
                    <a href={`mailto:${ticket.email}`} className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                      <Mail size={16}/> রিপ্লাই দিন
                    </a>
                    {ticket.status === 'pending' && (
                      <button onClick={() => markAsResolved(ticket.id)} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                        <CheckCircle size={16}/> সমাধান করুন
                      </button>
                    )}
                    <button onClick={() => deleteTicket(ticket.id)} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors mt-2">
                      <Trash2 size={16}/> মুছুন
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}