'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Testimoni {
  id: number;
  nama: string;
  testimoni: string;
  rating: number;
}

export default function TestimoniPage() {
  const [testimonials, setTestimonials] = useState<Testimoni[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('id, nama, testimoni, rating')
        .order('id', { ascending: false });

      if (!error && data) {
        setTestimonials(data);
      }

      setLoading(false);
    };

    fetchTestimonials();
  }, []);

  return (
    <main className="min-h-screen bg-black px-6 pt-28 pb-20 font-body">
      <div className="max-w-5xl mx-auto">
        <h1
          className="text-3xl md:text-4xl font-display italic font-extrabold text-white tracking-wide mb-10 text-center"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          Ini Kata Para Membership Tentang Kami
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading testimoni...</p>
        ) : testimonials.length === 0 ? (
          <p className="text-center text-gray-500">Belum ada testimoni.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {testimonials.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/20 rounded-xl p-5 shadow-sm"
              >
                <p className="text-sm italic text-white mb-3">
                  &quot;{item.testimoni}&quot;
                </p>
                <p className="text-sm text-white/50">— {item.nama}</p>
                <p className="text-yellow-500 mt-1">
                  {'⭐'.repeat(item.rating)}
                  {item.rating < 5 ? '☆'.repeat(5 - item.rating) : ''}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Link ke Beranda */}
      <div className="mt-16 text-center">
        <Link
          href="/"
          className="inline-block bg-white text-red-600 border border-red-400 hover:bg-red-50 px-5 py-2 rounded-md text-sm font-bold font-display italic transition"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
