'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function WaitingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('Menunggu persetujuan admin...')

  useEffect(() => {
    const checkApproval = async () => {
      const user = await supabase.auth.getUser()
      if (!user.data.user) {
        setMessage('Anda belum login. Silakan login dulu.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('members')
        .select('is_approved')
        .eq('user_id', user.data.user.id)
        .single()

      if (error) {
        setMessage('Gagal memeriksa status. Coba lagi nanti.')
        setLoading(false)
        return
      }

      if (data?.is_approved) {
        router.push('/membership')
      } else {
        setLoading(false)
      }
    }

    checkApproval()
    const interval = setInterval(checkApproval, 10000)
    return () => clearInterval(interval)
  }, [router])

  return (
    <main className="min-h-screen w-full bg-white flex items-center justify-center px-6 font-body">
      <div className="max-w-lg w-full text-center space-y-6 border border-red-100 bg-white rounded-2xl p-8 shadow-sm">

        <h1 className="text-2xl font-display italic font-extrabold text-red-600 tracking-wide">
          MENUNGGU VERIFIKASI
        </h1>

        <p className="text-base text-neutral-700 font-medium">{message}</p>

        {loading && (
          <p className="text-sm text-gray-500 animate-pulse">Memeriksa status akun setiap 10 detik...</p>
        )}

        <button
          onClick={() => router.push('/')}
          className="mt-4 px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition"
        >
          Kembali ke Beranda
        </button>
      </div>
    </main>
  )
}
