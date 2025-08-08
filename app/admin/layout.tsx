'use client';

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import '../globals.css';

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
            className="fixed top-4 left-4 z-50 px-3 py-2 bg-black/50 text-red-600 rounded shadow"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="text-lg font-bold">{sidebarOpen ? '||| ' : '☰ '}</span>
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
