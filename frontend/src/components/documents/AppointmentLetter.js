'use client';

import React, { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import api from '../../lib/api';
import getMediaUrl from '../../lib/imageHelper';

export default function AppointmentLetter({ appointmentData, onPrint }) {
  const [liveSettings, setLiveSettings] = useState(null);

  useEffect(() => {
    // If appointmentData doesn't already have official seal or signature, fetch from live settings
    if (!appointmentData?.officialSeal && !appointmentData?.presidentSignature) {
      api
        .get('/settings')
        .then((res) => {
          if (res.data?.success) {
            setLiveSettings(res.data.settings);
          }
        })
        .catch(() => {});
    }
  }, [appointmentData]);

  if (!appointmentData) return null;

  const sealUrl =
    appointmentData.officialSeal ||
    appointmentData.organization?.credentials?.officialSeal ||
    liveSettings?.credentials?.officialSeal;

  const sigUrl =
    appointmentData.presidentSignature ||
    appointmentData.organization?.credentials?.presidentSignature ||
    liveSettings?.credentials?.presidentSignature;

  const signatoryName =
    appointmentData.signatoryName ||
    appointmentData.organization?.credentials?.signatoryName ||
    liveSettings?.credentials?.signatoryName ||
    'Nation Correspondence / Chief Editor';

  const signatoryDesignation =
    appointmentData.signatoryDesignation ||
    appointmentData.organization?.credentials?.signatoryDesignation ||
    liveSettings?.credentials?.signatoryDesignation ||
    'Authorized Signatory & Chief Editor';

  const dateStr = appointmentData.date
    ? new Date(appointmentData.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US');

  return (
    <div className="flex flex-col items-center">
      {/* Printable Letter Sheet (A4 Proportion) */}
      <div className="print-area w-full max-w-3xl bg-white rounded-xl border border-slate-300 shadow-xl p-8 sm:p-12 text-slate-800 font-serif leading-relaxed my-4 relative">
        {/* Letterhead Top Header */}
        <div className="border-b-4 border-red-700 pb-5 mb-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-2">
            <img
              src="/logo.jpeg"
              alt="Seemanchal Express"
              className="w-14 h-14 rounded-lg bg-white object-contain border border-slate-200 shadow p-1"
            />
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                SEEMANCHAL EXPRESS
              </h1>
              <p className="text-sm font-bold text-red-700 font-sans tracking-wide">
                Voice of the People | Fearless Journalism
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-sans flex flex-wrap justify-center items-center gap-4 mt-2">
            <span><strong>Central Office:</strong> F 65, Shaheen Bagh, Okhla, New Delhi-110025</span>
            <span>|</span>
            <span><strong>Phone:</strong> +91 9871023184</span>
            <span>|</span>
            <span><strong>Email:</strong> mail@seemanchalexpress.in</span>
          </div>
        </div>

        {/* Ref No & Date */}
        <div className="flex justify-between items-center text-xs font-sans text-slate-600 mb-6 font-semibold">
          <div>
            Ref. No.:{' '}
            <span className="text-red-700 font-mono font-bold">
              {appointmentData.referenceNo || 'SE/APPT/2026/001'}
            </span>
          </div>
          <div>
            Date:{' '}
            <span className="text-slate-900 font-medium">{dateStr}</span>
          </div>
        </div>

        {/* Appointee Address Block */}
        <div className="mb-6 font-sans text-xs">
          <p className="text-slate-500 font-semibold mb-1">To,</p>
          <h3 className="text-base font-bold text-slate-900">{appointmentData.name}</h3>
          <p className="text-slate-600">
            {appointmentData.address?.street || 'Shaheen Bagh'},{' '}
            {appointmentData.address?.district || 'Seemanchal'},{' '}
            {appointmentData.address?.state || 'Bihar'}
          </p>
          <p className="text-slate-600">
            Contact: {appointmentData.phone} | {appointmentData.email}
          </p>
          <p className="text-red-700 font-bold mt-1">
            Credential Identification: {appointmentData.idCardNumber || 'SE-APPROVED'}
          </p>
        </div>

        {/* Subject */}
        <div className="bg-slate-100 p-3 rounded-lg border-l-4 border-red-700 mb-6 font-sans text-xs sm:text-sm font-bold text-slate-900">
          SUBJECT: Formal Appointment & Nomination to the Office of &ldquo;{appointmentData.assignedDesignation}&rdquo;.
        </div>

        {/* Letter Body Text */}
        <div className="text-xs sm:text-sm text-slate-700 space-y-4 mb-8 leading-relaxed font-sans">
          <p>Dear Colleague,</p>
          <p>
            We take great pride in informing you that having regard to your proven commitment to public welfare, social integrity, and dedicated service, the Central Executive Council and Editorial Board of Seemanchal Express hereby appoints you as <strong>&ldquo;{appointmentData.assignedDesignation}&rdquo;</strong> within the <strong>{appointmentData.committeeLevel} Committee</strong>.
          </p>
          <p>
            Your assigned jurisdiction and operational purview will be <strong>&ldquo;{appointmentData.assignedLocation || 'Seemanchal Region'}&rdquo;</strong>. You are authorized to uphold the highest ethical standards of independent media, organize regional engagements, and coordinate community advancement within your assigned territory.
          </p>
          <div className="bg-slate-50 p-4 rounded border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-900 mb-2">Key Responsibilities & Institutional Duties:</h4>
            <ol className="list-decimal pl-4 space-y-1 text-slate-600">
              <li>Monitor and champion public welfare, rural healthcare, educational equity, and civic development.</li>
              <li>Strictly maintain organizational integrity, journalistic impartiality, and constitutional ethics.</li>
              <li>Direct local council assemblies, press inquiries, and public grievance delegations.</li>
              <li>Employ digital credentials exclusively for sanctioned institutional and public responsibilities.</li>
            </ol>
          </div>
          <p>
            We are confident that you will discharge your responsibilities with the utmost diligence, honor, and courage. We wish you an impactful and successful tenure.
          </p>
        </div>

        {/* Signatures & Seal */}
        <div className="mt-10 pt-8 border-t border-slate-300 flex justify-between items-end font-sans text-xs">
          <div className="text-center">
            {sealUrl ? (
              <div className="w-24 h-24 mx-auto mb-1 flex items-center justify-center">
                <img
                  src={getMediaUrl(sealUrl)}
                  alt="Official Seal"
                  className="w-24 h-24 object-contain rounded-full drop-shadow-md border border-red-700/30"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full border-2 border-red-700 flex flex-col items-center justify-center p-1 text-[9px] text-red-800 font-bold uppercase tracking-tighter mx-auto mb-1">
                <span>★ OFFICIAL ★</span>
                <span className="font-black text-[10px]">SEEMANCHAL</span>
                <span>EXPRESS</span>
                <span>SEAL</span>
              </div>
            )}
            <span className="text-[10px] text-slate-500 font-semibold block">Official Institutional Seal</span>
          </div>

          <div className="text-center">
            {sigUrl ? (
              <div className="h-14 flex items-end justify-center mb-1">
                <img
                  src={getMediaUrl(sigUrl)}
                  alt="President / Chief Editor Signature"
                  className="max-h-14 max-w-[200px] object-contain drop-shadow-sm"
                />
              </div>
            ) : (
              <div className="h-10 border-b border-slate-800 w-44 mx-auto mb-1 flex items-end justify-center font-bold text-red-800 italic">
                {signatoryName}
              </div>
            )}
            <strong className="block text-slate-900 text-xs">{signatoryName}</strong>
            <span className="text-[11px] text-slate-600 block">{signatoryDesignation}</span>
            <span className="text-[10px] text-slate-400 block">Seemanchal Express Central Secretariat, New Delhi</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={() => {
          if (onPrint) onPrint();
          else window.print();
        }}
        className="no-print mt-3 px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-2 transition-all"
      >
        <Printer className="w-4 h-4 text-amber-300" />
        Print / Save Appointment Letter as PDF
      </button>
    </div>
  );
}
