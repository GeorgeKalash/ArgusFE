import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import GlEoyClosingForm from './form/GlEoyClosingForm'

const GlEoyClosing = () => {
  return (
    <ImmediateWindow datasetId={ResourceIds.GlEoyClosing} labelKey={'eoy'} Component={GlEoyClosingForm} height={300} />
  )
}

export default GlEoyClosing
