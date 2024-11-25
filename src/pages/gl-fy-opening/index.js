import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import FyOpeningForm from './form/FyOpeningForm'

const FyOpening = () => {
  return <ImmediateWindow datasetId={ResourceIds.FyOpening} labelKey={'fyo'} Component={FyOpeningForm} />
}

export default FyOpening
