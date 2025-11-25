const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: false,

  transpilePackages: [
    '@argus/module-sales',
    '@argus/repositories',
    '@argus/shared-domain',
    '@argus/shared-hooks',
    '@argus/shared-providers',
    '@argus/shared-ui',
    '@argus/shared-utils',
    '@argus/shared-configs',
    '@argus/shared-core',
    '@argus/shared-layouts',
    '@argus/shared-store'
  ],

  experimental: {
    externalDir: true
  },

  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    };

    return config;
  }
};

module.exports = nextConfig;
