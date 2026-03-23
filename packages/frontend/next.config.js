/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@brindin/shared'],
  output: 'standalone',
};

module.exports = nextConfig;
