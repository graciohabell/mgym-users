'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface MemberData {
  id: string;
  nama: string;
  tgl_daftar: string;
  tgl_berakhir: string;
}

export default function MemberOnlyPage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberData | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(true);

  const [testimoni, setTestimoni] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchMemberData = async () => {
      const memberId = typeof window !== 'undefined' ? localStorage.getItem('member_id') : null;

      if (!memberId) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('members')
        .select('id, nama, tgl_daftar, tgl_berakhir')
        .eq('id', memberId)
        .single();

      if (error || !data) {
        localStorage.removeItem('member_id');
        router.push('/login');
        return;
      }

      const today = new Date();
      const endDate = new Date(data.tgl_berakhir);
      const diffTime = endDate.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setMember(data);
      setDaysLeft(daysRemaining);
      setExpired(daysRemaining < 0);
      setLoading(false);
    };

    fetchMemberData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimoni || !rating || !member) {
      setMessage('Feedback & Rating kamu saat ini merupakan bagian dari perkembangan M.GYM di masa mendatang !');
      return;
    }

    const { error } = await supabase.from('testimonials').insert([
      {
        id_member: member.id,
        nama: member.nama,
        testimoni: testimoni,
        rating: rating,
      },
    ]);

    if (error) {
      setMessage('Gagal kirim testimoni: ' + error.message);
    } else {
      setMessage(`Testimoni terkirim! Terima kasih, ${member?.nama}`);
      setTestimoni('');
      setRating(5);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-600 font-body">
        Loading data membership...
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-white px-4 pt-28 pb-20 font-body">
      {/* Status Member Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md mx-auto bg-white/70 border border-red-100 rounded-2xl p-8 shadow-md text-center backdrop-blur-sm"
      >
        <h1 className="text-2xl font-display italic font-extrabold text-red-600 tracking-wide mb-4" style={{ fontFamily: 'Tomorrow, sans-serif' }}>
          Hai,
        </h1>
        <div className="text-sm md:text-base text-neutral-700 mt-2 leading-relaxed font-body" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          <p>Selamat Datang, {member?.nama}!</p>
          <p>Membership M.GYM kamu aktif dari {member?.tgl_daftar} sampai {member?.tgl_berakhir}.</p>
          <p>.</p>
          {!expired && daysLeft !== null && (
            <p className={`font-display ${daysLeft <= 7 ? 'text-red-500' : 'text-green-500'}`}>
              {daysLeft <= 7
                ? `MEMBERSHIP AKAN BERAKHIR DALAM ${daysLeft} HARI LAGI`
                : `MEMBERSHIP MASIH AKTIF`}
            </p>
          )}
          {expired && (
            <p className="text-red-700 font-display">MEMBERSHIP SUDAH JATUH TEMPO</p>
          )}
          <p>.</p>
          <p className="text-sm mt-2"> Tidak hanya sekedar latihan, Tetapi membangun kekeluargaan.</p>
        </div>
        <h2 className="text-2xl font-display italic font-extrabold text-red-600 tracking-wide mt-6" style={{ fontFamily: 'Tomorrow, sans-serif' }}>
          M.GYM
        </h2>
      </motion.div>

      {/* Form Testimoni */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="w-full max-w-md mx-auto mt-16"
      >
        <div className="border-t pt-8">
          <h2 className="text-sm mb-4 text-black/70 text-center"style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Testimoni
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4"style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <textarea
              value={testimoni}
              onChange={(e) => setTestimoni(e.target.value)}
              placeholder="Tulis sudut pandang kamu terhadap M-Gym..."
              className="text-sm w-full p-3 border border-gray-300 text-black rounded-md focus:outline-none focus:ring focus:border-red-300"
              rows={4}
            />
            <div>
              <label className="block mb-1 font-medium">Rating:</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full p-2 border rounded-md"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                <option value={4}>⭐⭐⭐⭐ (4)</option>
                <option value={3}>⭐⭐⭐ (3)</option>
                <option value={2}>⭐⭐ (2)</option>
                <option value={1}>⭐ (1)</option>
              </select>
            </div>
            <button
              type="submit"
              className="text-sm mt-2 w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
            >
              Kirim Testimoni
            </button>
            {message && (
              <p className="text-sm text-center mt-2 text-red-600">{message}</p>
            )}
          </form>
        </div>
      </motion.div>
    </main>
  );
}
