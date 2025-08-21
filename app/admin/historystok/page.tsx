'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import '../../globals.css';

interface HistoryItem {
  id: string;
  barang_id: string;
  jumlah: number;
  created_at: string;
  type: 'masuk' | 'keluar';
  barang?: {
    nama: string;
    kategori: string;
  };
}

export default function HistoryBarang() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'masuk' | 'keluar' | ''>('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    
    try {
      
      const { data: masukData, error: masukError } = await supabase
        .from('barang_masuk')
        .select('*, barang(nama, kategori)')
        .order('created_at', { ascending: false });
      
      if (masukError) throw masukError;
      
      
      const { data: keluarData, error: keluarError } = await supabase
        .from('barang_keluar')
        .select('*, barang(nama, kategori)')
        .order('created_at', { ascending: false });
      
      if (keluarError) throw keluarError;
      
      
      const masukWithType = masukData?.map(item => ({
        ...item,
        type: 'masuk' as const
      })) || [];
      
      const keluarWithType = keluarData?.map(item => ({
        ...item,
        type: 'keluar' as const
      })) || [];
      
     
      const combinedHistory = [...masukWithType, ...keluarWithType]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setHistory(combinedHistory);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('id-ID', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const filteredHistory = history.filter(item => {
    const matchesDate = dateFilter 
      ? new Date(item.created_at).toLocaleDateString('en-CA') === dateFilter
      : true;
    
    const matchesType = typeFilter 
      ? item.type === typeFilter
      : true;
    
    return matchesDate && matchesType;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans bg-black/50 min-h-screen text-white">
      <h2 className="text-3xl font-semibold italic mb-8 font-[Plus Jakarta Sans] bg-red-700 text-transparent bg-clip-text">
        HISTORY BARANG MASUK & KELUAR
      </h2>

      {/* FILTERS */}
      <div className="bg-black border border-white/10 p-4 rounded-lg mb-6 space-y-3">
        <h3 className="text-xl font-semibold text-red-600 mb-2">Filter History</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1">Tanggal:</label>
            <input 
              type="date" 
              value={dateFilter} 
              onChange={e => setDateFilter(e.target.value)} 
              className="p-2 rounded-md bg-black border border-white/10 w-full" 
            />
          </div>
          <div>
            <label className="block mb-1">Jenis:</label>
            <select 
              value={typeFilter} 
              onChange={e => setTypeFilter(e.target.value as 'masuk' | 'keluar' | '')} 
              className="p-2 rounded-md bg-black border border-white/10 w-full"
            >
              <option value="">Semua</option>
              <option value="masuk">Masuk</option>
              <option value="keluar">Keluar</option>
            </select>
          </div>
        </div>
        <button 
          onClick={() => { setDateFilter(''); setTypeFilter(''); }} 
          className="mt-2 px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 transition-colors"
        >
          Reset Filter
        </button>
      </div>

      {/* TABLE HISTORY */}
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
                  <th key={h} className="px-4 py-3 uppercase tracking-wider text-white font-semibold border-b border-white/10 text-xs">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-black">
              {filteredHistory.map(item => {
                const { date, time } = formatDateTime(item.created_at);
                return (
                  <tr key={`${item.type}-${item.id}`} className="hover:bg-white/10 transition-all duration-300">
                    <td className="px-4 py-3 text-gray-300 text-sm">{date}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{time}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{item.barang?.nama || 'Unknown'}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{item.barang?.kategori || 'Unknown'}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{item.jumlah}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${item.type === 'masuk' ? 'bg-green-600' : 'bg-red-600'}`}>
                        {item.type === 'masuk' ? 'MASUK' : 'KELUAR'}
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