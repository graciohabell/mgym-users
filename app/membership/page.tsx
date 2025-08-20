'use client';

import Link from 'next/link'

export default function MembershipPage() {
  return (
    <main className="min-h-screen w-full bg-black flex items-center justify-center font-body px-4">
      <div className="w-full max-w-md bg-black/80 shadow-sm p-8 flex flex-col items-center text-center gap-8 rounded-2xl">
        <h1
          className="text-2xl md:text-2xl font-display italic font-extrabold text-white tracking-wide"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          M.GYM MEMBER REMINDER
        </h1>

        <div className="flex flex-col gap-4 w-full">
          <Link href="/signup" className="w-full">
            <button
              className="w-full px-5 py-2 rounded-lg bg-red-600 text-white font-semibold text-base md:text-lg
                         hover:bg-white hover:text-red-600
                         focus:bg-red-500 focus:ring-2 focus:ring-red-400
                         active:bg-red-700 transition-colors shadow-sm"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Sign Up
            </button>
          </Link>
          <Link href="/login" className="w-full">
            <button
              className="w-full px-5 py-2 rounded-lg bg-red-600 text-white font-semibold text-base md:text-lg
                         hover:bg-white hover:text-red-600
                         focus:bg-red-500 focus:ring-2 focus:ring-red-400
                         active:bg-red-700 transition-colors shadow-sm"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Login
            </button>
          </Link>
        </div>

        <p className="text-sm md:text-base text-neutral-200 max-w-md font-body mt-2 leading-relaxed">
          <span
            className="text-red-600 italic font-semibold"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            M.GYM Member Reminder
          </span>{' '}
          adalah halaman eksklusif untuk para member M.GYM.
          <br />
          Di sini kamu bisa cek status, masa aktif, dan notifikasi jatuh tempo membership kamu.
        </p>
      </div>
    </main>
  )
}
