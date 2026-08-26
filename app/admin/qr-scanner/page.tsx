'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '@/lib/supabase';

interface Member {
  id: string;
  nama: string;
  tgl_daftar: string;
  tgl_berakhir: string;
}

type ScanStatus = 'idle' | 'scanning' | 'active' | 'inactive' | 'invalid';

export default function QRScannerPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [member, setMember] = useState<Member | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const stopScanner = async () => {
    if (!scannerRef.current) return;

    try {
      await scannerRef.current.stop();
      await scannerRef.current.clear();
    } catch (error) {
      console.error('Error stopping scanner:', error);
    }

    scannerRef.current = null;
  };

  const verifyMember = async (memberId: string) => {
    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase
      .from('members')
      .select('id, nama, tgl_daftar, tgl_berakhir')
      .eq('id', memberId)
      .single();

    setLoading(false);

    if (error || !data) {
      setMember(null);
      setScanStatus('invalid');
      setErrorMessage('QR Code tidak terdaftar di sistem M.GYM.');
      return;
    }

    setMember(data);

    const today = new Date();

    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const [year, month, day] = data.tgl_berakhir
      .split('-')
      .map(Number);

    const endDate = new Date(
      year,
      month - 1,
      day
    );

    if (todayDate <= endDate) {
      setScanStatus('active');
    } else {
      setScanStatus('inactive');
    }
  };

  const handleScan = async (decodedText: string) => {
    await stopScanner();

    const memberId = decodedText.trim();

    if (!memberId) {
      setScanStatus('invalid');
      setErrorMessage('QR Code kosong atau tidak valid.');
      return;
    }

    await verifyMember(memberId);
  };

  const startScanner = async () => {
    setMember(null);
    setErrorMessage('');
    setScanStatus('scanning');

    try {
      const scanner = new Html5Qrcode('qr-reader');

      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
          aspectRatio: 1,
        },
        handleScan,
        () => {
          
        }
      );
    } catch (error) {
      console.error('Camera error:', error);

      await stopScanner();

      setScanStatus('invalid');
      setErrorMessage(
        'Kamera tidak dapat digunakan. Pastikan izin kamera sudah diberikan.'
      );
    }
  };

  const resetScanner = async () => {
    await stopScanner();

    setMember(null);
    setErrorMessage('');
    setScanStatus('idle');
    setLoading(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-red-600">
            QR SCANNER
          </h1>

          <p className="text-sm text-gray-400 mt-2">
            Scan QR Code membership untuk memverifikasi akses member M.GYM.
          </p>
        </div>

        {/* SCANNER */}
        {(scanStatus === 'idle' || scanStatus === 'scanning') && (
          <div className="bg-black border border-white/10 rounded-xl p-6">

            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold">
                Scan Membership QR
              </h2>

              <p className="text-xs text-gray-500 mt-2">
                Arahkan kamera ke QR Code member.
              </p>
            </div>

            <div className="max-w-md mx-auto overflow-hidden rounded-xl border border-white/10">
              <div id="qr-reader" />
            </div>

            {scanStatus === 'idle' && (
              <button
                onClick={startScanner}
                className="w-full max-w-md mx-auto mt-6 block bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                MULAI SCAN
              </button>
            )}

            {scanStatus === 'scanning' && (
              <p className="text-center text-sm text-gray-400 mt-5">
                Kamera aktif. Arahkan QR ke dalam kotak scanner...
              </p>
            )}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="mt-6 bg-black border border-white/10 rounded-xl p-8 text-center">
            <div className="animate-pulse">
              <div className="h-3 w-32 bg-white/10 rounded mx-auto mb-3" />
              <div className="h-3 w-48 bg-white/10 rounded mx-auto" />
            </div>

            <p className="text-sm text-gray-400 mt-5">
              Memverifikasi membership...
            </p>
          </div>
        )}

        {/* ACTIVE */}
        {!loading && scanStatus === 'active' && member && (
          <div className="mt-6 bg-black border border-green-600/30 rounded-xl p-6">

            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-600/10 border border-green-600 flex items-center justify-center">
                <span className="text-3xl text-green-500">
                  ✓
                </span>
              </div>

              <h2 className="text-xl font-bold text-green-500 mt-4">
                MEMBERSHIP ACTIVE
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Akses member diperbolehkan.
              </p>
            </div>

            <div className="mt-6 border-t border-white/10 pt-5 space-y-3">

              <div className="flex justify-between gap-4">
                <span className="text-gray-500 text-sm">
                  Nama
                </span>

                <span className="text-white text-sm font-semibold">
                  {member.nama}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500 text-sm">
                  Tanggal Daftar
                </span>

                <span className="text-white text-sm">
                  {member.tgl_daftar}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500 text-sm">
                  Berlaku Sampai
                </span>

                <span className="text-green-500 text-sm font-semibold">
                  {member.tgl_berakhir}
                </span>
              </div>

            </div>

            <button
              onClick={resetScanner}
              className="w-full mt-6 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              SCAN LAGI
            </button>
          </div>
        )}

        {/* INACTIVE */}
        {!loading && scanStatus === 'inactive' && member && (
          <div className="mt-6 bg-black border border-red-600/30 rounded-xl p-6">

            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-600/10 border border-red-600 flex items-center justify-center">
                <span className="text-3xl text-red-500">
                  ✕
                </span>
              </div>

              <h2 className="text-xl font-bold text-red-500 mt-4">
                MEMBERSHIP INACTIVE
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Membership member sudah tidak berlaku.
              </p>
            </div>

            <div className="mt-6 border-t border-white/10 pt-5 space-y-3">

              <div className="flex justify-between gap-4">
                <span className="text-gray-500 text-sm">
                  Nama
                </span>

                <span className="text-white text-sm font-semibold">
                  {member.nama}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500 text-sm">
                  Expired
                </span>

                <span className="text-red-500 text-sm font-semibold">
                  {member.tgl_berakhir}
                </span>
              </div>

            </div>

            <button
              onClick={resetScanner}
              className="w-full mt-6 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              SCAN LAGI
            </button>
          </div>
        )}

        {/* INVALID */}
        {!loading && scanStatus === 'invalid' && (
          <div className="mt-6 bg-black border border-red-600/30 rounded-xl p-6 text-center">

            <div className="w-16 h-16 mx-auto rounded-full bg-red-600/10 border border-red-600 flex items-center justify-center">
              <span className="text-3xl text-red-500">
                !
              </span>
            </div>

            <h2 className="text-xl font-bold text-red-500 mt-4">
              INVALID QR
            </h2>

            <p className="text-sm text-gray-400 mt-2">
              {errorMessage || 'QR Code tidak valid.'}
            </p>

            <button
              onClick={resetScanner}
              className="w-full mt-6 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              COBA LAGI
            </button>
          </div>
        )}

      </div>
    </main>
  );
}