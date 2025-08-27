'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import '../../globals.css';

interface Barang {
  id: string;
  nama: string;
  kategori: string;
  stok: number;
  keterangan?: string;
}

export default function BarangList() {
  const [barang, setBarang] = useState<Barang[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [newBarang, setNewBarang] = useState({ nama: '', kategori: '', stok: '', keterangan: '' });
  const [addError, setAddError] = useState('');

  const [aksiBarang, setAksiBarang] = useState<{ id: string; jumlah: string; type: 'masuk' | 'keluar' } | null>(null);
  const [aksiError, setAksiError] = useState('');

  useEffect(() => {
    fetchBarang();
  }, []);

  const fetchBarang = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('barang')
      .select('*')
      .order('nama', { ascending: true });
    if (!error && data) setBarang(data);
    setLoading(false);
  };

  const handleAddChange = (field: keyof typeof newBarang, value: string) => {
    setNewBarang((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!newBarang.nama.trim() || !newBarang.kategori.trim()) {
      setAddError('Nama & kategori wajib diisi!');
      return;
    }
    if (isNaN(Number(newBarang.stok)) || Number(newBarang.stok) <= 0) {
      setAddError('Stok harus angka lebih dari 0!');
      return;
    }

    const stokNumber = Number(newBarang.stok);
    const { data, error } = await supabase.from('barang').insert([{
      nama: newBarang.nama,
      kategori: newBarang.kategori,
      stok: stokNumber,
      keterangan: newBarang.keterangan
    }]).select();

    if (!error && data) {
      const barangBaru = data[0];
      setBarang([barangBaru, ...barang]);

      await supabase.from('history_stok').insert([{
        barang_id: barangBaru.id,
        jumlah: stokNumber,
        tipe: 'masuk'
      }]);

      setNewBarang({ nama: '', kategori: '', stok: '', keterangan: '' });
    } else {
      setAddError('Gagal menambahkan barang baru.');
    }
  };

  const handleAksiChange = (field: 'jumlah', value: string) => {
    if (aksiBarang) setAksiBarang({ ...aksiBarang, [field]: value });
  };

  const handleAksiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aksiBarang) return;
    setAksiError('');
    const item = barang.find(b => b.id === aksiBarang.id);
    if (!item) {
      setAksiError('Barang tidak ditemukan!');
      return;
    }
    const jumlah = Number(aksiBarang.jumlah);
    if (isNaN(jumlah) || jumlah <= 0) {
      setAksiError('Jumlah harus angka lebih dari 0');
      return;
    }
    if (aksiBarang.type === 'keluar' && jumlah > item.stok) {
      setAksiError('Jumlah melebihi stok tersedia');
      return;
    }

    const newStok = aksiBarang.type === 'masuk' ? item.stok + jumlah : item.stok - jumlah;

    const { error } = await supabase.from('barang').update({ stok: newStok }).eq('id', item.id);
    if (!error) {
      setBarang(prev => prev.map(b => b.id === item.id ? { ...b, stok: newStok } : b));

      await supabase.from('history_stok').insert([{
        barang_id: item.id,
        jumlah,
        tipe: aksiBarang.type
      }]);

      setAksiBarang(null);
    } else {
      setAksiError('Gagal update stok.');
    }
  };

  const filteredBarang = barang
    .filter(b => b.nama.toLowerCase().includes(searchKeyword.toLowerCase()))
    .filter(b => categoryFilter ? b.kategori === categoryFilter : true);

  const kategoriOptions = Array.from(new Set(barang.map(b => b.kategori)));

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans bg-black/50 min-h-screen text-white">
      <h2 className="text-2xl font-semibold italic mb-2">DAFTAR BARANG</h2>
      <p className="text-sm mb-8 font-[Plus Jakarta Sans] italic text-white bg-clip-text">
        Halaman masuk, keluar, dan edit data stok barang M.GYM.
      </p>

      <form onSubmit={handleAddSubmit} className="bg-black border border-white/10 p-4 rounded-lg mb-6 space-y-3">
        <h3 className="text-xl font-semibold text-red-600 mb-2">Tambah Barang Baru</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input type="text" placeholder="Nama Barang" value={newBarang.nama} onChange={e => handleAddChange('nama', e.target.value)} className="p-2 rounded-md bg-black border border-white/10" required />
          <input type="text" placeholder="Kategori" value={newBarang.kategori} onChange={e => handleAddChange('kategori', e.target.value)} className="p-2 rounded-md bg-black border border-white/10" required />
          <input type="text" placeholder="Stok" value={newBarang.stok} onChange={e => handleAddChange('stok', e.target.value)} className="p-2 rounded-md bg-black border border-white/10" required />
          <input type="text" placeholder="Keterangan" value={newBarang.keterangan} onChange={e => handleAddChange('keterangan', e.target.value)} className="p-2 rounded-md bg-black border border-white/10" />
        </div>
        {addError && <p className="text-red-500">{addError}</p>}
        <button type="submit" className="mt-2 px-4 py-2 bg-red-700 rounded-md hover:bg-red-900">Simpan Barang Baru</button>
      </form>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="p-2 rounded-md bg-black border border-white/10">
          <option value="">Semua</option>
          {kategoriOptions.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <input type="text" placeholder="Cari barang..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} className="p-2 rounded-md bg-black border border-white/10 flex-grow max-w-sm" />
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : filteredBarang.length === 0 ? (
        <div className="text-center py-12 bg-black/30 rounded-md border border-white/10">Barang tidak ditemukan.</div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-white/10">
          <table className="w-full text-left">
            <thead className="bg-white/10">
              <tr>
                {['Nama','Kategori','Stok','Keterangan','Aksi'].map(h => (
                  <th key={h} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-black">
              {filteredBarang.map(b => (
                <tr
                  key={b.id}
                  tabIndex={0}
                  className="focus:bg-white/10 active:bg-white/10 hover:bg-white/10 transition-colors duration-200 outline-none"
                >
                  <td className="px-4 py-3">{b.nama}</td>
                  <td className="px-4 py-3">{b.kategori}</td>
                  <td className="px-4 py-3">{b.stok}</td>
                  <td className="px-4 py-3">{b.keterangan || '-'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setAksiBarang({ id: b.id, jumlah: '', type: 'masuk' })}
                      className="px-3 py-1 bg-green-700 rounded mr-2"
                    >
                      Masuk
                    </button>
                    <button
                      onClick={() => setAksiBarang({ id: b.id, jumlah: '', type: 'keluar' })}
                      className="px-3 py-1 bg-red-700 rounded"
                    >
                      Keluar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {aksiBarang && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/60 p-4">
          <div className="bg-black border border-white/10 rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-red-600 mb-4 text-center">
              {aksiBarang.type === 'masuk' ? 'Masukkan Stok' : 'Keluarkan Stok'}
            </h3>
            <form onSubmit={handleAksiSubmit} className="space-y-4">
              <input type="text" value={aksiBarang.jumlah} onChange={e => handleAksiChange('jumlah', e.target.value)} className="w-full p-2 rounded-md bg-black border border-white/10" required />
              {aksiError && <p className="text-red-500">{aksiError}</p>}
              <div className="flex justify-between mt-6">
                <button type="button" onClick={() => setAksiBarang(null)} className="px-4 py-2 bg-gray-700 rounded">Batal</button>
                <button type="submit" className="px-4 py-2 bg-red-600 rounded">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
