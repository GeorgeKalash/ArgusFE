import { useEffect, useState } from "react"
import { getClientConfig } from "@argus/shared-utils/src/utils/clientConfig"

export const useClientConfig = () => {
  const [config, setConfig] = useState(null)

  useEffect(() => {
    getClientConfig().then((cfg) => {
      setConfig(cfg)
    })
  }, [])

  return {config}
}