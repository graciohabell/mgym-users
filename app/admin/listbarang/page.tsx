'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import '../../globals.css';

interface Barang {
  id: string;
  nama: string;
  kategori: string;
  stok: number;
  harga_beli: number;
  harga_jual: number;
}

export default function BarangList() {
  const [barang, setBarang] = useState<Barang[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form Tambah Barang
  const [newBarang, setNewBarang] = useState({
    nama: '',
    kategori: '',
    stok: '',
    harga_beli: '',
    harga_jual: '',
  });
  const [addError, setAddError] = useState('');

  // Form Edit Barang
  const [editBarang, setEditBarang] = useState<Barang | null>(null);
  const [editForm, setEditForm] = useState({
    nama: '',
    kategori: '',
    stok: '',
    harga_beli: '',
    harga_jual: '',
  });
  const [editError, setEditError] = useState('');

  // Form Barang Keluar
  const [barangKeluar, setBarangKeluar] = useState({
    barangId: '',
    jumlah: '',
  });
  const [keluarError, setKeluarError] = useState('');

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

  // --- TAMBAH BARANG ---
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
    if (isNaN(Number(newBarang.stok)) || isNaN(Number(newBarang.harga_beli)) || isNaN(Number(newBarang.harga_jual))) {
      setAddError('Stok dan harga harus angka!');
      return;
    }

    const { data, error } = await supabase.from('barang').insert([{
      nama: newBarang.nama,
      kategori: newBarang.kategori,
      stok: Number(newBarang.stok),
      harga_beli: Number(newBarang.harga_beli),
      harga_jual: Number(newBarang.harga_jual),
    }]).select();

    if (!error && data) {
      setBarang([data[0], ...barang]);
      setNewBarang({ nama: '', kategori: '', stok: '', harga_beli: '', harga_jual: '' });
    } else {
      setAddError('Gagal menambahkan barang.');
    }
  };

  // --- DELETE BARANG ---
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('barang').delete().eq('id', id);
    if (!error) {
      setBarang(barang.filter((b) => b.id !== id));
      setConfirmDeleteId(null);
    } else alert('Gagal menghapus barang.');
  };

  // --- EDIT BARANG ---
  const openEdit = (item: Barang) => {
    setEditBarang(item);
    setEditForm({
      nama: item.nama,
      kategori: item.kategori,
      stok: item.stok.toString(),
      harga_beli: item.harga_beli.toString(),
      harga_jual: item.harga_jual.toString(),
    });
    setEditError('');
  };

  const handleEditChange = (field: keyof typeof editForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    if (!editForm.nama.trim() || !editForm.kategori.trim()) {
      setEditError('Nama & kategori wajib diisi!');
      return;
    }
    if (isNaN(Number(editForm.stok)) || isNaN(Number(editForm.harga_beli)) || isNaN(Number(editForm.harga_jual))) {
      setEditError('Stok dan harga harus angka!');
      return;
    }

    const { error } = await supabase.from('barang').update({
      nama: editForm.nama,
      kategori: editForm.kategori,
      stok: Number(editForm.stok),
      harga_beli: Number(editForm.harga_beli),
      harga_jual: Number(editForm.harga_jual),
    }).eq('id', editBarang!.id);

    if (!error) {
      setBarang((prev) =>
        prev.map((b) => (b.id === editBarang!.id ? { ...b, ...{
          nama: editForm.nama,
          kategori: editForm.kategori,
          stok: Number(editForm.stok),
          harga_beli: Number(editForm.harga_beli),
          harga_jual: Number(editForm.harga_jual),
        }} : b))
      );
      setEditBarang(null);
      setEditForm({ nama: '', kategori: '', stok: '', harga_beli: '', harga_jual: '' });
    } else setEditError('Gagal update barang.');
  };

  // --- BARANG KELUAR ---
  const handleKeluarChange = (field: keyof typeof barangKeluar, value: string) => {
    setBarangKeluar((prev) => ({ ...prev, [field]: value }));
  };

  const handleKeluarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeluarError('');
    const barangDipilih = barang.find(b => b.id === barangKeluar.barangId);
    if (!barangDipilih) {
      setKeluarError('Barang belum dipilih!');
      return;
    }
    const jumlah = Number(barangKeluar.jumlah);
    if (isNaN(jumlah) || jumlah <= 0) {
      setKeluarError('Jumlah harus angka lebih dari 0');
      return;
    }
    if (jumlah > barangDipilih.stok) {
      setKeluarError('Jumlah melebihi stok tersedia');
      return;
    }

    const { error } = await supabase.from('barang').update({
      stok: barangDipilih.stok - jumlah
    }).eq('id', barangDipilih.id);

    if (!error) {
      setBarang((prev) =>
        prev.map((b) => b.id === barangDipilih.id ? { ...b, stok: b.stok - jumlah } : b)
      );
      setBarangKeluar({ barangId: '', jumlah: '' });
    } else setKeluarError('Gagal update stok.');
  };

  // --- FILTER BARANG ---
  const filteredBarang = barang
    .filter((b) => b.nama.toLowerCase().includes(searchKeyword.toLowerCase()))
    .filter((b) => categoryFilter ? b.kategori === categoryFilter : true);

  const kategoriOptions = Array.from(new Set(barang.map(b => b.kategori)));

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans bg-black/50 min-h-screen text-white">
      <h2 className="text-3xl font-semibold italic mb-8 font-[Plus Jakarta Sans] bg-red-700 text-transparent bg-clip-text">
        TABEL DAFTAR BARANG WARUNG
      </h2>

      {/* FORM TAMBAH BARANG */}
      <form onSubmit={handleAddSubmit} className="bg-black border border-white/10 p-4 rounded-lg mb-6 space-y-3">
        <h3 className="text-xl font-semibold text-red-600 mb-2">Tambah Barang</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input type="text" placeholder="Nama" value={newBarang.nama} onChange={(e) => handleAddChange('nama', e.target.value)} className="p-2 rounded-md bg-black border border-white/10" required />
          <input type="text" placeholder="Kategori" value={newBarang.kategori} onChange={(e) => handleAddChange('kategori', e.target.value)} className="p-2 rounded-md bg-black border border-white/10" required />
          <input type="text" placeholder="Stok" value={newBarang.stok} onChange={(e) => handleAddChange('stok', e.target.value)} className="p-2 rounded-md bg-black border border-white/10" required />
          <input type="text" placeholder="Harga Beli" value={newBarang.harga_beli} onChange={(e) => handleAddChange('harga_beli', e.target.value)} className="p-2 rounded-md bg-black border border-white/10" required />
          <input type="text" placeholder="Harga Jual" value={newBarang.harga_jual} onChange={(e) => handleAddChange('harga_jual', e.target.value)} className="p-2 rounded-md bg-black border border-white/10" required />
        </div>
        {addError && <p className="text-red-500">{addError}</p>}
        <button type="submit" className="mt-2 px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 transition-colors">Simpan</button>
      </form>

      {/* FORM BARANG KELUAR */}
      <form onSubmit={handleKeluarSubmit} className="bg-black border border-white/10 p-4 rounded-lg mb-6 space-y-3">
        <h3 className="text-xl font-semibold text-red-600 mb-2">Barang Keluar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select value={barangKeluar.barangId} onChange={(e) => handleKeluarChange('barangId', e.target.value)} className="p-2 rounded-md bg-black border border-white/10">
            <option value="">Pilih Barang</option>
            {filteredBarang.map(b => (
              <option key={b.id} value={b.id}>{b.nama} (Stok: {b.stok})</option>
            ))}
          </select>
          <input type="text" placeholder="Jumlah Keluar" value={barangKeluar.jumlah} onChange={(e) => handleKeluarChange('jumlah', e.target.value)} className="p-2 rounded-md bg-black border border-white/10" />
        </div>
        {keluarError && <p className="text-red-500">{keluarError}</p>}
        <button type="submit" className="mt-2 px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 transition-colors">Proses Keluar</button>
      </form>

      {/* FILTER KATEGORI */}
      <div className="mb-3">
        <label className="mr-2">Filter Kategori:</label>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="p-1 rounded-md bg-black border border-white/10 text-white">
          <option value="">Semua</option>
          {kategoriOptions.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      {/* PENCARIAN */}
      <input type="text" placeholder="Cari barang..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} className="mb-3 px-2 py-1 rounded-md border border-white/10 text-white/50 w-full max-w-sm placeholder:text-white/10" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }} />

      {/* TABLE BARANG */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex space-x-4">
            <div className="h-12 w-12 bg-red-900 rounded-full"></div>
          </div>
        </div>
      ) : filteredBarang.length === 0 ? (
        <p className="text-gray-400 font-[Plus Jakarta Sans]">Barang tidak ditemukan.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-white/10 ">
          <table className="w-full text-left font-[Plus Jakarta Sans]">
            <thead className="bg-white/10">
              <tr>
                {['Nama', 'Kategori', 'Stok', 'Harga Beli', 'Harga Jual', 'Aksi'].map(
                  (header) => (
                    <th key={header} className="px-4 py-3 uppercase tracking-wider text-white font-semibold border-b border-white/10 text-xs">
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-black">
              {filteredBarang.map((b) => (
                <tr key={b.id} className="hover:bg-white/10 transition-all duration-300 group">
                  <td className="px-4 py-3 text-gray-300 text-sm">{b.nama}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{b.kategori}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{b.stok}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">Rp {b.harga_beli}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">Rp {b.harga_jual}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button className=" text-white/50 hover:text-white px-3 py-1 rounded-md text-xs transition-all duration-300 " onClick={() => openEdit(b)}>EDIT</button>
                    <button className=" text-red-500 hover:text-white px-3 py-1 rounded-md text-xs transition-all duration-300 " onClick={() => setConfirmDeleteId(b.id)}>X</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex justify-center items-center z-50 ">
          <div className=" bg-red-600 text-white rounded-lg shadow-lg w-60 text-center p-4 scale-95 opacity-0 animate-[popIn_0.2s_ease-out_forwards]">
            <h3 className="text-lg font-semibold mb-2">Hapus Barang?</h3>
            <p className="text-gray-300 mb-2">Yakin menghapus barang ini?</p>
            <div className="grid grid-cols-2 border-t rounded-2xl border-red-900/50">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="py-3 hover:bg-red-950/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="py-3 hover:bg-red-950/50 transition-colors border-l border-red-900/50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editBarang && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/60 p-4">
          <div className="bg-black border border-white/10 rounded-lg shadow-lg w-full max-w-md p-6 scale-95 opacity-0 animate-[popIn_0.2s_ease-out_forwards] font-[Plus Jakarta Sans]">
            <h3 className="text-xl font-semibold text-red-600 mb-4 text-center">
              Edit Barang
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4 text-white text-sm">
              {['nama','kategori','stok','harga_beli','harga_jual'].map((field) => (
                <div key={field}>
                  <label className="block mb-1">{field.replace('_',' ').toUpperCase()}:</label>
                  <input
                    type="text"
                    value={editForm[field as keyof typeof editForm]}
                    onChange={(e) => handleEditChange(field as keyof typeof editForm, e.target.value)}
                    className="w-full p-2 rounded-md bg-black border border-white/10 text-white"
                    required
                  />
                </div>
              ))}
              {editError && <p className="text-red-500 text-center">{editError}</p>}
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditBarang(null);
                    setEditForm({ nama: '', kategori: '', stok: '', harga_beli: '', harga_jual: '' });
                  }}
                  className="px-4 py-2 bg-red-700 rounded-md hover:bg-red-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
