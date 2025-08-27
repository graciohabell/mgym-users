'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [showConfirm, setShowConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<{ id: string; judul: string } | null>(null);

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

  const hapusNote = async () => {
    if (!noteToDelete) return;
    const { error } = await supabase.from('admin_notes').delete().eq('id', noteToDelete.id);
    if (!error) {
      fetchNotes();
    } else {
      alert('Gagal hapus catatan.');
    }
    setShowConfirm(false);
    setNoteToDelete(null);
  };

  return (
    <div className="min-h-screen p-6 bg-black font-jakarta">
      <h1 className="text-2xl italic font-semibold text-white mb-6 tracking-tight">
        DASHBOARD NOTES
      </h1>
      <p className="text-sm mb-5 font-[Plus Jakarta Sans] italic text-white bg-clip-text">
        Halaman catatan to-do list admin M.GYM.
      </p>

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
              onClick={() => {
                setNoteToDelete({ id: note.id, judul: note.judul });
                setShowConfirm(true);
              }}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-lg leading-none"
              aria-label={`Hapus catatan ${note.judul}`}
              type="button"
            >
              ×
            </button>

            <div>
              <h3 className="font-semibold text-white text-base mb-1">{note.judul}</h3>
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

      {/* Pop Up Konfirmasi Hapus */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex justify-center items-center z-[60] pointer-events-none"
          >
            <div className="bg-red-600 rounded-2xl shadow-lg shadow-black/30 w-80 text-center p-6 pointer-events-auto">
              <h3 className="text-lg font-semibold text-white mb-2 font-[Plus Jakarta Sans]">
                Hapus Catatan?
              </h3>
              <p className="text-white/80 mb-4 font-[Plus Jakarta Sans]">
                Yakin mau hapus catatan &quot;{noteToDelete?.judul}&quot;?
              </p>
              <div className="grid grid-cols-2 border-t border-red-400/50">
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    setNoteToDelete(null);
                  }}
                  className="py-3 text-white font-medium hover:bg-red-500/50 transition-colors font-[Plus Jakarta Sans]"
                >
                  Batal
                </button>
                <button
                  onClick={hapusNote}
                  className="py-3 text-white font-medium hover:bg-red-700 transition-colors border-l border-red-400/50 font-[Plus Jakarta Sans]"
                >
                  Yakin
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-jakarta {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>
    </div>
  );
}
