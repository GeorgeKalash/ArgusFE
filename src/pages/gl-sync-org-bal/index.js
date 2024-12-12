import { ImmediateWindow } from 'src/windows'
import GlSyncForm from './form/GlSyncForm'
import { ResourceIds } from 'src/resources/ResourceIds'

const GlSync = () => {
  return <ImmediateWindow datasetId={ResourceIds.GlSync} labelKey={'sync'} Component={GlSyncForm} />
}

export default GlSync
