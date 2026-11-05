'use client';

import React, { useEffect, useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'ur', label: 'اردو (Urdu)', flag: '🇵🇰' },
  { code: 'bn', label: 'বাংলা (Bengali)', flag: '🇧🇩' },
  { code: 'ar', label: 'العربية (Arabic)', flag: '🇸🇦' },
];

export default function GoogleTranslate() {
  const [selectedLang, setSelectedLang] = useState('en');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check existing googtrans cookie
    const cookies = document.cookie.split(';');
    for (let c of cookies) {
      const [key, val] = c.trim().split('=');
      if (key === 'googtrans' && val) {
        const lang = val.split('/').pop();
        if (lang) setSelectedLang(lang);
      }
    }

    // Define the global Google Translate init callback
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,ur,bn,ar,es,fr,de',
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    // Load Google Translate script if not already present
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const changeLanguage = (langCode) => {
    setSelectedLang(langCode);
    setIsOpen(false);

    // Set googtrans cookie for Google Translate
    const domain = window.location.hostname;
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${domain};`;

    // Also try to trigger Google Translate select if rendered
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === selectedLang) || LANGUAGES[0];

  return (
    <div className="relative inline-block text-left notranslate">
      {/* Hidden native container */}
      <div id="google_translate_element" className="hidden"></div>

      {/* Styled Language Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-md border border-slate-700 transition-all shadow-sm"
      >
        <Globe className="w-3.5 h-3.5 text-amber-400" />
        <span>
          {currentLangObj.flag} {currentLangObj.label.split(' ')[0]}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {/* Language Options Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-44 rounded-lg bg-slate-900 border border-slate-700 shadow-xl z-50 py-1 text-xs">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
            Select Language (भाषा चुनें)
          </div>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => changeLanguage(lang.code)}
              className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition-colors ${
                selectedLang === lang.code
                  ? 'text-amber-400 font-bold bg-slate-800/60'
                  : 'text-slate-200'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </span>
              {selectedLang === lang.code && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

