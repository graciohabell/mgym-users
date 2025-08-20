'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface HistoryItem {
  id: string;
  nama: string;
  kategori: string;
  jumlah: number;
  tipe: 'MASUK' | 'KELUAR';
  created_at: string;
}

export default function HistoryBarang() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);

    
    const { data: masukData } = await supabase
      .from('barang_masuk')
      .select('id,jumlah,created_at,barang(nama,kategori)')
      .order('created_at', { ascending: false });

    const { data: keluarData } = await supabase
      .from('barang_keluar')
      .select('id,jumlah,created_at,barang(nama,kategori)')
      .order('created_at', { ascending: false });

    if (masukData && keluarData) {
      const merged: HistoryItem[] = [
        ...masukData.map((m: any) => ({
          id: m.id,
          nama: m.barang.nama,
          kategori: m.barang.kategori,
          jumlah: m.jumlah,
          tipe: 'MASUK' as const,
          created_at: m.created_at,
        })),
        ...keluarData.map((k: any) => ({
          id: k.id,
          nama: k.barang.nama,
          kategori: k.barang.kategori,
          jumlah: k.jumlah,
          tipe: 'KELUAR' as const,
          created_at: k.created_at,
        })),
      ];

      merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setHistory(merged);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 text-white font-[Plus Jakarta Sans]">
      <h2 className="text-3xl font-semibold mb-6 text-red-600">In-Out Barang</h2>

      {loading ? (
        <p>Loading...</p>
      ) : history.length === 0 ? (
        <p>Tidak ada history.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-white/10">
          <table className="w-full text-left">
            <thead className="bg-white/10">
              <tr>
                {['Nama', 'Kategori', 'Jumlah', 'Tipe', 'Waktu'].map((header) => (
                  <th key={header} className="px-4 py-2 border-b border-white/10 text-xs uppercase text-gray-200">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-black">
              {history.map((h) => (
                <tr key={h.id} className="hover:bg-white/10 transition-all duration-200">
                  <td className="px-4 py-2 text-gray-300">{h.nama}</td>
                  <td className="px-4 py-2 text-gray-400">{h.kategori}</td>
                  <td className={`px-4 py-2 ${h.tipe === 'MASUK' ? 'text-green-400' : 'text-red-400'}`}>{h.jumlah}</td>
                  <td className="px-4 py-2">{h.tipe}</td>
                  <td className="px-4 py-2">
                    {new Date(h.created_at).toLocaleString('id-ID', { hour12: false })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
