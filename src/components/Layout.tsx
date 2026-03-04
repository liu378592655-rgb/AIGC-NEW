import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { personalInfo } from "../data";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-[#1a2622] text-[#e2e8f0] font-sans selection:bg-[#c5a880] selection:text-[#1a2622]">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a2622]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-widest uppercase text-[#c5a880]">
            {personalInfo.name} <span className="text-sm font-normal text-white/50 ml-2">Portfolio</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wider">
            <Link to="/" className="hover:text-[#c5a880] transition-colors">首页 HOME</Link>
            <a href="#about" className="hover:text-[#c5a880] transition-colors">关于 ABOUT</a>
            <a href="#works" className="hover:text-[#c5a880] transition-colors">作品 WORKS</a>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white/80 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-[#1a2622] border-b border-white/5 overflow-hidden"
            >
              <div className="px-6 py-4 flex flex-col gap-4 text-sm font-medium tracking-wider">
                <Link to="/" className="hover:text-[#c5a880] transition-colors">首页 HOME</Link>
                <a href="/#about" className="hover:text-[#c5a880] transition-colors">关于 ABOUT</a>
                <a href="/#works" className="hover:text-[#c5a880] transition-colors">作品 WORKS</a>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-[#111a17] py-12 border-t border-white/5 mt-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-[#c5a880] mb-2">{personalInfo.name}</h3>
            <p className="text-sm text-white/50">{personalInfo.title} • AIGC Designer</p>
          </div>
          <div className="flex gap-6 text-sm text-white/60">
            <span>{personalInfo.contact.phone}</span>
            <span>{personalInfo.contact.email}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
