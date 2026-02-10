import { getClientConfig } from "@argus/shared-domain/src/lib/clientConfig"

export default function handler(req, res) {
  let config

  try {
    config = getClientConfig()
  } catch (e) {
    console.error("getClientConfig THREW:", e)
    return res.status(500).json({
      error: "getClientConfig threw",
      message: e.message
    })
  }

  if (!config) {
    return res.status(200).json({
      warning: "config is falsy",
      config
    })
  }

  return res.status(200).json(config)
}
