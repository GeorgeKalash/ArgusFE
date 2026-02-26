import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import GlSyncForm from './form/GlSyncForm'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

const GlSync = () => {
  return <ImmediateWindow datasetId={ResourceIds.GlSync} labelKey={'sync'} Component={GlSyncForm} />
}

export default GlSync
