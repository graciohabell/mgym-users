'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface MemberData {
  nama: string;
  tgl_daftar: string;
  tgl_berakhir: string;
}

export default function MemberOnlyPage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberData | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberData = async () => {
      const memberId = typeof window !== 'undefined' ? localStorage.getItem('member_id') : null;

      if (!memberId) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('members')
        .select('nama, tgl_daftar, tgl_berakhir')
        .eq('id', memberId)
        .single();

      if (error || !data) {
        localStorage.removeItem('member_id'); // bersihkan biar gak stuck
        router.push('/login');
        return;
      }

      const today = new Date();
      const endDate = new Date(data.tgl_berakhir);
      const diffTime = endDate.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setMember(data);
      setDaysLeft(daysRemaining);
      setExpired(daysRemaining < 0);
      setLoading(false);
    };

    fetchMemberData();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-600 font-body">
        Loading data membership...
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-white flex items-center justify-center px-4 pt-28 font-body">
      <div className="w-full max-w-md bg-white border border-red-100 rounded-2xl p-8 shadow-sm text-center">
        <h1 className="text-2xl font-display italic font-extrabold text-red-600 tracking-wide mb-4"style={{ fontFamily: 'Tomorrow, sans-serif' }}>
          Hai,
        </h1>

        <div className="text-sm md:text-base text-neutral-700 max-w-md font-body mt-2 leading-relaxed"style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          <p>
            Selamat Datang, {member?.nama} !
          </p>
          <p>
             Membership M.GYM kamu mulai aktif pada {member?.tgl_daftar},
              dan berlaku sampai dengan {member?.tgl_berakhir}, Saat ini kamu status kamu merupakan
          </p>
          <p>
                .
            </p>
          {!expired && daysLeft !== null && (
            <p
              className={`font-display  ${
                daysLeft <= 7 ? 'text-red-500' : 'text-green-500'
              }`} style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {daysLeft <= 7
                ? `MEMBERSHIP M.GYM YANG AKAN BERAKHIR DALAM ${daysLeft} HARI LAGI.`
                : `MEMBERSHIP M.GYM YANG AKTIF.`}
            </p>
          )}

          {expired && (
            <p className="text-red-700 font-display"style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              MEMBER M.GYM YANG SUDAH JATUH TEMPO.
            </p>
          )}
            <p>
                .
            </p>

            <p> 
            Perhatian !!! Transaksi apapun hanya dilakukan secara langsung (onsite) via Cash, QRIS, Transfer, Dan lainnya oleh admin. Hati-hati penipuan !!! 
          </p>
          <p>
                .
            </p>
          
        </div>
        <div>
        <h2 className="text-2xl font-display italic font-extrabold text-red-600 tracking-wide mb-4" style={{ fontFamily: 'Tomorrow, sans-serif' }}>
           M.GYM
        </h2></div>
      </div>
    </main>
  );
}
