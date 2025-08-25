'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import dayjs from 'dayjs';

ChartJS.register(
  ArcElement,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface BarangKeluar {
  id: string;
  barang_id: string;
  jumlah: number;
  tanggal: string;
}

interface Barang {
  id: string;
  nama: string;
  kategori: string;
  stok: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    aktif: 0,
    nonAktif: 0,
    expSoon: 0,
    testimoniBulanIni: 0,
    pertumbuhanBulanan: [] as number[],
    ratingCounts: [0, 0, 0, 0, 0],
    kategoriData: {} as Record<string, number[]>,
    stockCategoryData: {} as Record<string, number>,
  });

  const bulanLabels = Array.from({ length: 12 }, (_, i) =>
    dayjs().subtract(11 - i, 'month').format('MMM YYYY')
  );

  useEffect(() => {
    const fetchData = async () => {
      const today = dayjs();
      const endOfMonth = today.endOf('month').toISOString();
      const startOfMonth = today.startOf('month').toISOString();
      const sevenDaysLater = today.add(7, 'day').toISOString();

      const { data: allMembers } = await supabase.from('members').select('*');
      const aktif = (allMembers ?? []).filter((m) =>
        m.tgl_berakhir ? dayjs(m.tgl_berakhir).isAfter(today) : false
      ).length;
      const nonAktif = (allMembers?.length ?? 0) - aktif;
      const expSoon = (allMembers ?? []).filter(
        (m) =>
          m.tgl_berakhir &&
          dayjs(m.tgl_berakhir).isAfter(today) &&
          dayjs(m.tgl_berakhir).isBefore(sevenDaysLater)
      ).length;

      const { count: testimoniBulanIni } = await supabase
        .from('testimonials')
        .select('*', { count: 'exact', head: true })
        .gte('tanggal_input', startOfMonth)
        .lte('tanggal_input', endOfMonth);

      const { data: allTestimonials } = await supabase
        .from('testimonials')
        .select('rating');

      const ratingCounts = [0, 0, 0, 0, 0];
      (allTestimonials ?? []).forEach((t) => {
        if (t.rating >= 1 && t.rating <= 5) {
          ratingCounts[t.rating - 1]++;
        }
      });

      const pertumbuhanBulanan = await Promise.all(
        bulanLabels.map(async (_, i) => {
          const start = dayjs().subtract(11 - i, 'month').startOf('month').toISOString();
          const end = dayjs().subtract(11 - i, 'month').endOf('month').toISOString();
          const { count } = await supabase
            .from('members')
            .select('*', { count: 'exact', head: true })
            .gte('tgl_daftar', start)
            .lte('tgl_daftar', end);
          return Number(count) || 0;
        })
      );

      const { data: allBarang } = await supabase.from('barang').select('id,nama,kategori,stok');
      const { data: historyStok } = await supabase.from('history_stok').select('id,barang_id,jumlah,tipe,created_at');

      const kategoriData: Record<string, number[]> = {};
      const stockCategoryData: Record<string, number> = {};
      (allBarang ?? []).forEach((b) => {
        kategoriData[b.kategori] = Array(12).fill(0);
        stockCategoryData[b.kategori] = 0;
      });

      (allBarang ?? []).forEach((b) => {
        stockCategoryData[b.kategori] = b.stok ?? 0;
      });

      (historyStok ?? []).forEach((hs) => {
        if (hs.tipe !== 'keluar') return;
        const barang = allBarang?.find((b) => b.id === hs.barang_id);
        if (!barang) return;
        const bulanIndex = bulanLabels.findIndex((_, i) => {
          const bulan = dayjs().subtract(11 - i, 'month');
          return dayjs(hs.created_at).isSame(bulan, 'month');
        });
        if (bulanIndex >= 0) {
          kategoriData[barang.kategori][bulanIndex] += hs.jumlah;
        }
      });

      setStats({
        aktif,
        nonAktif,
        expSoon,
        testimoniBulanIni: Number(testimoniBulanIni) || 0,
        pertumbuhanBulanan,
        ratingCounts,
        kategoriData,
        stockCategoryData,
      });
    };

    fetchData();
  }, []);

  const totalMembers = stats.aktif + stats.nonAktif + stats.expSoon;
  const totalTestimoni = stats.ratingCounts.reduce((a, b) => a + b, 0);

  const memberComparisonData = {
    labels: ['Aktif', 'Non-Aktif', 'Akan Expired'],
    datasets: [
      {
        data: [stats.aktif, stats.nonAktif, stats.expSoon],
        backgroundColor: ['#fb0000', '#660000', '#b30000'],
        borderWidth: 0,
      },
    ],
  };

  const ratingChartData = {
    labels: ['1/5', '2/5', '3/5', '4/5', '5/5'],
    datasets: [
      {
        data: stats.ratingCounts,
        backgroundColor: ['#ff0000', '#ff4000', '#ff6600', '#ff9900', '#ffd500'],
        borderWidth: 0,
      },
    ],
  };

  const backgroundColors = [
    '#dc2626', '#f97316', '#eab308', '#16a34a', '#2563eb', '#8b5cf6', '#ec4899', '#0f172a',
  ];

  const datasets = Object.entries(stats.kategoriData).map(([kategori, data], idx) => ({
    label: kategori,
    data,
    backgroundColor: backgroundColors[idx % backgroundColors.length],
  }));

  const stockCategoryChartData = {
    labels: Object.keys(stats.stockCategoryData),
    datasets: [
      {
        data: Object.values(stats.stockCategoryData),
        backgroundColor: backgroundColors.slice(0, Object.keys(stats.stockCategoryData).length),
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-black p-6 font-jakarta">
      <h1 className="text-3xl md:text-3xl italic font-semibold text-white mb-6 tracking-tight flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2" viewBox="0 0 20 20" fill="currentColor"></svg>
        DASHBOARD STATISTIK M.GYM
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatBox label="Total Data Member Aktif" value={stats.aktif} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>} />
        <StatBox label="Total Data Member Non-Aktif" value={stats.nonAktif} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /><path d="M4 12a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" /></svg>} />
        <StatBox label="Total Data Akan Non-Aktif dalam 7 Hari" value={stats.expSoon} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>} />
        <StatBox label="Total Testimoni" value={stats.testimoniBulanIni} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20 " fill="currentColor"><path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H6z" clipRule="evenodd" /></svg>} />
      </div>

      <div className="bg-black p-4 rounded-xl border border-red-600/20 hover:border-red-600/40 transition-colors mb-6">
        <h2 className="text-md font-semibold italic text-red-700 mb-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
          Pertumbuhan Member
        </h2>
        <div className="h-64">
          <Line
            data={{ labels: bulanLabels, datasets: [{ label: 'Member Baru', data: stats.pertumbuhanBulanan, borderColor: '#dc2626', backgroundColor: 'rgba(220, 38, 38, 0.08)', borderWidth: 2, pointBackgroundColor: '#dc2626', pointBorderColor: '#fff', pointRadius: 4, pointHoverRadius: 6, tension: 0.3, fill: true }] }}
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 10 } } }, y: { grid: { color: '#1f2937' }, ticks: { color: '#9ca3af', stepSize: 1 }, beginAtZero: true } } }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-black p-4 rounded-xl border border-red-600/20 hover:border-red-600/40 transition-colors">
          <h2 className="text-sm italic font-semibold text-red-700 mb-2 flex items-center">Persentase Status Member</h2>
          <div className="h-48">
            <Pie data={memberComparisonData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#f3f4f6', font: { family: "'Plus Jakarta Sans', sans-serif" } } }, tooltip: { callbacks: { label: (context) => { const label = context.label || ''; const value = Number(context.raw) || 0; const percentage = totalMembers ? Math.round((value / totalMembers) * 100) : 0; return `${label}: ${value} (${percentage}%)`; } } }, datalabels: { display: false } } }} />
          </div>
        </div>

        <div className="bg-black p-4 rounded-xl border border-red-600/20 hover:border-red-600/40 transition-colors">
          <h2 className="text-sm italic font-semibold text-red-700 mb-2 flex items-center">Rating Testimoni</h2>
          <div className="h-48">
            <Pie data={ratingChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#f3f4f6', font: { family: "'Plus Jakarta Sans', sans-serif" } } }, tooltip: { callbacks: { label: (context) => { const label = context.label || ''; const value = Number(context.raw) || 0; const percentage = totalTestimoni ? Math.round((value / totalTestimoni) * 100) : 0; return `${label}: ${value} (${percentage}%)`; } } }, datalabels: { display: false } } }} />
          </div>
        </div>


      <div className="bg-black p-4 rounded-xl border border-red-600/20 hover:border-red-600/40 transition-colors">
        <h2 className="text-sm italic font-semibold text-red-700 mb-2 flex items-center">Stock per Kategori</h2>
        <div className="h-48">
          <Pie data={stockCategoryChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#f3f4f6', font: { family: "'Plus Jakarta Sans', sans-serif" } } }, datalabels: { display: false } } }} />
        </div>
      </div>
    </div>

    <div className="bg-black p-4 rounded-xl border border-red-600/20 hover:border-red-600/40 transition-colors">
          <h2 className="text-sm italic font-semibold text-red-700 mb-2 flex items-center">Barang Keluar per Kategori</h2>
          <div className="h-48">
            <Bar data={{ labels: bulanLabels, datasets }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#f3f4f6' } }, datalabels: { display: false } }, scales: { x: { ticks: { color: '#f3f4f6' } }, y: { ticks: { color: '#f3f4f6', stepSize: 1 }, beginAtZero: true } } }} />
          </div>
        </div>
      </div>
  );
}

function StatBox({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-black p-4 rounded-xl border border-red-600/20 hover:border-red-600/40 transition-colors flex items-center justify-between">
      <div>
        <p className="text-xs text-red-600 uppercase mb-1">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
      <div className="text-red-600">{icon}</div>
    </div>
  );
}
