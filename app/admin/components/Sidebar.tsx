'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}


function SidebarIcon({ iconClass }: { iconClass: string }) {
  return <i className={`bi ${iconClass} w-4 h-4 mr-3 flex-shrink-0 text-white/60`}></i>;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    router.push('/');
  };

  const linkClass =
    'block px-4 py-2 rounded-sm text-white/40 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white active:bg-white/20 active:text-white font-medium transition-colors font-[Plus Jakarta Sans] flex items-center';

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.4 }}
            className="fixed top-0 left-0 h-full w-48 bg-black shadow-xl z-50 border-2 border-white/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center p-4 border-1 border-white/10">
                <h2 className="text-red-600 font-[Plus Jakarta Sans]">.</h2>
              </div>

              <nav className="p-2 rounded-lg space-x-0">
                <Link href="/admin/add-member" className={linkClass}>
                  <SidebarIcon iconClass="bi-person-plus" />
                  Membership
                </Link>
                <Link href="/admin/members" className={linkClass}>
                  <SidebarIcon iconClass="bi-people" />
                  Tabel Member
                </Link>
                <Link href="/admin/booking" className={linkClass}>
                  <SidebarIcon iconClass="bi-calendar-check" />
                  Jadwal Trainer
                </Link>
                <Link href="/admin/listbarang" className={linkClass}>
                  <SidebarIcon iconClass="bi-box-seam" />
                  Tabel Barang
                </Link>
                <Link href="/admin/historystok" className={linkClass}>
                  <SidebarIcon iconClass="bi bi-journals" />
                  In-Out Barang
                </Link>
                <Link href="/admin/testimoni" className={linkClass}>
                  <SidebarIcon iconClass="bi-chat-left-quote" />
                  Testimoni
                </Link>
                <Link href="/admin/statistik" className={linkClass}>
                  <SidebarIcon iconClass="bi-graph-up" />
                  Statistik
                </Link>
                <Link href="/admin/notes" className={linkClass}>
                  <SidebarIcon iconClass="bi-journal-text" />
                  Catatan
                </Link>
              </nav>
            </div>

            <div className="p-2 border-t border-white/10">
              <button
                onClick={() => setShowConfirm(true)}
                className="block w-full text-center text-white/40 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white active:bg-white/20 active:text-white font-medium px-3 py-2 rounded-sm transition-colors font-[Plus Jakarta Sans]"
              >
                Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex justify-center items-center z-[60] pointer-events-none"
          >
            <div className="bg-red-600 rounded-lg shadow-lg shadow-black/30 w-80 text-center p-6 pointer-events-auto">
              <h3 className="text-sm font-semibold text-white mb-2 font-[Plus Jakarta Sans]">
                Logout?
              </h3>
              <p className="text-white/80 mb-4 font-[Plus Jakarta Sans]">
                Yakin mau keluar dari dashboard?
              </p>
              <div className="grid grid-cols-2 border-t border-red-400/50">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="py-3 text-white font-medium hover:bg-red-500/50 transition-colors font-[Plus Jakarta Sans]"
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  className="py-3 text-white font-medium hover:bg-red-700 transition-colors border-l border-red-400/50 font-[Plus Jakarta Sans]"
                >
                  Yakin
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
