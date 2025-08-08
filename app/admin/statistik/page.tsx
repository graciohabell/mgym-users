'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
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
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    aktif: 0,
    nonAktif: 0,
    expSoon: 0,
    testimoniBulanIni: 0,
    pertumbuhanBulanan: [] as number[],
    ratingCounts: [0, 0, 0, 0, 0], // index 0 = bintang 1
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
      const aktif = (allMembers ?? []).filter(
        (m) => m.tgl_berakhir && dayjs(m.tgl_berakhir).isAfter(today)
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

      // Ambil jumlah masing-masing rating
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
          const start = dayjs()
            .subtract(11 - i, 'month')
            .startOf('month')
            .toISOString();
          const end = dayjs()
            .subtract(11 - i, 'month')
            .endOf('month')
            .toISOString();
          const { count } = await supabase
            .from('members')
            .select('*', { count: 'exact', head: true })
            .gte('tgl_daftar', start)
            .lte('tgl_daftar', end);
          return Number(count) || 0;
        })
      );

      setStats({
        aktif,
        nonAktif,
        expSoon,
        testimoniBulanIni: Number(testimoniBulanIni) || 0,
        pertumbuhanBulanan,
        ratingCounts,
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
        backgroundColor: [
          '#ff0000', 
          '#ff4000', 
          '#ff6600', 
          '#ff9900', 
          '#ffd500', 
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-black p-6 font-jakarta">
      <h1 className="text-2xl md:text-3xl italic font-semibold text-red-700 mb-6 tracking-tight">
        DASHBOARD STATISTIK M.GYM
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatBox label="Total Data Member Aktif" value={stats.aktif} />
        <StatBox label="Total Data Member Non-Aktif" value={stats.nonAktif} />
        <StatBox label="Total Data Akan Non-Aktif dalam 7 Hari" value={stats.expSoon} />
        <StatBox label="Total Testimoni" value={stats.testimoniBulanIni} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black p-4 rounded-xl border border-red-600/20 hover:border-red-600/40 transition-colors">
          <h2 className="text-sm italic font-semibold text-red-700 mb-2">
            Persentase Seluruh Status Member Dalam Database
          </h2>
          <div className="h-64">
            <Pie
              data={memberComparisonData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      color: '#f3f4f6',
                      font: { family: "'Plus Jakarta Sans', sans-serif" },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const label = context.label || '';
                        const value = Number(context.raw) || 0;
                        const percentage = totalMembers
                          ? Math.round((value / totalMembers) * 100)
                          : 0;
                        return `${label}: ${value} (${percentage}%)`;
                      },
                    },
                  },
                  datalabels: { display: false },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-black p-4 rounded-xl border border-red-600/20 hover:border-red-600/40 transition-colors">
          <h2 className="text-sm italic font-semibold text-red-700 mb-2">
            Persentase Seluruh Rating Testimoni Dalam Databse
          </h2>
          <div className="h-64">
            <Pie
              data={ratingChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      color: '#f3f4f6',
                      font: { family: "'Plus Jakarta Sans', sans-serif" },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const label = context.label || '';
                        const value = Number(context.raw) || 0;
                        const percentage = totalTestimoni
                          ? Math.round((value / totalTestimoni) * 100)
                          : 0;
                        return `${label}: ${value} (${percentage}%)`;
                      },
                    },
                  },
                  datalabels: { display: false },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-black p-4 rounded-xl border border-red-600/20 hover:border-red-600/40 transition-colors lg:col-span-2">
          <h2 className="text-md font-semibold italic text-red-700 mb-3">
            Pertumbuhan Member
          </h2>
          <div className="h-64">
            <Line
              data={{
                labels: bulanLabels,
                datasets: [
                  {
                    label: 'Member Baru',
                    data: stats.pertumbuhanBulanan,
                    borderColor: '#dc2626',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#dc2626',
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.3,
                    fill: true,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: {
                    grid: {
                      display: false,
                      drawTicks: false,
                      drawOnChartArea: false,
                    },
                    ticks: {
                      color: '#9ca3af',
                      font: { size: 10 },
                    },
                  },
                  y: {
                    grid: {
                      color: '#1f2937',
                      drawTicks: false,
                      drawOnChartArea: true,
                    },
                    ticks: { color: '#9ca3af', stepSize: 1 },
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        body {
          background-color: #000;
        }
        .font-jakarta {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-red-700 p-3 rounded-lg border border-red-700 hover:border-red-600/50 transition-all group">
      <h3 className="text-xs text-white/80 font-medium mb-1 group-hover:text-gray-300 transition-colors">
        {label}
      </h3>
      <p className="text-xl font-bold text-red-300">{value}</p>
      <div className="mt-1 h-0.5 w-6 bg-red-600/50 rounded-full group-hover:w-8 transition-all duration-300" />
    </div>
  );
}
