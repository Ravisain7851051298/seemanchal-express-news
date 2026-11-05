'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Shield,
  FileCheck,
  Users,
  Award,
  Globe,
  Info,
} from 'lucide-react';
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  YoutubeIcon,
  TelegramIcon,
  WhatsappIcon,
  LinkedinIcon,
} from '../common/SocialIcons';
import api from '../../lib/api';

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => {
        if (res.data?.success) {
          setSettings(res.data.settings);
        }
      })
      .catch((err) => {
        console.error('Footer settings fetch error:', err);
      });
  }, []);

  const socialLinks = settings?.socialLinks || {
    facebook: 'https://facebook.com/seemanchalexpress',
    twitter: 'https://twitter.com/seemanchalexp',
    instagram: 'https://instagram.com/seemanchalexpress',
    youtube: 'https://youtube.com/@seemanchalexpress',
    telegram: 'https://t.me/seemanchalexpress',
    whatsapp: 'https://whatsapp.com/channel/seemanchalexpress',
    linkedin: '',
  };

  const contactUs = settings?.contactUs || {
    headquartersAddress: 'F 65, Shaheen Bagh, Okhla, New Delhi-110025, India',
    phone: '+91 9871023184',
    email: 'mail@seemanchalexpress.in',
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-6 border-t-4 border-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Column 1: Brand & Mission */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.jpeg"
                alt="Seemanchal Express"
                className="w-11 h-11 object-contain rounded-lg border border-slate-700 bg-white p-0.5 shadow-md"
              />
              <div>
                <span className="text-xl font-black text-white tracking-tight">
                  SEEMANCHAL <span className="text-red-500">EXPRESS</span>
                </span>
                <p className="text-xs text-slate-400">Digital News & Community Network</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Empowering Seemanchal (Kishanganj, Araria, Purnea, Katihar) and all of India with true, unbiased, and fearless reporting. Dedicated to public welfare, rural growth, and transparent governance.
            </p>
            <div className="text-xs text-amber-400 font-semibold mb-3">
              Voice of the People | Fearless Journalism
            </div>

            {/* Dynamic Social Media Links */}
            <div className="mb-4">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold block mb-2">
                Connect With Us
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {socialLinks.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-blue-600 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm"
                    title="Facebook"
                  >
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-black border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm"
                    title="Twitter / X"
                  >
                    <TwitterIcon className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-pink-600 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm"
                    title="Instagram"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.youtube && (
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-red-600 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm"
                    title="YouTube"
                  >
                    <YoutubeIcon className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.telegram && (
                  <a
                    href={socialLinks.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-sky-500 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm"
                    title="Telegram"
                  >
                    <TelegramIcon className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.whatsapp && (
                  <a
                    href={socialLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-emerald-600 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm"
                    title="WhatsApp"
                  >
                    <WhatsappIcon className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-blue-700 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm"
                    title="LinkedIn"
                  >
                    <LinkedinIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Google Source Preference Button */}
            <a
              href="https://www.google.com/preferences/source?q=seemanchalexpress.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-colors shadow-sm"
              title="Google News पर Seemanchal Express को प्राथमिकता दें"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Google पर प्राथमिकता दें</span>
            </a>
          </div>

          {/* Column 2: Committees & Coverage */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-red-600 pl-2">
              Organizational Committees
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/team" className="hover:text-white transition-colors">
                  A. National Executive Committee
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-white transition-colors">
                  B. State Executive Committee (Bihar)
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-white transition-colors">
                  C. District Executive Committee
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-white transition-colors">
                  D. Block / Taluka Committee
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-white transition-colors">
                  E. Gram Panchayat Committee
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-white transition-colors">
                  F. Ward Committee
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-white transition-colors text-amber-400">
                  Field Correspondents & Press Bureau
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Portals, About & Contact */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-red-600 pl-2">
              Organization & Portals
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/about"
                  className="flex items-center gap-1.5 hover:text-white text-slate-300 font-medium"
                >
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  About Us (सीमांचल एक्सप्रेस परिचय)
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="flex items-center gap-1.5 hover:text-white text-slate-300 font-medium"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  Contact Us (संपर्क सूत्र)
                </Link>
              </li>
              <li>
                <Link
                  href="/apply-member"
                  className="flex items-center gap-1.5 hover:text-white text-slate-300"
                >
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  Membership Application Form
                </Link>
              </li>
              <li>
                <Link
                  href="/apply-reporter"
                  className="flex items-center gap-1.5 hover:text-white text-slate-300"
                >
                  <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                  Press Reporter Application
                </Link>
              </li>
              <li>
                <Link
                  href="/verify"
                  className="flex items-center gap-1.5 hover:text-white text-amber-300 font-semibold"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  Digital ID Card Online Verification
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 hover:text-white text-slate-300"
                >
                  <Award className="w-3.5 h-3.5 text-red-400" />
                  Member / Reporter Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Central Office & Contact */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-red-600 pl-2">
              Headquarters & Contact
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Headquarters Address:</strong>
                  <br />
                  {contactUs.headquartersAddress}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${contactUs.phone}`} className="hover:text-white font-medium">
                  {contactUs.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <a href={`mailto:${contactUs.email}`} className="hover:text-white font-medium">
                  {contactUs.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                <span>https://seemanchalexpress.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col lg:flex-row justify-between items-center gap-3 text-center lg:text-left">
          <p>© {new Date().getFullYear()} Seemanchal Express. All Rights Reserved. Digital Media & Community Network.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-slate-400">
            <Link href="/about" className="hover:text-white transition-colors text-slate-300">
              About Us
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-white transition-colors text-slate-300">
              Contact Us
            </Link>
            <span>•</span>
            <Link href="/legal" className="hover:text-white transition-colors text-amber-400 font-semibold">
              Legal & Policies
            </Link>
            <span>•</span>
            <Link href="/legal/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/legal/terms-and-conditions" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <span>•</span>
            <Link href="/legal/editorial-policy" className="hover:text-white transition-colors">
              Editorial Policy
            </Link>
            <span>•</span>
            <Link href="/complaint" className="hover:text-white transition-colors text-red-400 font-medium">
              Submit Grievance
            </Link>
            <span>•</span>
            <Link href="/complaint/track" className="hover:text-white transition-colors text-blue-400 font-medium">
              Track Grievance
            </Link>
            <span>•</span>
            <Link href="/verify" className="hover:text-white transition-colors">
              ID Card Verification
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
