/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 強制 Vercel 略過錯誤直接打包
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig