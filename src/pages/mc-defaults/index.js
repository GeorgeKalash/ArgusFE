import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import MCDefault from './form/MCDefaults'

const LoIndex = () => {
  return <ImmediateWindow datasetId={ResourceIds.MC_Default} labelKey={'mcd'} Component={MCDefault} height={500} />
}

export default LoIndex
