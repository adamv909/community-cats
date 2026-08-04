import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cat Feeding Rounds',
  description: 'Community cat feeding round tracker',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cat Rounds',
  },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
