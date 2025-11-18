import { ImmediateWindow } from '@argus/shared-providers/providers/windows'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import RebuildForm from './form/IvRebuild'

const RebuildCOGSIndex = () => {
  return <ImmediateWindow datasetId={ResourceIds.RebuildInventory} labelKey={'rebuildItem'} Component={RebuildForm} />
}

export default RebuildCOGSIndex
