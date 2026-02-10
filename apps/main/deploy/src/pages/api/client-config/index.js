import { getClientConfig } from '@argus/shared-domain/src/lib/clientConfig'

export default function handler(req, res) {
  try {
    const config = getClientConfig()

    return res.status(200).json({
      ok: true,
      config,
      type: typeof config,
      keys: config ? Object.keys(config) : null
    })
  } catch (e) {
    console.error('getClientConfig crashed:', e)

    return res.status(500).json({
      ok: false,
      message: e?.message,
      stack: e?.stack
    })
  }
}
