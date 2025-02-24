'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaLanguage, FaChevronDown, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  
  const translateRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' }
  ];

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(languages.length / ITEMS_PER_PAGE);

  const getCurrentPageItems = () => {
    const start = currentPage * ITEMS_PER_PAGE;
    return languages.slice(start, start + ITEMS_PER_PAGE);
  };

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      setIsLoggedIn(true);
      fetch(`/api/user/profile?email=${email}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUserName(data.user.name);
            localStorage.setItem('userName', data.user.name);
          }
        })
        .catch(console.error);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (translateRef.current && !translateRef.current.contains(event.target)) {
        setIsTranslateOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode) => {
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    }
    setIsTranslateOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    window.location.href = '/user/login';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const oldHighlights = document.querySelectorAll('.search-highlight');
      oldHighlights.forEach(highlight => {
        const parent = highlight.parentNode;
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize();
      });

      const searchText = searchQuery.toLowerCase();
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let node;
      let found = false;
      
      while (node = walker.nextNode()) {
        const textContent = node.textContent.toLowerCase();
        const index = textContent.indexOf(searchText);
        
        if (index >= 0 && !node.parentElement.classList.contains('search-highlight')) {
          const span = document.createElement('span');
          span.className = 'search-highlight';
          span.style.backgroundColor = '#FFEB3B';
          
          const text = node.textContent;
          const before = text.substring(0, index);
          const match = text.substring(index, index + searchText.length);
          const after = text.substring(index + searchText.length);
          
          span.textContent = match;
          node.parentNode.insertBefore(document.createTextNode(before), node);
          node.parentNode.insertBefore(span, node);
          node.parentNode.insertBefore(document.createTextNode(after), node);
          node.parentNode.removeChild(node);
          
          if (!found) {
            span.scrollIntoView({ behavior: 'smooth', block: 'center' });
            found = true;
          }
        }
      }

      if (!found) {
        alert('No matches found');
      }
    }
  };

  return (
    <nav className="sticky top-0 bg-white shadow-md z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            <div className="flex items-center">
              <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <span className="hidden sm:inline">NewsDaily</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in page..."
                  className="w-48 md:w-64 pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </form>
            
            <div className="flex items-center gap-4">
              <Link
                href="/blog/all"
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Blog
              </Link>

              {/* Language Selector */}
              <div className="relative" ref={translateRef}>
                <button
                  onClick={() => setIsTranslateOpen(!isTranslateOpen)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <FaLanguage className="w-5 h-5" />
                  <span>Translate</span>
                  <FaChevronDown className={`w-4 h-4 transform transition-transform ${isTranslateOpen ? 'rotate-180' : ''}`} />
                </button>

                {isTranslateOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="p-2 grid grid-cols-2 gap-1">
                      {getCurrentPageItems().map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className="text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md w-full"
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                    
                    {totalPages > 1 && (
                      <div className="border-t border-gray-100 p-2 flex justify-between items-center">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                          disabled={currentPage === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <FaChevronLeft />
                        </button>
                        <span className="text-sm text-gray-500">
                          {currentPage + 1} / {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                          disabled={currentPage === totalPages - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <FaChevronRight />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isLoggedIn ? (
                <>
                  <span className="text-sm text-gray-600">{userName}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/user/login"
                    className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Login
                  </Link>
                  <Link
                    href="/user/signup"
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100">
            <div className="py-4 space-y-4">
              <form onSubmit={handleSearch} className="px-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in page..."
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </form>

              <Link
                href="/blog/all"
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Blog
              </Link>

              {/* Mobile Language Selector */}
              <div className="px-4 border-t border-gray-200 pt-4">
                <button
                  onClick={() => setIsTranslateOpen(!isTranslateOpen)}
                  className="flex items-center w-full py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  <FaLanguage className="w-5 h-5 mr-3" />
                  <span>Select Language</span>
                  <FaChevronDown className={`ml-auto w-4 h-4 transform transition-transform ${isTranslateOpen ? 'rotate-180' : ''}`} />
                </button>

                {isTranslateOpen && (
                  <div className="mt-2">
                    <div className="grid grid-cols-2 gap-1">
                      {getCurrentPageItems().map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            handleLanguageChange(lang.code);
                            setIsMobileMenuOpen(false);
                          }}
                          className="text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                          disabled={currentPage === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <FaChevronLeft />
                        </button>
                        <span className="text-sm text-gray-500">
                          {currentPage + 1} / {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                          disabled={currentPage === totalPages - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <FaChevronRight />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="px-4 space-y-2">
                {isLoggedIn ? (
                  <>
                    <span className="text-sm text-gray-600">{userName}</span>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full py-2 text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/user/login"
                      className="flex items-center w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Login
                    </Link>
                    <Link
                      href="/user/signup"
                      className="flex items-center w-full py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-4"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}