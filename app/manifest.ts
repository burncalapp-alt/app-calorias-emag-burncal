import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'BurnCal - Queime Calorias',
        short_name: 'BurnCal',
        description: 'Acompanhe suas calorias, macros e treinos.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0d0f14',
        theme_color: '#f97316',
        icons: [
            {
                src: '/icons/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
