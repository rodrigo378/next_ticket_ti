/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://mesa-api.uma.edu.pe/:path*",
      },
    ];
  },
};

export default nextConfig;
