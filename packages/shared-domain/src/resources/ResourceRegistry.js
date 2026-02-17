import { ResourceIds } from './ResourceIds'

import SketchForm from '@argus/shared-ui/src/components/Shared/Forms/SketchForm'
import ThreeDDesignForm from '@argus/shared-ui/src/components/Shared/Forms/ThreeDDesignForm'
import ThreeDPrintForm from '@argus/shared-ui/src/components/Shared/Forms/ThreeDPrintForm'
import ItemDetails from '@argus/shared-ui/src/components/Shared/ItemDetails'

export const ResourceRegistry = {
  [ResourceIds.Sketch]: {
    Component: SketchForm,
    buildProps: ctx => ({
        ...ctx.props
    })
  }, 
  [ResourceIds.ThreeDDesign]: {
    Component: ThreeDDesignForm,
    buildProps: ctx => ({
        ...ctx.props
    })
  }, 
  [ResourceIds.ThreeDPrint]: {
    Component: ThreeDPrintForm,
    buildProps: ctx => ({
        ...ctx.props
    })
  }, 
  [ResourceIds.ItemDetails]: {
    Component: ItemDetails,
    buildProps: ctx => ({
      ...ctx.props
    })
  },

}
