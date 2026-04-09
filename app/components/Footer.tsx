// components/Footer.tsx
import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-emerald-950 text-emerald-50 border-t border-emerald-900 font-kalpurush">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 border-b border-emerald-800/50 pb-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-2xl font-bold text-white">
              <BookOpen className="text-amber-500" />
              <span>খুলনা বিশ্ববিদ্যালয় দ্বীনি কমিউনিটি</span>
            </div>
            <p className="text-emerald-200/80 text-lg max-w-sm leading-relaxed">
              নবী মুহাম্মদ (সাঃ) এর বরকতময় জীবনের উপর বিস্তর অধ্যয়ন। আমাদের লক্ষ্য হলো সিরাত চর্চাকে সবার মাঝে ছড়িয়ে দেওয়া।
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-amber-500 mb-4">প্রয়োজনীয় লিংক</h3>
            <ul className="space-y-3 text-lg">
              <li>
                <Link href="/faq" className="hover:text-amber-400 transition-colors">সাধারণ জিজ্ঞাসা (FAQ)</Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-amber-400 transition-colors">যোগাযোগ ও সাপোর্ট</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-amber-400 transition-colors">প্রাইভেসি পলিসি</Link>
              </li>
            </ul>
          </div>

          {/* Admin Link (Optional, for easy access) */}
          <div>
            <h3 className="text-xl font-bold text-amber-500 mb-4">সোস্যাল মিডিয়া</h3>
            <ul className="space-y-3 text-lg">
              <li>
                <Link href="https://www.facebook.com/profile.php?id=61566289485542" className="hover:text-amber-400 transition-colors">ফেসবুক</Link>
              </li>
            </ul>
          </div>
        </div>

          {/* Footer */}
      <div className="w-full text-center py-8 text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} KUDC Exam Management System. Dedicated to Preserving Knowledge.</p>
      </div>
      </div>
    </footer>
  );
}