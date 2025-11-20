import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import FyOpeningForm from './form/FyOpeningForm'

const FyOpening = () => {
  return <ImmediateWindow datasetId={ResourceIds.FyOpening} labelKey={'fyo'} Component={FyOpeningForm} height={300} />
}

export default FyOpening
