import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import MCDefault from './form/MCDefaults'

const LoIndex = () => {
  return <ImmediateWindow datasetId={ResourceIds.MC_Default} titleName={'mcd'} Component={MCDefault} />
}

export default LoIndex
