'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignUpPage() {
  const router = useRouter()
  const [nama, setNama] = useState('')
  const [noHp, setNoHp] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Password tidak sama.')
      return
    }

    // 🔍 Cek apakah username sudah dipakai user lain
    const { data: takenUsername } = await supabase
      .from('members')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (takenUsername) {
      setError('Username sudah digunakan.')
      return
    }

 
    const { data: existingMember, error: fetchError } = await supabase
      .from('members')
      .select('id, username, password')
      .eq('email', email)
      .eq('no_hp', noHp)
      .single()

    if (fetchError || !existingMember) {
      setError('Data tidak ditemukan. Pastikan email & no HP sudah diinput oleh admin.')
      return
    }

    if (existingMember.username) {
      setError('Akun sudah pernah dibuat. Silakan login.')
      return
    }

    // ✅ Update username dan password di record member
    const { error: updateError } = await supabase
      .from('members')
      .update({
        username,
        password,
      })
      .eq('id', existingMember.id)

    if (updateError) {
      setError('Gagal menyimpan data. Coba lagi nanti.')
      return
    }

    setSuccess('Berhasil daftar! Silakan login.')
    router.push('/login')
  }

  return (
    <main className="min-h-screen w-full bg-white flex items-center justify-center px-4 font-body">
      <div className="w-full max-w-md bg-white border border-red-100 rounded-2xl p-8 shadow-sm space-y-6">

        <h1 className="text-2xl text-center font-display italic font-extrabold text-red-600 tracking-wide"style={{ fontFamily: 'Tomorrow, sans-serif' }}>
          /// DAFTAR AKSES MEMBER ROOM 
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 text-black"style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          <input
            type="text"
            placeholder="Nama"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <input
            type="tel"
            placeholder="No HP"
            value={noHp}
            onChange={(e) => setNoHp(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
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
          <input
            type="password"
            placeholder="Konfirmasi Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-400"
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition"style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Daftar
          </button>
        </form>
      <p className="text-sm md:text-base text-neutral-700 max-w-md font-body mt-2 leading-relaxed"style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        Tetap ingat username dan password yang saat ini kamu daftarkan/sign-up untuk login/mengakses Member Room.
      </p>
      </div>
    </main>
  )
}
