/** @type {import('next').NextConfig} */
const nextConfig = {
  // --- Uncomment these if you deploy as a static export ---
  // output: 'export',
  // images: { unoptimized: true },

  images: {
    remotePatterns: [
      // DEV API
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8082',
        pathname: '/**',
      },

      // PROD: your real domain (allow both HTTP and HTTPS)
      {
        protocol: 'http',
        hostname: '34.131.104.9',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '34.131.104.9',
        pathname: '/**',
      },
      // (Optional) www host
      {
        protocol: 'http',
        hostname: 'http://34.131.104.9',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '34.131.104.9',
        pathname: '/**',
      },

      // If you use S3 or another CDN, add exact hosts here:
      // { protocol: 'https', hostname: 'your-bucket.s3.amazonaws.com', pathname: '/**' },
      // { protocol: 'https', hostname: 's3.ap-south-1.amazonaws.com', pathname: '/**' },
    ],
  },

};
//AniketXenel
export default nextConfig;
