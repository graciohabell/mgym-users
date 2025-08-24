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
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'error' | 'confirm'>('confirm');
  const [modalMessage, setModalMessage] = useState('');

  const convertDMYtoYMD = (dateStr: string) => {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [d, m, y] = dateStr.split('/');
      return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    return '';
  }

  const isValidISODate = (dateStr: string) => /^\d{4}-\d{2}-\d{2}$/.test(dateStr);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOpenModal = (e: React.FormEvent) => {
    e.preventDefault();
    const tglDaftarISO = convertDMYtoYMD(form.tgl_daftar);
    const tglBerakhirISO = convertDMYtoYMD(form.tgl_berakhir);

    if (!form.nama || !form.email || !form.no_hp || !form.tgl_daftar || !form.tgl_berakhir) {
      setModalType('error');
      setModalMessage('Semua field wajib diisi.');
      setShowModal(true);
      return;
    }

    if (!isValidISODate(tglDaftarISO) || !isValidISODate(tglBerakhirISO)) {
      setModalType('error');
      setModalMessage('Tanggal harus dalam format YYYY-MM-DD atau DD/MM/YYYY yang valid.');
      setShowModal(true);
      return;
    }

    setModalType('confirm');
    setModalMessage('Yakin ingin menambahkan member ini?');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setShowModal(false);

    const tglDaftarISO = convertDMYtoYMD(form.tgl_daftar);
    const tglBerakhirISO = convertDMYtoYMD(form.tgl_berakhir);

    const { data: existing, error: existingError } = await supabase
      .from('members')
      .select('id')
      .or(`email.eq.${form.email},no_hp.eq.${form.no_hp}`);

    if (existingError) {
      setModalType('error');
      setModalMessage('Gagal mengecek data unik. Coba lagi.');
      setShowModal(true);
      setLoading(false);
      return;
    }

    if (existing && existing.length > 0) {
      setModalType('error');
      setModalMessage('Email atau No HP sudah terdaftar.');
      setShowModal(true);
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('members').insert([{
      nama: form.nama,
      email: form.email,
      no_hp: form.no_hp,
      tgl_daftar: tglDaftarISO,
      tgl_berakhir: tglBerakhirISO,
    }]);

    if (error) {
      setModalType('error');
      setModalMessage(`Gagal menambahkan member: ${error.message}`);
      setShowModal(true);
    } else {
      setModalType('error');
      setModalMessage('Member berhasil ditambahkan!');
      setShowModal(true);
      setForm({ nama:'', email:'', no_hp:'', tgl_daftar:'', tgl_berakhir:'' });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black p-6 font-jakarta">
      <h2 className="text-2xl md:text-3xl italic font-semibold text-white mb-6 tracking-tight text-center">
        FORM MEMBERSHIP
      </h2>

      <div className="max-w-md mx-auto bg-black p-6 rounded-xl shadow-lg">
        <form onSubmit={handleOpenModal} className="space-y-5">
          {['nama','email','no_hp'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-red-300 capitalize mb-1">
                {field==='no_hp' ? 'Nomor HP' : field}
              </label>
              <input
                type={field==='email'?'email':'text'}
                name={field}
                value={form[field as keyof typeof form]}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-black border border-white/10 text-gray-200 focus:ring-2 focus:border-transparent transition-all hover:border-red-600/40"
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-red-300 mb-1">Tanggal Daftar</label>
              <input
                type="date"
                name="tgl_daftar"
                value={form.tgl_daftar}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-black border border-white/10 text-gray-200 focus:ring-2 focus:border-transparent transition-all hover:border-red-600/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-red-300 mb-1">Tanggal Berakhir</label>
              <input
                type="date"
                name="tgl_berakhir"
                value={form.tgl_berakhir}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-black border border-white/10 text-gray-200 focus:ring-2 focus:border-transparent transition-all hover:border-red-600/40"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#fb0000] to-[#b30000] hover:from-red-700 hover:to-red-800 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            {loading ? 'Memproses...' : 'Tambahkan'}
          </button>
        </form>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-red-600 border border-red-700 rounded-xl p-6 max-w-sm w-full text-center">
            <p className="text-white text-lg mb-6">{modalMessage}</p>
            {modalType==='error'?(
              <button onClick={()=>setShowModal(false)} className="px-4 py-2 rounded-lg bg-red-700 text-white hover:bg-red-800">OK</button>
            ):(
              <div className="flex justify-center gap-4">
                <button onClick={()=>setShowModal(false)} className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-red-800">Batal</button>
                <button onClick={handleSubmit} className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-red-800">Yakin</button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>
    </div>
  )
}
