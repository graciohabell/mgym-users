'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Testimonial {
  id: string
  nama: string
  testimoni: string
  rating: number
  tanggal_input: string
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [modalMsg, setModalMsg] = useState('')
  const [modalType, setModalType] = useState<'error' | 'success'>('error')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [filterRating, setFilterRating] = useState<number | null>(null)

  const fetchTestimonials = async () => {
    setLoading(true)
    let query = supabase
      .from('testimonials')
      .select('id, nama, testimoni, rating, tanggal_input')
      .order('tanggal_input', { ascending: false })

    if (filterRating) query = query.eq('rating', filterRating)

    const { data, error } = await query

    if (error) {
      showModal('Gagal memuat data.', 'error')
    } else {
      setTestimonials(data || [])
    }
    setLoading(false)
  }

  const showModal = (msg: string, type: 'error' | 'success' = 'error') => {
    setModalMsg(msg)
    setModalType(type)
  }

  const handleDelete = async () => {
    if (!confirmDeleteId) return
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', confirmDeleteId)

    if (error) {
      showModal('Gagal menghapus testimoni.', 'error')
    } else {
      showModal('Testimoni berhasil dihapus.', 'success')
      setTestimonials(testimonials.filter(t => t.id !== confirmDeleteId))
    }
    setConfirmDeleteId(null)
  }

  useEffect(() => {
    fetchTestimonials()
  }, [filterRating])

  return (
    <main
      className="min-h-screen bg-black text-white p-4 font-sans"
      style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
    >
      <h1 className="text-3xl font-semibold italic mb-3 text-red-700">
        DATABASE TESTIMONI
      </h1>

      {/* Filter Rating */}
      <div className="flex gap-1 mb-4 flex-wrap">
        <button
          onClick={() => setFilterRating(null)}
          className={`px-2 py-1 rounded text-xs font-medium transition ${
            filterRating === null
              ? 'bg-red-800 text-white'
              : 'bg-neutral-800 hover:bg-neutral-700'
          }`}
        >
          Semua
        </button>
        {[1, 2, 3, 4, 5].map((r) => (
          <button
            key={r}
            onClick={() => setFilterRating(r)}
            className={`px-2 py-1 rounded text-xs font-medium transition ${
              filterRating === r
                ? 'bg-red-800 text-white'
                : 'bg-neutral-800 hover:bg-neutral-700'
            }`}
          >
            ⭐{r}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-neutral-400 text-xs">Memuat data...</p>
      ) : testimonials.length === 0 ? (
        <p className="text-neutral-500 text-xs">Belum ada testimoni.</p>
      ) : (
        <div className="space-y-1">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-neutral-900 rounded p-2  border-neutral-800 flex justify-between items-start"
            >
              <div className="text-[11px] leading-tight">
                <span className="font-semibold text-white">{t.nama}</span>
                <p className="text-neutral-300 italic">&quot;{t.testimoni}&quot;</p>
                <span className="text-yellow-400 block">⭐ {t.rating}</span>
                <span className="text-neutral-500 block text-[10px]">
                  {new Date(t.tanggal_input).toLocaleString('id-ID')}
                </span>
              </div>
              <button
                onClick={() => setConfirmDeleteId(t.id)}
                className="text-red-500 px-2 py-1 hover:text-red-600 rounded text-[10px] transition"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Notifikasi */}
      {modalMsg && (
        <div className="fixed inset-0 flex justify-center items-center z-50 pointer-events-none">
          <div
            className={`${
              modalType === 'error' ? 'bg-red-600' : 'bg-green-600'
            } text-white rounded-lg shadow-lg w-60 text-center p-4 pointer-events-auto scale-95 animate-[popIn_0.15s_ease-out_forwards]`}
          >
            <h3 className="text-sm font-semibold mb-1">
              {modalType === 'error' ? 'Peringatan' : 'Berhasil'}
            </h3>
            <p className="mb-2 text-xs">{modalMsg}</p>
            <div className="border-t border-white/20">
              <button
                onClick={() => setModalMsg('')}
                className="w-full py-1.5 text-xs font-medium hover:bg-black/20 transition-colors rounded"
              >
                OK
              </button>
            </div>
          </div>
          <style jsx>{`
            @keyframes popIn {
              from {
                transform: scale(0.95);
                opacity: 0;
              }
              to {
                transform: scale(1);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div className="bg-red-600 text-white rounded-lg shadow-lg w-60 text-center p-4 scale-95 animate-[popIn_0.15s_ease-out_forwards]">
            <h3 className="text-sm font-semibold mb-1">Konfirmasi Hapus</h3>
            <p className="mb-2 text-xs">Yakin mau hapus testimoni ini?</p>
            <div className="flex border-t border-white/20">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-1.5 text-xs font-medium hover:bg-black/20 transition-colors rounded-bl-lg"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-1.5 text-xs font-medium hover:bg-black/20 transition-colors rounded-br-lg"
              >
                Ya
              </button>
            </div>
          </div>
          <style jsx>{`
            @keyframes popIn {
              from {
                transform: scale(0.95);
                opacity: 0;
              }
              to {
                transform: scale(1);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}
    </main>
  )
}
