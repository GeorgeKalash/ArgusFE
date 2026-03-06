import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

const buildProps = (ctx = {}) => ({
  ...(ctx.props || {})
})

const createResource = loader => ({
  loader,
  buildProps
})

export const ResourceRegistry = {
  [ResourceIds.Designer]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/DesignerForm')
  ),

  [ResourceIds.Sketch]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/Forms/SketchForm')
  ),

  [ResourceIds.Item]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/ItemDetails')
  ),

  [ResourceIds.ThreeDDesign]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/Forms/ThreeDDesignForm')
  )
}