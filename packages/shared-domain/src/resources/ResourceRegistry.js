import DesignerForm from '@argus/shared-ui/src/components/Shared/Forms/DesignerForm'
import SketchForm from '@argus/shared-ui/src/components/Shared/Forms/SketchForm'
import ThreeDDesignForm from '@argus/shared-ui/src/components/Shared/Forms/ThreeDDesignForm'
import ThreeDPrintForm from '@argus/shared-ui/src/components/Shared/Forms/ThreeDPrintForm'
import ItemDetails from '@argus/shared-ui/src/components/Shared/ItemDetails'

import { ResourceIds } from './ResourceIds'

const buildProps = (ctx = {}) => ({
  ...ctx.props,
})

const createResource = (Component) => ({
  Component,
  buildProps,
})

export const ResourceRegistry = {
  [ResourceIds.Sketch]: createResource(SketchForm),

  [ResourceIds.ThreeDDesign]: createResource(ThreeDDesignForm),

  [ResourceIds.ThreeDPrint]: createResource(ThreeDPrintForm),

  [ResourceIds.ItemDetails]: createResource(ItemDetails),

  [ResourceIds.Designer]: createResource(DesignerForm),
}
