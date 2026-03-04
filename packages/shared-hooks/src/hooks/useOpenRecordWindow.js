import { sharedComponents } from '@argus/shared-domain/src/resources/sharedComponents'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useCallback } from 'react'

export function useOpenRecordWindow() {
  const { stack } = useWindow()

  return useCallback((resourceId, ctx = {}) => {
    const Component = sharedComponents?.[resourceId]

    if (typeof Component !== 'function') {
      return
    }

    stack({ Component, props: ctx?.props || {} })
  }, [stack])
}