'use client';

import { FiMenu } from 'react-icons/fi';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 h-full w-48 bg-black shadow-xl z-50 border-r border-white/10 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center p-6 border-b rounded-lg border-white/10">
              <h2 className=" text-red-600 font-[Plus Jakarta Sans]">
               .
              </h2>
            </div>

            <nav className="p-4 rounded-lg space-y-2">
              <Link 
                href="/admin/add-member" 
                className="block px-4 py-3 rounded-sm text-red-600 hover:bg-white/5 hover:text-white font-medium transition-colors font-[Plus Jakarta Sans]"
              >
                ☰ Tambah
              </Link>
              <Link 
                href="/admin/members" 
                className="block px-4 py-3 rounded-sm text-red-600 hover:bg-white/5 hover:text-white font-medium transition-colors font-[Plus Jakarta Sans]"
              >
                ☰ Database
              </Link>
              <Link 
                href="/admin/statistik" 
                className="block px-4 py-3 rounded-sm text-red-600 hover:bg-white/5 hover:text-white font-medium transition-colors font-[Plus Jakarta Sans]"
              >
                ☰ Statistik
              </Link>
              <Link 
                href="/admin/testimoni" 
                className="block px-4 py-3 rounded-sm text-red-600 hover:bg-white/5 hover:text-white font-medium transition-colors font-[Plus Jakarta Sans]"
              >
                ☰ Testimoni
              </Link>
              <Link 
                href="/admin/notes" 
                className="block px-4 py-3 rounded-sm text-red-600 hover:bg-white/5 hover:text-white font-medium transition-colors font-[Plus Jakarta Sans]"
              >
                ☰ Catatan
              </Link>
            </nav>
          </div>

          
          <div className="p-4 border-t border-white/10">
  <Link
    href="/membership"
    className="block w-full text-center text-red-600 hover:bg-white/5 hover:text-white font-medium px-4 py-3 rounded-sm transition-colors font-[Plus Jakarta Sans]"
   
  >
    Logout
  </Link>
</div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
