'use client';

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import '../globals.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="id">
       <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap"
      precedence="default" 
    />
      <body className="antialiased font-body">
        <div className="relative min-h-screen bg-black">
          {/* Sidebar absolute niban isi */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Tombol pembuka sidebar, FIXED di kiri */}
          <button
            className="fixed top-3 left-2 z-50 px-3 py-2 text-white/40"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="text-2xl font-extrabold">{sidebarOpen ? '||| ' : '☰ '}</span>
          </button>

          {/* Konten utama */}
          <main className="transition-all duration-300">
            <div className="p-4">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
