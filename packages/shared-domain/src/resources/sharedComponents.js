import DesignerForm from "@argus/shared-ui/src/components/Shared/Forms/DesignerForm"
import SketchForm from "@argus/shared-ui/src/components/Shared/Forms/SketchForm"
import { ResourceIds } from "./ResourceIds"

export const sharedComponents = {
  [ResourceIds.Sketch]: SketchForm,
  [ResourceIds.Designer]: DesignerForm
}