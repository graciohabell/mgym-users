'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username wajib diisi.');
      return;
    }
    if (!password.trim()) {
      setError('Password wajib diisi.');
      return;
    }

    const { data: member, error: loginError } = await supabase
      .from('members')
      .select('id,nama')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (loginError || !member) {
      setError('Username atau password salah. Periksa kembali.');
      return;
    }

    localStorage.setItem('member_id', member.id);
    localStorage.setItem('member_nama', member.nama);

    router.push('/memberonly');
  };

  return (
    <main className="min-h-screen w-full bg-black flex flex-col items-center justify-center px-4 py-8 font-body">
      <div className="w-full max-w-md bg-black/20 p-6 rounded-2xl shadow-lg space-y-6">
        <h1
          className="text-2xl md:text-3xl font-display italic font-extrabold text-white tracking-wide text-center"
        >
          LOGIN M.GYM MEMBERSHIP
        </h1>

        <form onSubmit={handleLogin} className="space-y-4 text-white/80">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 placeholder-neutral-400 bg-transparent focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 placeholder-neutral-400 bg-transparent focus:outline-none focus:ring-2 focus:ring-red-400"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-red-600 text-white font-semibold transition hover:bg-red-500 focus:ring-2 focus:ring-red-400 active:bg-red-700"
          >
            Login
          </button>
        </form>

        <p className="text-sm md:text-base text-neutral-500 text-center leading-relaxed">
          Login dengan username dan password yang telah kamu buat.
        </p>
      </div>

      {/* Modal Error */}
      {error && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/40">
          <div className="bg-red-600 text-white rounded-2xl shadow-lg w-80 text-center p-6 animate-[popIn_0.15s_ease-out_forwards]">
            <h3 className="text-lg font-semibold mb-2">Login Gagal</h3>
            <p className="mb-4">{error}</p>
            <div className="border-t border-red-500 pt-4">
              <button
                onClick={() => setError('')}
                className="w-full py-3 font-medium hover:bg-red-700 rounded-lg"
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
  );
}
