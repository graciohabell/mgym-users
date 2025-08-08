'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Testimonial {
  id: string;
  nama: string;
  testimoni: string;
  rating: number;
}

export default function Home() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [showSplash, setShowSplash] = useState(true);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('id, nama, testimoni, rating')
        .order('tanggal_input', { ascending: false })
        .limit(10);
      if (!error && data) setTestimonials(data);
    };

    fetchTestimonials();

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleMouseMove = () => {
      setIsNavbarVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsNavbarVisible(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  if (showSplash) {
    return (
      <motion.div
        className="fixed inset-0 bg-black flex items-center justify-center z-[9999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="text-red-600 text-4xl md:text-6xl font-extrabold italic tracking-widest"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          style={{ fontFamily: 'Tomorrow, sans-serif' }}
        >
          M.GYM
        </motion.h1>
      </motion.div>
    );
  }

  const sections = [
    {
      id: 1,
      title: 'Cukup 3 Menit jalan kaki dari Stasiun Cilebut',
      subtitle: '/// Gym kota Bogor dan sekitarnya dengan akses lokasi paling mudah.',
      image: '/images/mgymbg1.jpg',
    },
    {
      id: 2,
      title: 'Membership Umum & Khusus Pelajar',
      subtitle: '/// Paket 1 Bulan Umum Rp120.000, Paket 6 Bulan Umum Rp660.000, dan Paket 1 Bulan Pelajar Rp110.000.',
      image: '/images/mgymbg2.jpg',
    },
    {
      id: 3,
      title: 'Kami Juga Tersedia Bagi Non Membership',
      subtitle: '/// Umum Rp20.000 & Khusus Pelajar Rp15.000 per-hari.',
      image: '/images/mgymbg3.jpg',
    },
    {
      id: 4,
      title: 'Ikuti Kami di Instagram, Tiktok dan WhatsApp',
      subtitle: '/// +62 858 1480 0499 (Michael)',
      image: '/images/mgymbg4.jpg',
    },
    {
      id: 5,
      title: 'Pendaftaran hanya on-site via Cash, QRIS, dsb.',
      subtitle:
        '///Jl. Raya Cilebut, Cilebut Tim., Kec. Sukaraja, Kabupaten Bogor, Jawa Barat',
      image: '/images/mgymbg5.jpg',
    },
  ];

  return (
    <main className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth font-body">
     <nav
  className={`fixed top-0 left-0 z-50 w-full px-6 py-4 flex justify-between items-center text-white transition-all duration-500 bg-black/20 backdrop-blur-sm ${
    isNavbarVisible
      ? 'opacity-100 pointer-events-auto translate-y-0'
      : 'opacity-0 pointer-events-none -translate-y-full'
  }`}
>
  <div className="flex items-center gap-2">
    <img
      src="/images/logo-mgym.jpg"
      alt="Logo M.GYM"
      className="h-8 w-8 object-contain"
    />
    <h1
      className="text-xl md:text-2xl font-display italic font-extrabold text-red-600 tracking-wide"
      style={{ fontFamily: 'Tomorrow, sans-serif' }}
    >
      M.GYM
    </h1>
  </div>

  <div className="flex items-center gap-3">
    <a
      href="/membership"
      className="text-sm px-3 py-1 rounded-md text-red-600 font-display italic font-extrabold hover:bg-white/30 active:shadow-inner transition duration-150 ease-in-out"
      style={{ fontFamily: 'Tomorrow, sans-serif' }}
    >
      MEMBER
    </a>
    <a
      href="/login-admin"
      className="text-sm px-3 py-1 rounded-md text-red-600 font-display italic font-extrabold hover:bg-white/30 active:shadow-inner transition duration-150 ease-in-out"
      style={{ fontFamily: 'Tomorrow, sans-serif' }}
    >
      ADMIN
    </a>
  </div>
</nav>


      {/* Hero Sections */}
      {sections.map((sec) => (
        <section
          key={sec.id}
          className="relative snap-start h-screen w-full bg-cover bg-center text-white flex flex-col justify-center items-start px-8 pt-24"
          style={{ backgroundImage: `url('${sec.image}')` }}
        >
          <div className="max-w-xl w-full space-y-4">
            <h2
              className="text-3xl md:text-4xl font-bold font-display drop-shadow-[0_0_2px_rgba(0,0,0,0.6)]"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {sec.title}
            </h2>
            <p
              className="text-lg md:text-xl text-white/90 font-body drop-shadow-[0_0_1px_rgba(0,0,0,0.5)]"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {sec.subtitle}
            </p>
          </div>

          {sec.id === 4 && (
            <div className="mt-6 w-full max-w-xs sm:max-w-md flex flex-row gap-4 flex-wrap">
              <iframe
                src="https://www.instagram.com/mgym_cilebut/embed"
                width="230"
                height="120"
                frameBorder="0"
                scrolling="no"
                className="rounded-xl border border-white"
              ></iframe>
              <iframe
                src="https://www.tiktok.com/embed/@mgymowner"
                width="230"
                height="120"
                frameBorder="0"
                allowFullScreen
                className="rounded-xl border border-white"
              ></iframe>
            </div>
          )}

          {sec.id === 5 && (
            <div className="mt-6 w-full max-w-[700px]">
              <div className="rounded-xl overflow-hidden border border-white w-full h-[260px] md:h-[300px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.911183446087!2d106.79761407370475!3d-6.532900763862933!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c34671e96f25%3A0x40242bbc8fe38a78!2sM%20GYM!5e0!3m2!1sid!2sid!4v1754672849735!5m2!1sid!2sid" 
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          )}
        </section>
      ))}

      {/* Section Testimoni */}
      <section className="snap-start min-h-screen bg-black text-gray-800 flex flex-col items-center justify-center px-6 py-16 font-body">
        <h2
          className="text-2xl md:text-3xl  font-semibold text-white tracking-wide mb-8"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          Apa Kata Mereka Yang Telah Bergabung Bersama Kami ?
        </h2>

        <div className="flex flex-wrap gap-4 pb-4 px-2 w-full max-w-5xl">
          {testimonials.length === 0 ? (
            <p className="text-gray-500 text-sm">Harap Tunggu...</p>
          ) : (
            testimonials.slice(0, 6).map((t, i) => (
              <motion.div
                key={t.id}
                className="snap-center flex-shrink-0 w-70 p-2 bg-black borderrounded-xl shadow-md"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <p className="text-sm italic text-white">“{t.testimoni}”</p>
                <p className="mt-3 text-sm text-gray-500">— {t.nama}</p>
                <p className="text-yellow-500 mt-1">{'⭐'.repeat(t.rating)}</p>
              </motion.div>
            ))
          )}
        </div>

        <div className="mt-6">
          <a
            href="/testimoni"
            className=" text-white px-9 py-5  hover:text-red-600 italic text-lg"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Lihat Semua Testimoni
          </a>
        </div>
      </section>
    </main>
  );
}
