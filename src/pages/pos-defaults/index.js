import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import PosDefaultForm from './form/PosDefaultForm'

const PosIndex = () => {
  return <ImmediateWindow datasetId={ResourceIds.POSDefaults} labelKey={'pos'} Component={PosDefaultForm} />
}

export default PosIndex
