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
      className="min-h-screen bg-black text-white p-6 font-sans"
      style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
    >
      <h1 className="text-3xl font-semibold italic mb-6 text-red-700">
        DATABASE TESTIMONI
      </h1>

      {/* Filter Rating Bar */}
      <div className="bg-neutral-900 rounded-xl overflow-hidden w-full max-w-3xl mx-auto flex divide-x divide-neutral-800 shadow-md mb-8">
        <button
          onClick={() => setFilterRating(null)}
          className={`flex-1 py-2 text-sm font-medium transition-all ${
            filterRating === null
              ? 'bg-red-700 text-white'
              : 'hover:bg-neutral-800 text-gray-300'
          }`}
        >
          All
        </button>
        {[1, 2, 3, 4, 5].map((r) => (
          <button
            key={r}
            onClick={() => setFilterRating(r)}
            className={`flex-1 py-2 text-sm font-medium transition-all ${
              filterRating === r
                ? 'bg-red-700 text-white'
                : 'hover:bg-neutral-800 text-gray-300'
            }`}
          >
            ⭐ {r}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-neutral-400 text-sm text-center">Memuat data...</p>
      ) : testimonials.length === 0 ? (
        <p className="text-neutral-500 text-sm text-center">Belum ada testimoni.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-neutral-900 rounded-lg p-3 border border-neutral-800 shadow hover:shadow-lg transition-all duration-200 relative text-sm"
            >
              <button
                onClick={() => setConfirmDeleteId(t.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-600 transition text-xs"
              >
                ✕
              </button>
              <div className="mb-1">
                <span className="block font-semibold">{t.nama}</span>
                <span className="text-yellow-400 text-xs">⭐ {t.rating}</span>
              </div>
              <p className="text-neutral-300 italic mb-2">
                “{t.testimoni}”
              </p>
              <span className="text-neutral-500 text-[10px]">
                {new Date(t.tanggal_input).toLocaleString('id-ID')}
              </span>
            </div>
          ))}
        </div>
      )}

      {modalMsg && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div
            className={`${
              modalType === 'error' ? 'bg-red-600' : 'bg-green-600'
            } text-white rounded-lg shadow-lg w-60 text-center p-4`}
          >
            <h3 className="text-sm font-semibold mb-1">
              {modalType === 'error' ? 'Peringatan' : 'Berhasil'}
            </h3>
            <p className="mb-2 text-xs">{modalMsg}</p>
            <div className="border-t border-white/20 mt-2">
              <button
                onClick={() => setModalMsg('')}
                className="w-full py-1.5 text-xs font-medium hover:bg-black/20 transition-colors rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div className="bg-red-600 text-white rounded-lg shadow-lg w-60 text-center p-4">
            <h3 className="text-sm font-semibold mb-1">Konfirmasi Hapus</h3>
            <p className="mb-2 text-xs">Yakin mau hapus testimoni ini?</p>
            <div className="flex border-t border-white/20">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-1.5 text-xs font-medium hover:bg-black/20 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-1.5 text-xs font-medium hover:bg-black/20 transition-colors"
              >
                Ya
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
