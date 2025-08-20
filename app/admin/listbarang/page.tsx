'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import '../../globals.css';

interface Barang {
  id: string;
  nama: string;
  kategori: string;
  stok: number;
  keterangan: string;
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
      .order('created_at', { ascending: false });
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

    const { data, error } = await supabase.from('barang').insert([{
      nama: newBarang.nama,
      kategori: newBarang.kategori,
      stok: Number(newBarang.stok),
      keterangan: newBarang.keterangan,
    }]).select();

    if (!error && data) {
      setBarang([data[0], ...barang]);
      
      await supabase.from('barang_masuk').insert([{ barang_id: data[0].id, jumlah: Number(newBarang.stok), created_at: new Date() }]);
      setNewBarang({ nama: '', kategori: '', stok: '', keterangan: '' });
    } else setAddError('Gagal menambahkan barang baru.');
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
      
      if (aksiBarang.type === 'masuk') {
        await supabase.from('barang_masuk').insert([{ barang_id: item.id, jumlah, created_at: new Date() }]);
      } else {
        await supabase.from('barang_keluar').insert([{ barang_id: item.id, jumlah, created_at: new Date() }]);
      }
      setAksiBarang(null);
    } else setAksiError('Gagal update stok.');
  };

  
  const filteredBarang = barang
    .filter(b => b.nama.toLowerCase().includes(searchKeyword.toLowerCase()))
    .filter(b => categoryFilter ? b.kategori === categoryFilter : true);

  const kategoriOptions = Array.from(new Set(barang.map(b => b.kategori)));

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans bg-black/50 min-h-screen text-white">
      <h2 className="text-3xl font-semibold italic mb-8 font-[Plus Jakarta Sans] bg-red-700 text-transparent bg-clip-text">
        TABEL BARANG
      </h2>

      {/* FORM BARANG BARU */}
      <form onSubmit={handleAddSubmit} className="bg-black border border-white/10 p-4 rounded-lg mb-6 space-y-3">
        <h3 className="text-xl font-semibold text-red-600 mb-2">Tambah Barang Baru</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input type="text" placeholder="Nama" value={newBarang.nama} onChange={e => handleAddChange('nama', e.target.value)} className="p-2 rounded-md bg-black border border-white/10" required />
          <input type="text" placeholder="Kategori" value={newBarang.kategori} onChange={e => handleAddChange('kategori', e.target.value)} className="p-2 rounded-md bg-black border border-white/10" required />
          <input type="text" placeholder="Stok" value={newBarang.stok} onChange={e => handleAddChange('stok', e.target.value)} className="p-2 rounded-md bg-black border border-white/10" required />
          <input type="text" placeholder="Keterangan" value={newBarang.keterangan} onChange={e => handleAddChange('keterangan', e.target.value)} className="p-2 rounded-md bg-black border border-white/10" />
        </div>
        {addError && <p className="text-red-500">{addError}</p>}
        <button type="submit" className="mt-2 px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 transition-colors">Simpan Barang Baru</button>
      </form>

      {/* FILTER KATEGORI */}
      <div className="mb-3">
        <label className="mr-2">Filter Kategori:</label>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="p-1 rounded-md bg-black border border-white/10 text-white">
          <option value="">Semua</option>
          {kategoriOptions.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      {/* PENCARIAN */}
      <input type="text" placeholder="Cari barang..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} className="mb-3 px-2 py-1 rounded-md border border-white/10 text-white/50 w-full max-w-sm placeholder:text-white/10" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }} />

      {/* TABLE BARANG */}
      {loading ? (
        <div className="flex justify-center items-center h-64">Loading...</div>
      ) : filteredBarang.length === 0 ? (
        <p className="text-gray-400 font-[Plus Jakarta Sans]">Barang tidak ditemukan.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-white/10">
          <table className="w-full text-left font-[Plus Jakarta Sans]">
            <thead className="bg-white/10">
              <tr>
                {['Nama','Kategori','Stok','Keterangan','Aksi'].map(h => <th key={h} className="px-4 py-3 uppercase tracking-wider text-white font-semibold border-b border-white/10 text-xs">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-black">
              {filteredBarang.map(b => (
                <tr key={b.id} className="hover:bg-white/10 transition-all duration-300">
                  <td className="px-4 py-3 text-gray-300 text-sm">{b.nama}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{b.kategori}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{b.stok}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{b.keterangan}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button className="px-3 py-1 bg-green-600 rounded text-xs hover:bg-green-700 transition" onClick={() => setAksiBarang({ id: b.id, jumlah: '', type: 'masuk' })}>Masukkan</button>
                    <button className="px-3 py-1 bg-red-600 rounded text-xs hover:bg-red-700 transition" onClick={() => setAksiBarang({ id: b.id, jumlah: '', type: 'keluar' })}>Keluar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL MASUK / KELUAR */}
      {aksiBarang && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/60 p-4">
          <div className="bg-black border border-white/10 rounded-lg shadow-lg w-full max-w-md p-6 font-[Plus Jakarta Sans]">
            <h3 className="text-xl font-semibold text-red-600 mb-4 text-center">{aksiBarang.type === 'masuk' ? 'Masukkan Stok' : 'Barang Keluar'}</h3>
            <form onSubmit={handleAksiSubmit} className="space-y-4 text-white text-sm">
              <div>
                <label className="block mb-1">Jumlah:</label>
                <input type="text" value={aksiBarang.jumlah} onChange={e => handleAksiChange('jumlah', e.target.value)} className="w-full p-2 rounded-md bg-black border border-white/10 text-white" required />
              </div>
              {aksiError && <p className="text-red-500 text-center">{aksiError}</p>}
              <div className="flex justify-between mt-6">
                <button type="button" onClick={() => setAksiBarang(null)} className="px-4 py-2 bg-red-700 rounded-md hover:bg-red-800 transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 transition-colors">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
