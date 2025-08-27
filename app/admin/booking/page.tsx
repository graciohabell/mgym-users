'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import '../../globals.css';

interface BookingFromDB {
  id: string;
  member_id: string;
  members: { nama: string }[];
  trainer_list: { nama: string }[];
  tanggal: string;
  jam: string;
  status: string;
  created_at: string;
}

interface Booking {
  id: string;
  member_id: string;
  member_nama: string;
  trainer_nama: string;
  tanggal: string;
  jam: string;
  status: string;
  created_at: string;
}

export default function BookingList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [popup, setPopup] = useState<{ action: string; id: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        tanggal,
        jam,
        status,
        created_at,
        member_id,
        members (nama),
        trainer_id,
        trainer_list (nama)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mapped = (data as BookingFromDB[]).map((b) => ({
        id: b.id,
        member_id: b.member_id,
        member_nama: b.members?.[0]?.nama || '-',
        trainer_nama: b.trainer_list?.[0]?.nama || '-',
        tanggal: b.tanggal,
        jam: b.jam,
        status: b.status,
        created_at: b.created_at
      }));
      setBookings(mapped);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    setActionLoading(true);
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
    } else {
      alert('Gagal mengubah status booking.');
    }
    setPopup(null);
    setActionLoading(false);
  };

  const deleteBooking = async (id: string) => {
    setActionLoading(true);
    const { error } = await supabase.from('bookings').delete().eq('id', id);

    if (!error) {
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } else {
      alert('Gagal menghapus booking.');
    }
    setPopup(null);
    setActionLoading(false);
  };

  const filteredBookings = bookings.filter((b) =>
    b.member_nama.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans bg-black/50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-3 font-[Plus Jakarta Sans] bg-red-700 text-white bg-clip-text">
        PERMINTAAN BOOKING TRAINER
      </h2>

      <h3 className="text-sm mb-8 italic font-[Plus Jakarta Sans] text-white bg-clip-text">
        Halaman aprrove dan decline request jadwal trainer dari member M.GYM.
      </h3>

      <input
        type="text"
        placeholder="Cari nama member..."
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        className="mb-3 px-2 py-1 rounded-md border border-white/10 text-white/50 w-full max-w-sm placeholder:text-white/10"
        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex space-x-4">
            <div className="h-12 w-12 bg-red-900 rounded-full"></div>
          </div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <p className="text-gray-400 font-[Plus Jakarta Sans]">Booking tidak ditemukan.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-white/10">
          <table className="w-full text-left font-[Plus Jakarta Sans]">
            <thead className="bg-white/10">
              <tr>
                {['Nama Member','Trainer','Tanggal','Jam','Status','Dibuat','Aksi'].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 uppercase tracking-wider text-white font-semibold border-b border-white/10 text-xs"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-black">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-white/10 transition-all duration-300 group">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-300 text-sm">{b.member_nama}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-400 text-sm">{b.trainer_nama}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-400 text-sm">{b.tanggal}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-400 text-sm">{b.jam}</td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${
                    b.status==='approved' ? 'text-green-400' : b.status==='rejected' ? 'text-red-400' : 'text-yellow-400'
                  }`}>{b.status}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-sm">{new Date(b.created_at).toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 whitespace-nowrap space-x-2">
                    <button
                      disabled={actionLoading}
                      onClick={() => setPopup({ action: 'approve', id: b.id })}
                      className="text-green-500 font-semibold hover:text-white px-3 py-1 rounded-md text-xs transition-all duration-300"
                    >
                      approve
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => setPopup({ action: 'reject', id: b.id })}
                      className="text-red-500 font-semibold hover:text-white px-3 py-1 rounded-md text-xs transition-all duration-300"
                    >
                      reject
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => setPopup({ action: 'delete', id: b.id })}
                      className="text-red-700 hover:text-white px-2 py-1 rounded-md text-xs transition-all duration-300 font-extrabold"
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {popup && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
          <div
            className="bg-red-600 text-white rounded-lg shadow-lg w-60 text-center p-4 scale-95 opacity-0 animate-[popIn_0.2s_ease-out_forwards]"
            style={{ animationFillMode: 'forwards' }}
          >
            <h3 className="text-lg font-semibold text-white mb-2">
              {popup.action==='approve' ? 'Setujui Booking Ini?' : popup.action==='reject' ? 'Tolak Booking Ini?' : 'Hapus Booking Ini?'}
            </h3>
            <p className="text-gray-300 mb-2">
              {popup.action==='delete' ? 'Yakin menghapus booking ini?' : 'Yakin mengubah status booking ini?'}
            </p>
            <div className="grid grid-cols-2 border-t rounded-2xl border-red-900/50">
              <button onClick={()=>setPopup(null)} className="py-3 text-white font-medium hover:bg-red-950/50 transition-colors">Cancel</button>
              <button
                onClick={()=>{
                  if(popup.action==='approve') updateStatus(popup.id,'approved');
                  if(popup.action==='reject') updateStatus(popup.id,'rejected');
                  if(popup.action==='delete') deleteBooking(popup.id);
                }}
                className="py-3 text-white font-medium hover:bg-red-950/50 transition-colors border-l border-red-900/50"
              >
                {popup.action==='delete' ? 'Delete' : popup.action==='approve' ? 'Ya, Setujui' : 'Ya, Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes popIn { from { transform: scale(0.95); opacity:0 } to { transform: scale(1); opacity:1 } }
      `}</style>
    </div>
  );
}
