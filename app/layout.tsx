import type { Metadata } from "next"
import { Tomorrow, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"

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
  title: "M-GYM",
  description: "Membership Gym App",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${tomorrow.variable} ${jakarta.variable}`}>
      <body className="antialiased font-body">
        {children}
      </body>
    </html>
  )
}
