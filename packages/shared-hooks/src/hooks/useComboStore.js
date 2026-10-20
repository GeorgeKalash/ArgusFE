import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'

export function useComboStore(extension, { parameters = '', transform, autoLoad = true } = {}) {
  const { getRequest } = useContext(RequestsContext)
  const [rawStore, setCombosStore] = useState({})

  const fillCombos = useCallback(async () => {
    const res = await getRequest({ extension, parameters })
    setCombosStore(prev => ({ ...prev, ...(res?.record || {}) }))
  }, [extension, parameters])

  useEffect(() => {
    if (autoLoad) fillCombos()
  }, [autoLoad])

  const combosStore = useMemo(() => (transform ? transform(rawStore) : rawStore), [rawStore])

  return { combosStore, fillCombos, setCombosStore }
}