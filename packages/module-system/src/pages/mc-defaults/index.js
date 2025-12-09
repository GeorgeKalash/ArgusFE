import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import MCDefault from './form/MCDefaults'

const LoIndex = () => {
  return <ImmediateWindow datasetId={ResourceIds.MC_Default} labelKey={'mcd'} Component={MCDefault} height={500} />
}

export default LoIndex
