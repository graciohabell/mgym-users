'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AddMemberPage() {
  const [form, setForm] = useState({
    nama: '',
    email: '',
    no_hp: '',
    tgl_daftar: '',
    tgl_berakhir: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    const { data: existing, error: existingError } = await supabase
      .from('members')
      .select('id')
      .or(`email.eq.${form.email},no_hp.eq.${form.no_hp}`);

    if (existingError) {
      setErrorMsg('Gagal mengecek data unik. Coba lagi.');
      setLoading(false);
      return;
    }

    if (existing && existing.length > 0) {
      setErrorMsg('Email atau No HP sudah terdaftar.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('members').insert([
      {
        nama: form.nama,
        email: form.email,
        no_hp: form.no_hp,
        tgl_daftar: form.tgl_daftar,
        tgl_berakhir: form.tgl_berakhir,
      },
    ]);

    if (error) {
      setErrorMsg('Gagal menambahkan member.');
    } else {
      setSuccessMsg('Member berhasil ditambahkan!');
      setForm({
        nama: '',
        email: '',
        no_hp: '',
        tgl_daftar: '',
        tgl_berakhir: '',
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black p-6 font-jakarta">
      <h2 className="text-2xl md:text-3xl font-style italic font-semibold text-red-700 mb-6 tracking-tight text-center">
        FORM MEMBERSHIP
      </h2>

      <div className="max-w-md mx-auto bg-black p-6 rounded-xl transition-colors shadow-lg">
        <p className="text-white/50 text-center mb-6">
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {['nama', 'email', 'no_hp'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-red-300 capitalize mb-1">
                {field === 'no_hp' ? 'Nomor HP' : field}
              </label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                name={field}
                value={form[field as keyof typeof form]}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-black border border-white/10 text-gray-200 focus:ring-2  focus:border-transparent transition-all hover:border-red-600/40"
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-red-300 mb-1">
                Tanggal Daftar
              </label>
              <input
                type="date"
                name="tgl_daftar"
                value={form.tgl_daftar}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-black border border-white/10 text-white/10 focus:ring-2 focus:border-transparent transition-all hover:border-red-600/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-red-300 mb-1">
                Tanggal Berakhir
              </label>
              <input
                type="date"
                name="tgl_berakhir"
                value={form.tgl_berakhir}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-black border border-white/10 text-white/10 focus:ring-2 focus:border-transparent transition-all hover:border-red-600/40"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#fb0000] to-[#b30000] hover:from-red-700 hover:to-red-800 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            {loading ? 'Memproses...' : 'Tambahkan'}
          </button>
        </form>

        {successMsg && (
          <div className="mt-6 p-4 bg-green-900/20 text-green-400 rounded-lg border border-green-400/30 transition-all">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mt-6 p-4 bg-red-900/20 text-red-400 rounded-lg border border-red-400/30 transition-all">
            {errorMsg}
          </div>
        )}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-jakarta {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>
    </div>
  );
}
