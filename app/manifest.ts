import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cat Feeding Rounds',
    short_name: 'Cat Rounds',
    description: 'Community cat feeding round tracker',
    start_url: '/home',
    display: 'standalone',
    background_color: '#0F0E0C',
    theme_color: '#D49010',
    orientation: 'portrait',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
