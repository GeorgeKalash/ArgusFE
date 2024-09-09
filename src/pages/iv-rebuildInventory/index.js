import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import RebuildForm from './form/IvRebuild'

const RebuildCOGSIndex = () => {
  return <ImmediateWindow datasetId={ResourceIds.RebuildInventory} labelKey={'rebuildItem'} Component={RebuildForm} />
}

export default RebuildCOGSIndex
