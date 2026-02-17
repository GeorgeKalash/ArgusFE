import { ResourceRegistry } from '@argus/shared-domain/src/resources/ResourceRegistry'
import { useWindow } from '@argus/shared-providers/src/providers/windows'

export function useOpenResource() {
  const { stack } = useWindow()

  return (resourceId, context = {}) => {
    const config = ResourceRegistry[resourceId]
    if (!config) return

    const { Component, buildProps } = config

    stack({
      Component,
      props: buildProps({
        props: context.props || {}
      })
    })
  }
}