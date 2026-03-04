import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { categories } from "../data";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, useVelocity, useAnimationFrame } from "motion/react";
import { ArrowLeft, X, ZoomIn, ArrowRight } from "lucide-react";
import { isVideo, getOptimizedUrl } from "../utils/image";

const AutoScrollModal = ({ 
  image, 
  onNext, 
  onClose, 
  total, 
  index 
}: { 
  image: { id: string | number, url: string, title: string }, 
  onNext: () => void, 
  onClose: () => void,
  total: number,
  index: number
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isNavigating = useRef(false);
  const [progress, setProgress] = useState(0);
  const [isScrollable, setIsScrollable] = useState(true);

  // Reset state on image change
  useEffect(() => {
    isNavigating.current = false;
    setProgress(0);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [image.id]);

  // Handle video ending
  const handleVideoEnded = () => {
    if (!isNavigating.current) {
      isNavigating.current = true;
      setTimeout(onNext, 500);
    }
  };

  // Auto scroll logic
  useAnimationFrame((t, delta) => {
    const el = containerRef.current;
    if (!el || isNavigating.current) return;

    // Check if scrollable
    if (el.scrollHeight <= el.clientHeight + 1) {
      if (isScrollable) setIsScrollable(false);
      return;
    }

    if (!isScrollable) setIsScrollable(true);

    // Auto scroll speed (pixels per ms * delta)
    // Adjust speed here. 0.08 is roughly 80px/sec
    const speed = 0.08 * delta;
    el.scrollTop += speed;

    // Update progress
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll > 0) {
      setProgress(Math.min(el.scrollTop / maxScroll, 1));
    }

    // Check if reached bottom
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
      if (!isNavigating.current) {
        isNavigating.current = true;
        setTimeout(onNext, 1000); // Wait 1s at bottom before next
      }
    }
  });

  // Fallback for non-scrollable images
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    const checkTimer = setInterval(() => {
      if (isNavigating.current) return;
      if (isVideo(image.url)) return; // Video handled by onEnded

      if (el.scrollHeight <= el.clientHeight + 1) {
        // Not scrollable, wait 3s then next
        if (!isNavigating.current) {
          isNavigating.current = true;
          setTimeout(onNext, 3000);
        }
      }
    }, 1000);

    return () => clearInterval(checkTimer);
  }, [image, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black overflow-hidden"
    >
      {/* Close Button */}
      <button 
        className="fixed top-6 right-6 md:top-8 md:right-8 text-white/50 hover:text-[#c5a880] transition-colors p-2 z-[110] bg-black/20 rounded-full backdrop-blur-sm"
        onClick={onClose}
      >
        <X size={32} />
      </button>

      {/* Scroll Container */}
      <div 
        ref={containerRef}
        className="w-full h-full overflow-y-auto no-scrollbar"
        style={{ scrollBehavior: 'auto' }}
      >
        <div className="w-full min-h-full flex flex-col items-center">
          {isVideo(image.url) ? (
            <div className="w-full h-screen flex items-center justify-center bg-black">
              <video
                src={image.url}
                className="w-full h-full object-contain"
                autoPlay
                playsInline
                muted={false}
                onEnded={handleVideoEnded}
              />
            </div>
          ) : (
            <div className="w-full max-w-4xl mx-auto bg-black min-h-screen relative">
               <img 
                src={getOptimizedUrl(image.url, 1920)} 
                alt={image.title}
                className="w-full h-auto block"
                referrerPolicy="no-referrer"
              />
              <div className="p-12 text-center pb-32">
                 <h2 className="text-3xl font-bold text-white mb-2">{image.title}</h2>
                 <p className="text-[#c5a880] font-mono text-sm tracking-widest uppercase">
                   {index + 1} / {total}
                 </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar (Scroll Progress) */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-white/10 z-[110]">
        <motion.div
          className="h-full bg-[#c5a880]"
          style={{ width: `${progress * 100}%` }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ ease: "linear", duration: 0.1 }}
        />
      </div>
    </motion.div>
  );
};

export default function Category() {
  const { id } = useParams();
  const category = categories.find((c) => c.id === id);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  // Horizontal scroll logic
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollX = useMotionValue(0);
  const scrollXSpring = useSpring(scrollX, { damping: 50, stiffness: 400 });
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Calculate scroll constraints
  useEffect(() => {
    const calculateConstraints = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.scrollWidth;
        const windowWidth = window.innerWidth;
        // If content is wider than window, allow scrolling
        // Negative value because we translate left
        const maxScroll = -(containerWidth - windowWidth + 200); // Extra padding
        setConstraints({ left: maxScroll, right: 0 });
      }
    };

    calculateConstraints();
    window.addEventListener("resize", calculateConstraints);
    // Recalculate after a short delay to ensure images/layout are ready
    const timer = setTimeout(calculateConstraints, 500);
    
    return () => {
      window.removeEventListener("resize", calculateConstraints);
      clearTimeout(timer);
    };
  }, [category]);

  // Map vertical wheel to horizontal scroll
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Only hijack scroll if no modal is open
      if (selectedIndex !== null) return;

      // Determine if we should scroll horizontally
      // If we are at the boundaries, we might want to allow normal vertical scroll?
      // For this specific "immersive" design, usually we lock vertical scroll 
      // and map it purely to horizontal movement for the gallery section.
      
      const newX = scrollX.get() - e.deltaY;
      // Clamp value
      const clampedX = Math.max(constraints.left, Math.min(constraints.right, newX));
      scrollX.set(clampedX);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [constraints, selectedIndex, scrollX]);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#1a2622]">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Category Not Found</h1>
          <Link to="/" className="text-[#c5a880] hover:underline flex items-center gap-2 justify-center">
            <ArrowLeft size={20} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Generate images or use custom ones
  const generatedImages = Array.from({ length: 10 }).map((_, i) => ({
    id: `gen-${i}`,
    url: `https://picsum.photos/seed/${category.seed}${i + 1}/800/1200`,
    title: `${category.title} 作品 ${i + 1}`
  }));

  const customImages = (category as any).customImages || [];
  const images = customImages.length > 0 ? customImages : generatedImages;
  
  const currentImage = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#1a2622] text-[#f4f1eb] relative">
      
      {/* Background Ambient */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <img 
          src={getOptimizedUrl(category.cover, 1920)} 
          alt="" 
          className="w-full h-full object-cover blur-3xl scale-110"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Header / Nav */}
      <header className="fixed top-0 left-0 w-full z-40 p-8 flex justify-between items-start pointer-events-none">
        <Link 
          to="/#works" 
          className="pointer-events-auto inline-flex items-center gap-3 text-white/70 hover:text-[#c5a880] transition-colors group"
        >
          <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#c5a880] transition-colors">
            <ArrowLeft size={16} />
          </div>
          <span className="uppercase tracking-widest text-xs font-medium">Back to Works</span>
        </Link>

        <div className="text-right">
          <h2 className="text-[#c5a880] text-xs font-bold tracking-[0.3em] uppercase mb-1">
            {category.subtitle}
          </h2>
          <h1 className="text-4xl font-bold tracking-tighter text-white">
            {category.title}
          </h1>
        </div>
      </header>

      {/* Horizontal Scroll Container */}
      <div className="h-full w-full flex items-center">
        <motion.div 
          ref={containerRef}
          style={{ x: scrollXSpring }}
          className="flex items-center gap-12 px-[15vw] h-[60vh]"
        >
          {/* Intro Text Card */}
          <div className="min-w-[400px] max-w-[400px] mr-12">
            <h3 className="text-6xl font-serif italic mb-6 text-white/90">
              Collection
            </h3>
            <p className="text-lg text-white/60 font-light leading-relaxed">
              探索AIGC在{category.title}领域的创新应用，结合商业需求与前沿审美，打造高品质视觉体验。
            </p>
            <div className="mt-8 flex items-center gap-4 text-[#c5a880] text-sm tracking-widest uppercase opacity-60">
              <ArrowRight size={16} />
              <span>Scroll to explore</span>
            </div>
          </div>

          {/* Image Cards */}
          {images.map((img, idx) => (
            <motion.div
              key={img.id}
              layoutId={`card-${img.id}`}
              onClick={() => setSelectedIndex(idx)}
              className="relative min-w-[30vh] md:min-w-[45vh] h-full group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-full h-full overflow-hidden rounded-lg bg-black/20 relative">
                {isVideo(img.url) ? (
                  <video
                    src={img.url}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                ) : (
                  <img 
                    src={getOptimizedUrl(img.url, 800)} 
                    alt={img.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center">
                   <span className="text-white font-serif italic text-3xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">View</span>
                </div>
              </div>

              {/* Number & Title below image */}
              <div className="absolute -bottom-16 left-0 w-full">
                <span className="text-xs font-mono text-white/40 block mb-1">{(idx + 1).toString().padStart(2, '0')}</span>
                <h3 className="text-lg font-medium text-white group-hover:text-[#c5a880] transition-colors">
                  {img.title}
                </h3>
              </div>
            </motion.div>
          ))}
          
          {/* End Spacer */}
          <div className="min-w-[20vw]" />
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="fixed bottom-12 left-12 right-12 h-[1px] bg-white/10 overflow-hidden">
        <motion.div 
          className="h-full bg-[#c5a880]"
          style={{ 
            width: useTransform(scrollXSpring, [constraints.left, constraints.right], ["100%", "0%"]) 
          }}
        />
      </div>

      {/* Fullscreen Auto-Scroll View */}
      <AnimatePresence>
        {currentImage && (
          <AutoScrollModal 
            image={currentImage} 
            onNext={() => {
              setSelectedIndex((prev) => {
                if (prev === null) return null;
                return (prev + 1) % images.length;
              });
            }}
            onClose={() => setSelectedIndex(null)}
            total={images.length}
            index={selectedIndex}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
