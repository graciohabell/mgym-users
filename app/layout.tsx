import type { Metadata } from "next"
import { Tomorrow, Plus_Jakarta_Sans } from "next/font/google"
import './globals.css'

// FONT: Tomorrow untuk heading
const tomorrow = Tomorrow({
  variable: "--font-tomorrow",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
})

// FONT: Plus Jakarta Sans untuk body text
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "M-Gym | Membership System",
  description:
    "Sistem keanggotaan eksklusif M-Gym. Cek status membership, login, dan dapatkan pengingat jatuh tempo secara otomatis.",
  keywords: [
    "M-Gym",
    "Gym Membership Indonesia",
    "Cek Status Gym",
    "Sistem Member Gym",
    "Aplikasi Gym",
    "Keanggotaan Gym",
  ],
  authors: [{ name: "M-Gym Developer Team", url: "https://mgym-users.vercel.app" }],
  creator: "M-Gym Developer Team",
  metadataBase: new URL("https://mgym-users.vercel.app"),
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
    },
  },
  openGraph: {
    title: "M-Gym | Membership System",
    description:
      "Sistem keanggotaan eksklusif M-Gym. Pantau status, jatuh tempo, dan akses member area secara cepat dan aman.",
    url: "https://mgym-users.vercel.app",
    siteName: "M-Gym",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "M-Gym | Membership System",
    description: "Cek status keanggotaan dan dapatkan pengingat jatuh tempo secara otomatis.",
    creator: "@mgymofficial",
  },
  category: "Fitness",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${tomorrow.variable} ${jakarta.variable}`}>
      <body className="antialiased font-body">{children}</body>
    </html>
  )
}
