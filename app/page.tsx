'use client'

export default function Home() {
  const sections = [
    {
      id: 1,
      title: 'Membership Umum',
      subtitle: '/// Paket 1 Bulan Rp120.000 & Paket 6 Bulan Rp660.000.',
      image: '/images/mgymbg1.jpg',
    },
    {
      id: 2,
      title: 'Membership Khusus Pelajar',
      subtitle: '/// Paket 1 Bulan Rp110.000.',
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
      subtitle: '/// M.GYM tidak menerima pembayaran apapun via website, Hati-Hati penipuan !',
      image: '/images/mgymbg5.jpg',
    },
  ]

  return (
    <main className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth font-body">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 z-50 w-full px-6 py-4 flex justify-between items-center bg-black/20 backdrop-blur-sm text-white">
        <h1 className="text-xl md:text-2xl font-display italic font-extrabold text-red-600 tracking-wide"style={{ fontFamily: 'Tomorrow, sans-serif' }}>
          /// M.GYM
        </h1>
        <a
        href="/membership"
        className="text-sm px-3 py-1 rounded-md text-red-600 font-display italic font-extrabold hover:bg-white/30 active:shadow-inner transition duration-150 ease-in-out"
        style={{ fontFamily: 'Tomorrow, sans-serif' }}
      >
        MEMBER ROOM
      </a>

      </nav>

      {/* Hero Sections */}
      {sections.map((sec) => (
        <section
          key={sec.id}
          className="relative snap-start h-screen w-full bg-cover bg-center text-white flex flex-col justify-center items-start px-8 pt-24"
          style={{ backgroundImage: `url('${sec.image}')` }}
        >
          {/* Teks Judul & Subjudul */}
          <div className="max-w-xl w-full space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-display drop-shadow-[0_0_2px_rgba(0,0,0,0.6)]"style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {sec.title}
            </h2>
            <p className="text-lg md:text-xl text-white/90 font-body drop-shadow-[0_0_1px_rgba(0,0,0,0.5)]"style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {sec.subtitle}
            </p>
          </div>

          {/* IG + TikTok Embed (section 4) */}
          {sec.id === 4 && (
            <div className="mt-6 w-full max-w-xs sm:max-w-md flex flex-row gap-4 flex-wrap">
              {/* Instagram */}
              <div
                dangerouslySetInnerHTML={{
                  __html: `
                  <iframe
                    src="https://www.instagram.com/mgym_cilebut/embed"
                    width="230"
                    height="120"
                    allowtransparency="true"
                    frameborder="0"
                    scrolling="no"
                    allow="encrypted-media"
                    class="rounded-xl border border-white"
                  ></iframe>
                `,
                }}
              />

              {/* TikTok */}
              <div
                dangerouslySetInnerHTML={{
                  __html: `
                  <iframe
                    src="https://www.tiktok.com/embed/@mgymowner"
                    width="230"
                    height="120"
                    frameborder="0"
                    allowfullscreen
                    class="rounded-xl border border-white"
                  ></iframe>
                `,
                }}
              />
            </div>
          )}

          {/* Maps Embed (section 5) */}
          {sec.id === 5 && (
            <div className="mt-6 w-full max-w-[700px]">
              <div className="rounded-xl overflow-hidden border border-white w-full h-[260px] md:h-[300px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.911141169527!2d106.80018899999999!3d-6.532906099999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c34671e96f25%3A0x40242bbc8fe38a78!2sM%20GYM!5e0!3m2!1sid!2sid!4v1754301520797!5m2!1sid!2sid"
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
    </main>
  )
}
