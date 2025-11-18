const path = require('path')

/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: [
    '@argus/repositories',
    '@argus/shared-domain',
    '@argus/shared-hooks',
    '@argus/shared-providers',
    '@argus/shared-ui',
    '@argus/shared-utils'
  ],
  experimental: { externalDir: true }
};

module.exports = {
  trailingSlash: true,
  reactStrictMode: false,
  nextConfig,
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }

    return config
  }
}
