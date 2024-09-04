import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'

const RebuildCOGSIndex = () => {
  return <ImmediateWindow datasetId={ResourceIds.RebuildCOGS} labelKey={'rebuildItem'} Component={RebuildCOGS} />
}

export default RebuildCOGSIndex
