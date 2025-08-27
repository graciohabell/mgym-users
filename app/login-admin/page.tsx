'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setErrorMsg('Username Admin wajib diisi.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Password Admin wajib diisi.');
      return;
    }

    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !data) {
      setErrorMsg('Username atau password salah.');
      return;
    }

    localStorage.setItem('admin_login', 'true');
    router.push('/admin/members');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/40 p-4 relative">
      <div className="p-6 rounded-lg w-full max-w-sm text-center bg-black/20">
        <h1
          className="text-2xl font-semibold italic text-white mb-4"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          LOGIN ADMIN
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username Admin"
            className="border px-4 py-2 text-white rounded-md bg-black/20 border-neutral-400
                       focus:outline-none focus:ring-2 focus:ring-red-400 active:ring-red-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password Admin"
            className="border px-4 py-2 text-white rounded-md bg-black/20 border-neutral-400
                       focus:outline-none focus:ring-2 focus:ring-red-400 active:ring-red-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="bg-red-600 font-semibold text-white py-2 rounded-lg
                       hover:bg-red-500 hover:text-white
                       focus:bg-red-500 focus:ring-2 focus:ring-red-400
                       active:bg-red-700 active:text-white transition-colors"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Login
          </button>
        </form>
      </div>

      {/* Modal Error */}
      {errorMsg && (
        <div className="fixed inset-0 flex justify-center items-center z-50 pointer-events-none">
          <div
            className="bg-red-600 text-white rounded-2xl shadow-lg shadow-black/40 w-80 text-center p-6 pointer-events-auto scale-95 animate-[popIn_0.15s_ease-out_forwards]"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <h3 className="text-lg font-semibold mb-2">Login Gagal</h3>
            <p className="mb-4">{errorMsg}</p>
            <div className="border-t border-red-500">
              <button
                onClick={() => setErrorMsg('')}
                className="w-full py-3 font-medium rounded-lg hover:bg-red-700 focus:bg-red-700 focus:ring-2 focus:ring-red-400 active:bg-red-800 transition-colors"
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
    </div>
  );
}
