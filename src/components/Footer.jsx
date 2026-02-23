import React, { useEffect, useState } from "react";

const Footer = () => {
  const [showTop, setShowTop] = useState(false);

  // Show button when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <footer className="bg-purple-200 text-gray-600 py-6 relative">
        <div className="max-w-6xl mx-auto px-4 flex flex-col gap-4 items-center">
          <div className="flex justify-around items-center w-full">

            {/* Social Icons */}
            <div className="flex gap-5">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition"
                aria-label="Instagram"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="3.5" />
                  <circle cx="17.5" cy="6.5" r="1" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition"
                aria-label="Facebook"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              {/* Email */}
              <a
                href="mailto:support@myapp.com"
                className="hover:opacity-80 transition"
                aria-label="Email"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16v16H4z" />
                  <path d="M22 6 12 13 2 6" />
                </svg>
              </a>
            </div>

            {/* Privacy Policy */}
            <div className="text-sm">
              <a href="/privacy-policy" className="hover:underline">
                Privacy Policy
              </a>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-sm">
            © 2026 <span className="font-medium">MyApp</span>. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Scroll To Top Button */}
      {showTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 bg-purple-200 text-gray-700 p-3 rounded-full shadow-lg hover:scale-110 transition"
          aria-label="Scroll to Top"
        >
          ↑
        </button>
      )}
    </>
  );
};

export default Footer;
