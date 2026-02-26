const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: false,

  transpilePackages: [
    '@argus/module-lo',
    '@argus/module-fa',
    '@argus/module-rs',
    '@argus/module-ct',
    '@argus/module-auth',
    '@argus/module-system',
    '@argus/module-hr',
    '@argus/module-remittance',
    '@argus/module-financials',
    '@argus/module-businessPartners',
    '@argus/module-inventory',
    '@argus/module-purchase',
    '@argus/module-delivery',
    '@argus/module-sales',
    '@argus/module-manufacturing',
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
    }

    return config
  }
}

module.exports = nextConfig
