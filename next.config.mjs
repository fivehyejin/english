/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages / 정적 호스팅: 빌드 산출물은 `out/`
  output: 'export',
  // 일부 정적 호스트는 day/1/index.html 형태를 더 잘 찾음
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
