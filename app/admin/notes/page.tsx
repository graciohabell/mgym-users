'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Note {
  id: string;
  judul: string;
  isi: string;
  deadline: string | null;
  with_deadline: boolean;
}

export default function AdminNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [judulBaru, setJudulBaru] = useState('');
  const [isiBaru, setIsiBaru] = useState('');
  const [pakaiDeadline, setPakaiDeadline] = useState(false);
  const [deadlineBaru, setDeadlineBaru] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('admin_notes')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setNotes(data);
  };

  const tambahNote = async () => {
    if (!judulBaru || !isiBaru) return;

    const { error } = await supabase.from('admin_notes').insert([
      {
        judul: judulBaru,
        isi: isiBaru,
        deadline: pakaiDeadline ? deadlineBaru : null,
        with_deadline: pakaiDeadline,
      },
    ]);

    if (!error) {
      setJudulBaru('');
      setIsiBaru('');
      setDeadlineBaru('');
      setPakaiDeadline(false);
      fetchNotes();
    }
  };

  const hapusNote = async (id: string, judul: string) => {
    if (confirm(`Hapus catatan "${judul}"?`)) {
      const { error } = await supabase.from('admin_notes').delete().eq('id', id);
      if (!error) {
        fetchNotes();
      } else {
        alert('Gagal hapus catatan.');
      }
    }
  };

  return (
    <div className="min-h-screen p-6 bg-black font-jakarta">
      <h1 className="text-2xl md:text-3xl font-style italic font-semibold text-red-700 mb-6 tracking-tight">
        DASHBOARD NOTES
      </h1>

      {/* Grid utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Form tambah catatan */}
        <div className="bg-neutral-900 p-4 rounded-xl border border-red-600/20 hover:border-red-600/40 transition-all text-white">
          <input
            className="w-full mb-2 px-2 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Judul Catatan"
            value={judulBaru}
            onChange={(e) => setJudulBaru(e.target.value)}
          />
          <textarea
            className="w-full mb-2 px-2 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Isi Catatan..."
            rows={3}
            value={isiBaru}
            onChange={(e) => setIsiBaru(e.target.value)}
          />
          <div className="flex items-center mb-2 gap-2 text-xs text-white">
            <input
              type="checkbox"
              checked={pakaiDeadline}
              onChange={(e) => setPakaiDeadline(e.target.checked)}
            />
            <label>Pakai Deadline</label>
            {pakaiDeadline && (
              <input
                type="date"
                className="ml-2 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                value={deadlineBaru}
                onChange={(e) => setDeadlineBaru(e.target.value)}
              />
            )}
          </div>
          <button
            onClick={tambahNote}
            className="bg-red-700 hover:bg-white text-white hover:text-red-700 px-3 py-1.5 rounded text-xs transition-colors"
          >
            + Tambah Catatan Baru
          </button>
        </div>

        {/* Notes list */}
        {notes.map((note) => (
          <div
            key={note.id}
            className="relative bg-neutral-900 p-4 rounded-xl hover:border-red-600/40 transition-all text-white flex flex-col justify-between min-h-[120px]"
          >
            {/* Tombol hapus */}
            <button
              onClick={() => hapusNote(note.id, note.judul)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-lg leading-none"
              aria-label={`Hapus catatan ${note.judul}`}
              type="button"
            >
              ×
            </button>

            <div>
              <h3 className="font-semibold text-[#ff4d4d] text-base mb-1">{note.judul}</h3>
              <p className="text-xs leading-snug whitespace-pre-line">{note.isi}</p>
            </div>
            {note.with_deadline && (
              <p className="text-[10px] text-neutral-400 mt-2">
                Deadline: {new Date(note.deadline!).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}

      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-jakarta {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>
    </div>
  );
}
