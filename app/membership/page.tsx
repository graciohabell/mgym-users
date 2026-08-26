'use client';

import Link from 'next/link';

export default function MembershipPage() {
  return (
    <main className="min-h-screen w-full bg-black flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-black/80 shadow-md p-6 sm:p-8 flex flex-col items-center text-center gap-6 sm:gap-8 rounded-2xl">
        <h1
          className="text-xl sm:text-2xl font-display italic font-semibold text-white tracking-wide"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          M.GYM Personal Member Page
        </h1>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full">
          <Link href="/login" className="w-full">
            <button
              className="w-full px-5 py-2 sm:py-3 rounded-lg bg-red-600 text-white font-semibold text-base sm:text-lg
                         hover:bg-white hover:text-red-600
                         focus:bg-red-500 focus:ring-2 focus:ring-red-400
                         active:bg-red-700 transition-colors shadow-sm"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Klaim QR Code
            </button>
          </Link>
        </div>

        {/* Description */}
        <p className="text-sm sm:text-base text-neutral-200 max-w-md font-body mt-2 leading-relaxed">
          <span
            className="text-red-600 italic font-semibold"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
           klaim Code QR Membership | Cek Status Membership | Request Trainer | Testimoni | Semua fitur hanya dengan satu e-mail yang terdaftar. 
          </span>{' '}
          
          <br />
          Berbagai fitur hanya dengan satu e-mail terdaftar. 
        </p>
      </div>
    </main>
  );
}
