'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import '../../globals.css';

interface Member {
  id: string;
  nama: string;
  tgl_daftar: string;
  tgl_berakhir: string;
}

export default function MembersList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [editMember, setEditMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({
    nama: '',
    tgl_daftar: '',
    tgl_berakhir: '',
  });
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('members')
      .select('id, nama, tgl_daftar, tgl_berakhir')
      .order('tgl_daftar', { ascending: false });

    if (!error && data) setMembers(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (!error) {
      setMembers(members.filter((m) => m.id !== id));
      setConfirmDeleteId(null);
    } else {
      alert('Gagal menghapus member.');
    }
  };

  const openEdit = (member: Member) => {
    setEditMember(member);
    setEditForm({
      nama: member.nama,
      tgl_daftar: member.tgl_daftar,
      tgl_berakhir: member.tgl_berakhir,
    });
    setEditError('');
  };

  const handleEditChange = (field: keyof typeof editForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');

    if (!editForm.nama.trim() || !editForm.tgl_daftar.trim() || !editForm.tgl_berakhir.trim()) {
      setEditError('Semua field wajib diisi ya!');
      return;
    }

    const { data, error } = await supabase
      .from('members')
      .update({
        nama: editForm.nama,
        tgl_daftar: editForm.tgl_daftar,
        tgl_berakhir: editForm.tgl_berakhir,
      })
      .eq('id', editMember!.id);

    if (error) {
      console.error('Supabase update error:', error);
      setEditError(`Gagal update: ${error.message}`);
    } else {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editMember!.id
            ? {
                ...m,
                nama: editForm.nama,
                tgl_daftar: editForm.tgl_daftar,
                tgl_berakhir: editForm.tgl_berakhir,
              }
            : m
        )
      );
      setEditMember(null);
    }
  };

  const filteredMembers = members.filter((m) =>
    m.nama.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans bg-black/50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-1 font-[Plus Jakarta Sans]  text-white bg-clip-text">
        TABEL MEMBER
      </h2>

      <h3 className="text-sm mb-8 italic font-[Plus Jakarta Sans] text-white bg-clip-text">
        Halaman hapus dan edit data membership M.GYM.
      </h3>

      <input
        type="text"
        placeholder="Cari nama..."
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
      ) : filteredMembers.length === 0 ? (
        <p className="text-gray-400 font-[Plus Jakarta Sans]">Member tidak ditemukan.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-white/10">
          <table className="w-full text-left font-[Plus Jakarta Sans]">
            <thead className="bg-white/10">
              <tr>
                {['Nama', 'Tanggal Daftar', 'Tanggal Berakhir', 'Aksi'].map((header) => (
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
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-white/10 transition-all duration-300 group">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-300 font-medium text-sm">{m.nama}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-400 text-sm">{m.tgl_daftar}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-400 text-sm">{m.tgl_berakhir}</td>
                  <td className="px-4 py-3 whitespace-nowrap space-x-2">
                    <button
                      className="text-white/50 hover:text-white px-3 py-1 rounded-md text-xs transition-all duration-300"
                      onClick={() => openEdit(m)}
                    >
                      EDIT
                    </button>
                    <button
                      className="text-red-500 hover:text-white px-3 py-1 rounded-md text-xs transition-all duration-300"
                      onClick={() => setConfirmDeleteId(m.id)}
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

      {/* Pop Up Delete Confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div className="bg-red-600 text-white rounded-lg shadow-lg w-60 text-center p-4 scale-95 opacity-0 animate-[popIn_0.2s_ease-out_forwards]">
            <h3 className="text-lg font-semibold text-white mb-2">Hapus ?</h3>
            <p className="text-gray-300 mb-2">Yakin menghapus member ini?</p>
            <div className="grid grid-cols-2 border-t rounded-2xl border-red-900/50">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="py-3 text-white font-medium hover:bg-red-950/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="py-3 text-white font-medium hover:bg-red-950/50 transition-colors border-l border-red-900/50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop Up Edit Member */}
      {editMember && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/60 p-4">
          <div className="bg-black border border-white/10 rounded-lg shadow-lg w-full max-w-md p-6 scale-95 opacity-0 animate-[popIn_0.2s_ease-out_forwards] font-[Plus Jakarta Sans]">
            <h3 className="text-xl font-semibold text-red-600 mb-4 text-center">Edit Member</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4 text-white text-sm">
              <div>
                <label className="block mb-1">Nama:</label>
                <input
                  type="text"
                  value={editForm.nama}
                  onChange={(e) => handleEditChange('nama', e.target.value)}
                  className="w-full p-2 rounded-md bg-black border border-white/10 text-white focus:outline-none focus:ring focus:ring-red-600"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Tanggal Daftar:</label>
                <input
                  type="date"
                  value={editForm.tgl_daftar}
                  onChange={(e) => handleEditChange('tgl_daftar', e.target.value)}
                  className="w-full p-2 rounded-md bg-black border border-white/10 text-white focus:outline-none focus:ring focus:ring-red-600"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Tanggal Berakhir:</label>
                <input
                  type="date"
                  value={editForm.tgl_berakhir}
                  onChange={(e) => handleEditChange('tgl_berakhir', e.target.value)}
                  className="w-full p-2 rounded-md bg-black border border-white/10 text-white focus:outline-none focus:ring focus:ring-red-600"
                  required
                />
              </div>
              {editError && <p className="text-red-500 text-center">{editError}</p>}
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setEditMember(null)}
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
