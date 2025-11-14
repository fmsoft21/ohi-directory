/** @type {import('next').NextConfig} */

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

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

module.exports = withPWA(nextConfig)
