let cachedConfig = null
let configPromise = null

export const getClientConfig = async () => {
  if (cachedConfig) return cachedConfig

  if (!configPromise) {
    configPromise = fetch("/api/client-config/")
      .then((res) => res.json())
      .then((data) => {
        cachedConfig = data?.config || {}
        return cachedConfig
      })
      .catch((err) => {
        console.error("Failed to load client config", err)
        return {}
      })
  }

  return configPromise
}