import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "motion/react";
import { personalInfo, categories } from "../data";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getOptimizedUrl } from "../utils/image";

// Custom Cursor Component
const Cursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'A' || (e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).closest('a') || (e.target as HTMLElement).closest('button')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-4 h-4 bg-[#c5a880] rounded-full pointer-events-none z-[9999] mix-blend-difference"
      animate={{
        x: mousePosition.x - 8,
        y: mousePosition.y - 8,
        scale: isHovering ? 4 : 1,
      }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
    />
  );
};

// Floating Image Component for Works List
const FloatingImage = ({ activeIndex, x, y }: { activeIndex: number | null, x: number, y: number }) => {
  return (
    <motion.div
      className="fixed pointer-events-none z-20 overflow-hidden rounded-lg w-[300px] h-[400px] md:w-[400px] md:h-[500px]"
      style={{ top: 0, left: 0 }}
      animate={{
        x: x + 20,
        y: y - 200,
        opacity: activeIndex !== null ? 1 : 0,
        scale: activeIndex !== null ? 1 : 0.8,
      }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {categories.map((cat, index) => (
        <img
          key={cat.id}
          src={getOptimizedUrl(cat.cover, 800)}
          alt={cat.title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${activeIndex === index ? 'opacity-100' : 'opacity-0'}`}
          referrerPolicy="no-referrer"
        />
      ))}
    </motion.div>
  );
};

export default function Home() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="bg-[#0a0a0a] text-[#e0e0e0] min-h-screen font-sans selection:bg-[#c5a880] selection:text-black cursor-none" ref={containerRef}>
      <Cursor />
      
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }} 
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-20 overflow-hidden pt-20">
        <div className="absolute top-10 right-10 md:top-20 md:right-20 flex flex-col items-end text-xs md:text-sm font-mono text-[#c5a880] opacity-60">
          <span>广州/佛山</span>
          <span>求职中</span>
          <span>{new Date().getFullYear()}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center z-10">
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-[12vw] md:text-[8vw] leading-[0.85] font-serif font-light tracking-tighter mix-blend-difference text-white mb-2">
              LIU <br />
              <span className="italic font-serif ml-[4vw] text-[#c5a880]">CHAOJIA</span>
            </h1>
            
            <div className="max-w-md pl-2 border-l border-[#c5a880]">
              <p className="text-lg md:text-xl font-light leading-relaxed text-white/70">
                专注 AIGC 视觉全案，从策略解构到营销海报呈现。以算法为试剂，精准萃取品牌内核，让数字像素也能传递品牌温度。
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative aspect-[3/4] w-full max-w-md mx-auto md:mr-0"
          >
             <div className="absolute inset-0 border border-[#c5a880]/30 rounded-full transform translate-x-4 translate-y-4" />
             <div className="relative w-full h-full rounded-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                <img 
                  src={getOptimizedUrl("https://github.com/liu378592655-rgb/AIGC/releases/download/AIGC/TX.png", 800)} 
                  alt="Liu Chaojia" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
             </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-12 flex justify-between items-end border-t border-white/10 pt-8"
        >
          <span className="text-[#c5a880] text-sm font-mono tracking-widest uppercase animate-pulse">
            ● 滑动探索
          </span>
        </motion.div>

        {/* Abstract Background Element */}
        <motion.div 
          style={{ y }}
          className="absolute right-[-10%] top-[20%] w-[40vw] h-[60vh] bg-gradient-to-b from-[#c5a880]/20 to-transparent blur-[100px] rounded-full pointer-events-none" 
        />
      </section>

      {/* Works List Section */}
      <section className="py-32 px-6 md:px-20 relative z-10" onMouseMove={handleMouseMove}>
        <div className="mb-20 flex items-end justify-between">
          <h2 className="text-sm font-mono text-[#c5a880] uppercase tracking-widest">精选作品 (05)</h2>
          <div className="h-[1px] flex-1 bg-white/10 mx-8 mb-2" />
        </div>

        <div className="flex flex-col">
          {categories.map((cat, index) => (
            <Link 
              key={cat.id}
              to={`/category/${cat.id}`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              className="group relative py-12 md:py-16 border-b border-white/10 flex items-center justify-between transition-colors hover:bg-white/5 px-4"
            >
              <div className="flex items-baseline gap-8 md:gap-16">
                <span className="font-mono text-sm text-white/30 group-hover:text-[#c5a880] transition-colors">
                  0{index + 1}
                </span>
                <h3 className="text-4xl md:text-7xl font-serif font-light group-hover:italic transition-all duration-500 text-white group-hover:translate-x-4">
                  {cat.title}
                </h3>
              </div>
              
              <div className="hidden md:flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-10 group-hover:translate-x-0">
                <span className="text-sm font-mono text-[#c5a880] uppercase tracking-widest mb-2">{cat.subtitle}</span>
                <ArrowUpRight className="text-white w-8 h-8" />
              </div>
            </Link>
          ))}
        </div>

        <FloatingImage activeIndex={activeIndex} x={mousePos.x} y={mousePos.y} />
      </section>

      {/* About / Personal Info Section */}
      <section className="py-32 px-6 md:px-20 bg-[#e0e0e0] text-[#0a0a0a]">
        <div className="grid md:grid-cols-12 gap-12">
          
          {/* Left Column: Profile Header */}
          <div className="md:col-span-4">
            <span className="block w-3 h-3 bg-[#0a0a0a] mb-8" />
            <h3 className="text-sm font-mono uppercase tracking-widest mb-12">个人简介</h3>
            
            <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden mb-8 grayscale hover:grayscale-0 transition-all duration-500">
               <img 
                  src={getOptimizedUrl("https://github.com/liu378592655-rgb/AIGC/releases/download/AIGC/TX.png", 800)} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
            </div>

            <div className="space-y-2 font-mono text-sm">
              <p className="font-bold">{personalInfo.name}</p>
              <p>{personalInfo.title}</p>
              <p className="text-[#c5a880]">{personalInfo.contact.email}</p>
            </div>
          </div>
          
          {/* Right Column: Detailed Info */}
          <div className="md:col-span-8">
            <h2 className="text-4xl md:text-6xl font-serif leading-[1.1] mb-16">
              "以算法为试剂，精准萃取品牌内核，让数字像素也能传递<span className="italic text-[#c5a880]">品牌温度</span>。"
            </h2>
            
            {/* Info Grid */}
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-16 border-t border-black/10 pt-12">
              
              {/* Basic Info */}
              <div>
                <h4 className="font-bold mb-6 uppercase tracking-wider text-sm border-b border-black/10 pb-2">基本信息</h4>
                <ul className="space-y-3 text-lg text-black/70">
                  {personalInfo.basic.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Intention */}
              <div>
                <h4 className="font-bold mb-6 uppercase tracking-wider text-sm border-b border-black/10 pb-2">求职意向</h4>
                <ul className="space-y-3 text-lg text-black/70">
                  <li className="flex justify-between">
                    <span>意向岗位</span>
                    <span className="text-black font-medium">{personalInfo.intention.role}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>期望薪资</span>
                    <span className="text-black font-medium">{personalInfo.intention.salary}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>期望城市</span>
                    <span className="text-black font-medium">{personalInfo.intention.city}</span>
                  </li>
                </ul>
              </div>

              {/* Advantages */}
              <div className="md:col-span-2">
                <h4 className="font-bold mb-8 uppercase tracking-wider text-sm border-b border-black/10 pb-2">个人优势</h4>
                <div className="grid md:grid-cols-2 gap-8">
                  {personalInfo.advantages.map((adv, i) => (
                    <div key={i} className="group">
                      <span className="block text-xs font-mono text-[#c5a880] mb-2">0{i + 1}</span>
                      <h5 className="text-xl font-bold mb-2 group-hover:text-[#c5a880] transition-colors">{adv.title}</h5>
                      <p className="text-black/60 text-sm leading-relaxed">{adv.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="md:col-span-2 bg-[#0a0a0a] text-[#e0e0e0] p-8 md:p-12 rounded-2xl mt-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div>
                    <h4 className="text-[#c5a880] font-mono text-xs uppercase tracking-widest mb-4">联系我</h4>
                    <p className="text-3xl font-serif">期待与您共创精彩。</p>
                  </div>
                  <div className="flex flex-col gap-2 text-right">
                    <a href={`mailto:${personalInfo.contact.email}`} className="text-xl hover:text-[#c5a880] transition-colors">
                      {personalInfo.contact.email}
                    </a>
                    <span className="text-white/50 font-mono">{personalInfo.contact.phone}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-20 border-t border-white/10 flex justify-between items-end text-white/30 text-xs font-mono uppercase">
        <div>
          &copy; {new Date().getFullYear()} LIU CHAOJIA
        </div>
        <div className="text-right">
          回到顶部
        </div>
      </footer>
    </div>
  );
}
