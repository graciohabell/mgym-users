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

    // 🔍 Cek kecocokan username & password
    const { data: member, error: loginError } = await supabase
      .from('members')
      .select('id,nama', { head: false })
      .eq('username', username)
      .eq('password', password)
      .single()

    if (loginError || !member) {
      setError('Username atau password salah. Periksa kembali.')
      return
    }

    // ✅ Simpan info member ke localStorage
    localStorage.setItem('member_id', member.id)
    localStorage.setItem('member_nama', member.nama)

    // 🚀 Arahkan ke halaman khusus member
    router.push('/memberonly')
  }

  return (
    <main className="min-h-screen w-full bg-white flex items-center justify-center px-4 font-body">
      <div className="max-w-md w-full space-y-6 border border-red-100 rounded-2xl p-8 shadow-sm bg-white">
        <h1 className="text-2xl font-display italic font-extrabold text-red-600 tracking-wide text-center"style={{ fontFamily: 'Tomorrow, sans-serif' }}>
          LOGIN M.GYM MEMBER REMINDER
        </h1>

        <form onSubmit={handleLogin} className="space-y-4 text-black"style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-400"
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition"
          >
            Login
          </button>
        </form>
        <p className="text-sm md:text-base text-neutral-700 max-w-md font-body mt-2 leading-relaxed">
          <span className="text-red-600 italic font-semibold"style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}></span> Login dengan menggunakan username dan password yang telah kamu daftarkan pada saat proses sign/up.
          <br /></p>
      </div>
    </main>
  )
}
