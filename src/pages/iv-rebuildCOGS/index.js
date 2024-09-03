import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import RebuildCOGS from './form/RebuildCOGS'

const RebuildCOGSIndex = () => {
  return <ImmediateWindow datasetId={ResourceIds.RebuildCOGS} labelKey={'rebuildItem'} Component={RebuildCOGS} />
}

export default RebuildCOGSIndex
