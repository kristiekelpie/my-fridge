import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Our Fridge',
    short_name: 'Fridge',
    description: 'A shared kitchen, kept in mind.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#E8E4D7',
    theme_color: '#E8E4D7',
    icons: [
      {
        src: '/icon.png?v=2',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png?v=2',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
