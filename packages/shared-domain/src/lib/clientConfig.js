const fs = require("fs")

// const CONFIG_PATH = "/Users/macpro/SourceCode/Argus/config/client-config.json"
const CONFIG_PATH = "C:/inetpub/wwwroot/config/client-config.json"

function getClientConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, "utf8")
      const parsed = JSON.parse(raw)

      if (parsed && parsed.authUrl && parsed.reportUrl) {
        return parsed
      }
    }
  } catch (err) {
    console.warn("Failed to read JSON config, fallback to .env", err.message)
  }

  return {
    onPremCode: null,
    authUrl: process.env.NEXT_PUBLIC_AuthURL || null,
    reportUrl: process.env.NEXT_PUBLIC_REPORT_URL || null
  }
}

module.exports = { getClientConfig }