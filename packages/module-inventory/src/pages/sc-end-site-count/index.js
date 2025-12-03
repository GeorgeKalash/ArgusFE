import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import EndSiteCountForm from './forms/EndSiteCountForm'

const EndSiteCount = () => {
  return <ImmediateWindow datasetId={ResourceIds.EndSiteCount} labelKey={'endSiteCount'} Component={EndSiteCountForm} />
}

export default EndSiteCount