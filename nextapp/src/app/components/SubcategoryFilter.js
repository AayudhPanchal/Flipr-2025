'use client';
import { useState, useRef, useEffect } from 'react';

export default function SubcategoryFilter({ category, subCategory, setSubCategory, categories }) {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({
        left: direction * 200,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="sticky top-16 bg-white shadow-sm z-40">
      <div className="container mx-auto">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 relative w-full md:w-auto">
            <span className="text-gray-500 text-sm hidden md:block">Filter by:</span>
            
            {/* Left Arrow */}
            {showLeftArrow && (
              <button 
                onClick={() => scroll(-1)}
                className="absolute left-0 z-10 p-2 bg-gradient-to-r from-white to-transparent md:hidden h-full flex items-center"
                style={{ background: 'linear-gradient(90deg, white 0%, white 50%, transparent 100%)' }}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Scrollable container */}
            <div 
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="flex gap-2 overflow-x-auto scrollbar-hide px-8 md:px-0 scroll-smooth"
            >
              {categories.find(cat => cat.id === category)?.subcategories.map(sub => (
                <button
                  key={sub}
                  onClick={() => setSubCategory(sub)}
                  className={`
                    whitespace-nowrap px-4 py-1.5 rounded-full transition-all flex-shrink-0
                    ${subCategory === sub 
                      ? 'bg-blue-100 text-blue-700 font-medium border-2 border-blue-200' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }
                    text-sm
                  `}
                >
                  {sub.charAt(0).toUpperCase() + sub.slice(1)}
                </button>
              ))}
            </div>

            {/* Right Arrow */}
            {showRightArrow && (
              <button 
                onClick={() => scroll(1)}
                className="absolute right-0 z-10 p-2 bg-gradient-to-l from-white to-transparent md:hidden h-full flex items-center"
                style={{ background: 'linear-gradient(-90deg, white 0%, white 50%, transparent 100%)' }}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
          
          <span className="text-blue-600 font-medium hidden md:block">
            {categories.find(cat => cat.id === category)?.name} News
          </span>
        </div>
      </div>
    </div>
  );
}
