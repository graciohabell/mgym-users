'use client'

import Link from 'next/link'

export default function MembershipPage() {
  return (
    <main className="min-h-screen w-full bg-white flex items-center justify-center font-body px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-red-100 shadow-sm p-8 flex flex-col items-center text-center gap-8">
        <h1 className="text-2xl md:text-2xl font-display italic font-extrabold text-red-600 tracking-wide"style={{ fontFamily: 'Tomorrow, sans-serif' }}>
           M.GYM MEMBER REMINDER
        </h1>

        <div className="flex flex-col gap-4 w-full">
          <Link href="/signup" className="w-full">
            <button className="w-full px-6 py-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-base md:text-lg transition font-body shadow-sm"style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Sign Up
            </button>
          </Link>
          <Link href="/login" className="w-full">
            <button className="w-full px-6 py-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-base md:text-lg transition font-body shadow-sm"style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Login
            </button>
          </Link>
        </div>

        <p className="text-sm md:text-base text-neutral-700 max-w-md font-body mt-2 leading-relaxed">
          <span className="text-red-600 italic font-semibold"style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>M.GYM Member Reminder</span> adalah halaman ekslusif untuk para member M.GYM.
          <br />
          Di sini kamu bisa cek status, masa aktif, dan notifikasi jatuh tempo membership kamu. <br />
        </p>
    
</div>


    </main>
  )
}
