import { ImmediateWindow } from '@argus/shared-providers/providers/windows'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import PosDefaultForm from './form/PosDefaultForm'

const PosIndex = () => {
  return <ImmediateWindow datasetId={ResourceIds.POSDefaults} labelKey={'pos'} Component={PosDefaultForm} />
}

export default PosIndex
