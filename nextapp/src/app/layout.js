'use client'
import { useEffect } from 'react';
import Script from "next/script";
import "./globals.css";
import Navbar from './components/Navbar';

export default function RootLayout({ children }) {

  useEffect(() => {
    const addGoogleTranslateScript = () => {
      if (!window.googleTranslateElementInit) {
        window.googleTranslateElementInit = () => {
          new window.google.translate.TranslateElement(
            { pageLanguage: "en" },
            "google_translate_element"
          );
        };

        const script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.src =
          "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.head.appendChild(script);
      }
    };

    addGoogleTranslateScript();
  }, []);

  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="beforeInteractive"
        />
      </head>
      <body className="antialiased">
        <div id="google_translate_element" style={{ display: "none" }}></div>
        {children}
      </body>
    </html>
  );
}