import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'PC Builder AI - Build Your Perfect PC',
  description: 'AI-powered PC builder that recommends optimized builds based on your budget and use case. Get personalized PC recommendations with real product links.',
  keywords: 'PC builder, AI, computer build, gaming PC, custom PC, budget PC',
  authors: [{ name: 'PC Builder AI' }],
  creator: 'PC Builder AI',
  publisher: 'PC Builder AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'PC Builder AI - Build Your Perfect PC',
    description: 'AI-powered PC builder that recommends optimized builds based on your budget and use case.',
    url: 'https://pcbuilderai.com',
    siteName: 'PC Builder AI',
    images: [
      {
        url: 'https://pcbuilderai.com/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PC Builder AI - Build Your Perfect PC',
    description: 'AI-powered PC builder that recommends optimized builds based on your budget and use case.',
    images: ['https://pcbuilderai.com/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}