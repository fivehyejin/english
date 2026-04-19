/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages / 정적 호스팅: 빌드 산출물은 `out/`
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
