'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('Username wajib diisi.')
      return
    }
    if (!password.trim()) {
      setError('Password wajib diisi.')
      return
    }

    const { data: member, error: loginError } = await supabase
      .from('members')
      .select('id,nama')
      .eq('username', username)
      .eq('password', password)
      .single()

    if (loginError || !member) {
      setError('Username atau password salah. Periksa kembali.')
      return
    }

    localStorage.setItem('member_id', member.id)
    localStorage.setItem('member_nama', member.nama)

    router.push('/memberonly')
  }

  return (
    <main className="min-h-screen w-full bg-black flex items-center justify-center px-4 font-body relative">
      <div className="max-w-md w-full space-y-6 bg-black/20 p-6 rounded-lg">
        <h1
          className="text-2xl font-display italic font-extrabold text-white tracking-wide text-center"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          LOGIN M.GYM MEMBERSHIP
        </h1>

        <form
          onSubmit={handleLogin}
          className="space-y-4 text-white/80"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-400 active:ring-red-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-400 active:ring-red-500"
          />

          <button
            type="submit"
            className={`w-full py-2 rounded-lg bg-red-600 text-white font-semibold transition-colors
                       hover:bg-red-500 hover:text-white
                       focus:bg-red-500 focus:ring-2 focus:ring-red-400
                       active:bg-red-700 active:text-white`}
          >
            Login
          </button>
        </form>

        <p className="text-sm md:text-base text-neutral-500 max-w-md font-body mt-2 leading-relaxed">
          Login dengan menggunakan username dan password yang telah kamu daftarkan pada saat proses sign-up.
        </p>
      </div>

      {/* Modal Error */}
      {error && (
        <div className="fixed inset-0 flex justify-center items-center z-50 pointer-events-none">
          <div
            className="bg-red-600 text-white rounded-2xl shadow-lg shadow-black/40 w-80 text-center p-6 pointer-events-auto scale-95 animate-[popIn_0.15s_ease-out_forwards]"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <h3 className="text-lg font-semibold mb-2">Login Gagal</h3>
            <p className="mb-4">{error}</p>
            <div className="border-t border-red-500">
              <button
                onClick={() => setError('')}
                className={`w-full py-3 font-medium transition-colors
                           hover:bg-red-700
                           focus:bg-red-700 focus:ring-2 focus:ring-red-400
                           active:bg-red-800 rounded-lg`}
              >
                OK
              </button>
            </div>
          </div>
          <style jsx>{`
            @keyframes popIn {
              from {
                transform: scale(0.95);
                opacity: 0;
              }
              to {
                transform: scale(1);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}
    </main>
  )
}
