'use client';

import React, { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageCircle,
} from 'lucide-react';
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  YoutubeIcon,
  TelegramIcon,
  WhatsappIcon,
  LinkedinIcon,
} from '../../components/common/SocialIcons';
import api from '../../lib/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
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
        console.error('Contact page settings fetch error:', err);
      });
  }, []);

  const contact = settings?.contactUs || {
    headquartersAddress: 'F 65, Shaheen Bagh, Okhla, New Delhi-110025, India',
    phone: '+91 9871023184',
    alternatePhone: '',
    email: 'mail@seemanchalexpress.in',
    supportEmail: 'editor@seemanchalexpress.in',
    whatsappNumber: '+91 9871023184',
    officeHours: 'Monday - Saturday: 9:00 AM - 8:00 PM IST',
  };

  const socialLinks = settings?.socialLinks || {};

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await api.post('/contact', formData);
      if (res.data.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setError(res.data.message || 'Error sending message.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 mb-2">
            Contact Seemanchal Express Headquarters
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            For news tips, press releases, committee membership inquiries, or general communications, reach out via the form below or contact our central secretariat.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Details Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6 text-white border-b border-slate-800 pb-3">
                Central Secretariat
              </h3>

              <div className="space-y-6 text-xs text-slate-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-white text-sm block mb-1">Head Office Address</strong>
                    <p className="leading-relaxed">
                      {contact.headquartersAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-white text-sm block mb-1">Helpline & Editorial Desk</strong>
                    <a href={`tel:${contact.phone}`} className="text-emerald-400 hover:underline font-bold text-sm block">
                      {contact.phone}
                    </a>
                    {contact.alternatePhone && (
                      <a href={`tel:${contact.alternatePhone}`} className="text-slate-400 hover:underline text-xs block mt-0.5">
                        Alt: {contact.alternatePhone}
                      </a>
                    )}
                    <span className="text-slate-400 text-[11px] flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {contact.officeHours}
                    </span>
                  </div>
                </div>

                {contact.whatsappNumber && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-white text-sm block mb-1">WhatsApp Desk</strong>
                      <a
                        href={`https://wa.me/${contact.whatsappNumber.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-300 hover:underline font-bold text-sm block"
                      >
                        {contact.whatsappNumber}
                      </a>
                      <span className="text-slate-400 text-[11px]">Direct news tips & instant inquiries</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-sky-600/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-white text-sm block mb-1">Official Email</strong>
                    <a href={`mailto:${contact.email}`} className="text-sky-400 hover:underline font-medium block">
                      {contact.email}
                    </a>
                    {contact.supportEmail && (
                      <a href={`mailto:${contact.supportEmail}`} className="text-slate-400 hover:underline text-[11px] block mt-0.5">
                        Editor: {contact.supportEmail}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Channels in Contact page */}
              <div className="mt-6 pt-5 border-t border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                  Follow Official Handles:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors"
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
                      className="p-2 rounded-lg bg-slate-800 hover:bg-black text-slate-300 hover:text-white transition-colors"
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
                      className="p-2 rounded-lg bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white transition-colors"
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
                      className="p-2 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-colors"
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
                      className="p-2 rounded-lg bg-slate-800 hover:bg-sky-500 text-slate-300 hover:text-white transition-colors"
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
                      className="p-2 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-colors"
                      title="WhatsApp Channel"
                    >
                      <WhatsappIcon className="w-4 h-4" />
                    </a>
                  )}
                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-blue-700 text-slate-300 hover:text-white transition-colors"
                      title="LinkedIn"
                    >
                      <LinkedinIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Location Overview */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-900 text-xs uppercase mb-2">Central Operations</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our central secretariat in Okhla, Shaheen Bagh, New Delhi coordinates national press operations, legal advocacy, and regional bureaus across Kishanganj, Purnea, Araria, and Katihar.
              </p>
            </div>
          </div>

          {/* Contact Message Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6 border-l-4 border-red-600 pl-3">
                Send an Inquiry or Feedback
              </h3>

              {success && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong>Message Sent Successfully!</strong>
                    <p>Our administrative team will review your message and respond shortly.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Full Name"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Brief topic of inquiry"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Message / Inquiry Details *
                  </label>
                  <textarea
                    name="message"
                    rows="6"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your complete message, feedback or inquiry here..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Transmitting Message...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
