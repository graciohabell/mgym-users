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

interface BookingFromDB {
  id: string;
  tanggal: string;
  jam: string;
  status: string;
  trainer: { nama: string }[] | null;
}

interface Booking {
  id: string;
  tanggal: string;
  jam: string;
  status: string;
  trainer: { nama: string };
}

interface Trainer {
  id: string;
  nama: string;
}

export default function MemberOnlyPage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberData | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(true);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);

  const [tanggal, setTanggal] = useState('');
  const [jam, setJam] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');

  const [testimoni, setTestimoni] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchMemberData = async () => {
      const memberId = localStorage.getItem('member_id');
      if (!memberId) return router.push('/login');

      const { data, error } = await supabase
        .from('members')
        .select('id, nama, tgl_daftar, tgl_berakhir')
        .eq('id', memberId)
        .single();

      if (error || !data) {
        localStorage.removeItem('member_id');
        return router.push('/login');
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

  const fetchBookings = async () => {
    const memberId = localStorage.getItem('member_id');
    if (!memberId) return;

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        tanggal,
        jam,
        status,
        trainer:trainer_id(nama)
      `)
      .eq('member_id', memberId);

    if (!error && data) {
      setBookings(
        data.map((b: BookingFromDB) => ({
          id: b.id,
          tanggal: b.tanggal,
          jam: b.jam,
          status: b.status,
          trainer: { nama: b.trainer && b.trainer.length > 0 ? b.trainer[0].nama : '-' },
        }))
      );
    }
  };

  const fetchTrainers = async () => {
    const { data, error } = await supabase
      .from('trainer_list')
      .select('id, nama');

    if (!error && data) {
      setTrainers(data);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchTrainers();
  }, []);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal || !jam || !trainerId || !member) {
      setBookingMessage('Isi semua field booking ya!');
      return;
    }

    const { error } = await supabase.from('bookings').insert([
      {
        member_id: member.id,
        trainer_id: trainerId,
        tanggal,
        jam,
        status: 'pending',
      },
    ]);

    if (error) {
      setBookingMessage('Gagal booking: ' + error.message);
    } else {
      setBookingMessage('Booking berhasil!');
      setTanggal('');
      setJam('');
      setTrainerId('');
      fetchBookings();
    }
  };

  const handleSubmitTestimoni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimoni || !rating || !member) {
      setMessage('Isi semua form testimoni ya!');
      return;
    }

    const { error } = await supabase.from('testimonials').insert([
      {
        member_id: member.id,
        nama: member.nama,
        testimoni,
        rating,
      },
    ]);

    if (error) {
      setMessage('Gagal kirim testimoni: ' + error.message);
    } else {
      setMessage(`Testimoni terkirim! Terima kasih, ${member.nama}`);
      setTestimoni('');
      setRating(5);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('member_id');
    router.push('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-600 font-body">
        Loading data membership...
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-white px-4 pt-28 font-semibold pb-20 text-black/70 font-body">
      <motion.div className="w-full max-w-md mx-auto bg-white/70 border border-red-100 rounded-2xl p-8 shadow-md text-center backdrop-blur-sm">
        <h1
          className="text-2xl font-display italic font-extrabold text-red-600 tracking-wide mb-4"
          style={{ fontFamily: 'Tomorrow, sans-serif', fontStyle: 'italic' }}
        >
          M.GYM
        </h1>
        <p>Selamat Datang, {member?.nama} !</p>
        <p>
          Membership kamu aktif dari {member?.tgl_daftar} sampai {member?.tgl_berakhir}.
        </p>
        {!expired && daysLeft !== null && (
          <p
            className={`mt-2 font-display font-semibold ${
              daysLeft <= 7 ? 'text-red-700' : 'text-green-700'
            }`}
          >
            {daysLeft <= 7 ? `BERAKHIR DALAM ${daysLeft} HARI` : 'MASIH AKTIF'}
          </p>
        )}
        {expired && (
          <p className="text-red-700 font-semibold font-display">SUDAH JATUH TEMPO</p>
        )}
      </motion.div>

      <motion.div className="w-full max-w-md mx-auto mt-12 bg-white/70 border border-red-100 rounded-2xl p-6 shadow-md backdrop-blur-sm">
        <h2 className="text-lg font-semibold mb-4 text-red-600">Booking Sesi Personal Trainer</h2>
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full text-black/70 p-2 border border-black/50 rounded-md
                       focus:outline-none focus:ring-2 focus:ring-red-400 active:ring-red-500"
          />
          <input
            type="time"
            value={jam}
            onChange={(e) => setJam(e.target.value)}
            className="w-full text-black/70 p-2 border border-black/50 rounded-md
                       focus:outline-none focus:ring-2 focus:ring-red-400 active:ring-red-500"
          />
          <select
            value={trainerId}
            onChange={(e) => setTrainerId(e.target.value)}
            className="w-full text-black/70 border border-black/50 p-2 rounded-md
                       focus:outline-none focus:ring-2 focus:ring-red-400 active:ring-red-500"
          >
            <option value="">Pilih Trainer</option>
            {trainers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nama}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-md
                       hover:bg-white hover:text-red-600
                       focus:bg-red-500 focus:ring-2 focus:ring-red-400
                       active:bg-red-700 transition-colors"
          >
            Booking
          </button>
          {bookingMessage && <p className="text-sm text-center text-red-600">{bookingMessage}</p>}
        </form>
      </motion.div>

      <motion.div className="w-full max-w-md mx-auto mt-8 bg-white/70 rounded-2xl p-6 shadow-md backdrop-blur-sm">
        <h2 className="text-lg font-semibold mb-4 text-red-600">Jadwal Booking</h2>
        {bookings.length === 0 ? (
          <p className="text-sm text-black/70">Belum ada booking.</p>
        ) : (
          <ul className="space-y-3">
            {bookings.map((b) => (
              <li key={b.id} className="p-3 bg-white text-black/70 text-sm shadow-sm">
                <p>
                  <strong>Tanggal :</strong> {b.tanggal}
                </p>
                <p>
                  <strong>Jam :</strong> {b.jam}
                </p>
                <p>
                  <strong>Trainer :</strong> {b.trainer.nama}
                </p>
                <p>
                  <strong>Status :</strong> {b.status}
                </p>
                <p className="text-sm text-black/70">
                  Hubungi admin jika jadwal belum di approved 1x24 jam !
                </p>
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      <motion.div className="w-full max-w-md mx-auto mt-12">
        <div className="border-t pt-8">
          <h2 className="text-sm font-semibold mb-4 text-black/70 text-center">TESTIMONI</h2>
          <form onSubmit={handleSubmitTestimoni} className="text-sm space-y-4">
            <textarea
              value={testimoni}
              onChange={(e) => setTestimoni(e.target.value)}
              placeholder="Tulis sudut pandang kamu terhadap M.GYM..."
              className="text-md w-full p-3 border border-gray-300 text-black rounded-md
                         focus:outline-none focus:ring-2 focus:ring-red-400 active:ring-red-500"
              rows={4}
            />
            <div>
              <label className="block mb-1 font-medium">Rating:</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full p-2 border rounded-md
                           focus:outline-none focus:ring-2 focus:ring-red-400 active:ring-red-500"
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
              className="text-sm mt-2 w-full bg-red-600 text-white py-2 rounded-md
                         hover:bg-white hover:text-red-600
                         focus:bg-red-500 focus:ring-2 focus:ring-red-400
                         active:bg-red-700 transition-colors"
            >
              Kirim
            </button>
            {message && <p className="text-sm text-center mt-2 text-red-600">{message}</p>}
          </form>
        </div>
      </motion.div>

      {/* Tombol Logout di Paling Bawah */}
      <motion.div 
        className="w-full max-w-md mx-auto mt-12 mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md
                     hover:bg-red-600 hover:text-white
                     focus:outline-none focus:ring-2 focus:ring-red-400
                     transition-colors duration-300"
        >
          Logout
        </button>
      </motion.div>
    </main>
  );
} 