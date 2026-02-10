const path = require('path')

const allModules = [
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
]

function getTranspilePackages() {
  const enabled = (process.env.ENABLED_MODULES || 'all').trim()

  if (enabled === 'all') return allModules

  // example: "sales,inventory,purchase"
  const enabledList = enabled.split(',').map(x => x.trim())

  // Always include shared packages (required)
  const shared = allModules.filter(p => p.includes('@argus/shared') || p.includes('@argus/repositories'))

  // Include only enabled modules
  const selected = allModules.filter(p => {
    return enabledList.some(m => p.includes(`/module-${m}`) || p.endsWith(`/module-${m}`) || p.includes(`module-${m}`))
  })

  // merge + remove duplicates
  return Array.from(new Set([...shared, ...selected]))
}
console.log('✅ ENABLED_MODULES =', process.env.ENABLED_MODULES)
console.log('✅ transpilePackages =', getTranspilePackages())

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: false,

  transpilePackages: getTranspilePackages(),

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
