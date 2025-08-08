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
  const [modalMsg, setModalMsg] = useState('')
  const [modalType, setModalType] = useState<'error' | 'success'>('error')

  const showModal = (msg: string, type: 'error' | 'success' = 'error') => {
    setModalMsg(msg)
    setModalType(type)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalMsg('')

    // Cek kalau ada form yang kosong
    if (!nama || !noHp || !email || !username || !password || !confirmPassword) {
      return showModal('Semua field wajib diisi.', 'error')
    }

    // Cek konfirmasi password
    if (password !== confirmPassword) {
      return showModal('Password tidak sama.', 'error')
    }

    // Cek username sudah dipakai atau belum
    const { data: takenUsername } = await supabase
      .from('members')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (takenUsername) {
      return showModal('Username sudah digunakan.', 'error')
    }

    // Cek email + no HP sudah terdaftar
    const { data: existingMember, error: fetchError } = await supabase
      .from('members')
      .select('id, username, password')
      .eq('email', email)
      .eq('no_hp', noHp)
      .single()

    if (fetchError || !existingMember) {
      return showModal('Data tidak ditemukan. Pastikan email & no HP sudah diinput oleh admin.', 'error')
    }

    if (existingMember.username) {
      return showModal('Akun sudah pernah dibuat. Silakan login.', 'error')
    }

    // Update username & password
    const { error: updateError } = await supabase
      .from('members')
      .update({
        username,
        password,
      })
      .eq('id', existingMember.id)

    if (updateError) {
      return showModal('Gagal menyimpan data. Coba lagi nanti.', 'error')
    }

    showModal('Berhasil daftar! Silakan login.', 'success')
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  }

  return (
    <main className="min-h-screen w-full bg-black flex items-center justify-center px-4 font-body relative">
      <div className="w-full max-w-md bg-black rounded-2xl p-8 shadow-sm space-y-6">
        <h1
          className="text-2xl text-center italic font-extrabold text-white tracking-wide"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          DAFTAR AKSES MEMBER REMINDER
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 text-white"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          <input type="text" placeholder="Nama" value={nama} onChange={(e) => setNama(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <input type="tel" placeholder="No HP" value={noHp} onChange={(e) => setNoHp(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <input type="password" placeholder="Konfirmasi Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-400"
          />

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-red-600 hover:text-red-600 text-white hover:bg-white font-semibold transition-colors duration-200"
          >
            Daftar
          </button>
        </form>

        <p className="text-sm md:text-base text-neutral-700 max-w-md font-body mt-2 leading-relaxed">
          Tetap ingat username dan password yang saat ini kamu daftarkan/sign-up untuk login/mengakses Member Reminder.
        </p>
      </div>

      {/* Modal */}
      {modalMsg && (
        <div className="fixed inset-0 flex justify-center items-center z-50 pointer-events-none">
          <div
            className={`${
              modalType === 'error' ? 'bg-red-600' : 'bg-green-600'
            } text-white rounded-2xl shadow-lg shadow-black/40 w-80 text-center p-6 pointer-events-auto scale-95 animate-[popIn_0.15s_ease-out_forwards]`}
          >
            <h3 className="text-lg font-semibold mb-2">
              {modalType === 'error' ? 'Gagal' : 'Berhasil'}
            </h3>
            <p className="mb-4">{modalMsg}</p>
            <div className="border-t border-white/20">
              <button
                onClick={() => setModalMsg('')}
                className="w-full py-3 font-medium hover:bg-black/20 transition-colors rounded-lg"
              >
                OK
              </button>
            </div>
          </div>
          <style jsx>{`
            @keyframes popIn {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </main>
  )
}
