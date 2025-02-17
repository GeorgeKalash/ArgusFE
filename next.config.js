const path = require('path')
const dotenv = require('dotenv')

/** @type {import('next').NextConfig} */

// Remove this if you're not using Fullcalendar features
dotenv.config()

module.exports = {
  trailingSlash: true,
  reactStrictMode: false,
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }

    return config
  },
  env: {
    NEXT_PUBLIC_ON_PREM: process.env.NEXT_PUBLIC_ON_PREM,
    NEXT_PUBLIC_JWT_EXPIRATION: process.env.NEXT_PUBLIC_JWT_EXPIRATION,
    NEXT_PUBLIC_JWT_SECRET: process.env.NEXT_PUBLIC_JWT_SECRET,
    NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET: process.env.NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET,
    NEXT_PUBLIC_AuthURL: process.env.NEXT_PUBLIC_AuthURL,
    NEXT_PUBLIC_REPORT_URL: process.env.NEXT_PUBLIC_REPORT_URL,
    NEXT_PUBLIC_YAKEEN_URL: process.env.NEXT_PUBLIC_YAKEEN_URL
  }
}
