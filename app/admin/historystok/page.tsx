'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import '../../globals.css';

interface HistoryItem {
  id: string;
  barang_id: string;
  jumlah: number;
  tipe: 'masuk' | 'keluar';
  created_at: string;
  barang?: {
    nama: string;
    kategori: string;
  } | null;
}

export default function HistoryBarang() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'masuk' | 'keluar' | ''>('');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('history_stok')
        .select('id, barang_id, jumlah, tipe, created_at, barang(nama, kategori)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      
      const normalizedData = (data || []).map((item: any) => ({
        ...item,
        barang: item.barang?.[0] || null
      }));

      setHistory(normalizedData);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const filteredHistory = history.filter(item => {
    const matchesDate = dateFilter ? new Date(item.created_at).toLocaleDateString('en-CA') === dateFilter : true;
    const matchesType = typeFilter ? item.tipe === typeFilter : true;
    const matchesSearch = searchKeyword
      ? item.barang?.nama?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.barang?.kategori?.toLowerCase().includes(searchKeyword.toLowerCase())
      : true;
    return matchesDate && matchesType && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans bg-black/50 min-h-screen text-white">
      <h2 className="text-3xl font-semibold italic mb-8 font-[Plus Jakarta Sans] text-white bg-clip-text">
        HISTORY BARANG MASUK & KELUAR
      </h2>


      {loading ? (
        <div className="flex justify-center items-center h-64">Loading...</div>
      ) : filteredHistory.length === 0 ? (
        <p className="text-gray-400 font-[Plus Jakarta Sans]">Tidak ada history ditemukan.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-white/10">
          <table className="w-full text-left font-[Plus Jakarta Sans]">
            <thead className="bg-white/10">
              <tr>
                {['Tanggal', 'Waktu', 'Nama Barang', 'Kategori', 'Jumlah', 'Jenis'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 uppercase tracking-wider text-white font-semibold border-b border-white/10 text-xs"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-black">
  {filteredHistory.map(item => {
    const { date, time } = formatDateTime(item.created_at);
    return (
      <tr
        key={item.id}
        tabIndex={0} // Supaya bisa focus saat di-tap
        className="hover:bg-white/10 focus:bg-white/10 active:bg-white/10 transition-colors duration-200 outline-none"
      >
        <td className="px-4 py-3 text-gray-300 text-sm">{date}</td>
        <td className="px-4 py-3 text-gray-300 text-sm">{time}</td>
        <td className="px-4 py-3 text-gray-300 text-sm">{item.barang?.nama || 'Unknown'}</td>
        <td className="px-4 py-3 text-gray-400 text-sm">{item.barang?.kategori || 'Unknown'}</td>
        <td className="px-4 py-3 text-gray-400 text-sm">{item.jumlah}</td>
        <td className="px-4 py-3">
          <span
            className={`px-2 py-1 rounded text-xs flex items-center gap-1 w-24 justify-center ${
              item.tipe === 'masuk' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {item.tipe === 'masuk' ? (
              <i className="bi bi-box-arrow-in-down"></i>
            ) : (
              <i className="bi bi-box-arrow-up"></i>
            )}
            {item.tipe.toUpperCase()}
          </span>
        </td>
      </tr>
    );
  })}
</tbody>

          </table>
        </div>
      )}
    </div>
  );
}
