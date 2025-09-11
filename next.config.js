const path = require('path')

/** @type {import('next').NextConfig} */
module.exports = {
  trailingSlash: true,
  reactStrictMode: true, // ✅ Enable strict mode to catch warnings
  productionBrowserSourceMaps: true, // ✅ Enable source maps for readable errors
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }

    return config
  }
}
