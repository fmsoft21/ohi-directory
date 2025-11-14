/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '**',
      },
      {
        hostname: 'images.pexels.com', 
      },
      {
        hostname: 'images.unsplash.com'
      },
      {
        hostname: 'plus.unsplash.com'
      },
      {
        hostname: 'cdn.dummyjson.com'
      },
      {
        hostname: 'i.dummyjson.com'
      },
      {
        hostname: 'drive.google.com'
      },
      {
        hostname: 'iili.io'
      },
    ],
  },
}

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

export default pwaConfig(nextConfig)
