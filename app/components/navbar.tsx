
"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Menu, X } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Close menu when a link is clicked
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-white backdrop-blur-md border-b border-emerald-100 font-kalpurush shadow-sm ">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        <div className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
          <span>খুলনা বিশ্ববিদ্যালয় সীরাত অলিম্পিয়াড </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-lg font-medium text-emerald-800">
          <Link href="/" className="hover:text-amber-600 transition-colors">হোম</Link>
          <Link href="/faq" className="hover:text-amber-600 transition-colors">জিজ্ঞাসা</Link>
          <Link href="/support" className="hover:text-amber-600 transition-colors">যোগাযোগ</Link>
          <Link href="/privacy" className="hover:text-amber-600 transition-colors">পলিসি</Link>
        </nav>

        {/* Desktop Call to Action */}
        <div className="hidden md:flex items-center gap-4">
  
          <Link 
            href="/register" 
            className="bg-emerald-800 hover:bg-emerald-700 text-white px-6 py-2 rounded-full font-bold transition-all shadow-md font-sans"
          >
            নিবন্ধন করুন
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          className="md:hidden text-emerald-900 p-2" 
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-emerald-100 shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen ? "max-h-100 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col px-6 py-4 space-y-4 text-lg font-medium text-emerald-800 text-center">
          <Link href="/" className="pb-2 border-b border-emerald-50" onClick={closeMenu}>হোম</Link>
          <Link href="/faq" className="pb-2 border-b border-emerald-50" onClick={closeMenu}>সাধারণ জিজ্ঞাসা</Link>
          <Link href="/support" className="pb-2 border-b border-emerald-50" onClick={closeMenu}>যোগাযোগ</Link>
          <Link href="/privacy" className="pb-2 border-b border-emerald-50" onClick={closeMenu}>প্রাইভেসি পলিসি</Link>
          
          <div className="flex flex-col gap-3 pt-4">
            <Link 
              href="/register" 
              className="bg-emerald-800 text-white py-3 rounded-xl font-bold font-sans"
              onClick={closeMenu}
            >
              নিবন্ধন করুন
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
