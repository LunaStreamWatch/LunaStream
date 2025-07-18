import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react'; // Lucide for a clean arrow icon

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`
        fixed bottom-8 right-8 w-20 h-20 rounded-full
        bg-white/90 dark:bg-gray-800/90
        text-gray-800 dark:text-white
        shadow-2xl hover:shadow-3xl
        hover:scale-110 active:scale-95
        transition-all duration-300
        backdrop-blur
        flex items-center justify-center
        z-[9999]
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
    >
      <ChevronUp size={36} strokeWidth={2.5} />
    </button>
  );
};

export default ScrollToTopButton;
